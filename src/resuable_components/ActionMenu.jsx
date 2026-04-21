import React, { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, useTheme, ListItemText } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ActionMenu = ({ onEdit, onDelete }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const theme = useTheme();
    const { palette } = theme;

    const handleEdit = () => {
        setAnchorEl(null);
        if (onEdit) {
            onEdit();
        }
    };

    const handleDelete = () => {
        setAnchorEl(null);
        if (onDelete) {
            onDelete();
        }
    };

    return (
        <>
            <IconButton
                size="medium"
                sx={{ padding: 0 }}
                onClick={(event) => setAnchorEl(event.currentTarget)}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="action-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    elevation: 2,
                    sx: {
                        width: 120,
                        borderRadius: 2,
                        p: 0,
                        overflow: "visible",
                        mt: 1.5,
                        "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 10,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                            boxShadow: "0px -1px 1px rgba(0,0,0,0.1)",
                        },
                    },
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MenuItem onClick={() => handleEdit()}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

        </>
    );
};

export default ActionMenu;
