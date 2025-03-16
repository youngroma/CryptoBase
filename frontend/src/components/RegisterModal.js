import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const RegisterModal = ({ show, onHide }) => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const response = await fetch("http://127.0.0.1:8000/auth/register/", {
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
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Register</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label className="text-dark fw-bold">Name</Form.Label>
            <Form.Control 
              type="text" 
              value={username} 
              onChange={(e) => setName(e.target.value)} 
              className="text-dark"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label className="text-dark fw-bold">Email</Form.Label>
            <Form.Control 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="text-dark"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label className="text-dark fw-bold">Password</Form.Label>
            <Form.Control 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="text-dark"
            />
          </Form.Group>
          <Button variant="success" className="mt-3 w-100 text-dark fw-bold" onClick={handleRegister}>
            Register
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal;
