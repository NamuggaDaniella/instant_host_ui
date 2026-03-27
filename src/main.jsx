import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const instantHostTheme = createTheme({
  palette: {
    primary: {
      main: '#1B2A6B',
      dark: '#1c5967',
      light: '#2B3E9E',
      contrastText: '#e9eeef',
    },
    secondary: {
      main: '#F5A623',
      dark: '#C47D0E',
      light: '#FEF3D9',
      contrastText: '#3D2100',
    },
    background: {
      default: '#e3ecf0',
      paper: '#e8f2eb',
    },
    error: { main: '#D32F2F' },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    info: { main: '#0288D1' },
    text: {
      primary: '#1A1A2E',
      secondary: '#636E82',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': { backgroundColor: '#111A4A' },
        },
        containedSecondary: {
          '&:hover': { backgroundColor: '#C47D0E' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1B2A6B',
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={instantHostTheme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);
