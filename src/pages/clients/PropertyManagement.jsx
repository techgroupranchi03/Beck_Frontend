import { Box, List, ListItemText, Typography } from '@mui/material'
import React from 'react'

const PropertyManagement = () => {
  return (
    <React.Fragment>
      <Box sx={{ mt: 4, mb: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Typography variant="h3" gutterBottom>Property Management page</Typography>
        <Typography>This is the Property Management page for clients.</Typography>
      </Box>
      {/* add the list of properties here in bullet points */}
      <List sx={{ maxWidth: 600, listStyleType: 'disc', pl: 4 }}>
        <ListItemText sx={{ display: 'list-item' }}>Client can list their Properties here.</ListItemText>
        <ListItemText sx={{ display: 'list-item' }}>Include basic property details for each listing.</ListItemText>
      </List>
    </React.Fragment>
  )
}

export default PropertyManagement