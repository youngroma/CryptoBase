import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def register_url():
    return reverse('register')

@pytest.fixture
def login_url():
    return reverse('login')

@pytest.fixture
def logout_url():
    return reverse('logout')

@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='test_example_user',
        email='tester@example.com',
        password='secret123'
    )

class AuthTestMixin:
    def register_user(self, client, url, **kwargs):
        default_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'defaultpassword123'
        }
        default_data.update(kwargs)
        return client.post(url, default_data)

    def login_user(self, client, email, password, login_url):
        return client.post(login_url, {
            'email': email,
            'password': password
        }, format='json')

class TestRegisterView(AuthTestMixin):
    @pytest.mark.django_db
    def test_register_user_success(self, api_client, register_url):
        response = self.register_user(api_client, register_url, username='new_user')
        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.django_db
    def test_register_user_no_password(self, api_client, register_url):
        response = self.register_user(api_client, register_url, username='new_user', email='new_user@email.com', password='')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    def test_register_user_duplicate_username(self, api_client, register_url):
        User.objects.create_user(username='existing', email='test@example.com', password='pass')

        response = self.register_user(api_client, register_url, username='existing', email='new@example.com',
                                      password='newpassword')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data


class TestLoginView(AuthTestMixin):
    def test_login_user_success(self, api_client, user, login_url):
        response = self.login_user(api_client, 'tester@example.com', 'secret123', login_url)

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == 'tester@example.com'

    def test_login_invalid_email(self, api_client, user, login_url):
        response = self.login_user(api_client, 'invalid@example.com', 'random123', login_url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_login_invalid_password(self, api_client, user, login_url):
        response = self.login_user(api_client, 'test@example.com', 'invalidpass', login_url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_login_validation_error(self, api_client, user, login_url):
        response = self.login_user(api_client, '', '', login_url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
        assert 'password' in response.data


class TestLogoutView:
    @pytest.mark.django_db
    def test_logout_success(self, api_client, user, logout_url):
        refresh = RefreshToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        response = api_client.post(logout_url, {'refresh': str(refresh)})

        assert response.status_code == status.HTTP_205_RESET_CONTENT

    @pytest.mark.django_db
    def test_logout_unauthorized(self, api_client, logout_url):
        response = api_client.post(logout_url, {'refresh': 'invalidtoken'})
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST]