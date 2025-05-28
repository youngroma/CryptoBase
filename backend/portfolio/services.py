import json
import httpx
from django.core.cache import cache
import logging

logging.basicConfig(level=logging.INFO)

async def getChartDataAsync(slug, interval_type="daily", chart_type="line"):
    cache_key = f"chart_data_{slug}_{interval_type}_{chart_type}"
    cached_data = cache.get(cache_key)

    if cached_data:
        logging.info(f"Cache hit for {cache_key}")
        return json.loads(cached_data)

    logging.info(f"Cache miss for {cache_key}, fetching new data.")

    interval_days_map = {
        "5min": 1,
        "hourly": 30,
        "daily": 365
    }

    days = interval_days_map.get(interval_type, 30)

    if chart_type == "candlestick":
        url = f"https://api.coingecko.com/api/v3/coins/{slug}/ohlc"
        params = {
            "vs_currency": "usd",
            "days": days
        }
    else:
        url = f"https://api.coingecko.com/api/v3/coins/{slug}/market_chart"
        params = {
            "vs_currency": "usd",
            "days": days
        }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)

        if response.status_code == 200:
            data = response.json()

            if chart_type == "candlestick":
                formatted_data = [
                    {
                        "timestamp": item[0],
                        "open": item[1],
                        "high": item[2],
                        "low": item[3],
                        "close": item[4],
                    }
                    for item in data
                ]
            else:
                prices = data.get("prices", [])
                formatted_data = [{"timestamp": ts, "price": price} for ts, price in prices]

            # Set cache timeout
            timeout = {
                "5min": 5 * 60,     # 5 minutes for 5-minute chart
                "hourly": 60 * 60,       # 1 hour for the time schedule
                "daily": 24 * 60 * 60       # 1 day for daily schedule
            }.get(interval_type, 60 * 60)   # Default 1 hour

            print(f"Caching data for {cache_key}: {formatted_data}")
            cache.set(cache_key, json.dumps(formatted_data), timeout)
            logging.info("Fetched new data from API and cached it.")
            return formatted_data
        else:
            return {"error": response.json()}

    except httpx.RequestError as e:
        return {"error": f"Request failed: {str(e)}"}

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return {"error": f"An error occurred: {str(e)}"}



