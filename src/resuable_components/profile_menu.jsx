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
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfileMenu() {
    const theme = useTheme();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleLogout = () => {
        setAnchorEl(null);
        logout();
    };
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    // Get user initials for avatar
    const getInitials = () => {
        if (user?.name) {
            return user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (user?.username) {
            return user.username.slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    // Get display name
    const getDisplayName = () => {
        return user?.name || user?.username || 'User';
    };

    // Get role label
    const getRoleLabel = () => {
        if (user?.role === 'admin') return 'Administrator';
        if (user?.role === 'client') return 'Client';
        return 'User';
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
                >
                    {getInitials()}
                </Avatar>
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
                    >
                        {getInitials()}
                    </Avatar>
                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.primary }}
                        >
                            {getRoleLabel()}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.primary.light,
                                fontWeight: 500
                            }}
                        >
                            {user?.role || 'super_admin'}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />

                {/* Email */}
                <MenuItem disabled>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.text.p,
                            wordBreak: "break-word"
                        }}
                    >
                        {user?.email}
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
