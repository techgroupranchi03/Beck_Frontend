import React, { useState, useEffect } from 'react';
import {
    Button,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Stack,
    CircularProgress,
    Box
} from '@mui/material';
import { useSnackbar } from '../../resuable_components/Snackbar';
import { units , containerOptions } from '../../constant';

const TaskQuantityUpdate = ({ task, inventory, onSuccess, onCancel, updateTaskCompletionStatus, markdoneClicked, isGroupTask = false }) => {
    const { showSnackbar } = useSnackbar();

    const [formData, setFormData] = useState({
        unit: '',
        quantity: '',
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUnit, setSelectedUnit] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (inventory) {
            setFormData({
                unit: inventory.unit || '',
                quantity: inventory.quantity || '',
            });
            setSelectedUnit(inventory.unit || '');
        }
        setValidationErrors({});
    }, [inventory]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleUnitChange = (value) => {
        setSelectedUnit(value);
        handleChange('unit', value);
        if (value === 'container') {
            handleChange('quantity', '');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // call the updateTaskCompletionStatus function passed as prop
            const updateData = {
                status: markdoneClicked ? 'completed' : task.status,
                updated_quantity: formData.quantity,
            };

            const response = await updateTaskCompletionStatus(task.id, updateData, isGroupTask);
            showSnackbar(response.message, 'success');

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            showSnackbar('Failed to update inventory quantity', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update quantity for: <strong>{inventory?.name}</strong>
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!validationErrors?.unit} disabled>
                        <InputLabel id="unit-label" size='small'>
                            Unit
                        </InputLabel>
                        <Select
                            label="Unit"
                            variant="outlined"
                            size='small'
                            value={formData.unit}
                            onChange={(e) => handleUnitChange(e.target.value)}
                            fullWidth
                        >
                            {units && units.length > 0 ? (
                                units.map((unit) => (
                                    <MenuItem key={unit.value} value={unit.value} dense>
                                        {unit.label}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No units available</MenuItem>
                            )}
                        </Select>
                        {validationErrors?.unit && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                {validationErrors.unit}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    {selectedUnit.toLowerCase() === 'container' ? (
                        <FormControl fullWidth error={!!validationErrors?.quantity}>
                            <InputLabel id="quantity-label" size='small'>
                                Quantity
                            </InputLabel>
                            <Select
                                label="Quantity"
                                variant="outlined"
                                size='small'
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', e.target.value)}
                                fullWidth
                            >
                                {containerOptions && containerOptions.length > 0 ? (
                                    containerOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>No options available</MenuItem>
                                )}
                            </Select>
                            {validationErrors?.quantity && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                    {validationErrors.quantity}
                                </Typography>
                            )}
                        </FormControl>
                    ) : (
                        <TextField
                            label="Quantity"
                            variant="outlined"
                            size='small'
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                            error={!!validationErrors?.quantity}
                            helperText={validationErrors?.quantity}
                            inputProps={{
                                min: 0,
                                step: selectedUnit.toLowerCase() === 'piece' ? 1 : 0.1
                            }}
                            fullWidth
                        />
                    )}
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.unit || !formData.quantity || loading}
                    startIcon={loading && <CircularProgress size={20} />}
                    disableElevation
                    sx={{
                         borderRadius: 10 ,
                         height: 30
                        }}
                >
                    {loading ? 'Updating...' : 'Update'}
                </Button>
            </Stack>
        </>
    );
};

export default TaskQuantityUpdate;
