import React, { useState } from 'react';
import SwitchList from './SwitchList';
import SwitchDetails from './SwitchDetails';
import SwitchPorts from './SwitchPorts';
import AddSwitch from './AddSwitch';

const SwitchInterfaces = () => {
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [switchPorts, setSwitchPorts] = useState([]);
  const [refreshMessage, setRefreshMessage] = useState('');
  const fetchSwitchPorts = (hostname) => {
  const dbUrl = window.config.DATABASE_API_URL;

    fetch(`${dbUrl}/get_latest_ports/${hostname}`)
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
      const dbUrl = window.config.DATABASE_API_URL;
      fetch(`${dbUrl}/update_switch`, {
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
    <div>
      <h1>Switch Interfaces</h1>
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
};

export default SwitchInterfaces;
