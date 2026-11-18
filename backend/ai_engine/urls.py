from django.urls import path
from .views import AIInsightsView, AIPredictView, AICampaignView, AICopilotView

urlpatterns = [
    path('insights/', AIInsightsView.as_view(), name='ai-insights'),
    path('predict/', AIPredictView.as_view(), name='ai-predict'),
    path('campaign/', AICampaignView.as_view(), name='ai-campaign'),
    path('copilot/', AICopilotView.as_view(), name='ai-copilot'),
]
