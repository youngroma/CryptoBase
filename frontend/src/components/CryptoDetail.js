import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Button, ButtonGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";

const CryptoDetail = () => {
  const { id } = useParams();
  const [crypto, setCrypto] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [interval, setInterval] = useState("daily");
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка базовых данных криптовалюты с бэкенда
  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const response = await fetch(`http://localhost:8000/details/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("CryptoDetail API Response:", data);
          setCrypto(data);
        } else {
          const text = await response.text();
          console.log("Server Response Text:", text);
          let errorMessage = `Не удалось загрузить данные: ${response.statusText} (Status: ${response.status})`;
          if (text.startsWith("<!DOCTYPE html")) {
            errorMessage = "Ошибка на сервере. Пожалуйста, попробуйте позже.";
          } else {
            try {
              const errorData = JSON.parse(text);
              errorMessage = `Не удалось загрузить данные: ${errorData.error || response.statusText}`;
            } catch {
              errorMessage = `Не удалось загрузить данные: ${response.statusText} (Unexpected response: ${text.slice(0, 100)}...)`;
            }
          }
          setError(errorMessage);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(`Ошибка сети: ${err.message}. Проверьте подключение.`);
      } finally {
        setLoading(false);
      }
    };
    fetchCrypto();
  }, [id]);

  // WebSocket для получения chart_data и обновления цены
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/crypto/${id}/`);
    ws.onopen = () => {
      console.log("WebSocket connected");
      // Отправляем начальный интервал
      ws.send(JSON.stringify({ interval_type: interval }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket data:", data);
        // Обработка chart_data
        if (data.chart_data && Array.isArray(data.chart_data)) {
          const formattedData = data.chart_data
            .map((item) => {
              if (!item?.timestamp || item?.price == null) return null;
              return {
                x: new Date(item.timestamp),
                y: chartType === "line" ? item.price : [item.price, item.price, item.price, item.price],
              };
            })
            .filter((item) => item !== null);
          setChartData(formattedData);
        }
        // Обработка цены
        if (typeof data.price === "number") {
          setCrypto((prev) => (prev ? { ...prev, current_price: data.price } : prev));
        }
        // Обработка ошибок
        if (data.error) {
          setError(`Ошибка WebSocket: ${data.error}`);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
        setError("Ошибка обработки данных WebSocket.");
      }
    };
    ws.onclose = () => console.log("WebSocket disconnected");
    // Отправка нового интервала при изменении
    ws.onopen = () => {
      ws.send(JSON.stringify({ interval_type: interval }));
    };
    return () => ws.close();
  }, [id, interval, chartType]);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toFixed(2);
  };

  const lineChartOptions = {
    chart: { type: "line", height: 400, toolbar: { show: true }, background: "#ffffff" },
    title: {
      text: `Price Chart (${interval === "5min" ? "5m" : interval === "hourly" ? "1h" : "1d"})`,
      align: "left",
      style: { fontSize: "18px", color: "#1a202c", fontWeight: "600" },
    },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#4a5568", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${formatNumber(value)}`,
        style: { colors: "#4a5568", fontSize: "12px" },
      },
    },
    stroke: { curve: "smooth", width: 2, colors: ["#3182ce"] },
    grid: { borderColor: "#e2e8f0" },
    fill: {
      type: "gradient",
      gradient: { shade: "light", gradientToColors: ["#63b3ed"], stops: [0, 100] },
    },
    tooltip: { theme: "light", style: { fontSize: "12px" } },
  };

  const candlestickChartOptions = {
    chart: { type: "candlestick", height: 400, toolbar: { show: true }, background: "#ffffff" },
    title: {
      text: `Candlestick Chart (${interval === "5min" ? "5m" : interval === "hourly" ? "1h" : "1d"})`,
      align: "left",
      style: { fontSize: "18px", color: "#1a202c", fontWeight: "600" },
    },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#4a5568", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${formatNumber(value)}`,
        style: { colors: "#4a5568", fontSize: "12px" },
      },
    },
    plotOptions: {
      candlestick: { colors: { upward: "#48bb78", downward: "#f56565" } },
    },
    grid: { borderColor: "#e2e8f0" },
    tooltip: { theme: "light", style: { fontSize: "12px" } },
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;
  if (!crypto || !crypto.name || !crypto.symbol || crypto.current_price === undefined) {
    return <Alert variant="danger" className="mt-5">Данные о криптовалюте недоступны. Попробуйте позже.</Alert>;
  }

  return (
    <Container
      className="mt-5"
      style={{
        backgroundColor: "#f7fafc",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        padding: "2rem",
      }}
    >
      <h1 className="text-4xl font-bold mb-4 text-gray-900">{crypto.name} ({crypto.symbol.toUpperCase()})</h1>
      <div className="text-xl mb-4 text-gray-700">
        1 {crypto.symbol.toUpperCase()} = ${formatNumber(crypto.current_price)} USD{" "}
        <span className={crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
          {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
          {formatNumber(crypto.price_change_percentage_24h)}%
        </span>
      </div>
      <ButtonGroup className="mb-4">
        <Button
          variant={chartType === "line" ? "primary" : "outline-primary"}
          onClick={() => setChartType("line")}
          style={{
            borderRadius: "8px 0 0 8px",
            padding: "10px 20px",
            backgroundColor: chartType === "line" ? "#3182ce" : "#edf2f7",
            borderColor: "#3182ce",
            color: chartType === "line" ? "#fff" : "#3182ce",
          }}
        >
          Line
        </Button>
        <Button
          variant={chartType === "candlestick" ? "primary" : "outline-primary"}
          onClick={() => setChartType("candlestick")}
          style={{
            borderRadius: "0 8px 8px 0",
            padding: "10px 20px",
            backgroundColor: chartType === "candlestick" ? "#3182ce" : "#edf2f7",
            borderColor: "#3182ce",
            color: chartType === "candlestick" ? "#fff" : "#3182ce",
          }}
        >
          Candlestick
        </Button>
      </ButtonGroup>
      <ButtonGroup className="mb-4">
        <Button
          variant={interval === "5min" ? "primary" : "outline-primary"}
          onClick={() => setInterval("5min")}
          style={{
            borderRadius: "8px 0 0 8px",
            padding: "10px 20px",
            backgroundColor: interval === "5min" ? "#3182ce" : "#edf2f7",
            borderColor: "#3182ce",
            color: interval === "5min" ? "#fff" : "#3182ce",
          }}
        >
          5m
        </Button>
        <Button
          variant={interval === "hourly" ? "primary" : "outline-primary"}
          onClick={() => setInterval("hourly")}
          style={{
            padding: "10px 20px",
            backgroundColor: interval === "hourly" ? "#3182ce" : "#edf2f7",
            borderColor: "#3182ce",
            color: interval === "hourly" ? "#fff" : "#3182ce",
          }}
        >
          1h
        </Button>
        <Button
          variant={interval === "daily" ? "primary" : "outline-primary"}
          onClick={() => setInterval("daily")}
          style={{
            borderRadius: "0 8px 8px 0",
            padding: "10px 20px",
            backgroundColor: interval === "daily" ? "#3182ce" : "#edf2f7",
            borderColor: "#3182ce",
            color: interval === "daily" ? "#fff" : "#3182ce",
          }}
        >
          1d
        </Button>
      </ButtonGroup>
      {chartData.length > 0 ? (
        <Card
          className="mb-4"
          style={{
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Card.Body>
            <Chart
              options={chartType === "line" ? lineChartOptions : candlestickChartOptions}
              series={[{ data: chartData }]}
              type={chartType}
              height={400}
            />
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="warning" className="mb-4">
          Данные графика недоступны. Попробуйте другой интервал или подождите.
        </Alert>
      )}
      <Row className="mt-4">
        <Col md={6}>
          <Card
            style={{
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
            }}
          >
            <Card.Body>
              <Card.Title className="text-xl font-semibold text-gray-900">Детали</Card.Title>
              <p className="text-gray-700">
                <strong>Цена:</strong> ${formatNumber(crypto.current_price)}
              </p>
              <p className="text-gray-700">
                <strong>Капитализация:</strong> ${formatNumber(crypto.market_cap)}
              </p>
              <p className="text-gray-700">
                <strong>Объём (24ч):</strong> ${formatNumber(crypto.total_volume)}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CryptoDetail;