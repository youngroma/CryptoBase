import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Button, ButtonGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";

// Mock data for testing (can be removed when WebSocket works)
const mockChartData = [
  { timestamp: new Date().getTime() - 86400000, price: 100000 },
  { timestamp: new Date().getTime() - 72000000, price: 101000 },
  { timestamp: new Date().getTime() - 36000000, price: 102000 },
  { timestamp: new Date().getTime(), price: 102267 },
].map((item) => ({
  x: new Date(item.timestamp),
  y: item.price,
}));

const CryptoDetail = () => {
  const { id } = useParams();
  const [crypto, setCrypto] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [interval, setInterval] = useState("daily");
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch crypto data
  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const response = await fetch(`http://localhost:8000/details/${id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("CryptoDetail API Response:", data);
          setCrypto(data);
        } else {
          const text = await response.text();
          console.log("Server Response Text:", text);
          let errorMessage = `Не удалось загрузить данные: ${response.statusText} (Status: ${response.status})`;
          if (text.startsWith("<!DOCTYPE html")) errorMessage = "Ошибка на сервере. Пожалуйста, попробуйте позже.";
          else try { const errorData = JSON.parse(text); errorMessage = errorData.error || errorMessage; } catch {}
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

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/crypto/${id}/`);
    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ interval_type: interval }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket data:", data);
        if (data.chart_data && Array.isArray(data.chart_data)) {
          const formattedData = data.chart_data
            .map((item) => (item?.timestamp && item?.price != null ? {
              x: new Date(item.timestamp),
              y: chartType === "line" ? item.price : [item.price, item.price, item.price, item.price],
            } : null))
            .filter((item) => item !== null);
          setChartData(formattedData);
        }
        if (typeof data.price === "number") setCrypto((prev) => prev ? { ...prev, current_price: data.price } : prev);
        if (data.error) setError(`Ошибка WebSocket: ${data.error}`);
      } catch (err) {
        console.error("WebSocket message error:", err);
        setError("Ошибка обработки данных WebSocket.");
      }
    };
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
    return () => ws.close();
  }, [id, interval, chartType]);

  const formatNumber = (num) => (num == null || isNaN(num) ? "N/A" : num >= 1e9 ? (num / 1e9).toFixed(1) + "B" : num >= 1e6 ? (num / 1e6).toFixed(1) + "M" : num >= 1e3 ? (num / 1e3).toFixed(1) + "K" : num.toFixed(2));

  const lineChartOptions = {
    chart: { type: "line", height: 400, toolbar: { show: true }, background: "#1f252a" },
    title: { text: `Price Chart (${interval === "5min" ? "5m" : interval === "hourly" ? "1h" : "1d"})`, align: "left", style: { fontSize: "18px", color: "#f0b90b", fontWeight: "600" } },
    xaxis: { type: "datetime", labels: { style: { colors: "#a9b6c2", fontSize: "12px" } } },
    yaxis: { labels: { formatter: (v) => `$${formatNumber(v)}`, style: { colors: "#a9b6c2", fontSize: "12px" } } },
    stroke: { curve: "smooth", width: 2, colors: ["#f0b90b"] },
    grid: { borderColor: "#2c3238" },
    fill: { type: "gradient", gradient: { shade: "dark", gradientToColors: ["#f0b90b"], stops: [0, 100] } },
    tooltip: { theme: "dark", style: { fontSize: "12px", background: "#2c3238", color: "#fff" } },
  };

  const candlestickChartOptions = {
    chart: { type: "candlestick", height: 400, toolbar: { show: true }, background: "#1f252a" },
    title: { text: `Candlestick Chart (${interval === "5min" ? "5m" : interval === "hourly" ? "1h" : "1d"})`, align: "left", style: { fontSize: "18px", color: "#f0b90b", fontWeight: "600" } },
    xaxis: { type: "datetime", labels: { style: { colors: "#a9b6c2", fontSize: "12px" } } },
    yaxis: { labels: { formatter: (v) => `$${formatNumber(v)}`, style: { colors: "#a9b6c2", fontSize: "12px" } } },
    plotOptions: { candlestick: { colors: { upward: "#00c08b", downward: "#f6465d" } } },
    grid: { borderColor: "#2c3238" },
    tooltip: { theme: "dark", style: { fontSize: "12px", background: "#2c3238", color: "#fff" } },
  };

  if (loading) return <Spinner animation="border" style={{ color: "#f0b90b" }} className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5" style={{ background: "#2c3238", color: "#fff", border: "1px solid #f6465d" }}>{error}</Alert>;
  if (!crypto || !crypto.name || !crypto.symbol || crypto.current_price === undefined) return <Alert variant="danger" className="mt-5" style={{ background: "#2c3238", color: "#fff", border: "1px solid #f6465d" }}>Данные о криптовалюте недоступны. Попробуйте позже.</Alert>;

  return (
    <Container
      className="mt-4 p-4"
      style={{
        background: "#12161c",
        minHeight: "100vh",
        color: "#a9b6c2",
        fontFamily: "'Inter', sans-serif",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold" style={{ color: "#f0b90b" }}>
          {crypto.name} ({crypto.symbol.toUpperCase()}) <span style={{ color: "#00c08b" }}>HOT</span>
        </h1>
        <p className="text-lg" style={{ color: "#a9b6c2" }}>
          1 {crypto.symbol.toUpperCase()} = ${formatNumber(crypto.current_price)} USD{" "}
          <span className={crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
            {crypto.price_change_percentage_24h >= 0 ? "+" : ""}{formatNumber(crypto.price_change_percentage_24h)}%
          </span>
        </p>
      </div>

      <ButtonGroup className="mb-4 justify-content-center">
        <Button
          variant="outline-light"
          onClick={() => setChartType("line")}
          style={{
            background: chartType === "line" ? "linear-gradient(90deg, #f0b90b, #ffca28)" : "transparent",
            color: chartType === "line" ? "#fff" : "#a9b6c2",
            border: "1px solid #2c3238",
            borderRadius: "8px 0 0 8px",
            padding: "10px 20px",
            transition: "all 0.3s ease",
          }}
        >
          Line
        </Button>
        <Button
          variant="outline-light"
          onClick={() => setChartType("candlestick")}
          style={{
            background: chartType === "candlestick" ? "linear-gradient(90deg, #f0b90b, #ffca28)" : "transparent",
            color: chartType === "candlestick" ? "#fff" : "#a9b6c2",
            border: "1px solid #2c3238",
            borderRadius: "0 8px 8px 0",
            padding: "10px 20px",
            transition: "all 0.3s ease",
          }}
        >
          Candlestick
        </Button>
      </ButtonGroup>

      <ButtonGroup className="mb-4 justify-content-center">
        <Button
          variant="outline-light"
          onClick={() => setInterval("5min")}
          style={{
            background: interval === "5min" ? "linear-gradient(90deg, #f0b90b, #ffca28)" : "transparent",
            color: interval === "5min" ? "#fff" : "#a9b6c2",
            border: "1px solid #2c3238",
            borderRadius: "8px 0 0 8px",
            padding: "10px 15px",
            transition: "all 0.3s ease",
          }}
        >
          5m
        </Button>
        <Button
          variant="outline-light"
          onClick={() => setInterval("hourly")}
          style={{
            background: interval === "hourly" ? "linear-gradient(90deg, #f0b90b, #ffca28)" : "transparent",
            color: interval === "hourly" ? "#fff" : "#a9b6c2",
            border: "1px solid #2c3238",
            padding: "10px 15px",
            transition: "all 0.3s ease",
          }}
        >
          1h
        </Button>
        <Button
          variant="outline-light"
          onClick={() => setInterval("daily")}
          style={{
            background: interval === "daily" ? "linear-gradient(90deg, #f0b90b, #ffca28)" : "transparent",
            color: interval === "daily" ? "#fff" : "#a9b6c2",
            border: "1px solid #2c3238",
            borderRadius: "0 8px 8px 0",
            padding: "10px 15px",
            transition: "all 0.3s ease",
          }}
        >
          1d
        </Button>
      </ButtonGroup>

      {chartData.length > 0 ? (
        <Card className="mb-4" style={{ background: "#1f252a", border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}>
          <Card.Body>
            <Chart options={chartType === "line" ? lineChartOptions : candlestickChartOptions} series={[{ data: chartData }]} type={chartType} height={400} />
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="warning" className="mb-4" style={{ background: "#2c3238", color: "#a9b6c2", border: "1px solid #f0b90b" }}>
          Данные графика недоступны. Попробуйте другой интервал или подождите.
        </Alert>
      )}

      <Row className="mt-4">
        <Col md={6}>
          <Card style={{ background: "#1f252a", border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}>
            <Card.Body>
              <Card.Title className="text-xl font-semibold" style={{ color: "#f0b90b" }}>Детали</Card.Title>
              <p className="text-gray-300"><strong>Цена:</strong> ${formatNumber(crypto.current_price)}</p>
              <p className="text-gray-300"><strong>Капитализация:</strong> ${formatNumber(crypto.market_cap)}</p>
              <p className="text-gray-300"><strong>Объём (24ч):</strong> ${formatNumber(crypto.total_volume)}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Button
            variant="warning"
            style={{
              background: "linear-gradient(90deg, #f0b90b, #ffca28)",
              border: "none",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "bold",
              width: "100%",
              transition: "all 0.3s ease",
            }}
            onClick={() => alert("Функция покупки в разработке!")}
          >
            Купить {crypto.symbol.toUpperCase()}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default CryptoDetail;