import React, { createContext, useContext } from 'react';
import { Box } from '@mui/material';
import Tile_View_Inventory from './Tile_View_Inventory';
import All_Inventory from './All_Inventory';
import { useInventoryData } from './useInventoryData.js';
import { useViewMode } from '../../../context/ViewModeContext.jsx';
import ViewToggle from '../../../resuable_components/ViewToggle.jsx';

// Create context for sharing inventory data across components
export const InventoryContext = createContext(null);

// Custom hook to use inventory context
export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within InventoryManagement');
  }
  return context;
};

const InventoryManagement = () => {
  const { viewMode } = useViewMode();
  
  // Initialize shared inventory data
  const inventoryData = useInventoryData();

  return (
    <InventoryContext.Provider value={inventoryData}>
      <Box>
        {/* View Toggle Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ViewToggle />
        </Box>
        
        {/* Conditional Rendering based on view mode */}
        {viewMode === 'tile' ? <Tile_View_Inventory /> : <All_Inventory />}
      </Box>
    </InventoryContext.Provider>
  )
}

export default InventoryManagement