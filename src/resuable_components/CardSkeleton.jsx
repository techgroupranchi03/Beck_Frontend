import React from 'react';
import {
  Skeleton,
  Box,
  Stack,
  Chip,
  Typography,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

const CardSkeleton = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        p: 2,
        width: '100%',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      {/* Header - Title + Menu */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>

      {/* Subtitle */}
      <Skeleton variant="text" width="60%" sx={{ mt: 0.5 }} />

      <Stack direction="row" spacing={2} mt={2}>
        <Chip
          label={<Skeleton width={80} />}
          color="default"
          sx={{ bgcolor: 'grey.300' }}
        />
        <Chip
          label={<Skeleton width={60} />}
          color="primary"
          sx={{ bgcolor: 'primary.light', color: 'transparent' }}
        />
      </Stack>

      {/* Icons row */}
      <Stack direction="row" spacing={4} alignItems="center" mt={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={80} />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <PersonIcon sx={{ color: 'transparent' }} />
          <Skeleton variant="text" width={60} />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarTodayIcon sx={{ color: 'transparent' }} />
          <Skeleton variant="text" width={100} />
        </Stack>
      </Stack>

      {/* Photo required badge */}
      <Stack direction="row" alignItems="center" spacing={1} mt={2}>
        <PhotoCameraIcon sx={{ color: 'grey.500' }} />
        <Skeleton variant="text" width={120} />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Optional extra line at the bottom */}
      <Skeleton variant="text" width="30%" />
    </Box>
  );
};

export default CardSkeleton;