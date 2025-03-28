import React, { useState, useEffect } from 'react';

const SwitchList = ({ onSelectSwitch, onRefresh }) => {
  const [switches, setSwitches] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_DATABASE_API_URL}/get_all_switches`)
      .then(response => response.json())
      .then(data => setSwitches(data))
      .catch(error => console.error('Error fetching switches:', error));
  }, []);

  const handleChange = (event) => {
    const selectedId = parseInt(event.target.value, 10);
    const selectedSwitch = switches.find(sw => sw.id === selectedId);
    onSelectSwitch(selectedSwitch);
  };

  return (
    <div className="switch-list">
      <h2>Select a Switch</h2>
      <div className="switch-list-controls">
        <select onChange={handleChange}>
          <option value="">Select a switch</option>
          {switches.map((sw) => (
            <option key={sw.id} value={sw.id}>
              {sw.hostname}
            </option>
          ))}
        </select>
        <button className="refresh-button" onClick={onRefresh}>Refresh</button>
      </div>
    </div>
  );
};

export default SwitchList;