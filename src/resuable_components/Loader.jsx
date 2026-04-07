import React from 'react';
import { Box, useTheme } from '@mui/material';

/**
 * Loader Component - 3D Spinning Orb Effect
 * 
 * Uses theme colors (layout, active, interactive) for a branded loading experience.
 * 
 * Props:
 * - size: number (default: 48) - width/height of the loader in px
 * - fullPage: boolean (default: false) - if true, centers in full viewport height
 * - overlay: boolean (default: false) - if true, shows as a fixed overlay with backdrop
 * - inline: boolean (default: false) - if true, renders inline (for buttons, etc.)
 * - sx: object - additional MUI sx styles for the wrapper
 */
const Loader = ({ size = 48, fullPage = false, overlay = false, inline = false, sx = {} }) => {
  const theme = useTheme();

  // Theme-aware colors
  const primaryColor = theme.palette.primary.main;    // active color
  const accentColor = theme.palette.secondary.main;    // interactive color
  const layoutColor = theme.palette.primary.dark;      // layout color

  const loaderKeyframes = `
    @keyframes taskbnb-spin {
      0%, 100% { box-shadow: .2em 0px 0 0px currentcolor; }
      12% { box-shadow: .2em .2em 0 0 currentcolor; }
      25% { box-shadow: 0 .2em 0 0px currentcolor; }
      37% { box-shadow: -.2em .2em 0 0 currentcolor; }
      50% { box-shadow: -.2em 0 0 0 currentcolor; }
      62% { box-shadow: -.2em -.2em 0 0 currentcolor; }
      75% { box-shadow: 0px -.2em 0 0 currentcolor; }
      87% { box-shadow: .2em -.2em 0 0 currentcolor; }
    }
  `;

  // Inline mode - for buttons, small spaces
  if (inline) {
    return (
      <>
        <style>{loaderKeyframes}</style>
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: size,
            height: size,
            borderRadius: '50%',
            color: primaryColor,
            transform: 'rotateZ(45deg)',
            perspective: '1000px',
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              transform: 'rotateX(70deg)',
              animation: '1s taskbnb-spin linear infinite',
            },
            '&::after': {
              color: accentColor,
              transform: 'rotateY(70deg)',
              animationDelay: '.4s',
            },
            ...sx,
          }}
        />
      </>
    );
  }

  // Overlay mode - fixed position with backdrop
  if (overlay) {
    return (
      <>
        <style>{loaderKeyframes}</style>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            ...sx,
          }}
        >
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: '50%',
              color: primaryColor,
              transform: 'rotateZ(45deg)',
              perspective: '1000px',
              position: 'relative',
              '&::before, &::after': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                transform: 'rotateX(70deg)',
                animation: '1s taskbnb-spin linear infinite',
              },
              '&::after': {
                color: accentColor,
                transform: 'rotateY(70deg)',
                animationDelay: '.4s',
              },
            }}
          />
        </Box>
      </>
    );
  }

  // Default / fullPage mode - centered in container
  return (
    <>
      <style>{loaderKeyframes}</style>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: fullPage ? '100vh' : '60vh',
          width: '100%',
          ...sx,
        }}
      >
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            color: primaryColor,
            transform: 'rotateZ(45deg)',
            perspective: '1000px',
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              transform: 'rotateX(70deg)',
              animation: '1s taskbnb-spin linear infinite',
            },
            '&::after': {
              color: accentColor,
              transform: 'rotateY(70deg)',
              animationDelay: '.4s',
            },
          }}
        />
      </Box>
    </>
  );
};

export default Loader;
