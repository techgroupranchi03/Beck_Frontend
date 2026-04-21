import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip, Box } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import { useViewMode } from '../context/ViewModeContext';

const ViewToggle = ({ showCenterView = false }) => {
    const { viewMode, setViewMode, isMobile } = useViewMode();

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    // Don't show toggle on mobile devices (forced to tile view)
    if (isMobile) {
        return null;
    }

    return (
        <Box mt={1} mr={2}>
            <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewChange}
                size="small"
                aria-label="view mode"
            >
                <ToggleButton value="table" aria-label="table view">
                    <Tooltip title="Table View">
                        <TableRowsIcon fontSize='small' />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="tile" aria-label="tile view">
                    <Tooltip title="Tile View">
                        <ViewModuleIcon fontSize='small' />
                    </Tooltip>
                </ToggleButton>
                {showCenterView && (
                    <ToggleButton value="center" aria-label="center view">
                        <Tooltip title="Center View">
                            <ViewAgendaIcon fontSize='small' />
                        </Tooltip>
                    </ToggleButton>
                )}
            </ToggleButtonGroup>
        </Box>
    );
};

export default ViewToggle;
