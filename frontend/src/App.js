import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Config from './PortConfig';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/PortConfig" element={<Config />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
