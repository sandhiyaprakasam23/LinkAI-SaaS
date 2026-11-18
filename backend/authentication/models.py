from django.db import models
from django.contrib.auth.models import User
import secrets

class UserProfile(models.Model):
    PLAN_CHOICES = (
        ('Free', 'Free'),
        ('Pro', 'Pro'),
        ('Enterprise', 'Enterprise'),
    )
    ROLE_CHOICES = (
        ('Owner', 'Owner'),
        ('Admin', 'Admin'),
        ('Editor', 'Editor'),
        ('Viewer', 'Viewer'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar_url = models.CharField(max_length=500, blank=True, default='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
    company = models.CharField(max_length=150, blank=True, default='LinkAI Labs')
    plan = models.CharField(max_length=30, choices=PLAN_CHOICES, default='Pro')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='Owner')
    monthly_link_limit = models.IntegerField(default=1000)
    monthly_api_calls_limit = models.IntegerField(default=50000)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.plan})"


class ApiKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100, default='Default Secret Key')
    key = models.CharField(max_length=80, unique=True)
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_key(cls, user, name='Default Secret Key'):
        token = f"lk_live_{secrets.token_urlsafe(28)}"
        return cls.objects.create(user=user, name=name, key=token)

    def __str__(self):
        return f"{self.name} - {self.key[:12]}..."


class TeamMember(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_members')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    role = models.CharField(max_length=50, default='Editor')
    status = models.CharField(max_length=30, default='Active')
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"
