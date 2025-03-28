// src/components/UpdateSwitch.js
import React, { useState } from 'react';

const UpdateSwitch = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = () => {
    fetch('http://localhost:5001/update_switch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip_address: ipAddress }),
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
      })
      .catch(error => console.error('Error updating switch:', error));
  };

  return (
    <div>
      <h2>Update Switch</h2>
      <input
        type="text"
        value={ipAddress}
        onChange={e => setIpAddress(e.target.value)}
        placeholder="Enter IP Address"
      />
      <button onClick={handleUpdate}>Update</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateSwitch;