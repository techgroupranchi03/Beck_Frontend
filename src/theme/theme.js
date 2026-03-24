import { createTheme } from "@mui/material/styles";
import { typography } from "./typography";

// Default color palette
const defaultColors = {
  layout: '#132421',
  active: '#407f68',
  interactive: '#6b603f',
  notifications: '#96d980',
  surface: '#fef7c5',
  
};


// Function to create custom theme with user-defined colors
export const createCustomTheme = (mode, customPalette) => {
  const isLight = mode === "light";
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: customPalette.active,
        dark: customPalette.layout,
        light: customPalette.notifications,
      },
      secondary: {
        main: customPalette.interactive,
      },
      background: {
        creme: customPalette.surface,
        default: isLight ? "#eeeeee" : "#1a1a1a",
        paper: isLight ? "#ffffff" : "#1a1a1a",
        customPaper: isLight ? "#ada8a828" : "#000000a8",
      },
      text: {
        primary: customPalette.text_primary || (isLight ? "#000000" : "#ffffff"),
        secondary: customPalette.text_secondary || (isLight ? "#555555" : "#b0b0b0"),

      },
      custom: {
        cream: customPalette.surface,
        lightGreen: customPalette.notifications,
      },

      card_button: {
        paper: isLight ? "#f0f0f0" : "#252525",
      },

      taskType: {
        inspection: isLight ? '#0288D1' : "#42a5f5",
        maintenance: '#6D4C41',
        delivery: isLight ? '#00796B' : "#66bb6a",
        repair: '#546E7A',
        cleaning: '#7E57C2',
        other: isLight ? '#9E9E9E' : "#bdbdbd",
      },

      taskStatus: {
        pending: isLight ? '#FFCA28' : '#FFCA28',
        in_progress: isLight ? '#2196F3' : '#42A5F5',
        cancelled: isLight ? '#9E9E9E' : "#e66c6aff",
        completed: isLight ? '#4CAF50' : '#66BB6A',     
         skipped: isLight ? '#9E9E9E' : '#BDBDBD',
      },

      tagTask: {
        categatory: isLight ? '#449e7d28' : '#81c78428',
        location: isLight ? '#e2ece26c' : '#64b5f628',
        quantity: '#9cdae252',
        lower_limit: '#f4433628',
        color: isLight ? '#000000ff' : '#ffffffff',
      },

    },
    customGradients: {
      right: isLight 
        ? 'linear-gradient(to right, rgba(255,255,255,0.95), transparent)' 
        : 'linear-gradient(to right, rgba(26,26,26,0.95), transparent)',
      left: isLight 
        ? 'linear-gradient(to left, rgba(255,255,255,0.95), transparent)' 
        : 'linear-gradient(to left, rgba(26,26,26,0.95), transparent)',
    },
    typography,
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: customPalette.layout,
            color: "#ffffff",
          },
        },
      },
    },
  });
};

// Create light theme
export const lightTheme = createTheme({

  palette: {

    mode: "light",
    primary: {
      main: defaultColors.active,
      dark: defaultColors.layout,
      light: defaultColors.notifications,
    },

    secondary: {
      main: defaultColors.interactive,
    },

    background: {
      creme: defaultColors.surface,
      default: "#f9f9f9",
      paper: "#ffffff",
      // default: defaultColors.surface,
      //paper:defaultColors.surface,
      customPaper: "#ada8a828",
    },

    text: {
      primary: '#000000',
      secondary: '#555555',
    },

    custom: {
      cream: defaultColors.surface,
      lightGreen: defaultColors.notifications,
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

    // Status colors
    taskStatus: {
      pending: '#FFCA28',
      in_progress: '#2196F3',
      cancelled: '#9E9E9E',
      completed: '#4CAF50',
      skipped: '#9E9E9E',
    },

    tagTask: {
      categatory: '#449e7d28',
      location: '#e2ece26c',
      quantity: '#9cdae252',
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
          backgroundColor: defaultColors.layout,
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
      main: defaultColors.active,
      dark: defaultColors.layout,
      light: defaultColors.notifications,
    },
    secondary: {
      main: defaultColors.interactive,
    },
    background: {
      creme: defaultColors.surface,
      default: "#1a1a1a",
      paper: "#000000",
      customPaper: "#000000",
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    custom: {
      cream: defaultColors.surface,
      lightGreen: defaultColors.notifications,
    },
    card_button: {
      paper: "#000000",
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
      pending: "#FFCA28",
      in_progress: "#42A5F5",
      cancelled: "#e66c6aff",
      completed: "#66BB6A",
      skipped: "#BDBDBD",
    },
    tagTask: {
      categatory: '#81c78428',
      location: '#64b5f628',
      quantity: '#9cdae252',
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
          backgroundColor: defaultColors.layout,
          color: "#ffffff",
        },
      },
    },
  },
});

