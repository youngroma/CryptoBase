import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Button, ButtonGroup, Modal, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";

const BuyModal = ({ show, onHide, crypto, onTransaction }) => {
  const [amount, setAmount] = useState("");
  const [priceUsd, setPriceUsd] = useState(crypto?.current_price || "");
  const [fee, setFee] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!priceUsd || priceUsd <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to your account.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/portfolio/transactions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coin_id: crypto.name.toLowerCase(),
          amount,
          price_usd: priceUsd,
          fee: fee || null,
          type: "buy",
        }),
      });

      if (response.ok) {
        onTransaction();
        onHide();
      } else {
        const data = await response.json();
        setError(data.error || "Error during purchase.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ background: "#1f252a", borderBottom: "1px solid #2c3238" }}>
        <Modal.Title style={{ color: "#f0b90b" }}>Buy {crypto?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#1f252a", color: "#a9b6c2" }}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{ background: "#2c3238", color: "#ffffff", border: "1px solid #3a4149" }}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price per Unit (USD)</Form.Label>
            <Form.Control
              type="number"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              placeholder="Enter price"
              style={{ background: "#2c3238", color: "#ffffff", border: "1px solid #3a4149" }}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fee (USD, optional)</Form.Label>
            <Form.Control
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="Enter fee"
              style={{ background: "#2c3238", color: "#ffffff", border: "1px solid #3a4149" }}
              className="custom-input"
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button
            variant="warning"
            onClick={handleSubmit}
            style={{ background: "#f0b90b", border: "none", width: "100%" }}
          >
            Buy
          </Button>
        </Form>
      </Modal.Body>
      <style jsx>{`
        .custom-input::placeholder {
          color: #a9b6c2 !important;
          opacity: 1;
        }
        .custom-input::-webkit-input-placeholder {
          color: #a9b6c2 !important;
        }
        .custom-input:-ms-input-placeholder {
          color: #a9b6c2 !important;
        }
        .custom-input::-ms-input-placeholder {
          color: #a9b6c2 !important;
        }
      `}</style>
    </Modal>
  );
};

const CryptoDetail = () => {
  const { id } = useParams();
  const [crypto, setCrypto] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [interval, setInterval] = useState("daily");
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const token = localStorage.getItem("token");


  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const response = await fetch(`http://localhost:8000/details/${id}/`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCrypto(data);
        } else {
          const text = await response.text();
          let errorMessage = `Failed to load data: ${response.statusText} (Status: ${response.status})`;
          if (text.startsWith("<!DOCTYPE html")) errorMessage = "Server error. Please try again later.";
          else try { const errorData = JSON.parse(text); errorMessage = errorData.error || errorMessage; } catch {}
          setError(errorMessage);
        }
      } catch (err) {
        setError(`Network error: ${err.message}. Check your connection.`);
      } finally {
        setLoading(false);
      }
    };


    const fetchFavoriteStatus = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:8000/favorites/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setIsFavorite(data.some(fav => fav.coin_id === id));
          }
        } catch (err) {
          setError("Error loading favorite status: " + err.message);
        }
      }
    };

    fetchCrypto();
    fetchFavoriteStatus();
  }, [id, token]);


  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/crypto/${id}/`);
    ws.onopen = () => {
      ws.send(JSON.stringify({ interval_type: interval, chart_type: chartType }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.chart_data && Array.isArray(data.chart_data)) {
          const formattedData = data.chart_data
            .map((item) => {
              if (item?.timestamp && (chartType === "candlestick" ? (item?.open != null && item?.high != null && item?.low != null && item?.close != null) : item?.price != null)) {
                if (chartType === "candlestick") {
                  return {
                    x: new Date(item.timestamp),
                    y: [item.open, item.high, item.low, item.close],
                  };
                } else {
                  return {
                    x: new Date(item.timestamp),
                    y: item.price,
                  };
                }
              }
              return null;
            })
            .filter((item) => item !== null);
          setChartData(formattedData);
        }

        if (typeof data.price === "number") {
          setCrypto((prev) => prev ? { ...prev, current_price: data.price } : prev);
        }

        if (data.error) setError(`WebSocket error: ${data.error}`);
      } catch (err) {
        setError("Error processing WebSocket data.");
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
    return () => ws.close();
  }, [id, interval, chartType]);

  const formatNumber = (num) => (num == null || isNaN(num) ? "N/A" : num >= 1e9 ? (num / 1e9).toFixed(1) + "B" : num >= 1e6 ? (num / 1e6).toFixed(1) + "M" : num >= 1e3 ? (num / 1e3).toFixed(1) + "K" : num.toFixed(2));

  const toggleFavorite = async () => {
    if (!token) {
      setError("Please log in to add to favorites.");
      return;
    }

    const method = isFavorite ? "DELETE" : "POST";
    try {
      const response = await fetch("http://localhost:8000/favorites/", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coin_id: id }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const data = await response.json();
        setError(data.error || "Error updating favorites.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

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
  if (!crypto || !crypto.name || !crypto.symbol || crypto.current_price === undefined) return <Alert variant="danger" className="mt-5" style={{ background: "#2c3238", color: "#fff", border: "1px solid #f6465d" }}>Cryptocurrency data unavailable. Please try again later.</Alert>;

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
        <Button
          variant={isFavorite ? "danger" : "outline-warning"}
          onClick={toggleFavorite}
          style={{
            marginTop: "10px",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "1rem",
            transition: "all 0.3s ease",
          }}
        >
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </Button>
      </div>

      <ButtonGroup className="mb-4 d-flex justify-content-center">
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

      <ButtonGroup className="mb-4 d-flex justify-content-center">
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
          Chart data unavailable. Try a different interval or wait.
        </Alert>
      )}

      <Row className="mt-4">
        <Col md={6}>
          <Card style={{ background: "#1f252a", border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}>
            <Card.Body>
              <Card.Title className="text-xl font-semibold" style={{ color: "#f0b90b" }}>Details</Card.Title>
              <p className="text-gray-300"><strong>Price:</strong> ${formatNumber(crypto.current_price)}</p>
              <p className="text-gray-300"><strong>Market Cap:</strong> ${formatNumber(crypto.market_cap)}</p>
              <p className="text-gray-300"><strong>Volume (24h):</strong> ${formatNumber(crypto.total_volume)}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Button
            variant="warning"
            onClick={() => setShowBuyModal(true)}
            style={{
              background: "linear-gradient(90deg, #f0b90b, #ffca28)",
              border: "none",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "bold",
              width: "100%",
              transition: "all 0.3s ease",
            }}
          >
            Buy {crypto.symbol.toUpperCase()}
          </Button>
        </Col>
      </Row>

      <BuyModal
        show={showBuyModal}
        onHide={() => setShowBuyModal(false)}
        crypto={crypto}
        onTransaction={() => alert("Purchase successful! Check your portfolio.")}
      />
    </Container>
  );
};

export default CryptoDetail;