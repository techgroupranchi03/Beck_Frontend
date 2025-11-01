import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ConfirmationDialog({ open, onCancel, onDelete, title, message }) {
    return (
        <React.Fragment>
            <Dialog
                open={open}
                slots={{ transition: Transition }}
                keepMounted
                onClose={onCancel}
                aria-describedby="alert-dialog-slide-description"
                maxWidth="xs"
            >
                <DialogTitle>{title}</DialogTitle>
                <IconButton
                    onClick={onCancel}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <Close />
                </IconButton>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={onDelete}
                        disableElevation
                        sx={{ backgroundColor: "#407f68", textTransform: "none", color: "#fff", "&:hover": { backgroundColor: "#356a58" } }}
                        variant="contained"

                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}