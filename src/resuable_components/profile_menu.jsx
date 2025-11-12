import React from "react";
import {
    Avatar,
    Box,
    Button,
    Divider,
    Menu,
    MenuItem,
    Typography,
    IconButton,
    useTheme,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import ThemeToggleButton from "../resuable_components/ThemeToggleButton.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleLogout = () => {
        try {
            // Clear authentication tokens or user data from localStorage
            localStorage.removeItem("admin_token");
            // Redirect to login page
            navigate("/admin/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };



    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}>
            {/* Theme Toggle Button */}
            <ThemeToggleButton />

            {/* Avatar button to open menu */}
            <IconButton onClick={handleMenuOpen} size="small">
                <Avatar
                    alt="Admin User"
                    src="/user-avatar.jpg"
                    sx={{
                        width: 50,
                        height: 50,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.custom.cream,
                    }}
                />
            </IconButton>

            {/* Profile dropdown menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 4,
                    sx: {
                        width: 300,
                        borderRadius: 2,
                        p: 1,
                        overflow: "visible",
                        mt: 1.5,
                        "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 20,
                            width: 12,
                            height: 12,
                            bgcolor: theme.palette.background.paper,
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                            boxShadow: theme.palette.mode === "light"
                                ? "0px -1px 1px rgba(0,0,0,0.1)"
                                : "0px -1px 1px rgba(255,255,255,0.1)",
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {/* Header Section */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2,
                    }}
                >
                    <Avatar
                        src="/user-avatar.jpg"
                        alt="Admin User"
                        sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.custom.cream,
                        }}
                    />
                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.primary }}
                        >
                            System Administrator
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.primary.light,
                                fontWeight: 500
                            }}
                        >
                            super_admin
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />

                {/* Email */}
                <MenuItem disabled>
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.text.secondary,
                            wordBreak: "break-word"
                        }}
                    >
                        johndoe@example.com
                    </Typography>
                </MenuItem>

                {/* Logout */}
                <Box sx={{ pt: 2 }}>
                    <Button
                        disableElevation
                        fullWidth
                        variant="contained"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.custom.cream,
                            borderRadius: 2,
                            "&:hover": {
                                bgcolor: theme.palette.secondary.main,
                            },
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Menu>
        </Box>
    );
}