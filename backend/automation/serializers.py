from rest_framework import serializers
from .models import AutomationRule, AutomationLog

class AutomationRuleSerializer(serializers.ModelSerializer):
    link_short_code = serializers.CharField(source='link.short_code', read_only=True)
    class Meta:
        model = AutomationRule
        fields = [
            'id', 'name', 'trigger_type', 'trigger_value', 'link', 'link_short_code',
            'action_type', 'action_payload', 'is_active', 'execution_count', 'created_at'
        ]

class AutomationLogSerializer(serializers.ModelSerializer):
    rule_name = serializers.CharField(source='rule.name', read_only=True)
    class Meta:
        model = AutomationLog
        fields = ['id', 'rule', 'rule_name', 'message', 'status', 'payload_snapshot', 'created_at']
