import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="mt-auto py-3" style={{ background: "#1f252a", borderTop: "1px solid #2c3238" }}>
      <Container>
        <p className="text-center mb-0" style={{ color: "#a9b6c2", fontSize: "0.9rem" }}>
          © 2025 CryptoBase. All Rights Reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;