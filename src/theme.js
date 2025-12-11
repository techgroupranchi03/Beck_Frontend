import { createTheme } from "@mui/material/styles";

// Color palette
const palette = {
  dark: "#132421",
  primary: "#407f68",
  accent: "#6b603f",
  lightGreen: "#96d980",
  cream: "#fef7c5",
};

// Typography settings
const typography = {
  // Primary font first, then secondary as fallback
  fontFamily: '"League Spartan", "Glacial Indifference", Arial, sans-serif',
  // Use League Spartan prominently for headings
  h1: { fontFamily: '"League Spartan", Arial, sans-serif', fontWeight: 700 },
  h2: { fontFamily: '"League Spartan", Arial, sans-serif', fontWeight: 700 },
  h3: { fontFamily: '"League Spartan", Arial, sans-serif', fontWeight: 600 },
  h4: { fontFamily: '"League Spartan", Arial, sans-serif', fontWeight: 600 },
  h5: { fontFamily: '"League Spartan", Arial, sans-serif', fontWeight: 600 },
  h6: { fontFamily: '"League Spartan", Arial, sans-serif', fontWeight: 600 },
  // Use Glacial Indifference for longer-reading text
  subtitle1: { fontFamily: '"Glacial Indifference", "League Spartan", Arial, sans-serif' },
  subtitle2: { fontFamily: '"Glacial Indifference", "League Spartan", Arial, sans-serif' },
  body1: { fontFamily: '"Glacial Indifference", "League Spartan", Arial, sans-serif' },
  body2: { fontFamily: '"Glacial Indifference", "League Spartan", Arial, sans-serif' },
  button: { textTransform: "none", fontFamily: '"League Spartan", Arial, sans-serif', fontWeight: 600 },
};

// Create light theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: palette.primary,
      dark: palette.dark,
      light: palette.lightGreen,
    },
    secondary: {
      main: palette.accent,
    },
    background: {
      // add background creme
      creme: palette.cream,
      default: "#f9f9f9",
      paper: "#ffffff",
    },
    text: {
      primary: palette.dark,
      secondary: "#555555",
    },
    custom: {
      cream: palette.cream,
      lightGreen: palette.lightGreen,
    },
    card_button: {
      paper: "#f0f0f0",
    },
    // Task type colors
    taskType: {
      inspection: '#0288D1',
      maintenance: '#6D4C41',
      delivery: '#00796B',
      repair: '#546E7A',
      cleaning: '#7E57C2',
      other: '#9E9E9E',
    },
    taskStatus: {
      pending: '#607D8B',
      in_progress: '#2196F3',
      cancelled: '#9E9E9E',
      completed: '#4CAF50',
      overdue: '#F44336',
    },

    tagTask: {
      categatory: '#449e7d28',
      location: '#e2ece26c',
      quantity: '#9cdae252',
      location: '#64b5f628',
      lower_limit: '#f4433628',
      color: '#000000ff',
    },
  },
  customGradients: {
    right: 'linear-gradient(to right, rgba(255,255,255,0.95), transparent)',
    left: 'linear-gradient(to left, rgba(255,255,255,0.95), transparent)',

  },
  typography,
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.dark,
          color: "#ffffff",
        },
      },
    },
  },
});

// Create dark theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: palette.primary,
      dark: palette.dark,
      light: palette.lightGreen,
    },
    secondary: {
      main: palette.accent,
    },
    background: {
      creme: "#fef7c5",
      default: "#1a1a1a",
      paper: "#3c3c3c",

    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    custom: {
      cream: palette.cream,
      lightGreen: palette.lightGreen,
    },
    card_button: {
      paper: "#3c3c3c",
    },
    // Task type colors
    taskType: {
      inspection: "#42a5f5",
      maintenance: "#6D4C41",
      delivery: "#66bb6a",
      repair: "#546E7A",
      cleaning: "#7E57C2",
      other: "#bdbdbd",
    },
    // Status colors
    taskStatus: {
      pending: "#607D8B",
      in_progress: "#42a5f5",
      cancelled: "#e66c6aff",
      completed: "#66bb6a",
      overdue: "#e53935",
    },
    tagTask: {
      categatory: '#81c78428',
      location: '#64b5f628',
      quantity: '#9cdae252',
      location: '#64b5f628',
      lower_limit: '#f4433628',
      color: '#ffffffff',
    },
  },
  customGradients: {
    right: 'linear-gradient(to right, rgba(26,26,26,0.95), transparent)',
    left: 'linear-gradient(to left, rgba(26,26,26,0.95), transparent)',
  },
  typography,
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.dark,
          color: "#ffffff",
        },
      },
    },
  },
});