from django.urls import path
from .views import CryptoListView

urlpatterns = [
    path('', CryptoListView.as_view(), name='crypto-list'),
]