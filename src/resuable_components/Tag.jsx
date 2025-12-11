import React from 'react';
import { Chip } from '@mui/material';

const Tag = ({
    icon,
    label,
    bgcolor,
    color,
    variant = 'filled',
    sx = {},
    ...props
}) => {
    return (
        <Chip
            icon={icon}
            label={label}
            variant={variant}
            size="small"
            sx={{
                height: 24,
                fontSize: '0.90rem',
                bgcolor: bgcolor,
                color: color || '#fff',
                '& .MuiChip-icon': {
                    fontSize: '0.8rem',
                    color: color || '#fff'
                },
                ...sx
            }}
            {...props}
        />
    );
};

export default Tag;