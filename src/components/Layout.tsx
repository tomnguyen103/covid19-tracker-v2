import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/ThemeContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Box className="min-h-screen">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            COVID-19 Tracker
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            aria-label="toggle dark mode"
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" className="max-w-5xl mx-auto px-4 pt-4 pb-8">
        {children}
      </Box>
    </Box>
  );
}
