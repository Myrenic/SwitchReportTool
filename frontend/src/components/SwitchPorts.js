import React from 'react';

const sortPorts = (a, b) => {
  const getPortParts = (port) => {
    const match = port.match(/([a-zA-Z]+)(\d+\/\d+\/\d+|\d+\/\d+|\d+)/);
    if (match) {
      return [match[1], match[2]];
    }
    return [port, ''];
  };

  const [prefixA, numA] = getPortParts(a.port);
  const [prefixB, numB] = getPortParts(b.port);

  if (prefixA < prefixB) return -1;
  if (prefixA > prefixB) return 1;

  const numAparts = numA.split('/').map(n => parseInt(n, 10));
  const numBparts = numB.split('/').map(n => parseInt(n, 10));

  for (let i = 0; i < Math.max(numAparts.length, numBparts.length); i++) {
    if (numAparts[i] < numBparts[i]) return -1;
    if (numAparts[i] > numBparts[i]) return 1;
  }

  return 0;
};

const SwitchPorts = ({ ports }) => {
  const sortedPorts = [...ports].sort(sortPorts);

  return (
    <div className="switch-ports">
      <h2>Latest Interface Configuration</h2>
      <table>
        <thead>
          <tr>
            <th>Port</th>
            <th>Status</th>
            <th>Duplex</th>
            <th>Speed</th>
            <th>MAC Address</th>
            <th>VLAN ID</th>
            <th>Type</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {sortedPorts.map(port => (
            <tr key={port.id}>
              <td>{port.port}</td>
              <td>{port.status}</td>
              <td>{port.duplex}</td>
              <td>{port.speed}</td>
              <td>{port.mac_address}</td>
              <td>{port.vlan_id}</td>
              <td>{port.type}</td>
              <td>{port.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SwitchPorts;