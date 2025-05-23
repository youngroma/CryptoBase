import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

// Кастомные стили
const customStyles = `
  .custom-backdrop {
    background-color: rgba(0, 0, 0, 0.3) !important;
  }
  .modal.custom-modal-container {
    height: auto !important;
    min-height: unset !important;
  }
  .modal-dialog.custom-modal {
    background: #1f252a;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
    border: none;
    max-width: 400px !important;
    max-height: 450px !important; 
    height: auto !important;
    margin: 0 auto;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }
  .modal-content {
    background: transparent !important;
    border: none !important;
    height: 100% !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important; 
  }
  .modal-header {
    padding: 10px !important;
    background: #1f252a;
    border-bottom: 1px solid #2c3238;
    border-radius: 15px 15px 0 0;
  }
  .modal-header .btn-close {
    color: #f0b90b !important;
    opacity: 1;
    font-size: 1.5rem;
  }
  .modal-header .btn-close:hover {
    opacity: 0.7;
  }
  .modal-body {
    padding: 8px !important; 
    max-height: 750 !important; 
    overflow-y: hidden !important;
    background: #1f252a;
    color: #a9b6c2;
    border-radius: 0 0 15px 15px;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    flex-grow: 1; 
  }
  .modal-dialog.custom-modal .form-group {
    margin-bottom: 6px !important; 
  }
  .modal-dialog.custom-modal .form-label {
    color: #f0b90b !important;
  }
  .modal-dialog.custom-modal .form-control {
    color: #ffffff !important;
    background: #2c3238 !important;
    border: 1px solid #3a4046;
    border-radius: 10px;
    padding: 8px !important; 
  }
  .modal-dialog.custom-modal .form-control::placeholder {
    color: #a9b6c2 !important;
  }
  .modal-dialog.custom-modal .btn-success {
    background: #f0b90b !important;
    color: #fff !important;
    font-weight: bold;
    border: none;
    padding: 8px;
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  .modal-dialog.custom-modal .btn-success:hover {
    background: #d4a017 !important;
  }
`;

const RegisterModal = ({ show, onHide }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;
    if (!username) {
      setUsernameError("Name cannot be empty.");
      isValid = false;
    } else {
      setUsernameError("");
    }
    if (!email) {
      setEmailError("Email cannot be empty.");
      isValid = false;
    } else if (!email.includes("@")) {
      setEmailError("Email must contain '@' symbol.");
      isValid = false;
    } else {
      setEmailError("");
    }
    if (!password) {
      setPasswordError("Password cannot be empty.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError("");
    }
    return isValid;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      const response = await fetch("http://localhost:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please log in.");
        onHide();
      } else {
        alert("Error: " + JSON.stringify(data));
      }
    }
  };

  return (
    <>
      <style>{customStyles}</style>
      <Modal
        show={show}
        onHide={onHide}
        centered
        backdropClassName="custom-backdrop"
        dialogClassName="custom-modal"
        className="custom-modal-container"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#f0b90b", fontWeight: "bold", fontSize: "1.5rem" }}>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Name</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
              />
              {usernameError && <Form.Text style={{ color: "#f6465d" }}>{usernameError}</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              {emailError && <Form.Text style={{ color: "#f6465d" }}>{emailError}</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              {passwordError && <Form.Text style={{ color: "#f6465d" }}>{passwordError}</Form.Text>}
            </Form.Group>
            <Button
              variant="success"
              className="w-100"
              onClick={handleRegister}
            >
              Register
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RegisterModal;
