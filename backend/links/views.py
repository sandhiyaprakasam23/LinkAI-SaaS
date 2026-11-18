from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from urllib.parse import urlparse
import io
import base64
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, CircleModuleDrawer, SquareModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask

from .models import Link, LinkVersionHistory, generate_short_code
from .serializers import LinkSerializer, LinkVersionHistorySerializer
from authentication.views import get_or_create_demo_user

class LinkListCreateView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        links = Link.objects.filter(user=user)

        # Filters
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        tag_filter = request.query_params.get('tag', '').strip()
        include_archived = request.query_params.get('archived', 'false').lower() == 'true'

        if not include_archived:
            links = links.filter(is_archived=False)

        if search:
            links = links.filter(title__icontains=search) | links.filter(short_code__icontains=search) | links.filter(original_url__icontains=search)

        if status_filter == 'active':
            links = links.filter(is_active=True)
        elif status_filter == 'disabled':
            links = links.filter(is_active=False)
        elif status_filter == 'expired':
            links = links.filter(expires_at__lt=timezone.now())

        if tag_filter:
            # Simple list containment check
            links = [l for l in links if tag_filter in (l.tags or [])]
            return Response(LinkSerializer(links, many=True).data)

        return Response(LinkSerializer(links, many=True).data)

    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        data = request.data.copy()

        # Handle short_code alias
        alias = data.get('short_code', '').strip()
        if not alias:
            alias = generate_short_code()
            while Link.objects.filter(short_code=alias).exists():
                alias = generate_short_code()
        else:
            if Link.objects.filter(short_code=alias).exists():
                return Response({'error': f"Alias '{alias}' is already taken. Please choose another or use AI suggestions."}, status=status.HTTP_400_BAD_REQUEST)

        # Handle title
        url = data.get('original_url', '')
        if not url:
            return Response({'error': 'Original URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not url.startswith('http://') and not url.startswith('https://'):
            url = f"https://{url}"
            data['original_url'] = url

        title = data.get('title', '').strip()
        if not title:
            parsed = urlparse(url)
            title = f"{parsed.netloc}{parsed.path}"[:60]

        data['short_code'] = alias
        data['title'] = title

        serializer = LinkSerializer(data=data)
        if serializer.is_valid():
            link = serializer.save(user=user)
            # Log version history
            LinkVersionHistory.objects.create(
                link=link,
                action="Created",
                details=f"Created short URL with destination {link.original_url}"
            )
            return Response(LinkSerializer(link).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LinkDetailView(APIView):
    def get(self, request, pk):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link = get_object_or_404(Link, id=pk, user=user)
        return Response(LinkSerializer(link).data)

    def put(self, request, pk):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link = get_object_or_404(Link, id=pk, user=user)
        serializer = LinkSerializer(link, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            LinkVersionHistory.objects.create(
                link=updated,
                action="Updated",
                details=f"Modified parameters: {list(request.data.keys())}"
            )
            return Response(LinkSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link = get_object_or_404(Link, id=pk, user=user)
        link.delete()
        return Response({'message': 'Link deleted successfully'})


class LinkBulkActionView(APIView):
    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        action = request.data.get('action')
        link_ids = request.data.get('link_ids', [])

        if not link_ids or not action:
            return Response({'error': 'link_ids and action are required'}, status=status.HTTP_400_BAD_REQUEST)

        links = Link.objects.filter(id__in=link_ids, user=user)
        count = links.count()

        if action == 'activate':
            links.update(is_active=True)
            msg = f"Activated {count} links"
        elif action == 'disable':
            links.update(is_active=False)
            msg = f"Disabled {count} links"
        elif action == 'archive':
            links.update(is_archived=True)
            msg = f"Archived {count} links"
        elif action == 'delete':
            links.delete()
            msg = f"Deleted {count} links"
        elif action == 'add_tag':
            tag = request.data.get('tag', 'Campaign')
            for l in links:
                t = list(l.tags or [])
                if tag not in t:
                    t.append(tag)
                    l.tags = t
                    l.save()
            msg = f"Added tag '{tag}' to {count} links"
        else:
            return Response({'error': f"Unknown action '{action}'"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': msg, 'affected': count})


class AISuggestAliasView(APIView):
    def post(self, request):
        url = request.data.get('url', '')
        title = request.data.get('title', '')
        topic = request.data.get('topic', '')

        base_words = []
        if title:
            base_words.extend([w.lower() for w in title.split() if len(w) > 3])
        if url:
            domain = urlparse(url).netloc.replace('www.', '').split('.')[0]
            base_words.append(domain)
        if topic:
            base_words.append(topic.lower().replace(' ', '-'))

        if not base_words:
            base_words = ['promo', 'vip', 'launch', 'deal', 'smart']

        suggestions = []
        prefixes = ['go', 'try', 'get', 'join', 'view', 'my', 'the']
        suffixes = ['2026', 'pro', 'hub', 'now', 'link', 'vip', 'ai']

        for _ in range(5):
            w = base_words[len(suggestions) % len(base_words)]
            clean_w = ''.join(c for c in w if c.isalnum() or c == '-')
            if len(suggestions) % 2 == 0:
                sug = f"{prefixes[len(suggestions) % len(prefixes)]}-{clean_w}"
            else:
                sug = f"{clean_w}-{suffixes[len(suggestions) % len(suffixes)]}"
            
            # Check availability
            if not Link.objects.filter(short_code=sug).exists() and sug not in suggestions:
                suggestions.append({
                    "alias": sug,
                    "ctr_boost": f"+{20 + len(suggestions) * 6}% CTR",
                    "style": "High-Converting Viral" if len(suggestions) < 2 else "Clean Brand"
                })

        # Fallback if needed
        while len(suggestions) < 5:
            code = f"link-{generate_short_code(4).lower()}"
            suggestions.append({"alias": code, "ctr_boost": "+18% CTR", "style": "Concise"})

        return Response({"suggestions": suggestions})


class AISuggestTitleView(APIView):
    def post(self, request):
        url = request.data.get('url', '')
        if not url:
            return Response({'error': 'URL required'}, status=status.HTTP_400_BAD_REQUEST)

        parsed = urlparse(url if url.startswith('http') else f"https://{url}")
        domain = parsed.netloc.replace('www.', '')
        path = parsed.path.strip('/')

        tags = ['Marketing']
        if 'product' in url.lower() or 'shop' in url.lower() or 'cart' in url.lower():
            tags = ['E-Commerce', 'Sales', 'Product']
            suggested_title = f"Exclusive Offer | {domain.title()}"
        elif 'github' in url.lower() or 'dev' in url.lower() or 'api' in url.lower() or 'docs' in url.lower():
            tags = ['Developer', 'API', 'Docs']
            suggested_title = f"{path.title() or 'Documentation'} - {domain}"
        elif 'blog' in url.lower() or 'article' in url.lower() or 'post' in url.lower():
            tags = ['Content', 'Article', 'Social']
            suggested_title = f"Must Read Guide: {path.replace('-', ' ').title() or 'Insights'}"
        else:
            suggested_title = f"{domain.capitalize()} - Official Gateway"
            tags = ['Brand', 'Gateway']

        smart_expiry = {
            "recommended_days": 14,
            "reasoning": "Standard 14-day campaign window maximizes conversion velocity while retaining viral replay value."
        }

        return Response({
            "suggested_title": suggested_title,
            "suggested_tags": tags,
            "smart_expiry": smart_expiry
        })


class LinkQRCodeView(APIView):
    def get(self, request, pk):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link = get_object_or_404(Link, id=pk, user=user)
        
        # QR color options
        fg_color = request.query_params.get('fg', '#00f5ff')
        bg_color = request.query_params.get('bg', '#070a12')
        style = request.query_params.get('style', 'rounded')

        # Redirection target for this link
        host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        short_url = f"{protocol}://{host}/r/{link.short_code}?src=qr"

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=3,
        )
        qr.add_data(short_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color=fg_color, back_color=bg_color)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        return Response({
            "short_code": link.short_code,
            "short_url": short_url,
            "qr_base64": f"data:image/png;base64,{img_str}"
        })
