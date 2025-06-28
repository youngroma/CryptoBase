from unittest.mock import patch
import pytest
from django.urls import reverse
from rest_framework import status
from conftest import api_client

@pytest.fixture
def crypto_list_url():
    return reverse('crypto-list')


@pytest.mark.django_db
class TestCryptoListView:

    @patch("portfolio.views.get_cached_data")
    def test_success_response(self, mock_get_cached_data, api_client, crypto_list_url):
        mock_get_cached_data.return_value = [
            {
                "name": "Bitcoin",
                "image": "btc.png",
                "symbol": "btc",
                "current_price": 100000,
                "market_cap": 1000000000,
                "market_cap_rank": 1,
            }
        ]

        response = api_client.get(crypto_list_url)

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert response.data[0]['name'] == "Bitcoin"

    @patch("portfolio.views.get_cached_data")
    @patch("portfolio.views.cache")
    def test_refresh_param_deletes_cache(self, mock_cache, mock_get_cached_data, api_client, crypto_list_url):
        mock_get_cached_data.return_value = []

        response = api_client.get(crypto_list_url + "?refresh=true")
        assert response.status_code == status.HTTP_200_OK
        mock_cache.delete.assert_called_once_with("crypto_list")

    @patch("portfolio.views.get_cached_data")
    @patch("portfolio.views.cache")
    def test_no_cache_delete_without_refresh(self, mock_cache, mock_get_cached_data, api_client, crypto_list_url):
        mock_get_cached_data.return_value = []

        response = api_client.get(crypto_list_url)
        assert response.status_code == status.HTTP_200_OK
        mock_cache.delete.assert_not_called()

    @patch("portfolio.views.get_cached_data")
    def test_external_api_error(self, mock_get_cached_data, api_client, crypto_list_url):
        mock_get_cached_data.return_value = {"error": "External service unavailable"}

        response = api_client.get(crypto_list_url)

        assert response.status_code == status.HTTP_502_BAD_GATEWAY
        assert "error" in response.data

    @patch("portfolio.views.get_cached_data")
    def test_empty_response(self, mock_get_cached_data, api_client, crypto_list_url):
        mock_get_cached_data.return_value = []

        response = api_client.get(crypto_list_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    @patch("portfolio.views.get_cached_data")
    def test_incomplete_data_in_response(self, mock_get_cached_data, api_client, crypto_list_url):
        mock_get_cached_data.return_value = [
            {
                "name": "Bitcoin",
                "image": None,
                "symbol": "btc",
                "current_price": 100000,
                "market_cap": None,
                "market_cap_rank": 1,
            }
        ]

        response = api_client.get(crypto_list_url)

        expected_keys = {"name", "image", "symbol", "current_price", "market_cap", "market_cap_rank"}

        assert response.status_code == status.HTTP_200_OK
        assert set(response.data[0].keys()) == expected_keys
