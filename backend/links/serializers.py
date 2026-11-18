from rest_framework import serializers
from .models import Link, LinkVersionHistory

class LinkVersionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkVersionHistory
        fields = ['id', 'action', 'details', 'created_at']

class LinkSerializer(serializers.ModelSerializer):
    full_target_url = serializers.CharField(source='get_full_target_url', read_only=True)
    has_password = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    history = LinkVersionHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Link
        fields = [
            'id', 'title', 'original_url', 'short_code', 'clicks_count', 'unique_clicks_count',
            'is_active', 'is_archived', 'has_password', 'password_hash', 'expires_at', 'is_expired',
            'tags', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'qr_code_data', 'enable_geo_routing', 'geo_rules', 'enable_ab_testing', 'ab_variants',
            'created_at', 'updated_at', 'full_target_url', 'history'
        ]
        extra_kwargs = {
            'password_hash': {'write_only': True, 'required': False}
        }

    def get_has_password(self, obj):
        return bool(obj.password_hash)

    def get_is_expired(self, obj):
        if not obj.expires_at:
            return False
        from django.utils import timezone
        return timezone.now() > obj.expires_at
