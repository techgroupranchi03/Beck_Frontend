import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Skeleton,
  useTheme,
  Grid,
  Divider,
} from '@mui/material';

const InventoryCardSkeleton = ({ count = 6, viewMode = 'wide' }) => {
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
              borderRadius: 3,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              bgcolor: palette.background.paper,
              overflow: 'hidden',
              border: `1px solid ${palette.divider}`,
            }}
          >
            {/* Horizontal layout with image on left */}
            <Box display="flex" alignItems="center">
              {/* Image on left */}
              <Skeleton 
                variant="rectangular" 
                width={80}
                height={80}
                animation="wave"
                sx={{ 
                  borderRadius: 3,
                  ml: 2,
                  flexShrink: 0,
                }}
              />
              
              {/* Content in middle */}
              <CardContent sx={{ pl: 2, pb: 0, flex: 1 }}>
                {/* Title */}
                <Skeleton 
                  variant="text" 
                  width="60%" 
                  height={24}
                  animation="wave"
                  sx={{ mb: 1 }}
                />

                {/* Tags/chips row 1 */}
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>
                  <Skeleton 
                    variant="rounded" 
                    width={70} 
                    height={24}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton 
                    variant="rounded" 
                    width={85} 
                    height={24}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton 
                    variant="rounded" 
                    width={80} 
                    height={24}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>

                {/* Tags/chips row 2 */}
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Skeleton 
                    variant="rounded" 
                    width={90} 
                    height={24}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton 
                    variant="rounded" 
                    width={85} 
                    height={24}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
              </CardContent>

              {/* Menu icon on right */}
              <Box sx={{ pr: 1, pt: 1, alignSelf: 'flex-start' }}>
                <Skeleton 
                  variant="circular" 
                  width={40} 
                  height={40}
                  animation="wave"
                />
              </Box>
            </Box>

            <Divider sx={{ mx: 2, my: 1 }} />

            {/* Show Tasks button */}
            <Box sx={{ px: 2, pb: 2 }}>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
              >
                <Skeleton 
                  variant="text" 
                  width={100} 
                  height={24}
                  animation="wave"
                />
                <Skeleton 
                  variant="circular" 
                  width={24} 
                  height={24}
                  animation="wave"
                />
              </Stack>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default InventoryCardSkeleton;