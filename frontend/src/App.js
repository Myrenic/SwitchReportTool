// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import SwitchInterfaces from './components/SwitchInterfaces';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/switch-interfaces" element={<SwitchInterfaces />} />
          {/* Add more routes for other tools here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;