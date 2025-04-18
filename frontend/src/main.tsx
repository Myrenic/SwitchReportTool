import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import MacFinder from './pages/switch/MacFinder'
import SwitchInterfaces from './pages/switch/SwitchInterfaces'
import HomePage from './pages/Index';
import Switch from './pages/Switch'
import ReqSwitch from './pages/switch/ReqSwitch';
import LLDPNeighbors from './pages/switch/LLDPNeighbors'
import LegacySwitch from './pages/switch/LegacySwitch'

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '',
            Component: HomePage,
          },
          {
            path: 'Home',
            Component: HomePage,
          },
          {
            path: 'switch',
            Component: Switch,
          },
          {
            path: 'switch/interfaces',
            Component: SwitchInterfaces,
          },
          {
            path: 'switch/mac-finder',
            Component: MacFinder,
          },
          {
            path: 'switch/request',
            Component: ReqSwitch,
          },
          {
            path: 'switch/LLDPNeighbors',
            Component: LLDPNeighbors,
          },
          {
            path: 'switch/adhocswitchselect',
            Component: LegacySwitch,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);