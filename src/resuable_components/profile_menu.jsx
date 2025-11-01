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
} from "@mui/material";
import { Logout } from "@mui/icons-material";

const palette = {
    dark: "#132421",
    primary: "#407f68",
    accent: "#6b603f",
    lightGreen: "#96d980",
    cream: "#fef7c5",
};

export default function ProfileMenu() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            {/* Avatar button to open menu */}
            <IconButton onClick={handleMenuOpen} size="small">
                <Avatar
                    alt="Admin User"
                    src="/user-avatar.jpg"
                    sx={{
                        width: 50,
                        height: 50,
                        bgcolor: palette.primary,
                        color: palette.cream,
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
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                            boxShadow: "0px -1px 1px rgba(0,0,0,0.1)",
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
                        bgcolor: "white",
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
                            bgcolor: palette.accent,
                            color: palette.cream,
                        }}
                    />
                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{ color: palette.dark }}
                        >
                            System Administrator
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: palette.lightGreen, fontWeight: 500 }}
                        >
                            super_admin
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1, borderColor: palette.accent }} />

                {/* Email */}
                <MenuItem disabled>
                    <Typography
                        variant="body2"
                        sx={{ color: palette.dark, wordBreak: "break-word" }}
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
                        onClick={() => alert("Logged out")}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: palette.primary,
                            color: palette.cream,
                            borderRadius: 2,
                            "&:hover": {
                                bgcolor: palette.accent,
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