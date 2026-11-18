from rest_framework import serializers
from .models import ClickEvent

class ClickEventSerializer(serializers.ModelSerializer):
    link_short_code = serializers.CharField(source='link.short_code', read_only=True)
    link_title = serializers.CharField(source='link.title', read_only=True)

    class Meta:
        model = ClickEvent
        fields = [
            'id', 'link', 'link_short_code', 'link_title', 'timestamp', 'country',
            'country_code', 'city', 'device', 'browser', 'os', 'referrer',
            'variant_chosen', 'is_qr_scan'
        ]
