import React, { createContext, useContext } from 'react';
import { Box } from '@mui/material';
import Tile_View_Inventory from './Tile_View_Inventory';
import All_Inventory from './All_Inventory';
import { useInventoryData } from './useInventoryData.js';
import { useViewMode } from '../../../context/ViewModeContext.jsx';
import ViewToggle from '../../../resuable_components/ViewToggle.jsx';

export const InventoryContext = createContext(null);
export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within InventoryManagement');
  }
  return context;
};

const InventoryManagement = () => {
  const { viewMode } = useViewMode();
  const inventoryData = useInventoryData();

  return (

    <InventoryContext.Provider value={inventoryData}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ViewToggle showCenterView={true} />
        </Box>
        {viewMode === 'table' ? <All_Inventory /> : <Tile_View_Inventory />}
      </Box>
    </InventoryContext.Provider>
    
  )
}

export default InventoryManagement