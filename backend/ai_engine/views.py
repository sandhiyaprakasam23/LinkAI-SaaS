from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from links.models import Link
from authentication.views import get_or_create_demo_user
from .services import LinkAIService

class AIInsightsView(APIView):
    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link_id = request.data.get('link_id')
        if not link_id:
            # Pick user's top link or first link
            link = Link.objects.filter(user=user).order_by('-clicks_count').first()
            if not link:
                return Response({'error': 'No link found to analyze'}, status=status.HTTP_404_NOT_FOUND)
        else:
            link = get_object_or_404(Link, id=link_id, user=user)

        insights = LinkAIService.analyze_link(link)
        return Response({
            "link_id": link.id,
            "short_code": link.short_code,
            "title": link.title,
            "insights": insights
        })


class AIPredictView(APIView):
    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link_id = request.data.get('link_id')
        link = get_object_or_404(Link, id=link_id, user=user) if link_id else Link.objects.filter(user=user).first()
        if not link:
            return Response({'error': 'No link found'}, status=status.HTTP_404_NOT_FOUND)

        prediction = LinkAIService.generate_click_prediction(link, link.clicks_count)
        return Response({
            "link_id": link.id,
            "short_code": link.short_code,
            "prediction": prediction
        })


class AICampaignView(APIView):
    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link_id = request.data.get('link_id')
        topic = request.data.get('topic', 'Product Launch & Special Deal')
        link = get_object_or_404(Link, id=link_id, user=user) if link_id else Link.objects.filter(user=user).first()
        if not link:
            return Response({'error': 'No link found'}, status=status.HTTP_404_NOT_FOUND)

        campaign = LinkAIService.generate_campaign_content(link, topic)
        return Response(campaign)


class AICopilotView(APIView):
    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        link_id = request.data.get('link_id')
        query = request.data.get('query', '')
        if not query:
            return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)

        link = Link.objects.filter(id=link_id, user=user).first() if link_id else Link.objects.filter(user=user).first()
        reply = LinkAIService.copilot_chat(link, query)
        return Response({
            "query": query,
            "reply": reply,
            "link_short_code": link.short_code if link else None
        })
