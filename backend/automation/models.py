from django.db import models
from django.contrib.auth.models import User
from links.models import Link

class AutomationRule(models.Model):
    TRIGGER_TYPES = (
        ('clicks_exceed', 'If Clicks Exceed Threshold'),
        ('link_expired', 'If Link Expires'),
        ('anomaly_spike', 'If Traffic Spike Detected'),
        ('country_traffic', 'If Specific Country Traffic Detected'),
    )
    ACTION_TYPES = (
        ('send_alert', 'Send In-App / Email Notification'),
        ('webhook_post', 'Trigger Webhook Endpoint'),
        ('auto_renew', 'Auto-Renew Expiry (+30 Days)'),
        ('pause_link', 'Auto-Pause Link Redirect'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='automation_rules')
    name = models.CharField(max_length=150)
    trigger_type = models.CharField(max_length=50, choices=TRIGGER_TYPES, default='clicks_exceed')
    trigger_value = models.CharField(max_length=255, default='1000')
    link = models.ForeignKey(Link, on_delete=models.CASCADE, null=True, blank=True, related_name='automations')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES, default='send_alert')
    action_payload = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    execution_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.trigger_type} -> {self.action_type})"


class AutomationLog(models.Model):
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='logs')
    message = models.CharField(max_length=255)
    status = models.CharField(max_length=30, default='Success') # Success, Warning, Failed
    payload_snapshot = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
