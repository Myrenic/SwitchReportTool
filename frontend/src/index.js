import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import config from './config';

window.config = config;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

