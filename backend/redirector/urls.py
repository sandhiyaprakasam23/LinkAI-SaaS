from django.urls import path
from .views import RedirectLinkView, VerifyPasswordView

urlpatterns = [
    path('<str:short_code>/', RedirectLinkView.as_view(), name='redirect-link'),
    path('<str:short_code>/verify-password/', VerifyPasswordView.as_view(), name='verify-password'),
]
