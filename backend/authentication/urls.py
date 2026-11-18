from django.urls import path
from .views import RegisterView, LoginView, ProfileView, ApiKeyListView, ApiKeyDetailView, TeamMemberListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('api-keys/', ApiKeyListView.as_view(), name='api-keys'),
    path('api-keys/<int:pk>/', ApiKeyDetailView.as_view(), name='api-key-detail'),
    path('team/', TeamMemberListView.as_view(), name='team'),
]
