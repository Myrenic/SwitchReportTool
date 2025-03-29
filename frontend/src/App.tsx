import * as React from 'react';
import LanIcon from '@mui/icons-material/Lan';
import HomeIcon from '@mui/icons-material/Home';
import SettingsInputCompositeIcon from '@mui/icons-material/SettingsInputComposite';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation } from '@toolpad/core/AppProvider';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme'; 

const NAVIGATION: Navigation = [
   {segment: '',
    title: 'Home',
    icon: <HomeIcon />
  },

    {
      kind: 'header',
      title: 'Switch',
    },
      {
        segment: 'switch/interfaces',
        title: 'Interfaces',
        icon: <SettingsInputCompositeIcon />,
      },
      {
        segment: 'switch/mac-finder',
        title: 'Mac Finder',
        icon: <FindInPageIcon />,
      },
]



const BRANDING = {
  title: "< MTU Toolbox / >",
  logo: '',
};


export default function App() {
  
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING} theme={theme}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}