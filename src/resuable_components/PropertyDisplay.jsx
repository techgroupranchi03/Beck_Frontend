import React, { useRef, useState, useEffect } from 'react';
import { Box, Avatar, Typography, Stack, Paper, IconButton } from '@mui/material';
import { Business, ChevronLeft, ChevronRight } from '@mui/icons-material';

const PropertyDisplay = ({ property, onScrollStateChange }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const newCanScrollLeft = scrollLeft > 0;
      const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

      setCanScrollLeft(newCanScrollLeft);
      setCanScrollRight(newCanScrollRight);

      // Notify parent about scroll state changes
      if (onScrollStateChange) {
        onScrollStateChange({ canScrollLeft: newCanScrollLeft, canScrollRight: newCanScrollRight });
      }
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [property]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 220;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  console.log("PropertyDisplay property:", property);
  // Handle array of properties
  if (Array.isArray(property)) {
    return (
      <Box sx={{ position: 'relative', mb: 2 }}>
        {canScrollLeft && (
          <IconButton
            onClick={() => scroll('left')}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
                bgcolor: 'transparent',
              },
            }}
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
        )}
        {canScrollRight && (
          <IconButton
            onClick={() => scroll('right')}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
                bgcolor: 'transparent',
              },
            }}
          >
            <ChevronRight fontSize="large" />
          </IconButton>
        )}
        <Box
          ref={scrollContainerRef}
          sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 1,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 4,
            },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ pb: 1 }}>
            {property.map((prop) => (
              <Paper
                key={prop.id}
                elevation={1}
                sx={{
                  p: 2,
                  minWidth: 200,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                <Avatar
                  src={prop.image_url}
                  alt={prop.name}
                  sx={{
                    width: 50,
                    height: 50,
                    border: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  {!prop.image_url && <Business />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {prop.name}
                  </Typography>
                  {prop.address && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {prop.address}
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  }

  // Handle single property object
  const imageUrl = property?.image_url;
  const propertyName = property?.name;
  const address = property?.address;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ maxWidth: 250 }}
    >
      <Avatar
        src={imageUrl}
        alt={propertyName}
        sx={{
          width: 50,
          height: 50,
          border: '2px solid',
          borderColor: 'divider',
        }}
      >
        {!imageUrl && <Business />}
      </Avatar>
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            '&:hover': {
              overflow: 'visible',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            },
          }}
        >
          {propertyName || 'N/A'}
        </Typography>
        {address && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              '&:hover': {
                overflow: 'visible',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              },
            }}
          >
            {address}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default PropertyDisplay;
