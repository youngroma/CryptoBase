from rest_framework import serializers
from .models import PortfolioTransaction

class PortfolioTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioTransaction
        fields = ['id', 'coin_id', 'symbol', 'amount', 'price_usd', 'type', 'timestamp']
