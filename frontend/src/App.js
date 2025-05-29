import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import CryptoDetail from "./components/CryptoDetail";
import Portfolio from "./pages/Portfolio"; // 
import Footer from "./components/Footer";
import "./index.css";

function App() {
  return (
    <div className="app d-flex flex-column min-vh-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/crypto/:id" element={<CryptoDetail />} />
        <Route path="/portfolio" element={<Portfolio />} /> 
      </Routes>
      <Footer />
    </div>
  );
}

export default App;