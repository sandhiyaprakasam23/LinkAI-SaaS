import os
import django
import random
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'linkai_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from authentication.models import UserProfile, ApiKey, TeamMember
from links.models import Link, LinkVersionHistory
from analytics.models import ClickEvent
from automation.models import AutomationRule, AutomationLog

def run_seed():
    print("Seeding LinkAI initial data...")

    # 1. User
    user, created = User.objects.get_or_create(
        username='demo_user',
        defaults={'email': 'alex.vance@linkai.io', 'first_name': 'Alex', 'last_name': 'Vance'}
    )
    user.set_password('demo1234')
    user.save()

    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'company': 'LinkAI Hypergrowth Labs',
            'plan': 'Pro',
            'role': 'Owner',
            'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        }
    )

    # 2. API Keys
    if not ApiKey.objects.filter(user=user).exists():
        ApiKey.generate_key(user=user, name='Production Live Gateway')
        ApiKey.generate_key(user=user, name='Zapier Automations Webhook')
        ApiKey.generate_key(user=user, name='Chrome Extension Key')

    # 3. Team Members
    if not TeamMember.objects.filter(owner=user).exists():
        TeamMember.objects.create(owner=user, name='Sophia Martinez', email='sophia@linkai.io', role='Admin', status='Active')
        TeamMember.objects.create(owner=user, name='David Chen', email='david@linkai.io', role='Editor', status='Active')
        TeamMember.objects.create(owner=user, name='Priya Sharma', email='priya@linkai.io', role='Analyst', status='Active')

    # 4. Links
    links_data = [
        {
            "short_code": "ai-launch",
            "title": "LinkAI 2.0 Global Launch Announcement",
            "original_url": "https://linkai.io/features/intelligence",
            "clicks_count": 1420,
            "unique_clicks_count": 1180,
            "tags": ["Marketing", "Launch", "Product"],
            "utm_source": "producthunt",
            "utm_medium": "featured_post",
            "utm_campaign": "q4_launch",
            "enable_geo_routing": True,
            "geo_rules": [
                {"country_code": "IN", "target_url": "https://linkai.io/in/launch-special"},
                {"country_code": "US", "target_url": "https://linkai.io/us/enterprise-portal"}
            ],
            "enable_ab_testing": True,
            "ab_variants": [
                {"id": "A", "name": "Dark Tech Variant", "target_url": "https://linkai.io/features/intelligence?v=dark", "weight": 50, "clicks": 730},
                {"id": "B", "name": "Minimalist High-Conv", "target_url": "https://linkai.io/features/intelligence?v=conv", "weight": 50, "clicks": 690}
            ]
        },
        {
            "short_code": "summer-deal",
            "title": "50% Off Early Adopter Pro Pass",
            "original_url": "https://linkai.io/pricing?discount=EARLYBIRD",
            "clicks_count": 890,
            "unique_clicks_count": 760,
            "tags": ["Sales", "Affiliate", "Campaign"],
            "utm_source": "instagram_bio",
            "utm_medium": "social",
            "utm_campaign": "summer_deal_50",
            "enable_ab_testing": False,
        },
        {
            "short_code": "vip-docs",
            "title": "Confidential Technical Whitepaper 2026",
            "original_url": "https://linkai.io/whitepaper/smart-routing",
            "clicks_count": 320,
            "unique_clicks_count": 295,
            "password_hash": "2026",
            "tags": ["Security", "Developer", "Private"],
        },
        {
            "short_code": "wa-community",
            "title": "LinkAI Founders WhatsApp Community",
            "original_url": "https://chat.whatsapp.com/invite/linkai-vip",
            "clicks_count": 640,
            "unique_clicks_count": 580,
            "tags": ["Community", "Social"],
            "utm_source": "whatsapp_broadcast",
            "utm_medium": "chat",
            "utm_campaign": "founders_club",
        }
    ]

    for ld in links_data:
        link, l_created = Link.objects.get_or_create(
            short_code=ld['short_code'],
            defaults={
                'user': user,
                'title': ld['title'],
                'original_url': ld['original_url'],
                'clicks_count': ld['clicks_count'],
                'unique_clicks_count': ld['unique_clicks_count'],
                'tags': ld.get('tags', []),
                'utm_source': ld.get('utm_source', ''),
                'utm_medium': ld.get('utm_medium', ''),
                'utm_campaign': ld.get('utm_campaign', ''),
                'password_hash': ld.get('password_hash'),
                'enable_geo_routing': ld.get('enable_geo_routing', False),
                'geo_rules': ld.get('geo_rules', []),
                'enable_ab_testing': ld.get('enable_ab_testing', False),
                'ab_variants': ld.get('ab_variants', [])
            }
        )
        if l_created:
            LinkVersionHistory.objects.create(link=link, action="Created", details=f"Initial seeded deployment for {link.short_code}")

    # 5. Click Events Telemetry
    all_links = list(Link.objects.filter(user=user))
    countries = [
        ("India", "IN", "Bengaluru"), ("India", "IN", "Mumbai"), ("India", "IN", "Chennai"),
        ("United States", "US", "San Francisco"), ("United States", "US", "New York"), ("United States", "US", "Austin"),
        ("United Kingdom", "GB", "London"), ("Germany", "DE", "Berlin"), ("Canada", "CA", "Toronto")
    ]
    devices = [("Mobile", "iOS", "Safari"), ("Mobile", "Android", "Chrome"), ("Desktop", "macOS", "Chrome"), ("Desktop", "Windows", "Edge"), ("Tablet", "iOS", "Safari")]
    referrers = ["Instagram", "WhatsApp", "Twitter / X", "LinkedIn", "Direct", "YouTube"]

    now = timezone.now()
    if ClickEvent.objects.count() < 100:
        print("Generating realistic click telemetry...")
        for _ in range(160):
            link = random.choice(all_links)
            c_name, c_code, city = random.choice(countries)
            dev, os_name, browser = random.choice(devices)
            ref = random.choice(referrers)
            days_ago = random.randint(0, 6)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            stamp = now - datetime.timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

            ClickEvent.objects.create(
                link=link,
                timestamp=stamp,
                country=c_name,
                country_code=c_code,
                city=city,
                device=dev,
                os=os_name,
                browser=browser,
                referrer=ref,
                is_qr_scan=(random.random() < 0.18)
            )

    # 6. Automations
    if not AutomationRule.objects.filter(user=user).exists():
        r1 = AutomationRule.objects.create(
            user=user,
            name="1,000 Clicks Milestone Alert",
            trigger_type="clicks_exceed",
            trigger_value="1000",
            action_type="send_alert",
            action_payload={"channel": "in_app", "message": "High-velocity link crossed 1,000 clicks threshold!"},
            is_active=True,
            execution_count=3
        )
        AutomationLog.objects.create(
            rule=r1,
            message="Milestone reached: Link 'ai-launch' reached 1,420 clicks (threshold: 1000)",
            status="Success",
            payload_snapshot={"clicks": 1420}
        )

        r2 = AutomationRule.objects.create(
            user=user,
            name="Auto-Renew Expiring Flash Campaigns",
            trigger_type="link_expired",
            trigger_value="0",
            action_type="auto_renew",
            action_payload={"extend_days": 30},
            is_active=True,
            execution_count=1
        )
        AutomationLog.objects.create(
            rule=r2,
            message="Auto-renewed campaign 'summer-deal' expiry date by +30 days",
            status="Success"
        )

        r3 = AutomationRule.objects.create(
            user=user,
            name="India Traffic Regional Webhook Relay",
            trigger_type="country_traffic",
            trigger_value="IN",
            action_type="webhook_post",
            action_payload={"webhook_url": "https://api.linkai.io/webhooks/regional-relay"},
            is_active=True,
            execution_count=42
        )

    print("[SUCCESS] Database seeding complete!")

if __name__ == '__main__':
    run_seed()
