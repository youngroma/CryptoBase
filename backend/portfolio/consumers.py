import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import requests
import httpx
from .services import getChartDataAsync

VALID_INTERVALS = ["5min", "hourly", "daily"]

class CryptoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get cryptocurrency slug from URL
        self.slug = self.scope['url_route']['kwargs']['slug']
        self.interval_type = "daily"  # default value
        self.running = True
        self.chart_type = "line"

        await self.accept()

        # Create background task
        self.chart_task = asyncio.create_task(self.send_chart_data_loop())

    async def disconnect(self, close_code):
        self.running = False

        if hasattr(self, 'chart_task'):
            self.chart_task.cancel()

    async def receive(self, text_data):
        data = json.loads(text_data)
        interval_type = data.get("interval_type")
        chart_type = data.get("chart_type", "line")

        if interval_type in VALID_INTERVALS and chart_type in ["line", "candlestick"]:
            self.interval_type = interval_type
            self.chart_type = chart_type

            if self.chart_task:
                self.chart_task.cancel()
                try:
                    await self.chart_task
                except asyncio.CancelledError:
                    pass

            self.chart_task = asyncio.create_task(self.send_chart_data_loop())

            await self.send(text_data=json.dumps({
                "message": f"Interval changed to {interval_type}, chart type changed to {chart_type}"
            }))
        else:
            await self.send(text_data=json.dumps({"error": "Invalid interval type or chart type."}))

    async def send_chart_data_loop(self):
        while self.running:
            try:
                # Get data for the graph
                chart_data = await getChartDataAsync(self.slug, self.interval_type, self.chart_type)  # Call getChartData from services

                # Send data via WebSocket
                await self.send(text_data=json.dumps({
                    "slug": self.slug,
                    "interval_type": self.interval_type,
                    "chart_type": self.chart_type,
                    "chart_data": chart_data
                }))

                if self.interval_type == "5min":
                    delay = 5 * 60
                elif self.interval_type == "hourly":
                    delay = 60 * 60
                elif self.interval_type == "daily":
                    delay = 24 * 60 * 60
                else:
                    delay = 60

                await asyncio.sleep(delay)
            except Exception as e:
                await self.send(text_data=json.dumps({"error": str(e)}))
                break


