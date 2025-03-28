// src/components/PortsSearch.js
import React, { useState } from 'react';

const PortsSearch = () => {
  const [query, setQuery] = useState('');
  const [ports, setPorts] = useState([]);

  const handleSearch = () => {
    fetch(`http://localhost:5000/get_all_ports/${query}`)
      .then(response => response.json())
      .then(data => setPorts(data))
      .catch(error => console.error('Error fetching ports:', error));
  };

  return (
    <div>
      <h2>Search Ports</h2>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter switch name or IP"
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {ports.map((port, index) => (
          <li key={index}>
            <strong>Port:</strong> {port.port}<br/>
            <strong>Status:</strong> {port.status}<br/>
            <strong>Speed:</strong> {port.speed}<br/>
            <strong>Duplex:</strong> {port.duplex}<br/>
            <strong>VLAN ID:</strong> {port.vlan_id}<br/>
            <strong>Type:</strong> {port.type}<br/>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortsSearch;