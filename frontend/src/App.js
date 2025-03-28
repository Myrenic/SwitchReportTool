// src/App.js
import React, { useState } from 'react';
import './App.css'; // Import the CSS file
import SwitchList from './components/SwitchList';
import SwitchDetails from './components/SwitchDetails';
import SwitchPorts from './components/SwitchPorts';
import AddSwitch from './components/AddSwitch';

function App() {
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [switchPorts, setSwitchPorts] = useState([]);
  const [refreshMessage, setRefreshMessage] = useState('');

  const fetchSwitchPorts = (hostname) => {
    fetch(`http://localhost:5000/get_latest_ports/${hostname}`)
      .then(response => response.json())
      .then(data => setSwitchPorts(data))
      .catch(error => console.error('Error fetching switch ports:', error));
  };

  const handleSelectSwitch = (sw) => {
    setSelectedSwitch(sw);
    fetchSwitchPorts(sw.hostname);
  };

  const handleRefresh = () => {
    if (selectedSwitch) {
      fetch('http://localhost:5001/update_switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip_address: selectedSwitch.ip_address }),
      })
        .then(response => response.json())
        .then(data => {
          setRefreshMessage(data.message);
          fetchSwitchPorts(selectedSwitch.hostname);
        })
        .catch(error => console.error('Error refreshing switch:', error));
    }
  };

  return (
    <div className="App">
      <h1>Switch Management UI</h1>
      <div className="top-bar">
        <div className="box">
          <SwitchList onSelectSwitch={handleSelectSwitch} onRefresh={handleRefresh} />
        </div>
      </div>
      {refreshMessage && <p className="refresh-message">{refreshMessage}</p>}
      <div className="content">
        {selectedSwitch && (
          <div className="box">
            <SwitchDetails switch={selectedSwitch} />
          </div>
        )}
      </div>
      {switchPorts.length > 0 && (
        <div className="box">
          <SwitchPorts ports={switchPorts} />
        </div>
      )}
      <div className="box add-switch">
        <AddSwitch />
      </div>
    </div>
  );
}

export default App;