import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to the SwitchReport Tool</h1>
      <p className="mb-8">Use with caution – this tool displays port configurations.</p>
      <Link 
        to="/PortConfig" 
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        View Port Config
      </Link>
    </div>
  );
}

export default Home;
