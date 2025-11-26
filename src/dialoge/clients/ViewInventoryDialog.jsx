import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Slide,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ViewInventoryDialog = ({ open, onClose, inventory }) => {
    const palette = {
        dark: "#132421",
        primary: "#407f68",
        accent: "#6b603f",
        lightGreen: "#96d980",
        cream: "#fef7c5",
    };

    console.log("Viewing inventory item:", inventory);

    if (!inventory) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Transition}
            transitionDuration={400}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.dark} 100%)`,
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2.5,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "radial-gradient(circle at 20% 50%, rgba(150, 217, 128, 0.2), transparent 50%)",
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, zIndex: 1 }}>
                    <InventoryIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={700}>
                        Inventory Details
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        zIndex: 1,
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            bgcolor: "rgba(255,255,255,0.2)",
                            transform: "rotate(90deg)",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: palette.cream }}>
                <Card
                    sx={{
                        boxShadow: "none",
                        borderRadius: 0,
                    }}
                >
                    {/* Image Section */}
                    <Box sx={{ position: "relative" }}>
                        {inventory.image_url ? (
                            <CardMedia
                                component="img"
                                height="280"
                                image={inventory.image_url}
                                alt={inventory.name}
                                sx={{
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    height: 280,
                                    bgcolor: palette.primary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <InventoryIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.5)" }} />
                                <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                                    No Image Available
                                </Typography>
                            </Box>
                        )}

                        {/* Gradient Overlay */}
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "60%",
                                background: "linear-gradient(to top, rgba(19, 36, 33, 0.9), transparent)",
                            }}
                        />



                        {/* Item Name Overlay */}
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 20,
                                left: 24,
                                right: 24,
                                zIndex: 2,
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    color: "#fff",
                                    fontWeight: 700,
                                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                                    mb: 0.5,
                                }}
                            >
                                {inventory.name}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: palette.lightGreen,
                                    fontWeight: 600,
                                }}
                            >
                                📍 {inventory.property_name || "Location not specified"}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Content Section */}
                    <CardContent sx={{ p: 3, bgcolor: palette.cream }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Category */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    py: 1.5,
                                    px: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(64, 127, 104, 0.05)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        bgcolor: "rgba(64, 127, 104, 0.1)",
                                        transform: "translateX(4px)",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        bgcolor: palette.primary,
                                        color: "#fff",
                                    }}
                                >
                                    <CategoryIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: palette.dark,
                                            opacity: 0.7,
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Category
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: palette.dark,
                                            fontWeight: 600,
                                            mt: 0.25,
                                        }}
                                    >
                                        {inventory.category}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Quantity */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    py: 1.5,
                                    px: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(64, 127, 104, 0.05)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        bgcolor: "rgba(64, 127, 104, 0.1)",
                                        transform: "translateX(4px)",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        bgcolor: palette.primary,
                                        color: "#fff",
                                        fontWeight: 700,
                                        fontSize: "1.1rem",
                                    }}
                                >
                                    #
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: palette.dark,
                                            opacity: 0.7,
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Quantity
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: palette.dark,
                                            fontWeight: 600,
                                            mt: 0.25,
                                        }}
                                    >
                                        {inventory.quantity}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Unit */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    py: 1.5,
                                    px: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(64, 127, 104, 0.05)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        bgcolor: "rgba(64, 127, 104, 0.1)",
                                        transform: "translateX(4px)",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        bgcolor: palette.primary,
                                        color: "#fff",
                                    }}
                                >
                                    <InventoryIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: palette.dark,
                                            opacity: 0.7,
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Unit Type
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: palette.dark,
                                            fontWeight: 600,
                                            mt: 0.25,
                                        }}
                                    >
                                        {inventory.unit}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3, borderColor: palette.primary, opacity: 0.2 }} />


                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default ViewInventoryDialog;