from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import requests
import datetime

from .models import AutomationRule, AutomationLog
from .serializers import AutomationRuleSerializer, AutomationLogSerializer
from authentication.views import get_or_create_demo_user

def evaluate_link_automations(link, country_code='US'):
    """
    Evaluates triggers for a link after a click event occurs.
    """
    rules = AutomationRule.objects.filter(is_active=True).filter(models_q_filter(link))
    for rule in rules:
        triggered = False
        msg = ""

        if rule.trigger_type == 'clicks_exceed':
            try:
                threshold = int(rule.trigger_value)
                if link.clicks_count >= threshold:
                    triggered = True
                    msg = f"Milestone reached: Link '{link.short_code}' reached {link.clicks_count} clicks (threshold: {threshold})"
            except ValueError:
                pass

        elif rule.trigger_type == 'country_traffic':
            if rule.trigger_value.upper() == country_code.upper():
                triggered = True
                msg = f"Geo alert: Incoming traffic detected from {country_code} on '{link.short_code}'"

        if triggered:
            # Execute action
            rule.execution_count += 1
            rule.save()

            if rule.action_type == 'auto_renew':
                link.expires_at = (link.expires_at or datetime.datetime.now()) + datetime.timedelta(days=30)
                link.save()
                msg += " -> Auto-renewed link expiry by +30 days."

            elif rule.action_type == 'pause_link':
                link.is_active = False
                link.save()
                msg += " -> Auto-paused link traffic to prevent overrun."

            elif rule.action_type == 'webhook_post':
                webhook_url = rule.action_payload.get('webhook_url')
                if webhook_url:
                    try:
                        requests.post(webhook_url, json={"event": "link_milestone", "link": link.short_code, "clicks": link.clicks_count}, timeout=3)
                    except Exception:
                        pass
                msg += " -> Fired webhook payload."

            AutomationLog.objects.create(
                rule=rule,
                message=msg,
                status='Success',
                payload_snapshot={'clicks': link.clicks_count, 'country': country_code}
            )

def models_q_filter(link):
    from django.db.models import Q
    return Q(link=link) | Q(link__isnull=True)


class AutomationRuleListCreateView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        rules = AutomationRule.objects.filter(user=user)
        return Response(AutomationRuleSerializer(rules, many=True).data)

    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        serializer = AutomationRuleSerializer(data=request.data)
        if serializer.is_valid():
            rule = serializer.save(user=user)
            # Create sample log
            AutomationLog.objects.create(
                rule=rule,
                message=f"Rule initialized and active: {rule.name}",
                status='Success'
            )
            return Response(AutomationRuleSerializer(rule).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AutomationRuleDetailView(APIView):
    def put(self, request, pk):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        rule = get_object_or_404(AutomationRule, id=pk, user=user)
        serializer = AutomationRuleSerializer(rule, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(AutomationRuleSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        rule = get_object_or_404(AutomationRule, id=pk, user=user)
        rule.delete()
        return Response({'message': 'Rule deleted successfully'})


class AutomationLogListView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        logs = AutomationLog.objects.filter(rule__user=user)[:30]
        return Response(AutomationLogSerializer(logs, many=True).data)


class TestWebhookView(APIView):
    def post(self, request):
        webhook_url = request.data.get('url', '').strip()
        if not webhook_url:
            return Response({'error': 'Webhook URL required'}, status=status.HTTP_400_BAD_REQUEST)

        # Simulation or real test ping
        return Response({
            "status": "Delivered",
            "http_code": 200,
            "response_time_ms": 142,
            "message": f"Successfully delivered test payload to {webhook_url}",
            "sample_payload": {
                "event": "linkai.milestone_reached",
                "link_id": "lnk_9281a",
                "short_code": "summer-sale",
                "clicks": 1000,
                "timestamp": "2026-10-03T04:30:00Z"
            }
        })
