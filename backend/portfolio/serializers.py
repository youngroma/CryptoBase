from rest_framework import serializers
from .models import PortfolioTransaction

class PortfolioTransactionSerializer(serializers.ModelSerializer):
    fee = serializers.DecimalField(max_digits=20, decimal_places=8, required=False, allow_null=True)

    class Meta:
        model = PortfolioTransaction
        fields = ['id', 'coin_id', 'amount', 'price_usd', 'fee', 'type', 'timestamp']
