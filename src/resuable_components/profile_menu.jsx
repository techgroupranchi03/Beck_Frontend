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
    Stack,
    ListItemIcon,
    ListItemText,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 0 }}>
            {/* Theme Toggle Button */}
            <ThemeToggleButton />

            {/* Avatar button to open menu */}
            <IconButton onClick={handleMenuOpen} size="small">
                <Avatar
                    alt="Admin User"
                    src="/user-avatar.jpg"
                    sx={{
                        width: 40,
                        height: 40,
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
                    elevation: 2,
                    sx: {
                        width: 250,
                        borderRadius: 2,
                        overflow: "visible",
                        mt: 1.5,
                        "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 11,
                            width: 12,
                            height: 12,
                            bgcolor: theme.palette.background.paper,
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                            boxShadow:
                                theme.palette.mode === "light"
                                    ? "0px -1px 1px rgba(0,0,0,0.1)"
                                    : "0px -1px 1px rgba(255,255,255,0.1)",
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {/* Profile Header as MenuItem */}
                <MenuItem>
                    <ListItemIcon>
                        <Avatar
                            src="/user-avatar.jpg"
                            alt="Admin User"
                            sx={{
                                mr: 1,
                                width: 40,
                                height: 40,
                                bgcolor: theme.palette.secondary.main,
                                color: theme.palette.custom.cream,
                            }}
                        >
                            {getInitials()}
                        </Avatar>
                    </ListItemIcon>

                    <ListItemText
                        primary={
                            <Typography variant="h6" sx={{ fontSize: 16 }}>
                                {user ? getDisplayName() : "Super Admin"}
                            </Typography>
                        }
                        secondary={
                            <Typography
                                variant="body2"
                                sx={{ fontSize: 13, color: theme.palette.primary.light }}
                            >
                                {user?.role || "super_admin"}
                            </Typography>
                        }
                    />
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                {/* Logout */}
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        mt: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.custom.cream,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        "&:hover": { bgcolor: theme.palette.secondary.main },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            color: theme.palette.custom.cream,
                        }}
                    >
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                            fontWeight: 600,
                            color: theme.palette.custom.cream,
                        }}
                    />
                </MenuItem>
            </Menu>

        </Box>
    );
}
