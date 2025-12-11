import React, { createContext, useContext } from 'react'
import { Box } from '@mui/material';
import AllTeam from './AllTeam.jsx';
import Tile_View_Team from './Tile_View_Team.jsx';
import { useViewMode } from '../../../context/ViewModeContext.jsx';
import ViewToggle from '../../../resuable_components/ViewToggle.jsx';
import { useTeamData } from './useTeamData.js';

// Create context for sharing team data across components
export const TeamContext = createContext(null);

// Custom hook to use team context
export const useTeamContext = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error('useTeamContext must be used within TeamManagement');
    }
    return context;
};

const TeamManagement = () => {
    const { viewMode } = useViewMode();
    
    // Initialize shared team data
    const teamData = useTeamData();

    return (
        <TeamContext.Provider value={teamData}>
            <Box>
                {/* View Toggle Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <ViewToggle />
                </Box>
                
                {/* Conditional Rendering based on view mode */}
                {viewMode === 'tile' ? <Tile_View_Team /> : <AllTeam />}
            </Box>
        </TeamContext.Provider>
    );
}

export default TeamManagement