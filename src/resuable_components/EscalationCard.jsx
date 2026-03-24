import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Card, CardHeader, CardContent, Typography, Box, Divider,
    List, ListItem, ListItemIcon, ListItemText, Chip, Tabs, Tab,
    CircularProgress, useTheme
} from '@mui/material';
import { Warning, Inventory2, AccessTime } from '@mui/icons-material';

const EscalationCard = ({ fetchEscalatedTasks, fetchDepletedInventory }) => {
    const [tab, setTab] = useState(0);
    const theme = useTheme();

    // Escalated tasks state
    const [tasks, setTasks] = useState([]);
    const [tasksPage, setTasksPage] = useState(1);
    const [tasksHasMore, setTasksHasMore] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksTotal, setTasksTotal] = useState(0);

    // Depleted inventory state
    const [inventory, setInventory] = useState([]);
    const [invPage, setInvPage] = useState(1);
    const [invHasMore, setInvHasMore] = useState(true);
    const [invLoading, setInvLoading] = useState(false);
    const [invTotal, setInvTotal] = useState(0);

    const tasksScrollRef = useRef(null);
    const invScrollRef = useRef(null);

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

    const loadInventory = useCallback(async (pageNum) => {
        if (invLoading) return;
        setInvLoading(true);
        try {
            const res = await fetchDepletedInventory(pageNum, 5);
            if (res.success) {
                setInventory(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
                setInvHasMore(res.pagination.hasNextPage);
                setInvTotal(res.pagination.total);
            }
        } catch (err) { console.error(err); }
        setInvLoading(false);
    }, [fetchDepletedInventory, invLoading]);

    useEffect(() => { loadTasks(1); }, []);
    useEffect(() => { loadInventory(1); }, []);

    const handleTasksScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50 && tasksHasMore && !tasksLoading) {
            const nextPage = tasksPage + 1;
            setTasksPage(nextPage);
            loadTasks(nextPage);
        }
    };

    const handleInvScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50 && invHasMore && !invLoading) {
            const nextPage = invPage + 1;
            setInvPage(nextPage);
            loadInventory(nextPage);
        }
    };

    const totalEscalations = tasksTotal + invTotal;

    return (
        <Card elevation={0} sx={{
            border: '1px solid',
            borderColor: totalEscalations > 0 ? 'error.main' : 'divider',
            borderRadius: 2, height: '100%',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
        }}>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" gap={1}>
                        <Warning sx={{ color: 'error.main', fontSize: 22 }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                            Escalations & Disputes
                        </Typography>
                        {totalEscalations > 0 && (
                            <Chip label={totalEscalations} size="small" color="error" sx={{ fontWeight: 700 }} />
                        )}
                    </Box>
                }
                sx={{ pb: 0 }}
            />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }} variant="fullWidth">
                <Tab
                    label={<Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTime sx={{ fontSize: 18 }} />
                        <span>Tasks ({tasksTotal})</span>
                    </Box>}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                />
                <Tab
                    label={<Box display="flex" alignItems="center" gap={0.5}>
                        <Inventory2 sx={{ fontSize: 18 }} />
                        <span>Inventory ({invTotal})</span>
                    </Box>}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                />
            </Tabs>
            <Divider />

            <CardContent sx={{ pt: 1, pb: 2, flex: 1, overflow: 'hidden' }}>
                {/* Escalated Tasks Tab */}
                {tab === 0 && (
                    tasks.length === 0 && !tasksLoading ? (
                        <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
                            <Typography variant="body1" color="text.secondary">
                                🎉 No escalated tasks
                            </Typography>
                        </Box>
                    ) : (
                        <Box ref={tasksScrollRef} onScroll={handleTasksScroll}
                            sx={{ maxHeight: 370, overflowY: 'auto', pr: 0.5 }}>
                            <List dense sx={{ p: 0 }}>
                                {tasks.map((task) => (
                                    <ListItem key={`task-${task.id}`} sx={{ px: 0, py: 0.75, alignItems: 'flex-start' }}>
                                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                            <AccessTime sx={{ color: 'error.main', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={600}>{task.task_title}</Typography>}
                                            secondary={
                                                <Box component="span">
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {task.property_name && `📍 ${task.property_name}`}
                                                        {task.assigned_to_name && ` • 👤 ${task.assigned_to_name}`}
                                                    </Typography>
                                                    <Typography variant="caption" color="error.main" fontWeight={500}>
                                                        Pending since {new Date(task.scheduled_date).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Chip label={task.status} size="small" sx={{
                                            bgcolor: theme.palette.taskStatus[task.status] || 'default',
                                            color: theme.palette.getContrastText(theme.palette.taskStatus[task.status] || theme.palette.background.paper),
                                            fontWeight: 500, textTransform: 'capitalize', mt: 0.5
                                        }} />
                                    </ListItem>
                                ))}
                            </List>
                            {tasksLoading && (
                                <Box display="flex" justifyContent="center" py={1}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                        </Box>
                    )
                )}

                {/* Depleted Inventory Tab */}
                {tab === 1 && (
                    inventory.length === 0 && !invLoading ? (
                        <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
                            <Typography variant="body1" color="text.secondary">
                                ✅ No depleted inventory
                            </Typography>
                        </Box>
                    ) : (
                        <Box ref={invScrollRef} onScroll={handleInvScroll}
                            sx={{ maxHeight: 370, overflowY: 'auto', pr: 0.5 }}>
                            <List dense sx={{ p: 0 }}>
                                {inventory.map((item) => (
                                    <ListItem key={`inv-${item.id}`} sx={{ px: 0, py: 0.75, alignItems: 'flex-start' }}>
                                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                            <Inventory2 sx={{ color: 'warning.main', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={600}>{item.name}</Typography>}
                                            secondary={
                                                <Box component="span">
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {item.property_name && `📍 ${item.property_name}`}
                                                        {item.category && ` • ${item.category}`}
                                                    </Typography>
                                                    <Typography variant="caption" color="warning.dark" fontWeight={500}>
                                                        Depleted — Qty: {item.quantity} {item.unit || ''}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            {invLoading && (
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

export default EscalationCard;
