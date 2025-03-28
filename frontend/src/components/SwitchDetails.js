import React from 'react';

const SwitchDetails = ({ switch: selectedSwitch }) => {
  return (
    <div className="switch-details">
      <h2>Switch Details</h2>
      <p><strong>Hostname:</strong> {selectedSwitch.hostname}</p>
      <p><strong>IP Address:</strong> {selectedSwitch.ip_address}</p>
      <p><strong>Hardware:</strong> {selectedSwitch.hardware.join(', ')}</p>
      <p><strong>MAC Address:</strong> {selectedSwitch.mac_address.join(', ')}</p>
      <p><strong>Serial:</strong> {selectedSwitch.serial.join(', ')}</p>
    </div>
  );
};

export default SwitchDetails;