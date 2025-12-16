import React from "react";
import {
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

    console.log('ProfileMenu user:', user);

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


    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 0 }}>
            {/* Theme Toggle Button */}
            <ThemeToggleButton />

            {/* Profile button to open menu */}
            <Box
                onClick={handleMenuOpen}
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.custom.cream,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: theme.palette.secondary.main,
                        transform: 'scale(1.05)',
                    }
                }}
            >
                {getInitials()}
            </Box>
           


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
                        <Box
                            sx={{
                                mr: 1,
                                width: 35,
                                height: 35,
                                borderRadius: '50%',
                                bgcolor: theme.palette.secondary.main,
                                color: theme.palette.custom.cream,
                                fontSize: 14,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {getInitials()}
                        </Box>
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
                                {user?.teamRole || "super_admin"}
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
