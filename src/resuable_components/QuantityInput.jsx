import React, { useState, useCallback } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Chip,
    Typography,
    InputAdornment,
    Autocomplete,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { containerOptions, containerTypes, quantityConfig } from '../constant';
import BottleQuantitySlider from './BottleQuantitySlider';

/**
 * Unit-aware quantity input component.
 *
 * - piece: decimal stepper (+/-) with quick-fill buttons (+1, +5, +10)
 * - liters/kg: decimal stepper (+/-) with quick-fill buttons (+0.5, +1.0, +5.0)
 * - container: container type selector + visual fill slider (supports arbitrary %)
 */
const QuantityInput = ({
    unit = '',
    value = '',
    onChange,
    disabled = false,
    error = '',
    size = 'small',
    showQuickFill = true,
    label,
    containerType = '',
    onContainerTypeChange,
}) => {
    const [localError, setLocalError] = useState('');
    const unitLower = unit.toLowerCase();
    const config = quantityConfig[unitLower];
    const isContainer = unitLower === 'container';

    const displayError = error || localError;

    const parseValue = useCallback((val) => {
        if (val === '' || val === null || val === undefined) return 0;
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    }, []);

    const formatValue = useCallback((num) => {
        // Round to 1 decimal, remove trailing zero if whole number
        const rounded = Math.round(num * 10) / 10;
        return String(rounded);
    }, []);

    const clamp = useCallback((num) => {
        if (!config) return num;
        return Math.max(config.min, Math.min(config.max, num));
    }, [config]);

    const validate = useCallback((val) => {
        const num = parseFloat(val);
        if (isNaN(num) && val !== '') {
            setLocalError('Invalid number');
            return false;
        }
        if (num < 0) {
            setLocalError('Quantity cannot be negative');
            return false;
        }
        setLocalError('');
        return true;
    }, []);

    // --- Stepper handlers ---
    const handleStep = useCallback((direction) => {
        if (!config) return;
        const current = parseValue(value);
        const step = config.step;
        const next = clamp(
            parseFloat((current + direction * step).toFixed(4))
        );
        validate(next);
        onChange(formatValue(next));
    }, [config, value, parseValue, clamp, validate, onChange, formatValue]);

    const handleQuickFill = useCallback((amount) => {
        if (!config) return;
        const current = parseValue(value);
        const next = clamp(
            parseFloat((current + amount).toFixed(4))
        );
        validate(next);
        onChange(formatValue(next));
    }, [config, value, parseValue, clamp, validate, onChange, formatValue]);

    const handleInputChange = useCallback((e) => {
        const raw = e.target.value;
        validate(raw);
        onChange(raw);
    }, [validate, onChange]);

    // ========================
    // CONTAINER: Type Selector + Visual Slider
    // ========================
    if (isContainer) {
        return (
            <Box>
                {/* Container Type Selector */}
                <Autocomplete
                    fullWidth
                    size="small"
                    options={containerTypes}
                    getOptionLabel={(option) => option.label || ''}
                    value={containerTypes.find((ct) => ct.value === containerType) || null}
                    onChange={(_, newVal) => {
                        if (onContainerTypeChange) {
                            onContainerTypeChange(newVal ? newVal.value : '');
                        }
                    }}
                    disabled={disabled}
                    renderOption={(props, option) => (
                        <li {...props} key={option.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span style={{ fontSize: '1.2rem' }}>{option.icon}</span>
                                {option.label}
                            </Box>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} label="Container Type" />
                    )}
                    sx={{ mb: 0 }}
                />
                <Typography variant="caption" sx={{ mt: 0, mb: 1 }}>
                    Please select a container type first
                </Typography>

                {/* Show the quantity slider only after a container type is selected */}
                {containerType && (
                    <BottleQuantitySlider
                        value={value}
                        onChange={(newVal) => { setLocalError(''); onChange(newVal); }}
                        disabled={disabled}
                        containerType={containerType}
                    />
                )}
                {displayError && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {displayError}
                    </Typography>
                )}
            </Box>
        );
    }

    // ========================
    // NUMERIC: Stepper + Quick-Fill
    // ========================
    if (!config) {
        // Fallback for unknown unit
        return (
            <TextField
                label={label || 'Quantity'}
                variant="outlined"
                size={size}
                type="number"
                value={value}
                onChange={handleInputChange}
                error={!!displayError}
                helperText={displayError}
                disabled={disabled}
                fullWidth
                slotProps={{
                    htmlInput: { step: 0.1 },
                }}
            />
        );
    }

    return (
        <Box>
            {label && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    {label}
                </Typography>
            )}

            {/* Stepper Row: [ - ] [input] [ + ] */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                    onClick={() => handleStep(-1)}
                    disabled={disabled || parseValue(value) <= config.min}
                    size={size}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        width: size === 'small' ? 36 : 42,
                        height: size === 'small' ? 36 : 42,
                    }}
                >
                    <RemoveIcon fontSize="small" />
                </IconButton>

                <TextField
                    variant="outlined"
                    size={size}
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    error={!!displayError}
                    disabled={disabled}
                    slotProps={{
                        input: {
                            endAdornment: config.unitSuffix ? (
                                <InputAdornment position="end">{config.unitSuffix}</InputAdornment>
                            ) : undefined,
                            sx: { textAlign: 'center' },
                        },
                        htmlInput: {
                            min: config.min,
                            max: config.max,
                            step: config.step,
                            style: { textAlign: 'center' },
                        },
                    }}
                    sx={{ flex: 1, minWidth: 80 }}
                />

                <IconButton
                    onClick={() => handleStep(1)}
                    disabled={disabled || parseValue(value) >= config.max}
                    size={size}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        width: size === 'small' ? 36 : 42,
                        height: size === 'small' ? 36 : 42,
                    }}
                >
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Error text */}
            {displayError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {displayError}
                </Typography>
            )}

            {/* Quick-Fill Buttons */}
            {showQuickFill && (
                <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5, justifyContent: 'center' }}>
                    {[-5, 5].map((amount) => (
                        <Chip
                            key={amount}
                            label={`${amount > 0 ? '+' : ''}${amount}${config.unitSuffix ? ' ' + config.unitSuffix : ''}`}
                            onClick={() => handleQuickFill(amount)}
                            disabled={disabled}
                            size={size}
                            variant="outlined"
                            sx={{
                                fontWeight: 500,
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default QuantityInput;
