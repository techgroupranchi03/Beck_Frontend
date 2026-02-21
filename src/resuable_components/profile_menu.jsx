import React, { useState, useEffect } from "react";
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
    Chip,
    CircularProgress,
} from "@mui/material";
import { Logout, Business, CheckCircle, Person, Palette } from "@mui/icons-material";
import ThemeToggleButton from "../resuable_components/ThemeToggleButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getAvailableTeamsAccounts, switchTeamAccount } from "../service/Teams/SelectAccount.js";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
    const theme = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [switchingAccount, setSwitchingAccount] = useState(false);
    const open = Boolean(anchorEl);

    //console.log('ProfileMenu user:', user);

    // Fetch available accounts for team members
    useEffect(() => {
        const fetchAvailableAccounts = async () => {
            if (user?.role === 'team') {
                setLoadingAccounts(true);
                try {
                    const response = await getAvailableTeamsAccounts();
                    if (response.success) {
                        setAvailableAccounts(response.data.available_clients || []);
                    }
                } catch (error) {
                    console.error('Error fetching available accounts:', error);
                } finally {
                    setLoadingAccounts(false);
                }
            }
        };

        fetchAvailableAccounts();
    }, [user?.role]);

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

    const handleThemeSettings = () => {
        setAnchorEl(null);
        navigate('themeSetting');
    };

    const handleSwitchAccount = async (clientId) => {
        if (switchingAccount) return;

        setSwitchingAccount(true);
        try {
            const response = await switchTeamAccount(clientId);
            if (response.success) {
                // set token in localStorage
                localStorage.setItem('team_token', response.data.token);
                // Refresh the page to load the new account context
                window.location.reload();
            }
        } catch (error) {
            console.error('Error switching account:', error);
        } finally {
            setSwitchingAccount(false);
        }
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
                    mr: 1,
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

                {/* Available Accounts Section (Only for team members) */}
                {user?.role === 'team' && (
                    <>
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    color: theme.palette.text.secondary,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}
                            >
                                Available Accounts
                            </Typography>
                        </Box>

                        {loadingAccounts ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : availableAccounts.length > 0 ? (
                            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                {availableAccounts.map((account) => (
                                    <MenuItem
                                        key={account.team_member_id}
                                        onClick={() => {
                                            if (!account.is_current_client) {
                                                handleSwitchAccount(account.client_id);
                                            }
                                        }}
                                        disabled={!!account.is_current_client || !account.is_active_subscription || switchingAccount}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            py: 1.5,
                                            px: 2,
                                            bgcolor: account.is_current_client
                                                ? theme.palette.action.selected
                                                : 'transparent',
                                            '&:hover': {
                                                bgcolor: account.is_current_client
                                                    ? theme.palette.action.selected
                                                    : theme.palette.action.hover,
                                            },
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center" width="100%">
                                            <Person fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {account.client_name}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: 'block' }}
                                                >
                                                    Role: {account.role}
                                                </Typography>
                                                {!account.is_active_subscription && (
                                                    <Chip
                                                        label="Plan Expired"
                                                        size="small"
                                                        color="error"
                                                        sx={{ mt: 0.5, height: 16, fontSize: 10 }}
                                                    />
                                                )}
                                            </Box>
                                            {!!account.is_current_client && (
                                                <CheckCircle
                                                    fontSize="small"
                                                    sx={{ color: theme.palette.success.main }}
                                                />
                                            )}


                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    No accounts available
                                </Typography>
                            </Box>
                        )}

                        <Divider sx={{ my: 1 }} />
                    </>
                )}
                
                {/* Theme Settings Menu Item */}
                <MenuItem onClick={handleThemeSettings}>
                    <ListItemIcon>
                        <Palette fontSize="small" sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText 
                        primary={
                            <Typography variant="body2" fontWeight={500}>
                                Theme Settings
                            </Typography>
                        }
                        secondary={
                            <Typography variant="caption" color="text.secondary">
                                Customize colors
                            </Typography>
                        }
                    />
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleLogout}
                    disabled={switchingAccount}
                    startIcon={<Logout />}
                    disableElevation
                    sx={{
                        borderRadius: 10,
                        bgcolor: theme.palette.primary.main,
                        elevation: 0,
                        '&:hover': {
                            bgcolor: theme.palette.secondary.main
                        }
                    }}
                >
                    Log out
                </Button>
            </Menu>

        </Box>
    );
}
