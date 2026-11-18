from django.db import models
from links.models import Link

class ClickEvent(models.Model):
    link = models.ForeignKey(Link, on_delete=models.CASCADE, related_name='clicks')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.CharField(max_length=64, blank=True, null=True)
    country = models.CharField(max_length=100, default='United States')
    country_code = models.CharField(max_length=10, default='US')
    city = models.CharField(max_length=100, default='San Francisco')
    device = models.CharField(max_length=50, default='Desktop') # Desktop, Mobile, Tablet
    browser = models.CharField(max_length=50, default='Chrome') # Chrome, Safari, Firefox, Edge
    os = models.CharField(max_length=50, default='macOS') # iOS, Android, Windows, macOS
    referrer = models.CharField(max_length=150, default='Direct') # Instagram, WhatsApp, Twitter / X, etc.
    variant_chosen = models.CharField(max_length=50, blank=True, null=True)
    is_qr_scan = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Click on {self.link.short_code} from {self.country} ({self.device}) at {self.timestamp}"
