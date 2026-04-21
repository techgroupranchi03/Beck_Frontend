import React from "react";
import { Dialog, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImageViewer = ({ open, onClose, image }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            PaperProps={{
                sx: {
                    boxShadow: "none",
                    position: "relative",
                },
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                size="small"
                sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    color: "#fff",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                    zIndex: 10,
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>

            {/* Image */}
            <Box
                component="img"
                src={image}
                alt="Preview"
                sx={{
                    width: "100%",
                    maxWidth: { xs: "480px", md: "1000px" },
                    height: "auto",
                    borderRadius: 2,
                    display: "block",
                    margin: "auto",
                }}
            />
        </Dialog>
    );
};

export default ImageViewer;
