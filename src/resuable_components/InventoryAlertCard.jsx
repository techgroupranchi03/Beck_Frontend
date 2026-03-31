import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Card, CardHeader, CardContent, Typography, Box, Divider,
    List, ListItem, ListItemIcon, ListItemText, Chip, Tabs, Tab,
    CircularProgress, useTheme, IconButton,
    Tooltip
} from '@mui/material';
import { TrendingDown, FiberNew, Inventory2, AddShoppingCart, LocationCityOutlined, BusinessCenterOutlined, HomeWorkOutlined, Business, Inventory } from '@mui/icons-material';
import { categoriess } from '../constant';

const getCategoryIcon = (category) => {
    const cat = categoriess.find(c => c.value === category);
    return cat ? cat.icon : null;
};

const InventoryAlertCard = ({ fetchLowStock, fetchNewInventory, onPurchaseTask }) => {
    const [tab, setTab] = useState(0);
    const theme = useTheme();

    // Low stock state
    const [depleting, setDepleting] = useState([]);
    const [depPage, setDepPage] = useState(1);
    const [depHasMore, setDepHasMore] = useState(true);
    const [depLoading, setDepLoading] = useState(false);
    const [depTotal, setDepTotal] = useState(0);

    // New inventory state
    const [newItems, setNewItems] = useState([]);
    const [newPage, setNewPage] = useState(1);
    const [newHasMore, setNewHasMore] = useState(true);
    const [newLoading, setNewLoading] = useState(false);
    const [newTotal, setNewTotal] = useState(0);

    const depScrollRef = useRef(null);
    const newScrollRef = useRef(null);

    const loadDepleting = useCallback(async (pageNum) => {
        if (depLoading) return;
        setDepLoading(true);
        try {
            const res = await fetchLowStock(pageNum, 5);
            if (res.success) {
                setDepleting(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
                setDepHasMore(res.pagination.hasNextPage);
                setDepTotal(res.pagination.total);
            }
        } catch (err) { console.error(err); }
        setDepLoading(false);
    }, [fetchLowStock, depLoading]);

    const loadNewItems = useCallback(async (pageNum) => {
        if (newLoading) return;
        setNewLoading(true);
        try {
            const res = await fetchNewInventory(pageNum, 5);
            if (res.success) {
                setNewItems(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
                setNewHasMore(res.pagination.hasNextPage);
                setNewTotal(res.pagination.total);
            }
        } catch (err) { console.error(err); }
        setNewLoading(false);
    }, [fetchNewInventory, newLoading]);

    useEffect(() => { loadDepleting(1); }, []);
    useEffect(() => { loadNewItems(1); }, []);

    const handleDepScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50 && depHasMore && !depLoading) {
            const nextPage = depPage + 1;
            setDepPage(nextPage);
            loadDepleting(nextPage);
        }
    };

    const handleNewScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50 && newHasMore && !newLoading) {
            const nextPage = newPage + 1;
            setNewPage(nextPage);
            loadNewItems(nextPage);
        }
    };

    return (
        <Card elevation={0} sx={{
            height: '100%',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`, borderRadius: 2,
            // transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
        }}>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                            Inventory Alerts
                        </Typography>
                    </Box>
                }
                sx={{ pb: 0 }}
            />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }} variant="fullWidth">
                <Tab
                    label={<Box display="flex" alignItems="center" gap={0.5}>
                        <TrendingDown sx={{ fontSize: 18 }} />
                        <span>Low Stock ({depTotal})</span>
                    </Box>}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                />
                <Tab
                    label={<Box display="flex" alignItems="center" gap={0.5}>
                        <Inventory sx={{ fontSize: 18 }} />
                        <span>Newly Added ({newTotal})</span>
                    </Box>}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                />
            </Tabs>
            <Divider />

            <CardContent sx={{ pt: 1, pb: 2, flex: 1, overflow: 'hidden' }}>
                {/* Low Stock Tab */}
                {tab === 0 && (
                    depleting.length === 0 && !depLoading ? (
                        <Box display="flex" alignItems="center" justifyContent="center" minHeight={80}>
                            <Typography variant="body2" color="text.secondary">All inventory is well stocked ✓</Typography>
                        </Box>
                    ) : (
                        <Box ref={depScrollRef} onScroll={handleDepScroll}
                            sx={{
                                maxHeight: 370, overflowY: 'auto', pr: 0.5,
                                '&::-webkit-scrollbar': { width: 8 },
                                '&::-webkit-scrollbar-track': { bgcolor: theme.palette.background.default, borderRadius: 3 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.primary.main, borderRadius: 3 },
                            }}>
                            <List dense sx={{ p: 0 }}>
                                {depleting.map((item) => (
                                    <ListItem key={item.id} sx={{ px: 0, py: 0.75 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                    {item.name}
                                                </Typography>}
                                            secondary={
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <Business sx={{ fontSize: 14 }} />
                                                    {item.property_name}
                                                    {item.category && (() => {
                                                        const CatIcon = getCategoryIcon(item.category);
                                                        return <>
                                                            {' • '}
                                                            {CatIcon && <CatIcon sx={{ fontSize: 14 }} />}
                                                            {item.category}
                                                        </>;
                                                    })()}
                                                </Typography>
                                            }
                                        />
                                        {onPurchaseTask && (
                                            <Tooltip title="Create Purchase Task" placement="top" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onPurchaseTask(item)}
                                                    sx={{ mr: 0.5, color: 'primary.main' }}
                                                >
                                                    <AddShoppingCart sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Chip
                                            label={`${item.quantity}${item.unit ? ` ${item.unit}` : ''}`}
                                            size="small"
                                            sx={{
                                                textTransform: 'capitalize',
                                                bgcolor: parseInt(item.quantity) === 0 ? '#f00c0c' : '#ff9800',
                                                color: theme.palette.getContrastText(parseInt(item.quantity) === 0 ? '#f00c0c' : '#ff9800'),
                                                fontWeight: 700, minWidth: 50, height: 22
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            {depLoading && (
                                <Box display="flex" justifyContent="center" py={1}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                        </Box>
                    )
                )}

                {/* Newly Added Tab */}
                {tab === 1 && (
                    newItems.length === 0 && !newLoading ? (
                        <Box display="flex" alignItems="center" justifyContent="center" minHeight={80}>
                            <Typography variant="body2" color="text.secondary">No new items this week</Typography>
                        </Box>
                    ) : (
                        <Box ref={newScrollRef} onScroll={handleNewScroll}
                            sx={{ maxHeight: 370, overflowY: 'auto', pr: 0.5 }}>
                            <List dense sx={{ p: 0 }}>
                                {newItems.map((item) => (
                                    <ListItem key={item.id} sx={{ px: 0, py: 0.75 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <FiberNew sx={{ color: 'success.main', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                    {item.name}
                                                </Typography>}
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    <Business sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.3 }} />
                                                    {item.property_name}
                                                    {` • Added ${new Date(item.created_at).toLocaleDateString()}`}
                                                </Typography>
                                            }
                                        />
                                        <Chip
                                            label={`${item.quantity}${item.unit ? ` ${item.unit}` : ''}`}
                                            size="small" color="success" variant="contained"
                                            sx={{ minWidth: 50, height: 22 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            {newLoading && (
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

export default InventoryAlertCard;
