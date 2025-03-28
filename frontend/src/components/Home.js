// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Mike's Network Management Tools</h1>
      <ul>
        <li><Link to="/switch-Interfaces">Switch Interfaces</Link></li>
        {/* Add more tools here */}
      </ul>
    </div>
  );
};

export default Home;