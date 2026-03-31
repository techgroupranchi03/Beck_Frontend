import React, { useState, useEffect } from 'react';
import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import { units } from '../../constant';
import QuantityInput from '../../resuable_components/QuantityInput';

const TaskQuantityUpdate = ({ inventory, quantityData, setQuantityData, loading }) => {
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUnit, setSelectedUnit] = useState('');

    useEffect(() => {
        if (inventory) {
            setSelectedUnit(inventory.unit || '');
        }
        setValidationErrors({});
    }, [inventory]);

    const handleQuantityChange = (value) => {
        setQuantityData(prev => ({
            ...prev,
            quantity: value
        }));
        if (validationErrors.quantity) {
            setValidationErrors(prev => ({
                ...prev,
                quantity: undefined
            }));
        }
    };

    const unitLabel = units.find(u => u.value === selectedUnit)?.label || selectedUnit;

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    Update quantity for: <strong>{inventory?.name}</strong>
                </Typography>
                {selectedUnit && (
                    <Chip
                        label={`Unit: ${unitLabel}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                    />
                )}
            </Box>

            <QuantityInput
                unit={selectedUnit}
                value={quantityData.quantity}
                onChange={handleQuantityChange}
                disabled={loading}
                error={validationErrors?.quantity}
                containerType={inventory?.container_type || ''}
                onContainerTypeChange={(val) => {
                    setQuantityData(prev => ({
                        ...prev,
                        container_type: val,
                        quantity: ''
                    }));
                }}
            />
        </>
    );
};

export default TaskQuantityUpdate;
