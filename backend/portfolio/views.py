import logging
import requests
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import PortfolioTransaction
from .serializers import PortfolioTransactionSerializer

def get_cached_data(cache_key, url, params=None):
    cached_data = cache.get(cache_key)

    if cached_data:
        logging.info(f"Cache hit for {cache_key}")
        return cached_data

    logging.info(f"Cache miss for {cache_key}. Fetching from API.")

    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            cache.set(cache_key, data, timeout=60 * 60)  # Cash for 60 minutes
            return data
        else:
            return {"error": "Failed to fetch data from CoinGecko"}
    except requests.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}


class CryptoListView(APIView):
    def get(self, request):
        cache_key = "crypto_list"
        if request.query_params.get("refresh") == "true":
            cache.delete(cache_key)
            cached_data = None

        url = "https://api.coingecko.com/api/v3/coins/markets"
        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 20,
            "page": 1,
            "sparkline": False
        }

        data = get_cached_data(cache_key, url, params)

        if "error" in data:
            return Response(data, status=status.HTTP_502_BAD_GATEWAY)

        result = [
            {
                "name": coin.get("name"),
                "image": coin.get("image"),
                "symbol": coin.get("symbol"),
                "current_price": coin.get("current_price"),
                "market_cap": coin.get("market_cap"),
                "market_cap_rank": coin.get("market_cap_rank")
            }
            for coin in data
        ]

        return Response(result)

class CryptoDetailView(APIView):
    def get(self, request, slug):
        cache_key = f"crypto_detail_{slug}"
        url = f"https://api.coingecko.com/api/v3/coins/{slug}"
        data = get_cached_data(cache_key, url)

        if "error" in data:
            return Response(data, status=status.HTTP_502_BAD_GATEWAY)

        result = {
            "name": data.get("name"),
            "image": data["image"]["thumb"],
            "symbol": data.get("symbol"),
            "current_price": data["market_data"]["current_price"]["usd"],
            "rank": data.get("market_cap_rank", "N/A"),  # Rating on CoinGecko
            "price_change_percentage_24h": data["market_data"].get("price_change_percentage_24h", "N/A"),   # Change in 24 hours
            "market_cap": data["market_data"]["market_cap"]["usd"],
            "total_volume": data["market_data"]["total_volume"]["usd"],
            "total_supply": data["market_data"].get("total_supply", "N/A"),  # may be none
            "max_supply": data["market_data"].get("max_supply", "N/A"),  # may be none
            "circulating_supply": data["market_data"].get("circulating_supply", "N/A"),  # may be none
            "fdv": data["market_data"].get("fully_diluted_valuation", {}).get("usd", "N/A"),
            "high_24h": data["market_data"].get("high_24h", {}).get("usd", "N/A"),  # Lowest
            "low_24h": data["market_data"].get("low_24h", {}).get("usd", "N/A"),  # And Highest price in 24h
            "ath": data["market_data"].get("ath", {}).get("usd", "N/A"),  # The Highest price of all time
        }

        return Response(result)


class PortfolioTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PortfolioTransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
