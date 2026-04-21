import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Skeleton,
  useTheme,
  Grid,
} from '@mui/material';

const PropertyCardSkeleton = ({ count = 6 }) => {
  const theme = useTheme();
  const { palette } = theme;

  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Property Image Skeleton */}
            <Skeleton
              variant="rectangular"
              height={250}
              animation="wave"
              sx={{ width: '100%' }}
            />

            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                {/* Property Name Skeleton */}
                <Skeleton
                  variant="text"
                  width="70%"
                  height={32}
                  animation="wave"
                />
                {/* Action Menu Skeleton */}
                <Skeleton
                  variant="circular"
                  width={32}
                  height={32}
                  animation="wave"
                />
              </Stack>

              {/* Address Skeleton */}
              <Skeleton
                variant="text"
                width="90%"
                height={20}
                animation="wave"
                sx={{ mt: 1 }}
              />
              <Skeleton
                variant="text"
                width="75%"
                height={20}
                animation="wave"
              />

              {/* Google Maps Link Skeleton */}
              <Skeleton
                variant="text"
                width="60%"
                height={20}
                animation="wave"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PropertyCardSkeleton;