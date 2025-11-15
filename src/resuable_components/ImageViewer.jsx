import React from "react";
import { Dialog, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImageViewer = ({ open, onClose, image }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            PaperProps={{
                sx: {
                    backgroundColor: "rgba(0,0,0,0.85)",
                    boxShadow: "none",
                    position: "relative",
                },
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                size="medium"
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
                    maxHeight: "90vh",
                    maxWidth: "90vw",
                    borderRadius: 2,
                    display: "block",
                    margin: "auto",
                }}
            />
        </Dialog>
    );
};

export default ImageViewer;
