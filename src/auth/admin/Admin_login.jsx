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
    CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../service/Admin/Admin_auth";

const Admin_login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
 

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await adminLogin({ username, password });
            console.log('Login response:', response);
            localStorage.setItem("admin_token", response.data.token);
            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.creme,
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
                            variant="h4"
                            fontWeight="bold"
                            sx={{ color: theme.palette.text.primary }}
                        >
                            Beck HolidayHomes
                        </Typography>
                        <Typography
                            variant="subtitle1"
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        error={!!error}
                        disabled={loading}
                        slotProps={{
                            inputLabel: { sx: { color: theme.palette.text.primary } }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        required
                        error={!!error}
                        disabled={loading}
                        slotProps={{
                            inputLabel: { sx: { color: theme.palette.text.primary } },
                            input: {
                                endAdornment: password ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: theme.palette.text.primary }}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            disabled={loading}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />

                    {/* Error Message */}
                    {error && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: "error.main",
                                mt: 2,
                                textAlign: "left",
                            }}
                        >
                            {error}
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        onClick={handleLogin}
                        disabled={loading}
                        sx={{
                            mt: 3,
                            py: 1.2,
                            backgroundColor: theme.palette.primary.main,
                            "&:hover": { backgroundColor: "#326655" },
                            "&:disabled": { backgroundColor: "#9db5a9" },
                            fontWeight: "bold",
                            borderRadius: 2,
                            textTransform: "none",
                        }}

                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                    </Button>
                </Container>
            </Box>
    );
};

export default Admin_login;
