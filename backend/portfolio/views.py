import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class CryptoListView(APIView):
    def get(self, request):
        url = "https://api.coingecko.com/api/v3/coins/markets"
        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 20,
            "page": 1,
            "sparkline": False
        }
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return Response(response.json())
        else:
            return Response(
                {"error": "Failed to fetch data from CoinGecko"},
                status=status.HTTP_502_BAD_GATEWAY
            )
