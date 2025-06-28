from unittest.mock import patch
import pytest
from django.urls import reverse
from rest_framework import status
from conftest import api_client


@pytest.fixture
def crypto_details_url():
    def _build(slug):
        return reverse('crypto-details', kwargs={"slug": slug})
    return _build

class TestCryptoDetailView:
    @patch("portfolio.views.get_cached_data")
    def test_success_response(self, mock_get_cached_data, api_client, crypto_details_url):
        mock_get_cached_data.return_value = {
                "name": "Bitcoin",
                "symbol": "btc",
                "image": {
                    "thumb": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png"
                },
                "market_data": {
                    "current_price": {
                        "usd": 100000
                    },
                    "market_cap_rank": 1,
                    "price_change_percentage_24h": 2.5,
                    "market_cap": {
                        "usd": 580000000000
                    },
                    "total_volume": {
                        "usd": 35000000000
                    },
                    "total_supply": 21000000,
                    "max_supply": 21000000,
                    "circulating_supply": 19500000,
                    "fully_diluted_valuation": {
                        "usd": 630000000000
                    },
                    "high_24h": {
                        "usd": 110000
                    },
                    "low_24h": {
                        "usd": 107000
                    },
                    "ath": {
                        "usd": 99000
                    }
                }
            }


        url = crypto_details_url("Bitcoin")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, dict)
        assert response.data['name'] == "Bitcoin"

    @patch("portfolio.views.get_cached_data")
    def test_wrong_slug(self, mock_get_cached_data, api_client, crypto_details_url):
        mock_get_cached_data.return_value = {"error": "Wrong slug"}

        url = crypto_details_url("Bibconi")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_502_BAD_GATEWAY
        assert response.data["error"] == "Wrong slug"
        assert "Bibconi" in url

    @patch("portfolio.views.get_cached_data")
    def test_external_api_error(self, mock_get_cached_data, api_client, crypto_details_url):
        mock_get_cached_data.return_value = {"error": "External service unavailable"}

        url = crypto_details_url("Bitcoin")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_502_BAD_GATEWAY
        assert "error" in response.data

    @patch("portfolio.views.get_cached_data")
    def test_incomplete_data_in_response(self, mock_get_cached_data, api_client, crypto_details_url):
        mock_get_cached_data.return_value = {
                "name": "Bitcoin",
                "symbol": "btc",
                "image": {
                    "thumb": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png"
                },
                "market_data": {
                    "current_price": {
                        "usd": 100000
                    },
                    "market_cap_rank": 1,
                    "price_change_percentage_24h": "N/A",
                    "market_cap": {
                        "usd": 580000000000
                    },
                    "total_volume": {
                        "usd": "N/A"
                    },
                    "total_supply": 21000000,
                    "max_supply": 21000000,
                    "circulating_supply": None,
                    "fully_diluted_valuation": {
                        "usd": 630000000000
                    },
                    "high_24h": {
                        "usd": 110000
                    },
                    "low_24h": {
                        "usd": 107000
                    },
                    "ath": {
                        "usd": None
                    }
                }
            }


        url = crypto_details_url("Bitcoin")
        response = api_client.get(url)

        expected_keys = {
            "name",
            "image",
            "symbol",
            "current_price",
            "rank",
            "price_change_percentage_24h",
            "market_cap",
            "total_volume",
            "total_supply",
            "max_supply",
            "circulating_supply",
            "fdv",
            "high_24h",
            "low_24h",
            "ath"
        }

        assert response.status_code == status.HTTP_200_OK
        assert set(response.data.keys()) == expected_keys

    @patch("portfolio.views.get_cached_data")
    def test_missing_nested_keys_returns_defaults(self, mock_get_cached_data, api_client, crypto_details_url):
        mock_get_cached_data.return_value = {
            "name": "Bitcoin",
            "symbol": "btc",
            # 'image' key not available
            "market_data": {
                # "current_price" missing

                # All other keys are missing or empty
            }
        }

        url = crypto_details_url("bitcoin")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        data = response.data

        assert data["name"] == "Bitcoin"
        assert data["symbol"] == "btc"
        assert data["image"] == None
        assert data["current_price"] == "N/A"
        assert data["rank"] == "N/A"
        assert data["price_change_percentage_24h"] == "N/A"
        assert data["market_cap"] == "N/A"
        assert data["total_volume"] == "N/A"
        assert data["total_supply"] == "N/A"
        assert data["max_supply"] == "N/A"
        assert data["circulating_supply"] == "N/A"
        assert data["fdv"] == "N/A"
        assert data["high_24h"] == "N/A"
        assert data["low_24h"] == "N/A"
        assert data["ath"] == "N/A"

    @patch("portfolio.views.get_cached_data")
    def test_method_not_allowed(self, mock_get_cached_data, api_client, crypto_details_url):
        url = crypto_details_url("bitcoin")
        response = api_client.post(url, {})

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

