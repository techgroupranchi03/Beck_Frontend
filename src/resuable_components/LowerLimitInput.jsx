import React, { useState, useCallback } from 'react';
import {
    Box,
    TextField,
    Typography,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { containerOptions, quantityConfig } from '../constant';

/**
 * Unit-aware Lower Limit input component.
 *
 * - piece/liters/kg: numeric input with decimal support
 * - container: dropdown with container level options (Full, 75%, Half, Quarter, Empty)
 *              + option to type a custom percentage
 */

// Container level options for lower limit — includes custom option
const containerLimitOptions = [
    { label: 'Full (100%)', value: '100%' },
    { label: '75%', value: '75%' },
    { label: 'Half (50%)', value: '50%' },
    { label: 'Quarter (25%)', value: '25%' },
    { label: 'Empty (0%)', value: 'empty' },
    { label: 'Custom %', value: '_custom' },
];

const LowerLimitInput = ({
    unit = '',
    value = '',
    onChange,
    disabled = false,
    error = '',
    size = 'small',
    label = 'Lower Limit',
}) => {
    const unitLower = unit.toLowerCase();
    const isContainer = unitLower === 'container';
    const config = quantityConfig[unitLower];

    const [showCustom, setShowCustom] = useState(false);
    const [customValue, setCustomValue] = useState('');

    // Check if current value is a "custom" container value (not one of the presets)
    const isCustomContainerValue = isContainer && value && !containerLimitOptions.some(
        opt => opt.value !== '_custom' && opt.value === value
    );

    const selectValue = isCustomContainerValue ? '_custom' : (value || '');

    // ========================
    // CONTAINER: Dropdown with preset levels + custom
    // ========================
    if (isContainer) {
        return (
            <Box>
                <FormControl fullWidth size={size} error={!!error}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        label={label}
                        value={selectValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '_custom') {
                                setShowCustom(true);
                                // Keep current value or set empty
                                if (!isCustomContainerValue) {
                                    setCustomValue('');
                                }
                            } else {
                                setShowCustom(false);
                                onChange(val);
                            }
                        }}
                        disabled={disabled}
                    >
                        {containerLimitOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value} dense>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                            {error}
                        </Typography>
                    )}
                </FormControl>

                {/* Custom percentage input */}
                {(showCustom || isCustomContainerValue) && (
                    <TextField
                        size={size}
                        type="number"
                        label="Custom Limit %"
                        value={isCustomContainerValue ? String(value).replace('%', '') : customValue}
                        onChange={(e) => {
                            const raw = e.target.value;
                            setCustomValue(raw);
                            const num = parseFloat(raw);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                                onChange(`${Math.round(num * 10) / 10}%`);
                            }
                        }}
                        disabled={disabled}
                        slotProps={{
                            input: {
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            },
                            htmlInput: {
                                min: 0,
                                max: 100,
                                step: 0.5,
                            },
                        }}
                        fullWidth
                        sx={{ mt: 1 }}
                    />
                )}
            </Box>
        );
    }

    // ========================
    // NUMERIC: Decimal input
    // ========================
    return (
        <TextField
            label={label}
            variant="outlined"
            size={size}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={disabled}
            fullWidth
            slotProps={{
                input: {
                    endAdornment: config?.unitSuffix ? (
                        <InputAdornment position="end">{config.unitSuffix}</InputAdornment>
                    ) : undefined,
                },
                htmlInput: {
                    min: 0,
                    step: config?.step || 0.1,
                },
            }}
        />
    );
};

export default LowerLimitInput;
