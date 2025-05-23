from django.db import models
from django.conf import settings

class PortfolioTransaction(models.Model):
    TRANSACTION_TYPES = (
        ("buy", "Buy"),
        ("sell", "Sell"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    coin_id = models.CharField(max_length=100)  # ID with CoinGecko, for example "bitcoin
    symbol = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=20, decimal_places=8)  # How much bought/sold
    price_usd = models.DecimalField(max_digits=20, decimal_places=8)  # purchase price
    type = models.CharField(max_length=4, choices=TRANSACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} {self.amount} {self.coin_id}"
