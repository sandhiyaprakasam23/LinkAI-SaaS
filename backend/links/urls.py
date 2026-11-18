from django.urls import path
from .views import (
    LinkListCreateView, LinkDetailView, LinkBulkActionView,
    AISuggestAliasView, AISuggestTitleView, LinkQRCodeView
)

urlpatterns = [
    path('', LinkListCreateView.as_view(), name='link-list-create'),
    path('<int:pk>/', LinkDetailView.as_view(), name='link-detail'),
    path('bulk-action/', LinkBulkActionView.as_view(), name='link-bulk-action'),
    path('ai-suggest-alias/', AISuggestAliasView.as_view(), name='ai-suggest-alias'),
    path('ai-suggest-title/', AISuggestTitleView.as_view(), name='ai-suggest-title'),
    path('<int:pk>/qr/', LinkQRCodeView.as_view(), name='link-qr'),
]
