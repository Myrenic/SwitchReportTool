import React, { useState } from 'react';

const SearchMac = () => {
  const [macAddress, setMacAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = () => {
    if (macAddress) {
      fetch(`${process.env.REACT_APP_DATABASE_API_URL}/get_ports_by_mac/${macAddress}`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            setSearchResults(data);
            setMessage('');
          } else {
            setSearchResults([]);
            setMessage('No results found');
          }
        })
        .catch(error => {
          console.error('Error searching MAC address:', error);
          setMessage('Error searching MAC address');
        });
    }
  };

  return (
    <div className="search-mac">
      <h1>Search MAC Address</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter MAC Address"
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {message && <p>{message}</p>}
      {searchResults.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Switch</th>
              <th>Port</th>
              <th>MAC Address</th>
              <th>Status</th>
              <th>VLAN ID</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((result, index) => (
              <tr key={index}>
                <td>{result.switch_name}</td>
                <td>{result.port}</td>
                <td>{result.mac_address}</td>
                <td>{result.status}</td>
                <td>{result.vlan_id}</td>
                <td>{result.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SearchMac;