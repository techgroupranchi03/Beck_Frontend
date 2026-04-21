import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Skeleton,
  useTheme,
  Grid,
  CardHeader,
} from '@mui/material';

const TaskCardSkeleton = ({ count = 6, viewMode = 'wide' }) => {
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
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${palette.divider}`,
              bgcolor: palette.background.paper,
            }}
          >
            <CardHeader
              sx={{ pb: 0.5 }}
              title={
                <Skeleton 
                  variant="text" 
                  width="70%" 
                  height={32}
                  animation="wave"
                />
              }
              action={
                <Skeleton 
                  variant="circular" 
                  width={32} 
                  height={32}
                  animation="wave"
                />
              }
            />

            <CardContent sx={{ pt: 0 }}>
              {/* Schedule info with icon and status chip */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1 }}>
                  <Skeleton 
                    variant="rounded" 
                    width={20} 
                    height={20}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="text" 
                    width="50%" 
                    height={28}
                    animation="wave"
                    sx={{ borderRadius: 1 }}
                  />
                </Stack>
                <Skeleton 
                  variant="rounded" 
                  width={70} 
                  height={28}
                  animation="wave"
                  sx={{ borderRadius: 5 }}
                />
              </Stack>

              {/* Date and Status row (for non-weekly/monthly tasks) */}
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Skeleton 
                    variant="rounded" 
                    width={18} 
                    height={18}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="text" 
                    width={90} 
                    height={20}
                    animation="wave"
                  />
                </Stack>
                <Skeleton 
                  variant="rounded" 
                  width={70} 
                  height={28}
                  animation="wave"
                  sx={{ borderRadius: 5 }}
                />
              </Stack>

              {/* Description */}
              <Skeleton 
                variant="text" 
                width="100%" 
                height={20}
                animation="wave"
                sx={{ mb: 0.5 }}
              />
              <Skeleton 
                variant="text" 
                width="85%" 
                height={20}
                animation="wave"
                sx={{ mb: 1 }}
              />

              {/* Icon labels row (task type, person, property, etc.) */}
              <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Skeleton 
                    variant="rounded" 
                    width={18} 
                    height={18}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="text" 
                    width={80} 
                    height={20}
                    animation="wave"
                  />
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Skeleton 
                    variant="rounded" 
                    width={18} 
                    height={18}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="text" 
                    width={90} 
                    height={20}
                    animation="wave"
                  />
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Skeleton 
                    variant="rounded" 
                    width={18} 
                    height={18}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="text" 
                    width={75} 
                    height={20}
                    animation="wave"
                  />
                </Stack>
              </Stack>

              {/* Bottom section - Last executed date and action icons */}
              <Stack 
                direction="row" 
                spacing={1} 
                mt={1} 
                alignItems="center"
                justifyContent="space-between"
              >
                <Skeleton 
                  variant="text" 
                  width="45%" 
                  height={20}
                  animation="wave"
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Skeleton 
                    variant="circular" 
                    width={25} 
                    height={25}
                    animation="wave"
                  />
                  <Skeleton 
                    variant="circular" 
                    width={25} 
                    height={25}
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

export default TaskCardSkeleton;