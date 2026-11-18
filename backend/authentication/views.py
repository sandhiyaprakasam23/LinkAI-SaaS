from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, ApiKey, TeamMember
from .serializers import UserSerializer, UserProfileSerializer, ApiKeySerializer, TeamMemberSerializer

def get_or_create_demo_user():
    user, created = User.objects.get_or_create(
        username='demo_user',
        defaults={'email': 'alex@linkai.io', 'first_name': 'Alex', 'last_name': 'Vance'}
    )
    if created:
        user.set_password('demo1234')
        user.save()
        UserProfile.objects.create(
            user=user,
            company='LinkAI Hypergrowth',
            plan='Pro',
            role='Owner',
            avatar_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        )
        ApiKey.generate_key(user=user, name='Production Live Key')
        ApiKey.generate_key(user=user, name='Zapier Automations')
        TeamMember.objects.create(owner=user, name='Sophia Martinez', email='sophia@linkai.io', role='Admin')
        TeamMember.objects.create(owner=user, name='David Chen', email='david@linkai.io', role='Analyst')
    elif not hasattr(user, 'profile'):
        UserProfile.objects.create(user=user)
    return user

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email', '')
        password = request.data.get('password')
        company = request.data.get('company', 'LinkAI Workspace')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        profile = UserProfile.objects.create(user=user, company=company, plan='Pro', role='Owner')
        token, _ = Token.objects.get_or_create(user=user)
        ApiKey.generate_key(user=user, name='Default Live API Key')

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Auto-fallback to demo user if requested
        if request.data.get('is_demo'):
            user = get_or_create_demo_user()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Demo logged in successfully'
            })

        user = authenticate(username=username, password=password)
        if not user:
            # Check if username was email
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Logged in successfully'
        })


class ProfileView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        return Response(UserSerializer(user).data)

    def put(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.company = request.data.get('company', profile.company)
        profile.plan = request.data.get('plan', profile.plan)
        profile.role = request.data.get('role', profile.role)
        profile.avatar_url = request.data.get('avatar_url', profile.avatar_url)
        profile.save()
        return Response(UserSerializer(user).data)


class ApiKeyListView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        keys = ApiKey.objects.filter(user=user)
        return Response(ApiKeySerializer(keys, many=True).data)

    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        name = request.data.get('name', 'Secret API Key')
        new_key = ApiKey.generate_key(user=user, name=name)
        return Response(ApiKeySerializer(new_key).data, status=status.HTTP_201_CREATED)


class ApiKeyDetailView(APIView):
    def delete(self, request, pk):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        try:
            key_obj = ApiKey.objects.get(id=pk, user=user)
            key_obj.delete()
            return Response({'message': 'API Key revoked successfully'})
        except ApiKey.DoesNotExist:
            return Response({'error': 'Key not found'}, status=status.HTTP_404_NOT_FOUND)


class TeamMemberListView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        members = TeamMember.objects.filter(owner=user)
        return Response(TeamMemberSerializer(members, many=True).data)

    def post(self, request):
        user = request.user if request.user.is_authenticated else get_or_create_demo_user()
        name = request.data.get('name', '')
        email = request.data.get('email', '')
        role = request.data.get('role', 'Editor')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        member = TeamMember.objects.create(owner=user, name=name or email.split('@')[0], email=email, role=role)
        return Response(TeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)
