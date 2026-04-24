import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4f46e5',
      light: '#818cf8',
      dark: '#3730a3',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#050510',
      paper: '#1f2937',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
  },
  typography: {
    fontFamily: 'inherit',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;