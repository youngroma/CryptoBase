import React, { useState } from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const NavBar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("token") ? true : false
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">CryptoBase</Navbar.Brand>
          <Nav className="ml-auto">
            {!isAuthenticated ? (
              <>
                <Button variant="outline-light" onClick={() => setShowLogin(true)}>
                  Login
                </Button>
                <Button variant="outline-light" onClick={() => setShowRegister(true)} className="ms-2">
                  Register
                </Button>
              </>
            ) : (
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      {/* Модальные окна */}
      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} onHide={() => setShowRegister(false)} />
    </>
  );
};

export default NavBar;
