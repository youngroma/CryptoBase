# services.py
import httpx


async def getChartDataAsync(slug, interval_type="daily"):
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
        return formatted_data
    else:
        return {"error": response.json()}



