// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import SwitchInterfaces from './components/SwitchInterfaces';
import SearchMac from './components/SearchMac';

function App() {
  console.log("database url:");
  console.log(process.env.REACT_APP_DATABASE_API_URL);
  console.log("cisco url:");
  console.log(process.env.REACT_APP_CISCO_API_URL);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/switch-Interfaces" element={<SwitchInterfaces />} />
          <Route path="/search-mac" element={<SearchMac />} />
          {/* Add more routes for other tools here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;