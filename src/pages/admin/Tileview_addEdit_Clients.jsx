import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Grid,
    IconButton,
    TextField,
    MenuItem,
    Button,
    useTheme
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useSnackbar } from '../../resuable_components/Snackbar';
import { Close } from '@mui/icons-material';

const Tileview_addEdit_Clients = ({ open, onClose, client, createClient, updateClient }) => {
    const isEdit = !!client;
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();

    const statusOptions = ['active', 'inactive'];
    const planOptions = ['basic', 'premium'];

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        plan: '',
        status: '',
        valid_from: '',
        valid_to: '',
    });

    // Initialize form data when client changes
    useEffect(() => {
        if (isEdit && client) {
            setFormData({
                name: client.name || '',
                company: client.company || '',
                phone: client.phone || '',
                plan: client.plan || '',
                status: client.status || '',
                valid_from: client.valid_from 
                    ? new Date(client.valid_from).toISOString().split('T')[0]
                    : '',
                valid_to: client.valid_to 
                    ? new Date(client.valid_to).toISOString().split('T')[0]
                    : '',
            });
        } else {
            // Reset form for new client
            setFormData({
                name: '',
                company: '',
                phone: '',
                plan: '',
                status: '',
                valid_from: '',
                valid_to: '',
            });
        }
        setValidationErrors({});
    }, [client, isEdit, open]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name?.trim()) errors.name = 'Name is required';
        if (!formData.phone) errors.phone = 'Phone is required';
        if (formData.phone && formData.phone.length !== 10) errors.phone = 'Phone must be 10 digits';
        if (!formData.plan) errors.plan = 'Plan is required';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.valid_from) errors.valid_from = 'Valid from date is required';
        if (!formData.valid_to) errors.valid_to = 'Valid to date is required';
        
        // Check if valid_to is after valid_from
        if (formData.valid_from && formData.valid_to) {
            const fromDate = new Date(formData.valid_from);
            const toDate = new Date(formData.valid_to);
            if (toDate <= fromDate) {
                errors.valid_to = 'Valid to date must be after valid from date';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                const res = await updateClient(client.id, formData);
                showSnackbar(res.message || 'Client updated successfully', 'success');
            } else {
                const res = await createClient(formData);
                showSnackbar(res.message || 'Client created successfully', 'success');
            }
            onClose();
        } catch (error) {
            if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {};
                error.errors.forEach((err) => {
                    Object.keys(err).forEach((key) => {
                        apiErrors[key] = err[key];
                    });
                });
                setValidationErrors(apiErrors);
            }
            showSnackbar(error.message || 'Operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {isEdit ? 'Edit Client' : 'Add Client'}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {/* Name */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            fullWidth
                            size="small"
                            required
                            error={!!validationErrors.name}
                            helperText={validationErrors.name}
                        />
                    </Grid>

                    {/* Company */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Company"
                            value={formData.company}
                            onChange={handleChange('company')}
                            fullWidth
                            size="small"
                            error={!!validationErrors.company}
                            helperText={validationErrors.company}
                        />
                    </Grid>

                    {/* Phone */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => {
                                // Only allow numbers
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                handleChange('phone')({ target: { value } });
                            }}
                            fullWidth
                            size="small"
                            required
                            inputProps={{ maxLength: 10 }}
                            error={!!validationErrors.phone}
                            helperText={validationErrors.phone || 'Enter 10 digit phone number'}
                        />
                    </Grid>

                    {/* Plan */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Plan"
                            value={formData.plan}
                            onChange={handleChange('plan')}
                            fullWidth
                            size="small"
                            required
                            error={!!validationErrors.plan}
                            helperText={validationErrors.plan}
                        >
                            {planOptions.map((plan) => (
                                <MenuItem key={plan} value={plan}>
                                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Status */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Status"
                            value={formData.status}
                            onChange={handleChange('status')}
                            fullWidth
                            size="small"
                            required
                            error={!!validationErrors.status}
                            helperText={validationErrors.status}
                        >
                            {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Valid From */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            type="date"
                            label="Valid From"
                            value={formData.valid_from}
                            onChange={handleChange('valid_from')}
                            fullWidth
                            size="small"
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={!!validationErrors.valid_from}
                            helperText={validationErrors.valid_from}
                        />
                    </Grid>

                    {/* Valid To */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            type="date"
                            label="Valid To"
                            value={formData.valid_to}
                            onChange={handleChange('valid_to')}
                            fullWidth
                            size="small"
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={!!validationErrors.valid_to}
                            helperText={validationErrors.valid_to}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    variant='text'
                    size='medium'
                    sx={{ textTransform: 'none' }}
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    disableElevation
                    size='small'
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        backgroundColor: palette.primary.main,
                        '&:hover': { backgroundColor: palette.secondary.main },
                        fontSize: '0.875rem',
                    }}
                >
                    {loading ? 'Saving...' : (isEdit ? 'Update Client' : 'Add Client')}
                </Button>
                
            </DialogActions>
        </Dialog>
    )
}

export default Tileview_addEdit_Clients
