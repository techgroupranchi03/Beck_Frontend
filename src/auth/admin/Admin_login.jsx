import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import Loader from "../../resuable_components/Loader.jsx";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { adminLogin } from "../../service/Admin/Admin_auth";
import { useAuth } from "../../context/AuthContext";

const Admin_login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    console.log("error : ", error);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            const from = location.state?.from || '/admin/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            // Call login API
            const response = await adminLogin({ username, password });
            const token = response.data.token;

            if (!token) {
                setError("Invalid response from server. Token not found.");
                setLoading(false);
                return;
            }

            // Use the auth context login function (only pass token)
            // This will automatically fetch user details from /api/auth/me
            const success = await login(token, 'admin');

            if (success) {
                const from = location.state?.from || '/admin/dashboard';
                navigate(from, { replace: true });
            } else {
                setError("Login failed. Please try again.");
            }
        } catch (error) {
            if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {}
                error.errors.forEach((err) => {
                    Object.keys(err).forEach((key) => {
                        apiErrors[key] = err[key]
                    })
                })
                setError(apiErrors);
            }
        } finally {
            setLoading(false);
        }
    };
    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && username && password && !loading) {
            handleLogin();
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
                        alt="TaskBnB Logo"
                        sx={{ width: 60, height: 60, mb: 1 }}
                    />
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ color: theme.palette.text.primary }}
                    >
                        TaskBnB
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ color: theme.palette.text.secondary }}
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
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    margin="normal"
                    error={Boolean(error?.username)}
                    helperText={error?.username}
                    disabled={loading}
                    focused={true}
                    slotProps={{
                        inputLabel: { sx: { color: theme.palette.text.primary } }
                    }}
                />

                {/* Password Field */}
                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    margin="normal"
                    required
                    error={Boolean(error?.password)}
                    helperText={error?.password}
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
                {/* Login Button */}
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
                        "&:hover": { backgroundColor: theme.palette.secondary.main },
                        fontWeight: "bold",
                        borderRadius: 2,
                        textTransform: "none",
                    }}
                >
                    {loading ? <Loader inline size={24} /> : "Login"}
                </Button>
            </Container>
        </Box>
    );
};

export default Admin_login;