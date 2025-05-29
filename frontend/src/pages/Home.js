import React, { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert, Image, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch("http://localhost:8000/");
        if (response.ok) {
          const data = await response.json();
          setCryptos(Array.isArray(data) ? data.slice(0, 20) : []);
        } else {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            setError(`Failed to load cryptocurrency list: ${errorData.error || response.statusText}`);
          } catch {
            setError(`Failed to load cryptocurrency list: ${response.statusText} (Unexpected response: ${text.slice(0, 50)}...)`);
          }
        }
      } catch (err) {
        setError("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:8000/favorites/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setFavorites(data.map(fav => fav.coin_id));
          }
        } catch (err) {
          setError("Error loading favorite coins: " + err.message);
        }
      }
    };

    fetchCryptos();
    fetchFavorites();
  }, [token]);

  const formatNumber = (num) => {
    if (num === "N/A" || num == null || isNaN(num)) return "N/A";
    const n = Number(num);
    return n >= 1e9 ? (n / 1e9).toFixed(1) + "B" : n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : n.toFixed(2);
  };

  const toggleFavorite = async (coinId) => {
    if (!token) {
      setError("Please log in to add to favorites.");
      return;
    }

    const isFavorite = favorites.includes(coinId);
    const method = isFavorite ? "DELETE" : "POST";
    try {
      const response = await fetch("http://localhost:8000/favorites/", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coin_id: coinId }),
      });

      if (response.ok) {
        if (isFavorite) {
          setFavorites(favorites.filter(id => id !== coinId));
        } else {
          setFavorites([...favorites, coinId]);
        }
      } else {
        const data = await response.json();
        setError(data.error || "Error updating favorites.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  if (loading) return <Spinner animation="border" style={{ color: "#f0b90b" }} className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5" style={{ background: "#1f252a", color: "#fff", border: "1px solid #f6465d" }}>{error}</Alert>;

  return (
    <Container fluid className="mt-0 p-4" style={{ background: "#12161c", minHeight: "100vh", color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>


      <Table responsive className="tile-table" style={{ background: "#12161c", borderRadius: "12px", overflow: "hidden" }}>
        <thead>
          <tr style={{ background: "#2c3238", color: "#f0b90b" }}>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Market Cap</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(cryptos) && cryptos.map((crypto, index) => {
            if (!crypto.name || !crypto.symbol) return null;
            const coinId = crypto.name.toLowerCase();
            const isFavorite = favorites.includes(coinId);
            return (
              <tr key={crypto.name} className="tile-row">
                <td>{index + 1}</td>
                <td>
                  <Link to={`/crypto/${coinId}`} style={{ color: "#ffffff", textDecoration: "none", display: "flex", alignItems: "center" }}>
                    <Image
                      src={typeof crypto.image === "string" ? crypto.image : "https://via.placeholder.com/30"}
                      alt={`${crypto.name} icon`}
                      style={{ width: "30px", height: "30px", marginRight: "10px" }}
                    />
                    <span>{crypto.name} ({crypto.symbol.toUpperCase()})</span>
                  </Link>
                </td>
                <td>${formatNumber(crypto.current_price)}</td>
                <td>${formatNumber(crypto.market_cap)}</td>
                <td>
                  <Button
                    variant={isFavorite ? "danger" : "outline-warning"}
                    size="sm"
                    onClick={() => toggleFavorite(coinId)}
                    style={{
                      background: isFavorite ? "#f6465d" : "transparent",
                      borderColor: "#f0b90b",
                      color: isFavorite ? "#ffffff" : "#f0b90b",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      fontSize: "0.9rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isFavorite ? "Remove" : "Add to Favorites"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <style jsx>{`
        .tile-table {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border-collapse: separate !important;
          border-spacing: 0 10px !important;
          background: #12161c !important;
        }
        .tile-row {
          background: #12161c !important;
          border-radius: 12px;
          margin: 5px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        .tile-row:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
          background: #2c3238 !important;
        }
        th, td {
          padding: 15px !important;
          border: none !important;
          vertical-align: middle !important;
          background: transparent !important;
          color: #ffffff !important;
        }
        th {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9rem;
        }
        td {
          font-size: 1rem;
        }
      `}</style>
    </Container>
  );
};

export default Home;