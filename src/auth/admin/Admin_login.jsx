import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Avatar,
    useTheme,
    createTheme,
    ThemeProvider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Your color palette
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

const Admin_login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [logindata, setLogindata] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setLogindata({ ...logindata, [e.target.name]: e.target.value });
    };
    const handleLogin = () => {
        if (!logindata.username || !logindata.password) {
            setError("Username and password are required.");
            return;
        }
        setError("");
        console.log("Admin Login:", logindata);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    backgroundColor: theme.palette.background.default,
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                }}
            >
                <Container
                    maxWidth="xs"
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 5,
                        boxShadow: 2,
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    {/* Logo and App Name */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                        <Avatar
                            src="../images/logo.png"
                            alt="Beck HolidayHomes Logo"
                            sx={{ width: 64, height: 64, mb: 1 }}
                        />
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{ color: theme.palette.text.primary }}
                        >
                            Beck HolidayHomes
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx={{ color: theme.palette.secondary.main }}
                        >
                            Admin Login
                        </Typography>
                    </Box>

                    {/* Username Field */}
                    <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        required
                        value={logindata.username}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        error={!!error && !logindata.username}
                        helperText={!!error && !logindata.username ? error : ""}
                        slotProps={{
                            inputLabel: { sx: { color: theme.palette.text.primary } }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={logindata.password}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        required
                        error={!!error && !logindata.password}
                        helperText={!!error && !logindata.password ? error : ""}
                        slotProps={{
                            inputLabel: { sx: { color: theme.palette.text.primary } },
                            input: {
                                endAdornment: logindata.password ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: theme.palette.text.primary }}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        onClick={handleLogin}
                        sx={{
                            mt: 3,
                            py: 1.2,
                            backgroundColor: theme.palette.primary.main,
                            "&:hover": { backgroundColor: "#326655" },
                            fontWeight: "bold",
                            borderRadius: 2,
                            textyTransform: "none",
                        }}

                    >
                        Login
                    </Button>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Admin_login;
