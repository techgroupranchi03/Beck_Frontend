import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme, createCustomTheme } from "../theme/theme";
import { fetchClientTheme } from "../service/Clients/clientThemeService";
import { fetchTeamsTheme } from "../service/Teams/TeamThemeService";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const authContext = useAuth();
  const user = authContext?.user;
  const [presetThemes, setPresetThemes] = useState([]);
  const [customThemes, setCustomThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [selectedLightThemeId, setSelectedLightThemeId] = useState(null);
  const [selectedDarkThemeId, setSelectedDarkThemeId] = useState(null);
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    return saved || "light";
  });

  // Fetch themes from API
  useEffect(() => {
    const loadThemes = async () => {
      if (!user) {
        setThemesLoading(false);
        return;
      }
      try {
        setThemesLoading(true);
        const isTeamUser = user?.role === 'team';
        const response = isTeamUser ? await fetchTeamsTheme() : await fetchClientTheme();
        // Separate themes based on client_id
        const allThemes = response.data || [];
        const builtInThemes = allThemes.filter(theme => theme.client_id === null);
        const clientCustomThemes = allThemes.filter(theme => theme.client_id !== null);
        
        setPresetThemes(builtInThemes);
        setCustomThemes(clientCustomThemes);
      } catch (error) {
        console.error('Failed to fetch themes:', error);
      } finally {
        setThemesLoading(false);
      }
    };

    loadThemes();
  }, [user]);

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  const reloadThemes = async () => {
    if (!user) return;
    try {
      setThemesLoading(true);
      const isTeamUser = user?.role === 'team';
      const response = isTeamUser ? await fetchTeamsTheme() : await fetchClientTheme();
      const allThemes = response.data || [];
      const builtInThemes = allThemes.filter(theme => theme.client_id === null);
      const clientCustomThemes = allThemes.filter(theme => theme.client_id !== null);
      
      setPresetThemes(builtInThemes);
      setCustomThemes(clientCustomThemes);
    } catch (error) {
      console.error('Failed to reload themes:', error);
    } finally {
      setThemesLoading(false);
    }
  };

  // Sync user theme from user profile - this is the source of truth
  const syncUserTheme = (themeData) => {
    if (themeData) {
      // Set both light and dark theme IDs if available from user profile
      if (themeData.light?.id) {
        setSelectedLightThemeId(themeData.light.id);
      }
      if (themeData.dark?.id) {
        setSelectedDarkThemeId(themeData.dark.id);
      }
    }
  };

  const applyPresetTheme = (lightThemeId, darkThemeId) => {
    if (lightThemeId) {
      setSelectedLightThemeId(lightThemeId);
    }
    if (darkThemeId) {
      setSelectedDarkThemeId(darkThemeId);
    }
  };

  const resetToDefault = () => {
    const defaultLightTheme = presetThemes.find(theme => theme.isDefault === 1 && theme.is_dark === 0);
    const defaultDarkTheme = presetThemes.find(theme => theme.isDefault === 1 && theme.is_dark === 1);
    
    if (defaultLightTheme) {
      setSelectedLightThemeId(defaultLightTheme.id);
    }
    if (defaultDarkTheme) {
      setSelectedDarkThemeId(defaultDarkTheme.id);
    }
  };

  // Get the active theme ID based on current mode
  const activeThemeId = useMemo(() => {
    return mode === 'light' ? selectedLightThemeId : selectedDarkThemeId;
  }, [mode, selectedLightThemeId, selectedDarkThemeId]);

  const theme = useMemo(() => {
    if (activeThemeId) {
      // Combine preset and custom themes for lookup
      const allThemes = [...presetThemes, ...(customThemes || [])];
      const selectedTheme = allThemes.find(t => t.id === activeThemeId);
      
      if (selectedTheme?.theme_properties?.palette) {
        return createCustomTheme(mode, selectedTheme.theme_properties.palette);
      }
    }
    // Fallback to default themes
    return mode === "light" ? lightTheme : darkTheme;
  }, [mode, activeThemeId, presetThemes, customThemes]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      activeThemeId,
      selectedLightThemeId,
      selectedDarkThemeId,
      setSelectedLightThemeId,
      setSelectedDarkThemeId,
      applyPresetTheme,
      resetToDefault,
      syncUserTheme,
      reloadThemes,
      presetThemes,
      customThemes,
      themesLoading,
    }),
    [mode, activeThemeId, selectedLightThemeId, selectedDarkThemeId, presetThemes, customThemes, themesLoading]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};