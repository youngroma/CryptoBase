from django.urls import path
from .views import CryptoListView, CryptoDetailView, PortfolioTransactionView, PortfolioSummaryView

urlpatterns = [
    path('', CryptoListView.as_view(), name='crypto-list'),
    path('details/<slug:slug>/', CryptoDetailView.as_view(), name='crypto-details'),
    path("portfolio/transactions/", PortfolioTransactionView.as_view(), name="portfolio_transaction"),
    path("portfolio/summary/", PortfolioSummaryView.as_view(), name="portfolio_summary"),
]
