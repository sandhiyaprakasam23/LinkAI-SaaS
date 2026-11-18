from django.urls import path
from .views import (
    AutomationRuleListCreateView, AutomationRuleDetailView,
    AutomationLogListView, TestWebhookView
)

urlpatterns = [
    path('rules/', AutomationRuleListCreateView.as_view(), name='automation-rules'),
    path('rules/<int:pk>/', AutomationRuleDetailView.as_view(), name='automation-rule-detail'),
    path('logs/', AutomationLogListView.as_view(), name='automation-logs'),
    path('test-webhook/', TestWebhookView.as_view(), name='automation-test-webhook'),
]
