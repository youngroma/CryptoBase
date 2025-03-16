import React from "react";
import { Routes, Route } from "react-router-dom"; // ❌ Убрал BrowserRouter
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import "./index.css";

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
