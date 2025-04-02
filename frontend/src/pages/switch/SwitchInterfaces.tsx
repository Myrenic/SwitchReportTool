import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import SwitchList from '../../components/SwitchLists';
import SwitchDetails from '../../components/SwitchDetails';
import SwitchPorts from '../../components/SwitchPorts';
import AddSwitch from '../../components/AddSwitch';
import config from '../../config';

const SwitchInterfaces = () => {
  const dbUrl = config.DATABASE_API_URL;
  const ciscoUrl = config.CISCO_API_URL;
  console.log(`Switch interface debug:
    Envs:
    ${dbUrl}/get_all_switches
    ${ciscoUrl}/update`);

  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [switchPorts, setSwitchPorts] = useState([]);
  const [refreshMessage, setRefreshMessage] = useState('');

  const fetchSwitchPorts = (hostname) => {
    const dbUrl = config.DATABASE_API_URL;

    fetch(`${dbUrl}/get_latest_ports/${hostname}`)
      .then(response => response.json())
      .then(data => setSwitchPorts(data))
      .catch(error => console.error('Error fetching switch ports:', error));
  };

  const fetchSwitchDetails = (identifier) => {
    fetch(`${dbUrl}/get_switch/${identifier}`)
      .then(response => response.json())
      .then(data => setSelectedSwitch(data))
      .catch(error => console.error('Error fetching switch details:', error));
  };

  const handleSelectSwitch = (sw) => {
    fetchSwitchDetails(sw.hostname);
    fetchSwitchPorts(sw.hostname);
  };

  const handleRefresh = () => {
    if (selectedSwitch) {
      fetch(`${ciscoUrl}/update_switch`, {
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
          fetchSwitchDetails(selectedSwitch.hostname); // Refresh switch details
        })
        .catch(error => console.error('Error refreshing switch:', error));
    }
  };

  return (
    <div>
      <div className="top-bar">
        <div className="box">
          <SwitchList
            selectedSwitch={selectedSwitch}
            onSelectSwitch={handleSelectSwitch}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
      {refreshMessage && <p className="refresh-message">{refreshMessage}</p>}
      <div className="content">
        <div className="box">
          {selectedSwitch ? (
            <SwitchDetails switch={selectedSwitch} />
          ) : (
            <div className="placeholder">Select a switch to see details</div>
          )}
        </div>
      </div>
      <div className="box">
        {switchPorts.length > 0 ? (
          <SwitchPorts ports={switchPorts} />
        ) : (
          <div className="placeholder">No ports to display</div>
        )}
      </div>
      {/* <div className="box add-switch">
        <AddSwitch />
      </div> */}
    </div>
  );
};

export default SwitchInterfaces;