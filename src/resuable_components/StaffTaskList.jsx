import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Card, CardHeader, CardContent, Typography, Box, Divider,
    List, ListItem, ListItemIcon, ListItemText, Chip, Tabs, Tab,
    CircularProgress, useTheme
} from '@mui/material';
import { TaskAlt, PendingActions, Schedule, PlayArrow, Assessment, Assignment, LocationOnOutlined, AssignmentLate, AssignmentLateOutlined } from '@mui/icons-material';

const statusConfig = {
    completed: { color: 'success', icon: <TaskAlt sx={{ fontSize: 20 }} />, label: 'Completed' },
    in_progress: { color: 'info', icon: <PlayArrow sx={{ fontSize: 20 }} />, label: 'In Progress' },
    pending: { color: 'warning', icon: <PendingActions sx={{ fontSize: 20 }} />, label: 'Pending' },
    skipped: { color: 'default', icon: <Schedule sx={{ fontSize: 20 }} />, label: 'Skipped' },
};

const StaffTaskList = ({ fetchTodayTasks, fetchPendingTasks }) => {
    const [tab, setTab] = useState(0);
    const theme = useTheme();

    // Today tasks state
    const [todayTasks, setTodayTasks] = useState([]);
    const [todayPage, setTodayPage] = useState(1);
    const [todayHasMore, setTodayHasMore] = useState(true);
    const [todayLoading, setTodayLoading] = useState(false);
    const [todayTotal, setTodayTotal] = useState(0);

    // Pending tasks state
    const [pendingTasks, setPendingTasks] = useState([]);
    const [pendingPage, setPendingPage] = useState(1);
    const [pendingHasMore, setPendingHasMore] = useState(true);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [pendingTotal, setPendingTotal] = useState(0);

    const todayScrollRef = useRef(null);
    const pendingScrollRef = useRef(null);

    const loadTodayTasks = useCallback(async (pageNum) => {
        if (todayLoading) return;
        setTodayLoading(true);
        try {
            const res = await fetchTodayTasks(pageNum, 5);
            if (res.success) {
                setTodayTasks(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
                setTodayHasMore(res.pagination.hasNextPage);
                setTodayTotal(res.pagination.total);
            }
        } catch (err) { console.error(err); }
        setTodayLoading(false);
    }, [fetchTodayTasks, todayLoading]);

    console.log('loadTodayTasks', todayTasks);

    const loadPendingTasks = useCallback(async (pageNum) => {
        if (pendingLoading) return;
        setPendingLoading(true);
        try {
            const res = await fetchPendingTasks(pageNum, 5);
            if (res.success) {
                setPendingTasks(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
                setPendingHasMore(res.pagination.hasNextPage);
                setPendingTotal(res.pagination.total);
            }
        } catch (err) { console.error(err); }
        setPendingLoading(false);
    }, [fetchPendingTasks, pendingLoading]);

    useEffect(() => { loadTodayTasks(1); }, []);
    useEffect(() => { loadPendingTasks(1); }, []);

    const handleTodayScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50 && todayHasMore && !todayLoading) {
            const nextPage = todayPage + 1;
            setTodayPage(nextPage);
            loadTodayTasks(nextPage);
        }
    };

    const handlePendingScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50 && pendingHasMore && !pendingLoading) {
            const nextPage = pendingPage + 1;
            setPendingPage(nextPage);
            loadPendingTasks(nextPage);
        }
    };

    const renderTaskItem = (task, showOverdue = false) => {
        const cfg = statusConfig[task.status] || statusConfig.pending;
        return (
            <ListItem key={task.id} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5, color: `${cfg.color}.main`, alignSelf: 'center' }}>
                    <Assignment sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography variant="body1" sx={{ mb: 0.3, textTransform: 'capitalize' }}>
                            {task.task_title}
                        </Typography>}
                    secondary={
                        <Box component="span">
                            <Typography variant="body2" color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnOutlined sx={{ fontSize: 16 }} />
                                {task.property_name && `${task.property_name}`}
                            </Typography>
                            {showOverdue && task.days_overdue > 0 && (
                                <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                                    {task.days_overdue} day{task.days_overdue > 1 ? 's' : ''} overdue
                                </Typography>
                            )}
                        </Box>
                    }
                />
                <Chip
                    label={cfg.label} size="small"
                    sx={{
                        display: 'flex', alignSelf: 'center',
                        bgcolor: theme.palette.taskStatus[task.status] || 'default',
                        color: theme.palette.getContrastText(theme.palette.taskStatus[task.status] || theme.palette.background.paper),
                        textTransform: 'capitalize', fontSize: '0.75rem', height: 24,mr: 1
                    }}
                />
            </ListItem>
        );
    };

    return (
        <Card elevation={0} sx={{
            border: '1px solid', borderColor: 'divider', borderRadius: 2,
            height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            // transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
        }}>
            <CardHeader
                title={<Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>My Tasks</Typography>}
                sx={{ pb: 0 }}
            />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }} variant="fullWidth">
                <Tab
                    label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <TaskAlt sx={{ fontSize: 18 }} />
                        <span>Today ({todayTotal})</span>
                    </Box>}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                />
                <Tab
                    label={<Box display="flex" alignItems="center" gap={0.5}>
                        <AssignmentLateOutlined sx={{ fontSize: 18, color: 'error.main' }} />
                        <span>Overdue ({pendingTotal})</span>
                    </Box>}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                />
            </Tabs>
            <Divider />

            <CardContent sx={{ pt: 1, pb: 2, flex: 1, overflow: 'hidden' }}>
                {/* Today Tab */}
                {tab === 0 && (
                    todayTasks.length === 0 && !todayLoading ? (
                        <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
                            <Typography variant="body1" color="text.secondary">
                                No tasks scheduled for today
                            </Typography>
                        </Box>
                    ) : (
                        <Box ref={todayScrollRef} onScroll={handleTodayScroll}
                            sx={{ maxHeight: 370, overflowY: 'auto', pr: 0.5,
                                '&::-webkit-scrollbar': { width: 8 },
                                '&::-webkit-scrollbar-track': { bgcolor: theme.palette.background.default, borderRadius: 3 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.primary.main, borderRadius: 3 },
                            }}>
                            <List dense sx={{ p: 0 }}>
                                {todayTasks.map((task) => renderTaskItem(task, false))}
                            </List>
                            {todayLoading && (
                                <Box display="flex" justifyContent="center" py={1}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                        </Box>
                    )
                )}

                {/* Overdue Tab */}
                {tab === 1 && (
                    pendingTasks.length === 0 && !pendingLoading ? (
                        <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
                            <Typography variant="body1" color="text.secondary">
                                No overdue tasks
                            </Typography>
                        </Box>
                    ) : (
                        <Box ref={pendingScrollRef} onScroll={handlePendingScroll}
                            sx={{ maxHeight: 370, overflowY: 'auto', pr: 0.5,
                                '&::-webkit-scrollbar': { width: 8 },
                                '&::-webkit-scrollbar-track': { bgcolor: theme.palette.background.default, borderRadius: 3 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.primary.main, borderRadius: 3 },
                            }}>
                            <List dense sx={{ p: 0 }}>
                                {pendingTasks.map((task) => renderTaskItem(task, true))}
                            </List>
                            {pendingLoading && (
                                <Box display="flex" justifyContent="center" py={1}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                        </Box>
                    )
                )}
            </CardContent>
        </Card>
    );
};

export default StaffTaskList;
