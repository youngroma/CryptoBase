import React, { useState } from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const NavBar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("token") ? true : false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <>
      <Navbar expand="lg" style={{ background: "#12161c", borderBottom: "1px solid #2c3238", marginBottom: 0 }}>
        <Container>
          <Navbar.Brand href="/" style={{ color: "#f0b90b", fontWeight: "bold", fontSize: "1.5rem" }}>
            CryptoBase
          </Navbar.Brand>
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => setShowLogin(true)}
                  style={{
                    background: "transparent",
                    border: "1px solid #f0b90b",
                    color: "#f0b90b",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    marginRight: "10px",
                    transition: "all 0.3s ease",
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => setShowRegister(true)}
                  style={{
                    background: "linear-gradient(90deg, #f0b90b, #ffca28)",
                    border: "none",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLogout}
                style={{
                  background: "#f6465d",
                  border: "none",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
              >
                Logout
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} onHide={() => setShowRegister(false)} />
    </>
  );
};

export default NavBar;