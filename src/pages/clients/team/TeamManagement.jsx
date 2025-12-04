import React from 'react'
import { useMediaQuery, useTheme } from '@mui/material';
import AllTeam from './AllTeam.jsx';
import Tile_View_Team from './Tile_View_Team.jsx';
 

const TeamManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return isMobile ? <Tile_View_Team /> : <AllTeam />;
}
export default TeamManagement