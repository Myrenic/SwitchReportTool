import React, { useState } from 'react';
import SwitchList from '../../components/SwitchLists';
import SwitchDetails from '../../components/SwitchDetails';
import SwitchPorts from '../../components/SwitchPorts';
import config from '../../config';

const SwitchInterfaces = () => {
  const dbUrl = config.DATABASE_API_URL;

  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [switchPorts, setSwitchPorts] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchSwitchPorts = (hostname) => {
    fetch(`${dbUrl}/get_latest_ports/${hostname}`)
      .then(response => response.json())
      .then(data => setSwitchPorts(data))
      .catch(error => console.error('Error fetching switch ports:', error));
  };
  console.log(config);


  const fetchSwitchDetails = (identifier) => {
    fetch(`${dbUrl}/get_switch/${identifier}`)
      .then(response => response.json())
      .then(data => setSelectedSwitch(data))
      .catch(error => console.error('Error fetching switch details:', error));
  };


  const handleSelectSwitch = (sw) => {
    setSelectedSwitch(null); // Clear previous selection while fetching new data
    fetchSwitchDetails(sw.hostname);
    fetchSwitchPorts(sw.hostname);
  };

  const handleRefresh = () => {
    if (selectedSwitch) {
      setStatusMessage('Refreshing data...');
      Promise.all([
        fetchSwitchDetails(selectedSwitch.hostname),
        fetchSwitchPorts(selectedSwitch.hostname)
      ])
      .then(() => {
        setStatusMessage('Data refreshed successfully');
      })
      .catch(error => {
        console.error('Error refreshing ', error);
        setStatusMessage('Error refreshing data');
      })
      .finally(() => {
        setTimeout(() => setStatusMessage(''), 3000); // Clear the message after 3 seconds
      });
    }
  };

  const handleUpdate = () => {
    if (selectedSwitch) {
      setStatusMessage('Updating switch data...');
      fetch(`${config.CISCO_API_URL}/update_switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip_address: selectedSwitch.ip_address }),
      })
        .then(response => response.json())
        .then(data => {
          setStatusMessage(data.message || 'Switch updated successfully.');
          handleRefresh(); // Refresh data after updating
        })
        .catch(error => {
          console.error('Error updating switch:', error);
          setStatusMessage('Error updating switch');
        })
        .finally(() => {
          setTimeout(() => setStatusMessage(''), 3000); // Clear the message after 3 seconds
        });
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
            onUpdate={handleUpdate}
            setStatusMessage={setStatusMessage}
          />
        </div>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
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
    </div>
  );
};

export default SwitchInterfaces;