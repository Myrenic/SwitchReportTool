import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import MacFinder from './pages/switch/MacFinder'
import SwitchInterfaces from './pages/switch/SwitchInterfaces'
import HomePage from './pages/Index';
import Switch from './pages/Switch'


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