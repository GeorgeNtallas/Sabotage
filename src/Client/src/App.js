import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import OneDeviceLobby from "./pages/OneDeviceLobby";
import OneDeviceGame from "./pages/OneDeviceGame";
import "./i18n";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/onedevice" element={<OneDeviceLobby />} />
        <Route path="/onedevicegame" element={<OneDeviceGame />} />
      </Routes>
    </Router>
  );
}

export default App;
