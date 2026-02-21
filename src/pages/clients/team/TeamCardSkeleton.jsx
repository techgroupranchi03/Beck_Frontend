import React from 'react'
import { Card, CardContent, Grid, Box, Stack, Skeleton, useTheme } from '@mui/material';


const TeamCardSkeleton = ({ count = 6, viewMode = 'center' }) => {
  const theme = useTheme();
  const { palette } = theme;

  return (
    <Grid container spacing={2}>
      {[...Array(count)].map((_, index) => (
        <Grid 
          size={viewMode === 'center' ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }} 
          key={index}
        >
          <Card
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              bgcolor: palette.background.paper,
            }}
          >
            <CardContent sx={{ pb: '16px !important' }}>
              {/* Header section with avatar, name, and menu */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* Avatar skeleton */}
                  <Skeleton 
                    variant="circular" 
                    width={50} 
                    height={50}
                    animation="wave"
                  />
                  
                  {/* Name and role skeleton */}
                  <Box>
                    <Skeleton 
                      variant="text" 
                      width={120} 
                      height={28}
                      animation="wave"
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton 
                      variant="text" 
                      width={100} 
                      height={20}
                      animation="wave"
                    />
                  </Box>
                </Stack>
                
                {/* Menu icon skeleton */}
                <Skeleton 
                  variant="circular" 
                  width={40} 
                  height={40}
                  animation="wave"
                />
              </Stack>

              {/* Phone and status section */}
              <Stack direction="row" spacing={1} mt={2} justifyContent="space-evenly">
                {/* Phone skeleton */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: '200px',
                    bgcolor: palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.03)',
                    p: 1,
                    borderRadius: 2,
                  }}
                >
                  <Skeleton 
                    variant="circular" 
                    width={20} 
                    height={20}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="text" 
                    width={100} 
                    height={20}
                    animation="wave"
                  />
                </Stack>

                {/* Status skeleton */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: '200px',
                    bgcolor: palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.03)',
                    p: 1,
                    borderRadius: 2,
                  }}
                >
                  <Skeleton 
                    variant="circular" 
                    width={20} 
                    height={20}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="text" 
                    width={60} 
                    height={20}
                    animation="wave"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TeamCardSkeleton