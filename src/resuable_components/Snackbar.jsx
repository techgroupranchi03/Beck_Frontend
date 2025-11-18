import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

const SnackbarContext = createContext();

function SlideTransition(props) {
  return <Slide {...props} direction="left" />; // enters from right side
}

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}     
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            bgcolor: "#6b603f !important",
            color: "white",
            fontWeight: 500,
            boxShadow: 3,
          }}
          elevation={0}
          icon={false}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
