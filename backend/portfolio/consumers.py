import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import requests
import httpx
from .services import getChartDataAsync


class CryptoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get cryptocurrency slug from URL
        self.slug = self.scope['url_route']['kwargs']['slug']
        await self.accept()

        # Perpetual cycle for data update
        while True:
            try:
                # Get data for the graph
                chart_data = await getChartDataAsync(self.slug)  # Call getChartData from services

                # Send data via WebSocket
                await self.send(text_data=json.dumps({
                    "chart_data": chart_data
                }))

                # Update data every 10 seconds
                await asyncio.sleep(10)
            except Exception as e:
                await self.send(text_data=json.dumps({"error": str(e)}))
                break

    async def disconnect(self, close_code):
        pass
