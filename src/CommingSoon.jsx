import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, useTheme, Paper, Stack, Chip, Button, alpha } from '@mui/material';
import { Notifications, ArrowForward } from '@mui/icons-material';

const CommingSoon = () => {
  const theme = useTheme();
  const { palette } = theme;
  const navigate = useNavigate();


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
          p: 4,
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
            sx={{
              bgcolor: palette.custom?.cream || '#fff8e1',
              fontWeight: 600,
              px: 2,
              py: 2.5,
            }}
          />

          {/* add two button  continue with client and continue with team */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent={{ xs: 'center', sm: 'space-around' }}
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              size="small"
              disableElevation
              endIcon={<ArrowForward />}
              onClick={() => navigate('/clients/login')}
              sx={{
                borderRadius: 2,
                px: 4,
                fontSize: '1rem',
              }}
            >
              Get Started as Client
            </Button>
            <Button
              variant="contained"
              size="small"
              disableElevation
              endIcon={<ArrowForward />}
              onClick={() => navigate('/teams/login')}
              sx={{
                borderRadius: 2,
                px: 4,
                fontSize: '1rem',
              }}
            >
              Join as Team Member
            </Button>
          </Stack>
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
