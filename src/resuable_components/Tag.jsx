import React from 'react';
import { Chip } from '@mui/material';

const Tag = ({
    icon,
    label,
    bgcolor,
    color,
    variant = 'filled',
}) => {
    return (
        <Chip
            icon={icon}
            label={label}
            variant={variant}
            size="large"
            sx={{
                
                height: 24,
                fontSize: '0.80rem',
                bgcolor: bgcolor,
                color: color || '#fff',
                textTransform: 'capitalize',
            }}
        />
    );
};

export default Tag;