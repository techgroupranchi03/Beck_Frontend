import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Tab,
    Tabs,
    Typography,
    TextField,
    Paper,
    Stack,
    Chip,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Skeleton,
    useTheme,
    useMediaQuery,
    Avatar,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Person,
    Phone,
    CardMembership,
    Palette,
    Save,
    ShoppingCart,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../resuable_components/Snackbar';
import { getClientSettings, updateClientSettings } from '../../service/Clients/ClientSettings';
import { getTeamMembers } from '../../service/Clients/Team';
import ThemeSettingsContent from '../ThemeSettings';

const GeneralSettings = () => {
    const theme = useTheme();
    const { user, refreshUser } = useAuth();
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [settings, setSettings] = useState({
        name: '',
        phone: '',
        company: '',
        plan: '',
        valid_from: '',
        valid_to: '',
        status: '',
        purchase_order_assignee: 'myself',
    });

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [settingsRes, teamRes] = await Promise.all([
                    getClientSettings(),
                    getTeamMembers('', 1),
                ]);
                if (settingsRes.success) {
                    setSettings({
                        name: settingsRes.data.name || '',
                        phone: settingsRes.data.phone || '',
                        company: settingsRes.data.company || '',
                        plan: settingsRes.data.plan || '',
                        valid_from: settingsRes.data.valid_from || '',
                        valid_to: settingsRes.data.valid_to || '',
                        status: settingsRes.data.status || '',
                        purchase_order_assignee: settingsRes.data.purchase_order_assignee || 'myself',
                    });
                }
                if (teamRes.success) {
                    setTeamMembers(teamRes.data || []);
                }
            } catch (err) {
                console.error('Error loading settings:', err);
                // Fallback to user context data
                if (user) {
                    setSettings(prev => ({
                        ...prev,
                        name: user.name || '',
                        phone: user.phone || '',
                        company: user.company || '',
                        plan: user.plan || '',
                        valid_from: user.valid_from || '',
                        valid_to: user.valid_to || '',
                        status: user.status || '',
                    }));
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await updateClientSettings({
                name: settings.name,
                phone: settings.phone,
                purchase_order_assignee: settings.purchase_order_assignee,
            });
            if (res.success) {
                showSnackbar('Settings updated successfully', 'success');
                await refreshUser();
            }
        } catch (err) {
            showSnackbar(err.message || 'Failed to update settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const planColors = {
        basic: { bg: `${theme.palette.info.main}18`, color: theme.palette.info.dark },
        premium: { bg: `${theme.palette.warning.main}18`, color: theme.palette.warning.dark },
    };

    const statusColors = {
        active: { bg: `${theme.palette.success.main}18`, color: theme.palette.success.dark },
        inactive: { bg: `${theme.palette.error.main}18`, color: theme.palette.error.dark },
        suspended: { bg: `${theme.palette.warning.main}18`, color: theme.palette.warning.dark },
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2 }} />
                    ))}
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Profile Summary Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '1.3rem',
                            fontWeight: 700,
                        }}
                    >
                        {settings.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={700}>
                            {settings.name || 'Client'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {user?.teamRole || user?.role || 'Member'}
                        </Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" gap={0.5}>
                            <Chip
                                size="small"
                                label={settings.plan?.charAt(0).toUpperCase() + settings.plan?.slice(1) || 'N/A'}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 22,
                                    bgcolor: planColors[settings.plan]?.bg || theme.palette.action.hover,
                                    color: planColors[settings.plan]?.color || theme.palette.text.primary,
                                }}
                            />
                            <Chip
                                size="small"
                                label={settings.status?.charAt(0).toUpperCase() + settings.status?.slice(1) || 'N/A'}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 22,
                                    bgcolor: statusColors[settings.status]?.bg || theme.palette.action.hover,
                                    color: statusColors[settings.status]?.color || theme.palette.text.primary,
                                }}
                            />
                        </Stack>
                    </Box>
                </Stack>
            </Paper>

            {/* Editable Fields */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                    Account Information
                </Typography>

                <Stack spacing={2.5}>
                    {/* Name - Editable */}
                    <TextField
                        label="Name"
                        value={settings.name}
                        onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <Person sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />
                                ),
                            },
                        }}
                    />

                    {/* Phone - Editable */}
                    <TextField
                        label="Phone Number"
                        value={settings.phone}
                        onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <Phone sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />
                                ),
                            },
                        }}
                    />

                    <Divider sx={{ my: 1 }} />

                    {/* Subscription Info - Read-only */}
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Subscription Details
                    </Typography>

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <TextField
                            label="Plan"
                            value={settings.plan?.charAt(0).toUpperCase() + settings.plan?.slice(1) || ''}
                            size="small"
                            disabled
                            sx={{ flex: 1, minWidth: 120 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <CardMembership sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label="Valid From"
                            value={settings.valid_from || ''}
                            size="small"
                            disabled
                            sx={{ flex: 1, minWidth: 120 }}
                        />
                        <TextField
                            label="Valid To"
                            value={settings.valid_to || ''}
                            size="small"
                            disabled
                            sx={{ flex: 1, minWidth: 120 }}
                        />
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Purchase Order Assignee */}
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Purchase Order
                    </Typography>

                    <FormControl fullWidth size="small">
                        <InputLabel>Purchase Order Assignee</InputLabel>
                        <Select
                            label="Purchase Order Assignee"
                            value={settings.purchase_order_assignee}
                            onChange={(e) => setSettings(prev => ({ ...prev, purchase_order_assignee: e.target.value }))}
                            startAdornment={
                                <ShoppingCart sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />
                            }
                        >
                            <MenuItem value="myself">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Person fontSize="small" />
                                    <Typography variant="body2">Myself</Typography>
                                </Stack>
                            </MenuItem>
                            <Divider />
                            {teamMembers.map((member) => (
                                <MenuItem key={member.id} value={String(member.id)}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                fontSize: '0.7rem',
                                                bgcolor: theme.palette.secondary.main,
                                            }}
                                        >
                                            {member.name?.charAt(0).toUpperCase() || '?'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2">{member.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {member.role}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                {/* Save Button */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                            fontWeight: 600,
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

const ClientSettings = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Container maxWidth="lg" sx={{ mt: 2, px: isMobile ? 1.5 : 3, pb: 4 }}>
            {/* Page Header */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <SettingsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your account and preferences
                    </Typography>
                </Box>
            </Stack>

            {/* Tabs */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    mb: 3,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            py: 1.5,
                        },
                        '& .Mui-selected': {
                            color: theme.palette.primary.main,
                        },
                    }}
                >
                    <Tab
                        label="General"
                        icon={<Person sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                    />
                    <Tab
                        label="Theme"
                        icon={<Palette sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box sx={{ minHeight: 400 }}>
                {activeTab === 0 && <GeneralSettings />}
                {activeTab === 1 && <ThemeSettingsContent />}
            </Box>
        </Container>
    );
};

export default ClientSettings;
