import React from 'react'
import { useMediaQuery, useTheme } from '@mui/material';
import Tile_View_Inventory from './Tile_View_Inventory';
import All_Inventory from './All_Inventory';
const InventoryManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  return (
    isMobile ? <Tile_View_Inventory /> : <All_Inventory />
  )
}

export default InventoryManagement