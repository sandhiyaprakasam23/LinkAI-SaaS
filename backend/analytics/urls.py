from django.urls import path
from .views import (
    DashboardSummaryView, LinkDeepAnalyticsView, LinkCompareView,
    RealtimeFeedView, ExportCsvView, ExportPdfSummaryView, ScheduleExportView
)

urlpatterns = [
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('link/<int:pk>/', LinkDeepAnalyticsView.as_view(), name='link-analytics'),
    path('compare/', LinkCompareView.as_view(), name='link-compare'),
    path('realtime-feed/', RealtimeFeedView.as_view(), name='realtime-feed'),
    path('export/csv/', ExportCsvView.as_view(), name='export-csv'),
    path('export/pdf-summary/', ExportPdfSummaryView.as_view(), name='export-pdf-summary'),
    path('export/schedule/', ScheduleExportView.as_view(), name='export-schedule'),
]
