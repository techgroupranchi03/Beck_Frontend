import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slide,
    Box,
    Autocomplete,
    TextField,
    useTheme,
} from '@mui/material';
import { Close, NavigateBefore } from '@mui/icons-material';
import { useInventoryContext } from './InventoryManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import QuantityInput from '../../../resuable_components/QuantityInput';

const Transition = React.forwardRef(function transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const UpdateInventoryDialog = ({ open, onClose, inventory }) => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const { updateInventory } = useInventoryContext();

    const [quantity, setQuantity] = useState('');
    const [containerType, setContainerType] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const unit = inventory?.unit || '';

    useEffect(() => {
        if (open && inventory) {
            setQuantity(inventory.quantity || '');
            setContainerType(inventory.container_type || '');
            setError('');
        }
    }, [open, inventory]);

    const handleSave = async () => {
        if (quantity === '' || quantity === null || quantity === undefined) {
            setError('Quantity is required');
            return;
        }
        setError('');
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', inventory.name);
            formData.append('category', inventory.category);
            formData.append('property_id', inventory.property_id);
            formData.append('quantity', quantity);
            formData.append('unit', inventory.unit);
            formData.append('located_at', inventory.located_at || '');
            formData.append('lower_limit', inventory.lower_limit || '');
            formData.append('auto_purchase_order', inventory.auto_purchase_order ? 1 : 0);
            if (inventory.unit === 'container' && containerType) {
                formData.append('container_type', containerType);
            }
            const res = await updateInventory(inventory.id, formData);
            showSnackbar(res.message || 'Quantity updated successfully', 'success');
            onClose();
        } catch (err) {
            showSnackbar(err.message || 'Failed to update quantity', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Transition}
        >
            <DialogTitle>
                Update Quantity
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: palette.grey[500],
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {inventory?.name}
                </Typography>

                {/* Unit (read-only / pre-selected) */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel size="small">Unit</InputLabel>
                    <Select
                        label="Unit"
                        size="small"
                        value={unit}
                        disabled
                        fullWidth
                    >
                        <MenuItem value={unit}>
                            {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </MenuItem>
                    </Select>
                </FormControl>

                {/* Quantity input */}
                <Box sx={{ mt: 2 }}>
                    <QuantityInput
                        unit={unit}
                        value={quantity}
                        onChange={(val) => { setQuantity(val); setError(''); }}
                        error={error}
                        label={unit === 'container' ? undefined : 'Quantity'}
                        containerType={containerType}
                        onContainerTypeChange={(val) => {
                            setContainerType(val);
                            setQuantity('');
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    startIcon={<NavigateBefore />}
                    sx={{ textTransform: 'none', borderRadius: 10 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disableElevation
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 10,
                        bgcolor: palette.primary.main,
                        '&:hover': { bgcolor: palette.secondary.main },
                    }}
                >
                    {saving ? 'Saving...' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateInventoryDialog;
