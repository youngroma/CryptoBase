import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch("http://localhost:8000/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">CryptoBase</h1>
      <p className="text-center mb-5">Track the top 20 cryptocurrencies</p>
      <Row xs={1} md={2} lg={4} className="g-4">
        {Array.isArray(cryptos) &&
          cryptos.map((crypto) =>
            crypto.id && crypto.name && crypto.symbol && crypto.image ? (
              <Col key={crypto.id}>
                <Card as={Link} to={`/crypto/${crypto.id.toLowerCase()}`} className="h-100 text-decoration-none shadow-sm crypto-card">
                  <Card.Body className="text-center">
                    <Card.Img
                      variant="top"
                      src={typeof crypto.image === "string" ? crypto.image : "https://via.placeholder.com/50"}
                      alt={`${crypto.name} icon`}
                      style={{ width: "50px", height: "50px", margin: "auto" }}
                    />
                    <Card.Title className="mt-3">{crypto.name}</Card.Title>
                    <Card.Text className="text-muted">{crypto.symbol.toUpperCase()}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ) : null
          )}
      </Row>
    </Container>
  );
};

export default Home;