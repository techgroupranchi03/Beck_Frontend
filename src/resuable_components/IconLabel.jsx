import * as React from 'react';
import { Avatar, Box, Typography } from '@mui/material';

// Props for the reusable component
import PropTypes from 'prop-types';

const IconLabel = ({ icon: IconComponent, label, ...props }) => {
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                px: 1,                                      
                py: 0.25,
                fontSize: '0.75rem',
                // lineHeight: 1,
                ...props.sx,                 // Allow override/customization
            }}
            {...props}
        >
            {/* Small icon size */}
            <Avatar sx={{ width: 18, height: 18 }}>
                <IconComponent style={{ fontSize: 12 }} />
            </Avatar>
            <Typography
                variant="body2"
                component="span"
                sx={{
                    fontWeight: 500,
                    textTransform: 'capitalize'
                }}
            >
                {label}
            </Typography>
        </Box>
    );
};

IconLabel.propTypes = {
    icon: PropTypes.elementType.isRequired, 
    label: PropTypes.string.isRequired,
};

export default IconLabel;