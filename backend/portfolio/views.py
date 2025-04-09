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

class CryptoDetailView(APIView):
    def get(self, request, slug):
        url = f"https://api.coingecko.com/api/v3/coins/{slug}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
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
                "low_24h": data["market_data"].get("low_24h", {}).get("usd", "N/A"),     # And Highest price in 24h
                "ath": data["market_data"].get("ath", {}).get("usd", "N/A"),    # The Highest price of all time
            }

            interval = request.query_params.get("interval", "daily")
            chart_data = self.getChartDataSync(slug, interval)

            result["chart_data"] = chart_data

            return Response(result)
        else:
            return Response(
                {"error": f"Failed to fetch data for {slug} from CoinGecko"},
                status=status.HTTP_502_BAD_GATEWAY
            )

    def getChartDataSync(self, slug, interval_type="daily"):
        interval_days_map = {
            "5min": 1,
            "hourly": 30,
            "daily": 365
        }

        days = interval_days_map.get(interval_type, 30)

        url = f"https://api.coingecko.com/api/v3/coins/{slug}/market_chart"
        params = {
            "vs_currency": "usd",
            "days": days
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            data = response.json()
            prices = data.get("prices", [])
            formatted_data = [{"timestamp": ts, "price": price} for ts, price in prices]
            return formatted_data
        else:
            return {"error": response.json()}


