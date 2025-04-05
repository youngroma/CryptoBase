from django.urls import path
from .views import CryptoListView, CryptoDetailView

urlpatterns = [
    path('', CryptoListView.as_view(), name='crypto-list'),
    path('details/<slug:slug>/', CryptoDetailView.as_view(), name='crypto-details'),
]