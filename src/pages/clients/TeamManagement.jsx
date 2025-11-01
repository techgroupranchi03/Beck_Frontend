import React from 'react'
import { Box, Typography } from '@mui/material'

const TeamManagement = () => {
  return (
    <React.Fragment>
      <Box sx={{ mt: 4, mb: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Typography variant="h3" gutterBottom>Team Management page</Typography>
        <Typography>This is the Team Management page for clients.</Typography>
      </Box>
    </React.Fragment>
  )
}

export default TeamManagement