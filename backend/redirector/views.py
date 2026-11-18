from django.views import View
from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random

from links.models import Link
from analytics.models import ClickEvent
from automation.views import evaluate_link_automations

def parse_user_agent(ua_string):
    ua = ua_string.lower()
    
    # Device
    if 'tablet' in ua or 'ipad' in ua:
        device = 'Tablet'
    elif 'mobile' in ua or 'iphone' in ua or 'android' in ua:
        device = 'Mobile'
    else:
        device = 'Desktop'

    # Browser
    if 'edg' in ua:
        browser = 'Edge'
    elif 'chrome' in ua and 'safari' in ua:
        browser = 'Chrome'
    elif 'safari' in ua and 'chrome' not in ua:
        browser = 'Safari'
    elif 'firefox' in ua:
        browser = 'Firefox'
    else:
        browser = 'Chrome'

    # OS
    if 'iphone' in ua or 'ipad' in ua or 'ios' in ua:
        os = 'iOS'
    elif 'android' in ua:
        os = 'Android'
    elif 'mac' in ua:
        os = 'macOS'
    elif 'win' in ua:
        os = 'Windows'
    elif 'linux' in ua:
        os = 'Linux'
    else:
        os = 'Windows'

    return device, browser, os

def parse_referrer(ref_header):
    if not ref_header:
        return 'Direct'
    r = ref_header.lower()
    if 'instagram' in r:
        return 'Instagram'
    elif 'whatsapp' in r:
        return 'WhatsApp'
    elif 'twitter' in r or 't.co' in r or 'x.com' in r:
        return 'Twitter / X'
    elif 'linkedin' in r:
        return 'LinkedIn'
    elif 'youtube' in r or 'youtu.be' in r:
        return 'YouTube'
    elif 'google' in r:
        return 'Google'
    elif 'facebook' in r or 'fb.com' in r:
        return 'Facebook'
    return 'Web Referrer'


class RedirectLinkView(View):
    def get(self, request, short_code):
        try:
            link = Link.objects.get(short_code=short_code)
        except Link.DoesNotExist:
            return HttpResponse("""
                <!DOCTYPE html>
                <html><head><title>Link Not Found | LinkAI</title><meta name="viewport" content="width=device-width, initial-scale=1">
                <style>body{background:#070a12;color:#f1f5f9;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
                .box{background:rgba(255,255,255,0.05);padding:3rem;border-radius:1rem;border:1px solid rgba(255,255,255,0.1);text-align:center;max-width:400px;}
                h1{color:#ef4444;margin-bottom:0.5rem;}p{color:#94a3b8;}</style></head>
                <body><div class="box"><h1>404 Not Found</h1><p>The short link you requested does not exist or was deleted.</p></div></body></html>
            """, status=404)

        # Check Active
        if not link.is_active or link.is_archived:
            return HttpResponse("""
                <!DOCTYPE html>
                <html><head><title>Link Inactive | LinkAI</title><meta name="viewport" content="width=device-width, initial-scale=1">
                <style>body{background:#070a12;color:#f1f5f9;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
                .box{background:rgba(255,255,255,0.05);padding:3rem;border-radius:1rem;border:1px solid rgba(255,255,255,0.1);text-align:center;max-width:400px;}
                h1{color:#f59e0b;margin-bottom:0.5rem;}p{color:#94a3b8;}</style></head>
                <body><div class="box"><h1>Link Paused</h1><p>This link has been temporarily disabled by its creator.</p></div></body></html>
            """, status=403)

        # Check Expiry
        if link.expires_at and timezone.now() > link.expires_at:
            return HttpResponse("""
                <!DOCTYPE html>
                <html><head><title>Link Expired | LinkAI</title><meta name="viewport" content="width=device-width, initial-scale=1">
                <style>body{background:#070a12;color:#f1f5f9;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
                .box{background:rgba(255,255,255,0.05);padding:3rem;border-radius:1rem;border:1px solid rgba(255,255,255,0.1);text-align:center;max-width:400px;}
                h1{color:#ec4899;margin-bottom:0.5rem;}p{color:#94a3b8;}</style></head>
                <body><div class="box"><h1>Link Expired</h1><p>This promotional link has reached its expiry deadline.</p></div></body></html>
            """, status=410)

        # Check Password Protection
        if link.password_hash:
            entered_pin = request.GET.get('pin') or request.COOKIES.get(f'link_auth_{link.id}')
            if entered_pin != link.password_hash:
                # Render password gate
                return HttpResponse(f"""
                    <!DOCTYPE html>
                    <html><head><title>Protected Link | LinkAI</title><meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {{ background:#070a12; color:#f1f5f9; font-family:system-ui; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }}
                        .card {{ background:rgba(15,23,42,0.8); backdrop-filter:blur(16px); padding:2.5rem; border-radius:1.25rem; border:1px solid rgba(0,245,255,0.2); box-shadow:0 0 30px rgba(0,245,255,0.15); width:90%; max-width:380px; text-align:center; }}
                        h2 {{ margin-top:0; color:#00f5ff; font-weight:700; }}
                        p {{ color:#94a3b8; font-size:0.9rem; margin-bottom:1.5rem; }}
                        input {{ width:100%; box-sizing:border-box; padding:0.8rem 1rem; border-radius:0.6rem; border:1px solid rgba(255,255,255,0.15); background:#0b0f19; color:#fff; font-size:1.1rem; text-align:center; letter-spacing:3px; margin-bottom:1.2rem; }}
                        button {{ width:100%; padding:0.85rem; border-radius:0.6rem; border:none; background:linear-gradient(135deg, #00f5ff, #a855f7); color:#000; font-weight:700; font-size:1rem; cursor:pointer; transition:transform 0.2s; }}
                        button:hover {{ transform:scale(1.02); }}
                    </style>
                    </head>
                    <body>
                    <div class="card">
                        <div style="font-size:2.5rem;margin-bottom:0.5rem;">🔒</div>
                        <h2>Password Protected</h2>
                        <p>This destination URL requires an access code from the creator.</p>
                        <form method="GET">
                            <input type="password" name="pin" placeholder="Enter Access Code" autofocus required />
                            <button type="submit">Unlock & Continue &rarr;</button>
                        </form>
                    </div>
                    </body></html>
                """)

        # Determine Destination URL
        target_url = link.get_full_target_url()
        variant_chosen = None

        # Geo-Routing check
        test_geo = request.GET.get('geo') or request.META.get('HTTP_CF_IPCOUNTRY') or 'US'
        country_code = test_geo.upper()
        country_name = "India" if country_code == 'IN' else ("United States" if country_code == 'US' else "United Kingdom" if country_code == 'GB' else "Global")
        city_name = "Bengaluru" if country_code == 'IN' else ("San Francisco" if country_code == 'US' else "London")

        if link.enable_geo_routing and link.geo_rules:
            for rule in link.geo_rules:
                if rule.get('country_code', '').upper() == country_code:
                    target_url = rule.get('target_url')
                    break

        # A/B Testing check
        if link.enable_ab_testing and link.ab_variants:
            # Pick variant according to weights
            variants = link.ab_variants
            total_weight = sum(v.get('weight', 50) for v in variants) or 100
            rand_val = random.randint(1, total_weight)
            cum = 0
            for v in variants:
                cum += v.get('weight', 50)
                if rand_val <= cum:
                    target_url = v.get('target_url')
                    variant_chosen = v.get('id')
                    # Update count in variant list
                    v['clicks'] = v.get('clicks', 0) + 1
                    link.save(update_fields=['ab_variants'])
                    break

        # Log Click Telemetry
        ua_string = request.META.get('HTTP_USER_AGENT', '')
        device, browser, os = parse_user_agent(ua_string)
        ref_header = request.META.get('HTTP_REFERER', '')
        referrer = parse_referrer(ref_header)
        is_qr = request.GET.get('src') == 'qr'

        ClickEvent.objects.create(
            link=link,
            country=country_name,
            country_code=country_code,
            city=city_name,
            device=device,
            browser=browser,
            os=os,
            referrer=referrer,
            variant_chosen=variant_chosen,
            is_qr_scan=is_qr
        )

        link.clicks_count += 1
        link.unique_clicks_count += 1
        link.save(update_fields=['clicks_count', 'unique_clicks_count'])

        # Trigger Automation Rules
        evaluate_link_automations(link, country_code=country_code)

        # Execute Redirect
        response = redirect(target_url)
        if link.password_hash and request.GET.get('pin'):
            response.set_cookie(f'link_auth_{link.id}', request.GET.get('pin'), max_age=3600)
        return response


class VerifyPasswordView(APIView):
    def post(self, request, short_code):
        link = get_object_or_404(Link, short_code=short_code)
        pin = request.data.get('pin', '')
        if link.password_hash == pin:
            return Response({'valid': True, 'target_url': link.get_full_target_url()})
        return Response({'valid': False, 'error': 'Invalid access PIN'}, status=status.HTTP_401_UNAUTHORIZED)
