import json
import httpx
from django.core.cache import cache
import logging

logging.basicConfig(level=logging.INFO)

async def getChartDataAsync(slug, interval_type="daily"):
    cache_key = f"chart_data_{slug}_{interval_type}"
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

    url = f"https://api.coingecko.com/api/v3/coins/{slug}/market_chart"
    params = {
        "vs_currency": "usd",
        "days": days
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        prices = data.get("prices", [])
        formatted_data = [{"timestamp": ts, "price": price} for ts, price in prices]

        print(f"Caching data for {cache_key}: {formatted_data}")
        cache.set(cache_key, json.dumps(formatted_data), timeout=60 * 60)

        logging.info("Fetched new data from API and cached it.")
        return formatted_data
    else:
        return {"error": response.json()}



