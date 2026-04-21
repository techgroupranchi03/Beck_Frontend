import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Card, CardHeader, CardContent, Typography, Box, Divider,
    List, ListItem, ListItemIcon, ListItemText, Chip,
    useTheme
} from '@mui/material';
import Loader from './Loader.jsx';
import {
    ReportProblem,
    AccessTime,
    LocationOnOutlined,
    PersonOutline,
    Assignment,
} from '@mui/icons-material';

const EscalationCard = ({ fetchEscalatedTasks }) => {
    const theme = useTheme();

    const [tasks, setTasks] = useState([]);
    const [tasksPage, setTasksPage] = useState(1);
    const [tasksHasMore, setTasksHasMore] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksTotal, setTasksTotal] = useState(0);

    const scrollRef = useRef(null);


    const loadTasks = useCallback(async (pageNum) => {
        if (tasksLoading) return;
        setTasksLoading(true);
        try {
            const res = await fetchEscalatedTasks(pageNum, 5);
            if (res.success) {
                setTasks(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
                setTasksHasMore(res.pagination.hasNextPage);
                setTasksTotal(res.pagination.total);
            }
        } catch (err) { console.error(err); }
        setTasksLoading(false);
    }, [fetchEscalatedTasks, tasksLoading]);

    useEffect(() => { loadTasks(1); }, []);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            if (tasksHasMore && !tasksLoading) {
                const nextPage = tasksPage + 1;
                setTasksPage(nextPage);
                loadTasks(nextPage);
            }
        }
    };

    const isLoading = tasksLoading;
    const isEmpty = tasks.length === 0 && !isLoading;

    const allItems = [
        ...tasks.map(task => ({ type: 'task', data: task })),
    ];


    return (
        <Card elevation={0} sx={{
            height: '100%',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`, borderRadius: 2,
        }}>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" >
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                            Escalations & Disputes
                        </Typography>
                    </Box>
                }
                subheader={
                    tasksTotal > 0 && (
                        <Box display="flex" gap={2} mt={0.5}>
                            <Typography variant="caption" color="error.main" fontWeight={500}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                <Assignment sx={{ fontSize: 16 }} />
                                Tasks: {tasksTotal}
                            </Typography>
                        </Box>
                    )
                }
                sx={{ pb: 1 }}
            />
            <Divider />

            <CardContent sx={{ pt: 0, pb: '0 !important', flex: 1, overflow: 'hidden', px: 0 }}>
                {isEmpty ? (
                    <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
                        <Typography variant="body1" color="text.secondary">
                            No escalations
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        ref={scrollRef}
                        onScroll={handleScroll}
                        sx={{
                            maxHeight: 370, overflowY: 'auto',
                            '&::-webkit-scrollbar': { width: 8 },
                            '&::-webkit-scrollbar-track': { bgcolor: theme.palette.background.paper, borderRadius: 3 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.primary.main, borderRadius: 3 },
                        }}

                    >
                        <List disablePadding>
                            {allItems.map((entry, index) => {
                                const item = entry.data;

                                return (
                                    <React.Fragment key={`task-${item.id}`}>
                                        <ListItem>
                                            <ListItemIcon sx={{ minWidth: 36, alignSelf: 'center' }}>
                                                <AccessTime sx={{ color: 'error.main', fontSize: 22 }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" sx={{ mb: 0.3, textTransform: 'capitalize' }}>
                                                        {item.task_title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box component="span">
                                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.4, mb: 0.2 }}>
                                                            {item.property_name && (
                                                                <Typography variant="caption" color="text.secondary"
                                                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                                                    <LocationOnOutlined sx={{ fontSize: 16 }} />
                                                                    {item.property_name}
                                                                </Typography>
                                                            )}
                                                            {item.assigned_to_name && (
                                                                <Typography variant="caption" color="text.secondary"
                                                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                                                    <PersonOutline sx={{ fontSize: 16 }} />
                                                                    {item.assigned_to_name}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Typography variant="caption" color="error.main" display="block">
                                                            Pending since {new Date(item.scheduled_date).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <Chip
                                                label={item.status?.replace(/_/g, ' ')}
                                                size="small"
                                                sx={{
                                                    bgcolor: theme.palette.taskStatus?.[item.status] || 'default',
                                                    color: '#000',
                                                    textTransform: 'capitalize',
                                                    alignSelf: 'center',
                                                }}
                                            />
                                        </ListItem>
                                        {index < allItems.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                );
                            })}
                        </List>

                        {isLoading && (
                            <Box display="flex" justifyContent="center" py={1}>
                                <Loader inline size={24} />
                            </Box>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default EscalationCard;