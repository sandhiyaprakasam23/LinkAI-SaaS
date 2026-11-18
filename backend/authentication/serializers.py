from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, ApiKey, TeamMember

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar_url', 'company', 'plan', 'role', 'monthly_link_limit', 'monthly_api_calls_limit', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class ApiKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiKey
        fields = ['id', 'name', 'key', 'is_active', 'last_used', 'created_at']
        read_only_fields = ['key', 'created_at']

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'email', 'role', 'status', 'joined_at']
