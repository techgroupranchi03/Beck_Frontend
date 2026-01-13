import React, { useEffect } from 'react';
import { Box, Container, Typography, useTheme, Paper, Stack, Chip } from '@mui/material';
import { AccessTime, Notifications } from '@mui/icons-material';
import { trackEvent, initTracking } from './utils/tracking';

const CommingSoon = () => {
  const theme = useTheme();
  const { palette } = theme;

  // Initialize tracking on component mount
  useEffect(() => {
    initTracking();

    // Track page view with session context
    trackEvent('Page View', {
      page_name: 'Coming Soon',
      action: 'viewed',
      page_category: 'marketing',
      page_type: 'coming_soon'
    });
  }, []);

  const handleStayTunedClick = async () => {
    await trackEvent('Button Click', {
      button_name: 'Stay Tuned',
      page_name: 'Coming Soon',
      action: 'clicked',
      element_type: 'chip',
      element_location: 'center'
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          borderRadius: 4,
          border: `1px solid ${palette.primary.main}`,
          bgcolor: palette.background.paper,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          width: { xs: '90%', sm: '80%', md: '60%' },
        }}
      >
        {/* decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: palette.custom?.lightGreen || '#e8f5e9',
            opacity: 0.2,
          }}
        />


        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: palette.background?.creme || '#fff8e1',
            opacity: 0.5,
          }}
        />



        {/* content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            component="img"
            src="public/images/taskbnb.png"
            alt="Coming soon"
            sx={{
              width: '100%',
              maxWidth: 300,
              mx: 'auto',
              display: 'block',
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '3.5rem' },
              mb: 3,
              background: `linear-gradient(90deg, #132421, #407f68, #96d980, #fef7c5)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Coming Soon
          </Typography>

          <Chip
            icon={<Notifications />}
            label="Stay Tuned"
            onClick={handleStayTunedClick}
            sx={{
              bgcolor: palette.custom?.cream || '#fff8e1',
              fontWeight: 600,
              px: 2,
              py: 2.5,
            }}
          />

          <Typography
            variant="body2"
            sx={{ mt: 6, fontStyle: 'italic', color: palette.text.secondary }}
          >
            Thank you for your patience. We'll notify you when this feature is ready.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};


export default CommingSoon;