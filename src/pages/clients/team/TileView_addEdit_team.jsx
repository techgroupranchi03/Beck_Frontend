import { 
    Autocomplete, 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    DialogActions,
    Grid, 
    IconButton, 
    TextField,
    Select,
    MenuItem,
    Button,
    useTheme 
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useSnackbar } from '../../../resuable_components/Snackbar';
import { Close } from '@mui/icons-material';
import { TeamStatus } from '../../../constant';
import { useTeamContext } from './TeamManagement';

const TileView_addEdit_team = ({ open, onClose, teamMember }) => {
    const isEdit = !!teamMember;
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();

    // Get data from context
    const {
        roles,
        createTeam,
        updateTeam,
    } = useTeamContext();

    console.log('teamMember in dialog:', teamMember , roles);

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        phone: '',
        status: '',
    });

    // Initialize form data when teamMember changes
    useEffect(() => {
        if (isEdit && teamMember) {
            setFormData({
                name: teamMember.name || '',
                role: teamMember.role || '',
                phone: teamMember.phone || '',
                status: teamMember.status || '',
            });
        } else {
            // Reset form for new team member
            setFormData({
                name: '',
                role: '',
                phone: '',
                status: '',
            });
        }
        setValidationErrors({});
    }, [teamMember, isEdit, open]);

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
        if (!formData.role) errors.role = 'Role is required';
        if (!formData.phone) errors.phone = 'Phone is required';
        if (formData.phone && formData.phone.length !== 10) errors.phone = 'Phone must be 10 digits';
        if (!formData.status) errors.status = 'Status is required';

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
                const res = await updateTeam(teamMember.id, formData);
                showSnackbar(res.message || 'Team member updated successfully', 'success');
            } else {
                const res = await createTeam(formData);
                showSnackbar(res.message || 'Team member created successfully', 'success');
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
                {isEdit ? 'Edit Team Member' : 'Add Team Member'}
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
                    
                    {/* Role */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size="small"
                            options={roles.map(role => role.name)}
                            value={formData.role || null}
                            onChange={(e, newValue) => {
                                handleChange("role")({
                                    target: { value: newValue || "" }
                                });
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Role" 
                                    required
                                    error={!!validationErrors.role}
                                    helperText={validationErrors.role}
                                />
                            )}
                        />
                    </Grid>
                    
                    {/* Phone number only 10 digits */}
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
                            {TeamStatus.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </MenuItem>
                            ))}
                        </TextField>
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
                    size='medium'
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: palette.primary.main,
                        '&:hover': { backgroundColor: palette.secondary.main }
                    }}
                >
                    {loading ? 'Saving...' : (isEdit ? 'Update Team Member' : 'Add Team Member')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TileView_addEdit_team