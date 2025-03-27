import React, { useState } from 'react';
import axios from 'axios';
import './PortConfig.css'; // Import the CSS file

function PortConfig() {
  const [ip, setIP] = useState('');
  const [configData, setConfigData] = useState([]);
  const [error, setError] = useState('');
  
  const fetchConfig = async () => {
    setError('');
    try {
      const response = await axios.get(`http://10.115.196.130:5000/port_config?ip=${ip}`, {
        headers: {
          Authorization: 'Bearer NoHJIRbuzQ0p3wC3oLNb7BW2nvaHgC9C1Z4jYHHyhwTGaLOgNiJae8AE1RvGxyal1rMZVPaL4tteCEQIgEmROrIbh7twuO3PeyQT5iifPIf8tNDmuv5RvNHfCmoPeoQl',
        }
      });
      setConfigData(response.data.config);
    } catch (err) {
      setError('Failed to fetch configuration. Please check the IP address.');
    }
  };

  return (
    <div className="port-config-container">
      <div className="input-container">
        <a href="/">
          <button className="home-btn">🏠</button>
        </a>

        <input
          type="text"
          placeholder="Enter IP address"
          value={ip}
          onChange={(e) => setIP(e.target.value)}
          className="input-field"
        />
        <button 
          onClick={fetchConfig} 
          className="confirm-btn"
        >
          Confirm
        </button>
      </div>

      {/* Color Key */}
      <div className="color-key">
        <p><span className="green-dot">🟩</span> Port is connected</p>
        <p><span className="light-blue-dot">🟦</span> Port is not connected</p>
        <p><span className="red-dot">🟥</span> Port is in error</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {configData.length > 0 && (
        <div className="table-container">
          <table className="config-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>Name</th>
                <th>Duplex</th>
                <th>Speed</th>
                <th>Status</th>
                <th>Vlan</th>
              </tr>
            </thead>
            <tbody>
              {configData.map((item, index) => (
                <tr key={index} className={`port-row ${item.Status}`}>
                  <td>{item.Port}</td>
                  <td>{item.Name}</td>
                  <td>{item.Duplex}</td>
                  <td>{item.Speed}</td>

                  <td>
                    {item.Status === "up" ? (
                      <>
                        <span className="green-dot"></span> {item.Status}
                      </>
                    ) : item.Status === "down" ? (
                      <>
                        <span className="light-blue-dot"></span> {item.Status}
                      </>
                    ) : item.Status === "administratively down" ? (
                        <>
                          <span className="light-blue-dot"></span> {item.Status}
                        </>
                    ) : (
                      <>
                        <span className="red-dot"></span> {item.Status}
                      </>
                    )}
                  </td>
                  <td>{item.Vlan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PortConfig;
