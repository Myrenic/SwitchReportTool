// src/components/SwitchData.js
import React, { useState } from 'react';

const SwitchData = () => {
  const [query, setQuery] = useState('');
  const [switchData, setSwitchData] = useState(null);

  const handleSearch = (type) => {
    fetch(`http://localhost:5000/get_switch/${query}`)
      .then(response => response.json())
      .then(data => setSwitchData(data))
      .catch(error => console.error('Error fetching switch ', error));
  };

  return (
    <div>
      <h2>Get Switch Data</h2>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter hostname or IP"
      />
      <button onClick={() => handleSearch('hostname')}>Get by Hostname</button>
      <button onClick={() => handleSearch('ip')}>Get by IP</button>
      {switchData && (
        <div>
          <strong>Hostname:</strong> {switchData.hostname}<br/>
          <strong>IP Address:</strong> {switchData.ip_address}<br/>
          <strong>Hardware:</strong> {switchData.hardware.join(', ')}<br/>
          <strong>MAC Address:</strong> {switchData.mac_address.join(', ')}<br/>
          <strong>Serial:</strong> {switchData.serial.join(', ')}<br/>
        </div>
      )}
    </div>
  );
};

export default SwitchData;