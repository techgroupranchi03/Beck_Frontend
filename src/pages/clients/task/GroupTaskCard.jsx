import React from "react";
import { useNavigate, useLocation} from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Stack,
    Chip,
    IconButton,
    Box,
    Tooltip,
    useTheme,
} from "@mui/material";
import {
    MoreVert,
    Person,
    Assignment,
    CalendarMonth,
    Group,
    OpenInNew,
} from "@mui/icons-material";
import { formatSchedule } from "../../../utils/scheduleFormatter.js";
import { formatDate } from "../../../utils/dateFormat.js";
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import IconLabel from "../../../resuable_components/IconLabel.jsx";


export const GroupTaskCard = ({ task, onMenuClick }) => {
    const theme = useTheme();
    const { palette } = theme;
    const navigate = useNavigate();
    const location = useLocation();
    //console.log('Rendering GroupTaskCard for task:', task);

    const scheduleInfo = formatSchedule(task.repeat_on?.frequency, task.repeat_on);

    const handleViewDetails = () => {
        const groupTaskSlug = task.title.toLowerCase().replace(/\s+/g, '-');
        const basePath = location.pathname.startsWith('/teams') ? '/teams' : '/clients';
        navigate(`${basePath}/task-management/${groupTaskSlug}`, {
            state: { groupId: task.id },
        });
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: `2px solid ${palette.primary.main}`,
                bgcolor: palette.background.paper,
                position: 'relative',
                overflow: 'visible',
            }}
        >
            {/* Group Badge */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -1,
                    right: 0,
                    bgcolor: palette.primary.main,
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    borderBottomRightRadius: 0,
                    borderTopLeftRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                }}
            >
                <Group sx={{ fontSize: 16 }} />
                Group Task
            </Box>

            <CardHeader
                sx={{ pb: 0.5, pt: 3 }}
                title={
                    <Typography variant="h6" color="text.primary" fontWeight={600}>
                        {task.title}
                    </Typography>
                }
                action={onMenuClick ? (
                    <IconButton
                        aria-label="settings"
                        onClick={(e) => onMenuClick(e, task)}
                    >
                        <MoreVert fontSize="medium" />
                    </IconButton>
                ) : null}
            />

            <CardContent
                sx={{
                    pt: 0.5,
                    '&:last-child': {
                        pb: 0
                    }
                }}
            >
                {/* Schedule Information */}
                {scheduleInfo && (
                    <Stack
                        direction="row"
                        gap={1}
                        flexWrap="wrap"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1}
                    >
                        <Stack direction="row" gap={0.5} alignItems="center">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: palette.primary.main,
                                }}
                            >
                                <scheduleInfo.icon fontSize="small" />
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    whiteSpace: 'normal',
                                    bgcolor: palette.background.customPaper,
                                    color: palette.text.secondary,
                                    px: 1,
                                    borderRadius: 1,
                                    fontSize: '0.875rem',
                                }}
                            >
                                {scheduleInfo.description}
                            </Typography>
                        </Stack>


                        <Tooltip placement="top" arrow title="Task Status">
                            <Chip
                                label={task.status.replace('_', ' ')}
                                size="small"
                                sx={{
                                    bgcolor: palette.taskStatus?.[task.status] || palette.grey[500],
                                    color: 'white',
                                    px: 1.5,
                                    borderRadius: 5,

                                }}
                            />
                        </Tooltip>

                    </Stack>
                )}

                {/* Description */}
                <ViewMoreText text={task.description} limit={100} />

                {/* Task Details */}
                <Stack direction="row" flexWrap="wrap" gap={1} mt={1.5}>
                    <IconLabel
                        icon={Person}
                        label={task.assigned_to_name || 'Unassigned'}
                    />

                    {task.start_date && (
                        <IconLabel
                            icon={CalendarMonth}
                            label={formatDate(task.start_date)}
                        />
                    )}

                    {task.task_count > 0 && (
                        <Tooltip title="Total tasks in this group" placement="top" arrow>
                            <Chip
                                icon={<Assignment sx={{ fontSize: 16 }} />}
                                label={`${task.task_count} Task${task.task_count !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    bgcolor: palette.background.customPaper,
                                    color: palette.text.primary,
                                    fontWeight: 500,
                                }}
                            />
                        </Tooltip>
                    )}
                </Stack>
                {/* view details icon button  */}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', }}>
                    <Tooltip title="View Details" placement="top" arrow>
                        <IconButton
                            aria-label="view-details"
                            onClick={handleViewDetails}
                        >
                            <OpenInNew fontSize="medium" />
                        </IconButton>
                    </Tooltip>
                </Box>

            </CardContent>
        </Card>
    );
};
