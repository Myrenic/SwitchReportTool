// src/components/LatestPorts.js
import React, { useState } from 'react';

const LatestPorts = () => {
  const [switchName, setSwitchName] = useState('');
  const [latestPorts, setLatestPorts] = useState([]);

  const handleGetLatestPorts = () => {
    fetch(`http://localhost:5000/get_latest_ports/${switchName}`)
      .then(response => response.json())
      .then(data => setLatestPorts(data))
      .catch(error => console.error('Error fetching latest ports:', error));
  };

  return (
    <div>
      <h2>Get Latest Ports</h2>
      <input
        type="text"
        value={switchName}
        onChange={e => setSwitchName(e.target.value)}
        placeholder="Enter switch name"
      />
      <button onClick={handleGetLatestPorts}>Get Latest Ports</button>
      <ul>
        {latestPorts.map((port, index) => (
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

export default LatestPorts;