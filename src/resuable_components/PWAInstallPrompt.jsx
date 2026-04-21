/**
 * PWAInstallPrompt.jsx — "Install App" Banner Component
 * ──────────────────────────────────────────────────────
 * This component listens for the browser's `beforeinstallprompt` event
 * and shows a sleek Material UI Snackbar prompting the user to install
 * TaskBnb as a native-like app on their device.
 *
 * How it works:
 * 1. The browser fires `beforeinstallprompt` when the PWA criteria are met
 *    (valid manifest, registered SW, HTTPS, user hasn't installed yet)
 * 2. We intercept and store the event (deferredPrompt)
 * 3. We show a Snackbar with an "Install" button
 * 4. When clicked, we call deferredPrompt.prompt() to show the native
 *    install dialog
 * 5. After the user accepts or dismisses, we hide the banner
 *
 * Usage:
 *   Place <PWAInstallPrompt /> once in your app, e.g. inside Layout.jsx
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Snackbar,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import CloseIcon from "@mui/icons-material/Close";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const deferredPromptRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const handler = (e) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();

      // Check if user has dismissed prompt within the last 24 hours
      const lastClosedTime = localStorage.getItem("pwaPromptClosedTime");
      if (lastClosedTime) {
        const timeSinceClosed = Date.now() - parseInt(lastClosedTime, 10);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (timeSinceClosed < twentyFourHours) {
          // Do not show the prompt if it was closed less than 24 hours ago
          return;
        }
      }

      // Save the event so we can trigger it later
      deferredPromptRef.current = e;
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also detect if already installed
    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      deferredPromptRef.current = null;
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPromptRef.current) return;

    // Show the native install prompt
    deferredPromptRef.current.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPromptRef.current.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt");
    } else {
      console.log("[PWA] User dismissed the install prompt");
      // If they cancel out of the browser prompt, we should also probably wait 24h
      localStorage.setItem("pwaPromptClosedTime", Date.now().toString());
    }

    // Clear the deferred prompt — it can only be used once
    deferredPromptRef.current = null;
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwaPromptClosedTime", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ mb: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: theme.palette.primary.dark,
          color: "#fff",
          px: 2.5,
          py: 1.5,
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          maxWidth: 420,
          width: "100%",
        }}
      >
        <InstallMobileIcon sx={{ fontSize: 28, color: theme.palette.primary.light }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Install TaskBnb
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Add to home screen for quick access
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleInstallClick}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.dark,
            },
          }}
        >
          Install
        </Button>
        <IconButton size="small" onClick={handleDismiss} sx={{ color: "#fff", opacity: 0.7 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
