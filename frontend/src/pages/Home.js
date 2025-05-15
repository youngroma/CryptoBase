import React, { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert, Image } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch("http://localhost:8000/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          setCryptos(Array.isArray(data) ? data.slice(0, 20) : []);
        } else {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            setError(`Не удалось загрузить список криптовалют: ${errorData.error || response.statusText}`);
          } catch {
            setError(`Не удалось загрузить список криптовалют: ${response.statusText} (Unexpected response: ${text.slice(0, 50)}...)`);
          }
        }
      } catch (err) {
        setError("Ошибка сети: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCryptos();
  }, []);

  const formatNumber = (num) => (num == null || isNaN(num) ? "N/A" : num >= 1e9 ? (num / 1e9).toFixed(1) + "B" : num >= 1e6 ? (num / 1e6).toFixed(1) + "M" : num >= 1e3 ? (num / 1e3).toFixed(1) + "K" : num.toFixed(2));

  if (loading) return <Spinner animation="border" style={{ color: "#f0b90b" }} className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5" style={{ background: "#2c3238", color: "#fff", border: "1px solid #f6465d" }}>{error}</Alert>;

  return (
    <Container fluid className="mt-4 p-4" style={{ background: "#12161c", minHeight: "100vh", color: "#a9b6c2", fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-center mb-4" style={{ color: "#f0b90b", fontSize: "2.5rem", fontWeight: "bold" }}>CryptoBase</h1>
      <p className="text-center mb-5" style={{ color: "#a9b6c2", fontSize: "1.2rem" }}>Track the top 20 cryptocurrencies</p>
      <Table hover responsive style={{ background: "#1f252a", color: "#a9b6c2", borderRadius: "12px", overflow: "hidden" }}>
        <thead>
          <tr style={{ background: "#2c3238", color: "#f0b90b" }}>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>24h Change</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(cryptos) && cryptos.map((crypto, index) => (
            crypto.name && crypto.symbol ? (
              <tr key={crypto.name} style={{ transition: "all 0.3s ease" }}>
                <td>{index + 1}</td>
                <td>
                  <Link to={`/crypto/${crypto.name.toLowerCase()}`} style={{ color: "#a9b6c2", textDecoration: "none", display: "flex", alignItems: "center" }}>
                    <Image
                      src={typeof crypto.image === "string" ? crypto.image : "https://via.placeholder.com/30"}
                      alt={`${crypto.name} icon`}
                      style={{ width: "30px", height: "30px", marginRight: "10px" }}
                    />
                    <span>{crypto.name} ({crypto.symbol.toUpperCase()})</span>
                  </Link>
                </td>
                <td>${formatNumber(crypto.current_price)}</td>
                <td style={{ color: crypto.price_change_percentage_24h >= 0 ? "#00c08b" : "#f6465d" }}>
                  {crypto.price_change_percentage_24h >= 0 ? "+" : ""}{formatNumber(crypto.price_change_percentage_24h)}%
                </td>
              </tr>
            ) : null
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Home;