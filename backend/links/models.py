from django.db import models
from django.contrib.auth.models import User
import string
import random

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

class Link(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='links')
    title = models.CharField(max_length=255, blank=True)
    original_url = models.URLField(max_length=2000)
    short_code = models.CharField(max_length=50, unique=True, db_index=True)
    clicks_count = models.IntegerField(default=0)
    unique_clicks_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Password & Expiry
    password_hash = models.CharField(max_length=128, blank=True, null=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Tags & UTM
    tags = models.JSONField(default=list, blank=True)
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=150, blank=True)
    utm_term = models.CharField(max_length=100, blank=True)
    utm_content = models.CharField(max_length=150, blank=True)

    # QR styling configuration
    qr_code_data = models.JSONField(default=dict, blank=True)

    # Future-Level: Geo Routing
    enable_geo_routing = models.BooleanField(default=False)
    geo_rules = models.JSONField(default=list, blank=True) # [{"country_code": "IN", "target_url": "..."}, ...]

    # Future-Level: A/B Testing
    enable_ab_testing = models.BooleanField(default=False)
    ab_variants = models.JSONField(default=list, blank=True) # [{"id": "A", "target_url": "...", "weight": 50, "clicks": 0}]

    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.short_code} -> {self.original_url[:40]}"

    def get_full_target_url(self):
        url = self.original_url
        params = []
        if self.utm_source:
            params.append(f"utm_source={self.utm_source}")
        if self.utm_medium:
            params.append(f"utm_medium={self.utm_medium}")
        if self.utm_campaign:
            params.append(f"utm_campaign={self.utm_campaign}")
        if self.utm_term:
            params.append(f"utm_term={self.utm_term}")
        if self.utm_content:
            params.append(f"utm_content={self.utm_content}")
        
        if params:
            separator = '&' if '?' in url else '?'
            return f"{url}{separator}{'&'.join(params)}"
        return url


class LinkVersionHistory(models.Model):
    link = models.ForeignKey(Link, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=100)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
