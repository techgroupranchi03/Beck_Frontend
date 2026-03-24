import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Stack,
    CardHeader,
    useTheme,
} from '@mui/material';
import {
    Person,
    CalendarMonth,
    MoreVert,
    Business,
    CameraAlt,
    AssignmentTurnedIn,
} from '@mui/icons-material';
import { formatDate } from '../../../utils/dateFormat';
import ViewMoreText from '../../../resuable_components/ViewMore';
import IconLabel from '../../../resuable_components/IconLabel';
import { canCreate, canUpdate, canDelete, RESOURCES } from '../../../utils/permissions';

const GroupTasksList = ({
    tasks = [],
    onMenuClick,
    user,
    onAddNewTask,
    onAddExistingTask
}) => {
    const theme = useTheme();
    const { palette } = theme;

    // Check if user can create tasks
    const canCreateTask = canCreate(user?.teamRole, RESOURCES.TASK);

    return (
        <>
            {/* Header with action buttons */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} mt={2} flexWrap="wrap" gap={1}>
                {canCreateTask && (
                    <Stack direction="row" gap={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            disableElevation
                            sx={{
                                bgcolor: palette.primary.main,
                                '&:hover': { bgcolor: palette.secondary.main },
                                borderRadius: 10,
                                height: '30px',
                                fontSize: '0.75rem',
                                textTransform: 'none',
                            }}
                            onClick={onAddNewTask}
                        >
                            Add New Task
                        </Button>
                        <Button
                            variant="contained"
                            disableElevation
                            onClick={onAddExistingTask}
                            sx={{
                                bgcolor: palette.secondary.main,
                                '&:hover': { bgcolor: palette.primary.main },
                                borderRadius: 10,
                                height: '30px',
                                fontSize: '0.75rem',
                                textTransform: 'none',
                            }}
                        >
                            Add Existing Task
                        </Button>
                    </Stack>
                )}
            </Stack>

            {/* Tasks List */}
            {tasks && tasks.length > 0 ? (
                <Stack spacing={2}>
                    {tasks.map((task) => (
                        <Card
                            key={task.id}
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${palette.divider}`,
                                bgcolor: palette.background.paper,
                            }}
                        >
                            <CardHeader
                                sx={{ pb: 0.5 }}
                                title={
                                    <Typography variant="h6" color="text.primary" textTransform="capitalize">
                                        {task.title}
                                    </Typography>
                                }
                                action={(canCreateTask || canUpdate(user?.teamRole, RESOURCES.TASK) || canDelete(user?.teamRole, RESOURCES.TASK)) ? (
                                    <IconButton
                                        aria-label="settings"
                                        onClick={(e) => onMenuClick(e, task, true)}
                                    >
                                        <MoreVert fontSize="medium" />
                                    </IconButton>
                                ) : null}
                            />

                            <CardContent sx={{ pt: 0.5 }}>
                                <ViewMoreText text={task.description} limit={150} />

                                <Stack direction="row" gap={1} mt={1} flexWrap="wrap">
                                    {task.assigned_to && (
                                        <IconLabel
                                            icon={Person}
                                            label={task.assigned_to.name || 'Unassigned'}
                                        />
                                    )}
                                    {task.property && (
                                        <IconLabel
                                            icon={Business}
                                            label={task.property.name}
                                        />
                                    )}
                                    {task.schedule && (
                                        <IconLabel
                                            icon={CalendarMonth}
                                            label={`${task.schedule.schedule_type?.charAt(0).toUpperCase()}${task.schedule.schedule_type?.slice(1) || ''}`}
                                        />
                                    )}
                                    {task.schedule?.start_date && (
                                        <IconLabel
                                            icon={CalendarMonth}
                                            label={formatDate(task.schedule.start_date)}
                                        />
                                    )}
                                    {!!task.requires_photo && (
                                        <IconLabel
                                            icon={CameraAlt}
                                            label="Photo Required"
                                        />
                                    )}
                                    {!!task.allows_inventory_update && (
                                        <IconLabel
                                            icon={AssignmentTurnedIn}
                                            label="Inventory Update"
                                        />
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        No tasks in this group yet.
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default GroupTasksList;
