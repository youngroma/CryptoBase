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

        if interval_type in VALID_INTERVALS:
            self.interval_type = interval_type
            # Stop old problem
            if self.chart_task:
                self.chart_task.cancel()
                try:
                    await self.chart_task
                except asyncio.CancelledError:
                    pass

            # Run a new task with a new interval
            self.chart_task = asyncio.create_task(self.send_chart_data_loop())

            await self.send(text_data=json.dumps({"message": f"Interval changed to {interval_type}"}))
        else:
            await self.send(text_data=json.dumps({"error": "Invalid interval type."}))

    async def send_chart_data_loop(self):
        while self.running:
            try:
                # Get data for the graph
                chart_data = await getChartDataAsync(self.slug, self.interval_type)  # Call getChartData from services

                # Send data via WebSocket
                await self.send(text_data=json.dumps({
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


