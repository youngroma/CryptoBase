import React, { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert, Button, Modal, Form, Image, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const TransactionModal = ({ show, onHide, coin, onTransaction, maxAmount, portfolio, isPortfolioModal = false }) => {
  const [transactionType, setTransactionType] = useState("sell");
  const [selectedCoinId, setSelectedCoinId] = useState(coin?.coin_id || "");
  const [amount, setAmount] = useState("");
  const [priceUsd, setPriceUsd] = useState(coin?.current_price || "");
  const [fee, setFee] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
  const [error, setError] = useState("");
  const [allCoins, setAllCoins] = useState([]);

  const selectedCoin = portfolio.find(item => item.coin_id === selectedCoinId) || coin;
  const currentMaxAmount = isPortfolioModal ? (portfolio.find(item => item.coin_id === selectedCoinId)?.amount || 0) : maxAmount;

  // Fetch top 20 cryptocurrencies for Buy/Transfer In
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
        );
        const data = await response.json();
        setAllCoins(data.map(coin => ({
          coin_id: coin.id,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
        })));
      } catch (err) {
        setError("Error loading cryptocurrency list: " + err.message);
      }
    };

    if (isPortfolioModal) {
      fetchTopCoins();
    }
  }, [isPortfolioModal]);

  // Filter coins based on transaction type
  const availableCoins = transactionType === "buy" || transactionType === "transfer_in"
    ? allCoins
    : portfolio.filter(item => item.amount > 0);

  useEffect(() => {
    const defaultCoin = availableCoins.find(item => item.coin_id === selectedCoinId) || availableCoins[0];
    setSelectedCoinId(defaultCoin?.coin_id || "");
    setPriceUsd(defaultCoin?.current_price || "");
  }, [transactionType, availableCoins]);

  const handleSubmit = async () => {
    if (!selectedCoinId) {
      setError("Please select a cryptocurrency.");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if ((transactionType === "sell" || transactionType === "transfer_out") && amount > currentMaxAmount) {
      setError(`You only have ${currentMaxAmount} ${selectedCoinId}. Cannot sell or transfer more than that.`);
      return;
    }
    if (!priceUsd || priceUsd <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/portfolio/transactions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coin_id: selectedCoinId,
          amount,
          price_usd: priceUsd,
          fee: fee || null,
          type: transactionType,
          timestamp: new Date(transactionDate).toISOString(),
        }),
      });

      if (response.ok) {
        onTransaction();
        onHide();
      } else {
        const data = await response.json();
        setError(data.error || "Error creating transaction.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  const handleCoinChange = (coinId) => {
    setSelectedCoinId(coinId);
    const newCoin = availableCoins.find(item => item.coin_id === coinId);
    setPriceUsd(newCoin?.current_price || "");
  };

  const maxDateTime = new Date().toISOString().slice(0, 16);

  const selectedCoinDisplay = availableCoins.find(item => item.coin_id === selectedCoinId);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ background: "#1f252a", borderBottom: "1px solid #2c3238" }}>
        <Modal.Title style={{ color: "#f0b90b" }}>New Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#1f252a", color: "#a9b6c2", maxHeight: "70vh", overflowY: "auto" }}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Transaction Type</Form.Label>
            <div className="d-flex gap-2">
              <Button
                variant={transactionType === "buy" ? "warning" : "secondary"}
                onClick={() => setTransactionType("buy")}
                style={{ flex: 1, background: transactionType === "buy" ? "#f0b90b" : "#2c3238", border: "none" }}
              >
                Buy
              </Button>
              <Button
                variant={transactionType === "sell" ? "warning" : "secondary"}
                onClick={() => setTransactionType("sell")}
                style={{ flex: 1, background: transactionType === "sell" ? "#f0b90b" : "#2c3238", border: "none" }}
              >
                Sell
              </Button>
              <Button
                variant={transactionType === "transfer_in" ? "warning" : "secondary"}
                onClick={() => setTransactionType("transfer_in")}
                style={{ flex: 1, background: transactionType === "transfer_in" ? "#f0b90b" : "#2c3238", border: "none" }}
              >
                Transfer In
              </Button>
              <Button
                variant={transactionType === "transfer_out" ? "warning" : "secondary"}
                onClick={() => setTransactionType("transfer_out")}
                style={{ flex: 1, background: transactionType === "transfer_out" ? "#f0b90b" : "#2c3238", border: "none" }}
              >
                Transfer Out
              </Button>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cryptocurrency</Form.Label>
            <Dropdown onSelect={handleCoinChange} style={{ width: "100%" }}>
              <Dropdown.Toggle
                style={{
                  background: "#2c3238",
                  color: "#ffffff",
                  border: "1px solid #3a4149",
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                }}
              >
                {selectedCoinDisplay ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Image
                      src={selectedCoinDisplay.image || "https://via.placeholder.com/20"}
                      alt={`${selectedCoinDisplay.coin_id} icon`}
                      style={{ width: "20px", height: "20px", marginRight: "10px" }}
                    />
                    {selectedCoinDisplay.name || selectedCoinDisplay.coin_id.charAt(0).toUpperCase() + selectedCoinDisplay.coin_id.slice(1)}
                  </div>
                ) : (
                  "Select Cryptocurrency"
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ background: "#2c3238", color: "#ffffff", maxHeight: "200px", overflowY: "auto", width: "100%" }}>
                {availableCoins.map((item) => (
                  <Dropdown.Item
                    key={item.coin_id}
                    eventKey={item.coin_id}
                    style={{
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                    }}
                    active={selectedCoinId === item.coin_id}
                  >
                    <Image
                      src={item.image || "https://via.placeholder.com/20"}
                      alt={`${item.coin_id} icon`}
                      style={{ width: "20px", height: "20px", marginRight: "10px" }}
                    />
                    {item.name || item.coin_id.charAt(0).toUpperCase() + item.coin_id.slice(1)}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Transaction Date</Form.Label>
            <Form.Control
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              max={maxDateTime}
              style={{ background: "#2c3238", color: "#ffffff", border: "1px solid #3a4149" }}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount (Available: {currentMaxAmount})</Form.Label>
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
            Confirm
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
        .dropdown-item:hover {
          background-color: #3a4149 !important;
          color: #ffffff !important;
        }
        .dropdown-item.active {
          background-color: #f0b90b !important;
          color: #000000 !important;
        }
      `}</style>
    </Modal>
  );
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPortfolioTransactionModal, setShowPortfolioTransactionModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your portfolio.");
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      try {
        const response = await fetch("http://localhost:8000/portfolio/summary/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const coinIds = data.map(item => item.coin_id).join(",");
          if (coinIds) {
            const coinDataResponse = await fetch(
              `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
            );
            const coinData = await coinDataResponse.json();
            const updatedPortfolio = data.map(item => {
              const coinInfo = coinData.find(coin => coin.id === item.coin_id);
              return {
                ...item,
                image: coinInfo?.image || "https://via.placeholder.com/30",
              };
            });
            setPortfolio(updatedPortfolio);
          } else {
            setPortfolio(data);
          }
        } else {
          const data = await response.json();
          setError(data.error || "Error loading portfolio.");
        }
      } catch (err) {
        setError("Network error: " + err.message);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await fetch("http://localhost:8000/favorites/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const coinIds = data.map(fav => fav.coin_id).join(",");
          if (coinIds) {
            const pricesResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
            const pricesData = await pricesResponse.json();
            setFavorites(data.map(fav => ({
              coin_id: fav.coin_id,
              current_price: pricesData[fav.coin_id]?.usd || "N/A",
              price_change_24h: pricesData[fav.coin_id]?.usd_24h_change || "N/A",
            })));
          }
        }
      } catch (err) {
        setError("Error loading favorite coins: " + err.message);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:8000/portfolio/transactions/history/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          const data = await response.json();
          setError(data.error || "Error loading transaction history.");
        }
      } catch (err) {
        setError("Error loading transaction history: " + err.message);
      }
    };

    Promise.all([fetchPortfolio(), fetchFavorites(), fetchTransactions()]).finally(() => setLoading(false));
  }, [token]);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(Number(num))) {
      return "N/A";
    }
    const n = Number(num);
    return n >= 1e9
      ? (n / 1e9).toFixed(1) + "B"
      : n >= 1e6
      ? (n / 1e6).toFixed(1) + "M"
      : n >= 1e3
      ? (n / 1e3).toFixed(1) + "K"
      : n.toFixed(2);
  };

  const refreshPortfolio = () => {
    setLoading(true);
    setPortfolio([]);
    setTransactions([]);
    setFavorites([]);
    setError(null);
    const fetchPortfolio = async () => {
      try {
        const response = await fetch("http://localhost:8000/portfolio/summary/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const coinIds = data.map(item => item.coin_id).join(",");
          if (coinIds) {
            const coinDataResponse = await fetch(
              `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
            );
            const coinData = await coinDataResponse.json();
            const updatedPortfolio = data.map(item => {
              const coinInfo = coinData.find(coin => coin.id === item.coin_id);
              return {
                ...item,
                image: coinInfo?.image || "https://via.placeholder.com/30",
              };
            });
            setPortfolio(updatedPortfolio);
          } else {
            setPortfolio(data);
          }
        }
      } catch (err) {
        setError("Network error: " + err.message);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:8000/portfolio/transactions/history/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (err) {
        setError("Error loading transaction history: " + err.message);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await fetch("http://localhost:8000/favorites/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const coinIds = data.map(fav => fav.coin_id).join(",");
          if (coinIds) {
            const pricesResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
            const pricesData = await pricesResponse.json();
            setFavorites(data.map(fav => ({
              coin_id: fav.coin_id,
              current_price: pricesData[fav.coin_id]?.usd || "N/A",
              price_change_24h: pricesData[fav.coin_id]?.usd_24h_change || "N/A",
            })));
          }
        }
      } catch (err) {
        setError("Error loading favorite coins: " + err.message);
      }
    };

    Promise.all([fetchPortfolio(), fetchTransactions(), fetchFavorites()]).finally(() => setLoading(false));
  };

  const totalAmount = portfolio.reduce((sum, item) => sum + (Number(item.current_value) || 0), 0);

  if (loading) return <Spinner animation="border" style={{ color: "#f0b90b" }} className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5" style={{ background: "#1f252a", color: "#fff", border: "1px solid #f6465d" }}>{error}</Alert>;

  return (
    <Container fluid className="mt-0 p-4 position-relative" style={{ background: "#12161c", minHeight: "100vh", color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div style={{ display: "flex", alignItems: "center" }}>
          <i className="fas fa-wallet" style={{ color: "#f0b90b", fontSize: "20px", marginRight: "10px" }}></i>
          <div>
            <h2 style={{ color: "#f0b90b", fontSize: "1.5rem", margin: "0" }}>Total Asset Value</h2>
            <p style={{ color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold", margin: "0" }}>
              ${formatNumber(totalAmount)} USD
            </p>
          </div>
        </div>
        <Button
          variant="warning"
          onClick={() => setShowPortfolioTransactionModal(true)}
          style={{
            background: "#f0b90b",
            border: "none",
            color: "#000",
            fontWeight: "600",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        >
          New Transaction
        </Button>
      </div>

    

      <h2 className="mb-3" style={{ color: "#f0b90b", fontSize: "1.8rem" }}>Your Assets</h2>
      {portfolio.length > 0 ? (
        <Table responsive className="tile-table mb-5" style={{ background: "#12161c !important", borderRadius: "12px", overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "#2c3238", color: "#f0b90b" }}>
              <th>Coin</th>
              <th>Amount</th>
              <th>Current Price</th>
              <th>Current Value</th>
              <th>Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item) => (
              <tr key={item.coin_id} className="tile-row">
                <td>
                  <Link to={`/crypto/${item.coin_id}`} style={{ color: "#ffffff", textDecoration: "none", display: "flex", alignItems: "center" }}>
                    <Image
                      src={item.image}
                      alt={`${item.coin_id} icon`}
                      style={{ width: "30px", height: "30px", marginRight: "10px" }}
                    />
                    <span>{item.coin_id.charAt(0).toUpperCase() + item.coin_id.slice(1)}</span>
                  </Link>
                </td>
                <td>{formatNumber(item.amount)}</td>
                <td>${formatNumber(item.current_price)}</td>
                <td>${formatNumber(item.current_value)}</td>
                <td style={{ color: Number(item.profit_loss) >= 0 ? "#00c08b" : "#f6465d", fontWeight: "bold" }}>
                  {Number(item.profit_loss) >= 0 ? "+" : ""}{formatNumber(item.profit_loss)} USD
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info" className="mb-5" style={{ background: "#2c3238", color: "#a9b6c2", border: "1px solid #f0b90b" }}>
          You have no purchased cryptocurrencies yet. Go to the cryptocurrency page to buy.
        </Alert>
      )}

      <h2 className="mb-3" style={{ color: "#f0b90b", fontSize: "1.8rem" }}>Favorite Coins</h2>
      {favorites.length > 0 ? (
        <Table responsive className="tile-table mb-5" style={{ background: "#12161c !important", borderRadius: "12px", overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "#2c3238", color: "#f0b90b" }}>
              <th>Coin</th>
              <th>Current Price</th>
              <th>24h Change</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((fav) => (
              <tr key={fav.coin_id} className="tile-row">
                <td>
                  <Link to={`/crypto/${fav.coin_id}`} style={{ color: "#ffffff", textDecoration: "none" }}>
                    {fav.coin_id.charAt(0).toUpperCase() + fav.coin_id.slice(1)}
                  </Link>
                </td>
                <td>${formatNumber(fav.current_price)}</td>
                <td style={{ color: Number(fav.price_change_24h) >= 0 ? "#00c08b" : "#f6465d" }}>
                  {Number(fav.price_change_24h) >= 0 ? "+" : ""}{formatNumber(fav.price_change_24h)}%
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info" className="mb-5" style={{ background: "#2c3238", color: "#a9b6c2", border: "1px solid #f0b90b" }}>
          You have no favorite cryptocurrencies yet. Add them on the main page.
        </Alert>
      )}

      <h2 className="mb-3" style={{ color: "#f0b90b", fontSize: "1.8rem" }}>Transaction History</h2>
      {transactions.length > 0 ? (
        <Table responsive className="tile-table mb-5" style={{ background: "#12161c !important", borderRadius: "12px", overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "#2c3238", color: "#f0b90b" }}>
              <th>Coin</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Price (USD)</th>
              <th>Fee</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="tile-row">
                <td>{tx.coin_id.charAt(0).toUpperCase() + tx.coin_id.slice(1)}</td>
                <td>{tx.type === "buy" ? "Buy" : tx.type === "sell" ? "Sell" : tx.type === "transfer_in" ? "Transfer In" : "Transfer Out"}</td>
                <td>{formatNumber(tx.amount)}</td>
                <td>${formatNumber(tx.price_usd)}</td>
                <td>{tx.fee ? `$${formatNumber(tx.fee)}` : "None"}</td>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info" style={{ background: "#2c3238", color: "#a9b6c2", border: "1px solid #f0b90b" }}>
          You have no transactions yet.
        </Alert>
      )}

      <TransactionModal
        show={showPortfolioTransactionModal}
        onHide={() => setShowPortfolioTransactionModal(false)}
        onTransaction={refreshPortfolio}
        portfolio={portfolio}
        isPortfolioModal={true}
      />

      <style jsx>{`
        @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

        .tile-table {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border-collapse: separate !important;
          border-spacing: 0 10px !important;
          background: #12161c !important;
        }
        .tile-table tbody tr {
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
          background: #12161c !important;
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
        td:nth-child(5) {
          color: inherit !important;
        }
      `}</style>
    </Container>
  );
};

export default Portfolio;