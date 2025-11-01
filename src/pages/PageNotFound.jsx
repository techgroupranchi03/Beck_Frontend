import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Your Beck HolidayHomes color palette
const theme = createTheme({
  palette: {
    primary: { main: "#407f68" },
    secondary: { main: "#6b603f" },
    background: { default: "#fef7c5", paper: "#ffffff" },
    text: { primary: "#132421" },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          p: 3,
        }}
      >
        {/* Big 404 Text */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "6rem", sm: "8rem", md: "10rem" },
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          404
        </Typography>

        {/* Page Not Found Text */}
        <Typography
          variant="h5"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            mb: 1,
          }}
        >
          Oops! Page Not Found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.secondary.main,
            mb: 4,
            maxWidth: "400px",
          }}
        >
          The page you’re looking for doesn’t exist or has been moved.
        </Typography>

        {/* Back to Home Button */}
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            fontWeight: "bold",
            textTransform: "none",
            px: 4,
            py: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "#326655",
            },
          }}
        >
          Go Back Home
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default PageNotFound;
