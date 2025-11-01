import { Box, Typography } from '@mui/material'
import React from 'react'

const PropertyManagement = () => {
  return (
    <React.Fragment>
      <Box sx={{ mt: 4, mb: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Typography variant="h3" gutterBottom>Property Management page</Typography>
        <Typography>This is the Property Management page for clients.</Typography>
      </Box>
    </React.Fragment>
  )
}

export default PropertyManagement