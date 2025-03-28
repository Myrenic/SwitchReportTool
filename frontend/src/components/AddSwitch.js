// src/components/AddSwitch.js
import React, { useState } from 'react';

const AddSwitch = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

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
        setIpAddress('');
      })
      .catch(error => console.error('Error updating switch:', error));
  };

  return (
    <div className="add-switch">
      <h2>Add New Switch</h2>
      <form onSubmit={handleSubmit}>
        <label>
          IP Address:
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            required
          />
        </label>
        <button type="submit">Add Switch</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddSwitch;