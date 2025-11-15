// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Box,
//     Button,
//     Container,
//     TextField,
//     Typography,
//     InputAdornment,
//     IconButton,
//     Avatar,
//     useTheme,
//     CircularProgress,
// } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { clientLogin } from "../../service/Clients/Clients_auth";

// const Clients_login = () => {
//     const theme = useTheme();
//     const [showPassword, setShowPassword] = useState(false);
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();


//     const handleLogin = async () => {
//         setError("");
//         setLoading(true);
//         try {
//             const response = await clientLogin({ email: username, password });
//             console.log('Login response:', response);
//             localStorage.setItem("client_token", response.data.token);
//             navigate("/clients/dashboard");
//         } catch (err) {
//             setError(err.message || "Login failed. Please check your credentials.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Box
//             sx={{
//                 backgroundColor: theme.palette.background.creme,
//                 minHeight: "100vh",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 p: 2,
//             }}
//         >
//             <Container
//                 maxWidth="xs"
//                 sx={{
//                     backgroundColor: theme.palette.background.paper,
//                     borderRadius: 5,
//                     boxShadow: 2,
//                     p: 4,
//                     textAlign: "center",
//                 }}
//             >
//                 {/* Logo and App Name */}
//                 <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
//                     <Avatar
//                         src="../images/logo.png"
//                         alt="Beck HolidayHomes Logo"
//                         sx={{ width: 64, height: 64, mb: 1 }}
//                     />
//                     <Typography
//                         variant="h4"
//                         fontWeight="bold"
//                         sx={{ color: theme.palette.text.primary }}
//                     >
//                         Beck HolidayHomes
//                     </Typography>
//                     <Typography
//                         variant="subtitle1"
//                         sx={{ color: theme.palette.secondary.main }}
//                     >
//                         Clients Login
//                     </Typography>
//                 </Box>

//                 {/* Username Field */}
//                 <TextField
//                     fullWidth
//                     label="Username"
//                     name="username"
//                     required
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     variant="outlined"
//                     margin="normal"
//                     error={!!error}
//                     slotProps={{
//                         inputLabel: { sx: { color: theme.palette.text.primary } }
//                     }}
//                 />
//                 <TextField
//                     fullWidth
//                     label="Password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     variant="outlined"
//                     margin="normal"
//                     required
//                     error={!!error}
//                     slotProps={{
//                         inputLabel: { sx: { color: theme.palette.text.primary } },
//                         input: {
//                             endAdornment: password ? (
//                                 <InputAdornment position="end">
//                                     <IconButton
//                                         onClick={() => setShowPassword(!showPassword)}
//                                         edge="end"
//                                         sx={{ color: theme.palette.text.primary }}
//                                         aria-label={showPassword ? "Hide password" : "Show password"}
//                                     >
//                                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                                     </IconButton>
//                                 </InputAdornment>
//                             ) : null,
//                         },
//                     }}
//                 />

//                 {/* Error Message */}
//                 {error && (
//                     <Typography color="error" variant="body1" sx={{ mt: 1 }}>
//                         {error}
//                     </Typography>
//                 )}

//                 <Button
//                     fullWidth
//                     variant="contained"
//                     disableElevation
//                     onClick={handleLogin}
//                     sx={{
//                         mt: 3,
//                         py: 1.2,
//                         backgroundColor: theme.palette.primary.main,
//                         "&:hover": { backgroundColor: "#326655" },
//                         fontWeight: "bold",
//                         borderRadius: 2,
//                         textTransform: "none",
//                     }}

//                 >
//                     {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
//                 </Button>
//             </Container>
//         </Box>
//     );
// };

// export default Clients_login;


import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { clientLogin } from "../../service/Clients/Clients_auth";
import { useAuth } from "../../context/AuthContext";
const Clients_login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            const from = location.state?.from || '/clients/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        
        try {
            // Call login API (note: using email as username)
            const response = await clientLogin({ email: username, password });
            console.log('Login response:', response);
            
            // Extract token from response
            const token = response.data.token;
            
            if (!token) {
                setError("Invalid response from server. Token not found.");
                setLoading(false);
                return;
            }

            // Use the auth context login function (only pass token)
            // This will automatically fetch user details from /api/auth/me
            const success = await login(token, 'client');
            
            if (success) {
                // Navigate to the page they were trying to access, or dashboard
                const from = location.state?.from || '/clients/dashboard';
                navigate(from, { replace: true });
            } else {
                setError("Failed to authenticate. Please try again.");
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || "Login failed. Please check your credentials.");
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
                        Client Login
                    </Typography>
                </Box>

                {/* Email/Username Field */}
                <TextField
                    fullWidth
                    label="Email"
                    name="username"
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    margin="normal"
                    error={!!error}
                    disabled={loading}
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

                {/* Login Button */}
                <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={handleLogin}
                    disabled={loading || !username || !password}
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

export default Clients_login;