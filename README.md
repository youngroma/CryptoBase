# 🪙 CryptoBase

**CryptoBase** is a full-stack cryptocurrency portfolio tracker application built with Django, Django REST Framework, PostgreSQL, Redis, Docker and WebSockets, on the Frontend side used: React. It allows users to manage their crypto transactions, get real-time market data, and view detailed charts including candlestick views powered by the CoinGecko API.

---

## 🚀 Features

- 🔐 JWT Authentication
- 🧾 Portfolio & Transaction Management
- 📈 Real-time Chart Updates via WebSockets
- 📉 Candlestick and Line Charts Support
- 🐋 Dockerized Environment
- 🔁 Caching via Redis
- 🌍 CoinGecko API Integration

---

## 🧱 Tech Stack

- **Backend**: Django, Django REST Framework, Django Channels, PostgreSQL, Redis, Websockets
- **Frontend**: React
- **WebSocket**: Django Channels
- **Async HTTP**: `httpx`
- **Caching**: Redis
- **Deployment**: Docker, Docker Compose

---

## 🐳 Getting Started (Docker)

### 1. Clone the repository

```bash
https://github.com/youngroma/CryptoBase.git
cd cryptobase
```

### 2. Create `.env` for the backend

```
SECRET_KEY=your-secret-key
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=crypto_db
DB_PORT=5432(or your port)
REDIS_HOST=redis-server

REDIS_PORT=6379(or your port)
REDIS_DB=1
```

### 3. Run the services

```bash
docker-compose up --build
```

### 4. Apply database migrations

```bash
docker-compose exec backend python manage.py migrate
```

---

## API Endpoints Overview

### Auth
- `POST /auth/register/` – User registration
- `POST /auth/login/` – Login and receive JWT tokens
- `POST /auth/logout/` – Logout (invalidate token)

### Crypto
- `GET /` – List of cryptocurrencies
- `GET /details/<slug>/` – Detailed info + chart (supports `interval_type` & `chart_type`)

### Portfolio
- `GET /portfolio/summary/` – Portfolio summary with P&L
- `GET/POST /portfolio/transactions/` – View or create transactions

### Favorites
- `GET /favorites/` – Get favorite coins
- `POST /favorites/` – Add to favorites
- `DELETE /favorites/` – Remove from favorites


Parameters:

- `interval_type`: `5min`, `hourly`, `daily`
- `chart_type`: `line`, `candlestick`

---

## 🔄 WebSocket Usage

**Endpoint:**

```
ws://localhost:8000/ws/crypto/<slug>/
```

**To change interval type (client sends):**

```json
{
  "interval_type": "hourly"
}
```

**Server response – Line chart:**

```json
{
  "chart_data": [
    { "timestamp": 1687500000000, "price": 28350.21 }
  ]
}
```

**Server response – Candlestick chart:**

```json
{
  "chart_data": [
    {
      "timestamp": 1687500000000,
      "open": 28310.0,
      "high": 28400.0,
      "low": 28250.0,
      "close": 28350.21
    }
  ]
}
```

---

## 🧠 Caching Strategy

Chart data from CoinGecko is cached with the following TTLs:

| Interval      | Cache TTL         |
|---------------|-------------------|
| 5min          | 5 minutes         |
| hourly        | 1 hour            |
| daily         | 24 hours          |

---

