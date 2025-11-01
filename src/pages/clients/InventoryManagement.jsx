import React from 'react'
import { Typography, Box, } from '@mui/material'

const InventoryManagement = () => {
  return (
    <React.Fragment>
      <Box sx={{ mt: 4, mb: 4, display: 'flex', alignItems: 'center' , flexDirection: 'column' }}>
        <Typography variant="h3" gutterBottom>
          Inventory Management page
        </Typography>
        <Typography>
          This is the Inventory Management page for clients.
        </Typography>
      </Box>
    </React.Fragment>

  )
}

export default InventoryManagement
