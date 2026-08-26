# commandes/dashboard_urls.py
from django.urls import path
from .views import DashboardStatsView, DashboardActivite7jView, DashboardFinancesView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('activite-7j/', DashboardActivite7jView.as_view(), name='dashboard-activite'),
    path('finances/', DashboardFinancesView.as_view(), name='dashboard-finances'),
]