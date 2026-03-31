import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    useTheme,
    Card,
    CardContent,
    Stack,
    Container,
    Button,
    TextField,
    Divider,
    IconButton,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import {
    Palette,
    CheckCircle,
    Close,
    Edit,
    Delete,
    DarkMode,
    LightMode,
    Add,
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { switchClientTheme, CreateClientCustomTheme, UpdateClientCustomTheme, DeleteClientCustomTheme } from '../service/Clients/clientThemeService';
import { useSnackbar } from '../resuable_components/Snackbar';
import { CreateTeamCustomTheme, switchTeamTheme, UpdateTeamCustomTheme, DeleteTeamCustomTheme } from '../service/Teams/TeamThemeService';

// Theme Preview Component
const ThemePreview = ({ colors }) => {
    return (
        <Box
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: colors.layout,
                p: 1,
            }}
        >
            {/* Inner Card */}
            <Box
                sx={{
                    bgcolor: colors.surface,
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
            >
                {/* Header */}
                <Stack direction="row" alignItems="center" mb={1.5}>
                    {/* Left group */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: colors.active,
                            }}
                        />
                        <Box
                            sx={{
                                width: 80,
                                height: 8,
                                borderRadius: 1,
                                bgcolor: colors.text_secondary,
                                opacity: 0.6,
                            }}
                        />
                    </Stack>

                    {/* Right dot */}
                    <Box
                        sx={{
                            width: 15,
                            height: 15,
                            borderRadius: '50%',
                            bgcolor: colors.active,
                            ml: 'auto',
                        }}
                    />
                </Stack>

                <Divider sx={{ mb: 1.5, borderColor: colors.text_secondary, opacity: 0.2 }} />

                {/* Title */}
                <Box
                    sx={{
                        width: '70%',
                        height: 10,
                        borderRadius: 1,
                        bgcolor: colors.text_primary,
                        opacity: 0.8,
                        mb: 1,
                    }}
                />

                {/* Subtitle */}
                <Box
                    sx={{
                        width: '50%',
                        height: 8,
                        borderRadius: 1,
                        bgcolor: colors.text_secondary,
                        opacity: 0.5,
                        mb: 3,
                    }}
                />

                {/* Button */}
                <Box
                    sx={{
                        height: 36,
                        borderRadius: 2,
                        bgcolor: colors.active,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 6,
                            borderRadius: 1,
                            bgcolor: colors.text_primary,
                            opacity: 0.9,
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};
// Theme Card Component
const ThemeCard = ({ themeData, isActive, onSelect, onEdit, onDelete }) => {
    const theme = useTheme();
    const colors = themeData.theme_properties?.palette || {};
    const isCustomTheme = themeData.client_id !== null;

    return (
        <Card
            onClick={onSelect}
            sx={{
                cursor: 'pointer',
                position: 'relative',
                border: 2,
                borderColor: isActive ? theme.palette.primary.main : 'transparent',
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                },
            }}
        >
            <CardContent sx={{ p: 2 }}>
                {isActive && (
                    <CheckCircle
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: theme.palette.primary.main,
                            zIndex: 1,
                        }}
                    />
                )}

                {/* Show edit/delete only for custom themes (client_id not null) */}
                {isCustomTheme && (
                    <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: isActive ? 40 : 8, zIndex: 1 }}>
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(themeData);
                            }}
                            sx={{
                                color: theme.palette.text.secondary,
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                },
                            }}
                            size="small"
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(themeData);
                            }}
                            sx={{
                                color: theme.palette.text.secondary,
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                    color: theme.palette.error.main,
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                },
                            }}
                            size="small"
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Stack>
                )}

                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    {themeData.theme_name}
                </Typography>

                {/* Theme Preview */}
                <ThemePreview colors={colors} />
            </CardContent>
        </Card>
    );
};
// Color Picker Component
const ColorPicker = ({ label, value, onChange }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        bgcolor: value,
                        border: '2px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                        }}
                    />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                    {label}
                </Typography>
                <TextField
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    size="small"
                    sx={{ width: 100 }}
                    inputProps={{
                        style: { fontSize: 12, fontFamily: 'monospace' }
                    }}
                />
            </Stack>
        </Box>
    );
};

// Main Theme Settings Component
const ThemeSettings = () => {
    const theme = useTheme();
    const { showSnackbar } = useSnackbar();
    const { user } = useAuth();
    const [creatingCustomTheme, setCreatingCustomTheme] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [loading, setLoading] = useState(false);
    console.log('ThemeSettings user:', user);
    const isTeamUser = user?.role === 'team';

    const {
        selectedLightThemeId,
        selectedDarkThemeId,
        setSelectedLightThemeId,
        setSelectedDarkThemeId,
        syncUserTheme,
        presetThemes,
        customThemes,
        themesLoading,
        mode,
        reloadThemes
    } = useThemeMode();

    // Custom theme state
    const [customThemeData, setCustomThemeData] = useState({
        theme_name: '',
        is_dark: false,
        layout: '#f5f5f5',
        active: '#1976d2',
        interactive: '#42a5f5',
        notifications: '#4caf50',
        surface: '#ffffff',
        text_primary: '#212121',
        text_secondary: '#757575',
    });

    // Sync theme from user profile on mount
    useEffect(() => {
        if (user?.theme) {
            syncUserTheme(user.theme);
        }
    }, [user, syncUserTheme]);

    const handleThemeSelect = useCallback(async (themeId, selectedTheme) => {
        try {
            const isLightTheme = selectedTheme.is_dark === 0;
            const isDarkTheme = selectedTheme.is_dark === 1;

            // Update the appropriate theme ID based on theme type
            let newLightThemeId = selectedLightThemeId;
            let newDarkThemeId = selectedDarkThemeId;

            if (isLightTheme) {
                newLightThemeId = selectedTheme.id;
                setSelectedLightThemeId(selectedTheme.id);
            } else if (isDarkTheme) {
                newDarkThemeId = selectedTheme.id;
                setSelectedDarkThemeId(selectedTheme.id);
            }

            // Call API to update both light and dark themes
            // The API will update the user profile, which will trigger a re-sync
            if (isTeamUser) {
                await switchTeamTheme(newLightThemeId, newDarkThemeId);
            } else {
                await switchClientTheme(newLightThemeId, newDarkThemeId);
            }

            // refresh complete website  with window location reload
            window.location.reload();

            showSnackbar(`Theme "${selectedTheme.theme_name}" selected successfully!`, 'success');
        } catch (error) {
            console.error('Failed to switch theme:', error);
            showSnackbar(error.message || 'Failed to switch theme', 'error');
        }
    }, [isTeamUser, selectedLightThemeId, selectedDarkThemeId, setSelectedLightThemeId, setSelectedDarkThemeId, showSnackbar]);

    const handleCreateCustomTheme = (isDark = false) => {
        setCreatingCustomTheme(true);
        setEditingTheme(null);

        // Set default colors based on theme type
        if (isDark) {
            setCustomThemeData({
                theme_name: '',
                is_dark: true,
                layout: '#0a192f',
                active: '#64ffda',
                interactive: '#8892b0',
                notifications: '#00d4aa',
                surface: '#172a45',
                text_primary: '#ccd6f6',
                text_secondary: '#8892b0',
            });
        } else {
            setCustomThemeData({
                theme_name: '',
                is_dark: false,
                layout: '#f5f5f5',
                active: '#1976d2',
                interactive: '#42a5f5',
                notifications: '#4caf50',
                surface: '#ffffff',
                text_primary: '#212121',
                text_secondary: '#757575',
            });
        }
    };

    const handleEditTheme = (themeToEdit) => {
        setEditingTheme(themeToEdit);
        setCreatingCustomTheme(true);
        setCustomThemeData({
            theme_name: themeToEdit.theme_name,
            is_dark: themeToEdit.is_dark,
            layout: themeToEdit.theme_properties.palette.layout,
            active: themeToEdit.theme_properties.palette.active,
            interactive: themeToEdit.theme_properties.palette.interactive,
            notifications: themeToEdit.theme_properties.palette.notifications,
            surface: themeToEdit.theme_properties.palette.surface,
            text_primary: themeToEdit.theme_properties.palette.text_primary,
            text_secondary: themeToEdit.theme_properties.palette.text_secondary,
        });
    };

    const handleCancelCustomTheme = () => {
        setCreatingCustomTheme(false);
        setEditingTheme(null);
        setCustomThemeData({
            theme_name: '',
            is_dark: false,
            layout: '#f5f5f5',
            active: '#1976d2',
            interactive: '#42a5f5',
            notifications: '#4caf50',
            surface: '#ffffff',
            text_primary: '#212121',
            text_secondary: '#757575',
        });
    };

    const handleResetCustomTheme = () => {
        if (customThemeData.is_dark) {
            setCustomThemeData({
                ...customThemeData,
                theme_name: customThemeData.theme_name,
                layout: '#0a192f',
                active: '#64ffda',
                interactive: '#8892b0',
                notifications: '#00d4aa',
                surface: '#172a45',
                text_primary: '#ccd6f6',
                text_secondary: '#8892b0',
            });
        } else {
            setCustomThemeData({
                ...customThemeData,
                theme_name: customThemeData.theme_name,
                layout: '#f5f5f5',
                active: '#1976d2',
                interactive: '#42a5f5',
                notifications: '#4caf50',
                surface: '#ffffff',
                text_primary: '#212121',
                text_secondary: '#757575',
            });
        }
    };

    const handleAddCustomTheme = async () => {
        setLoading(true);
        // Validation
        if (!customThemeData.theme_name.trim()) {
            showSnackbar('Please enter a theme name', 'error');
            setLoading(false);
            return;
        }

        // Prepare theme data with correct structure
        const themePayload = {
            theme_name: customThemeData.theme_name,
            is_dark: customThemeData.is_dark,
            theme_properties: {
                palette: {
                    layout: customThemeData.layout,
                    active: customThemeData.active,
                    interactive: customThemeData.interactive,
                    notifications: customThemeData.notifications,
                    surface: customThemeData.surface,
                    text_primary: customThemeData.text_primary,
                    text_secondary: customThemeData.text_secondary,
                }
            }
        };

        try {
            if (editingTheme) {
                // Update existing theme
                const response = isTeamUser
                    ? await UpdateTeamCustomTheme({
                        id: editingTheme.id,
                        ...themePayload
                    })
                    : await UpdateClientCustomTheme({
                        id: editingTheme.id,
                        ...themePayload
                    });
                showSnackbar(response.message, 'success');
            } else {
                // Create new theme
                const response = isTeamUser
                    ? await CreateTeamCustomTheme(themePayload)
                    : await CreateClientCustomTheme(themePayload);
                showSnackbar(response.message, 'success');
            }

            setCreatingCustomTheme(false);
            setEditingTheme(null);
            handleResetCustomTheme();
            // Refresh themes
            await reloadThemes();
        } catch (error) {
            console.error('Failed to create/update theme:', error);
            showSnackbar(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleColorChange = useCallback((field, value) => {
        setCustomThemeData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleDeleteTheme = useCallback(async (themeToDelete) => {
        try {
            if (isTeamUser) {
                await DeleteTeamCustomTheme(themeToDelete.id, themeToDelete.theme_name);
            } else {
                await DeleteClientCustomTheme(themeToDelete.id, themeToDelete.theme_name);
            }
            showSnackbar('Theme deleted successfully!', 'success');
            await reloadThemes();
        } catch (error) {
            console.error('Failed to delete theme:', error);
            showSnackbar('Failed to delete theme', 'error');
        }
    }, [isTeamUser, reloadThemes, showSnackbar]);

    const handleThemeTypeChange = useCallback((event, newValue) => {
        if (newValue !== null) {
            const isDark = newValue === 'dark';
            setCustomThemeData(prev => ({
                ...prev,
                is_dark: isDark,
                // Update colors when switching type
                layout: isDark ? '#0a192f' : '#f5f5f5',
                active: isDark ? '#64ffda' : '#1976d2',
                interactive: isDark ? '#8892b0' : '#42a5f5',
                notifications: isDark ? '#00d4aa' : '#4caf50',
                surface: isDark ? '#172a45' : '#ffffff',
                text_primary: isDark ? '#ccd6f6' : '#212121',
                text_secondary: isDark ? '#8892b0' : '#757575',
            }));
        }
    }, []);

    // Combine all themes and filter by light/dark
    const allThemes = useMemo(
        () => [...presetThemes, ...(customThemes || [])],
        [presetThemes, customThemes]
    );

    const lightThemes = useMemo(
        () => allThemes.filter(t => t.is_dark === 0),
        [allThemes]
    );

    const darkThemes = useMemo(
        () => allThemes.filter(t => t.is_dark === 1),
        [allThemes]
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4, px: 0 }}>
            {/* Header with Create Button */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Palette sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                        <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.2rem' }} gutterBottom>
                            Theme Settings
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        onClick={() => handleCreateCustomTheme(false)}
                        disableElevation
                        sx={{ borderRadius: 10, height: 30, textTransform: 'none' }}
                    >
                        Create Theme
                    </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    Start with a built-in theme or build your own
                </Typography>
            </Box>

            {/* if we creating the custom theme then not show the light and dark themes */}
            {!creatingCustomTheme && (
                <>
                    {/* Light Themes Section */}
                    <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <LightMode sx={{ fontSize: 32, color: theme.palette.warning.main }} />
                            <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1rem' }} gutterBottom>
                                Light Themes
                            </Typography>
                        </Stack>
                        {themesLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Loading themes...
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    overflowX: 'auto',
                                    pb: 1,
                                    scrollSnapType: 'x mandatory',
                                    scrollBehavior: 'smooth',
                                    '&::-webkit-scrollbar': {
                                        height: 4,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'divider',
                                        borderRadius: 4,
                                    },
                                }}
                            >
                                {/* All Light Themes */}
                                {lightThemes?.map((themeItem) => (
                                    <Box
                                        key={themeItem.id}
                                        sx={{
                                            mt: 1,
                                            minWidth: 320,
                                            scrollSnapAlign: 'start',
                                        }}
                                    >
                                        <ThemeCard
                                            themeData={themeItem}
                                            isActive={selectedLightThemeId === themeItem.id}
                                            onSelect={() => handleThemeSelect(themeItem.id, themeItem)}
                                            onEdit={handleEditTheme}
                                            onDelete={handleDeleteTheme}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>

                    {/* Dark Themes Section */}
                    <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <DarkMode sx={{ fontSize: 32 }} />
                            <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1rem' }} gutterBottom>
                                Dark Themes
                            </Typography>
                        </Stack>

                        {themesLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Loading themes...
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    overflowX: 'auto',
                                    pb: 1,
                                    scrollSnapType: 'x mandatory',
                                    scrollBehavior: 'smooth',
                                    '&::-webkit-scrollbar': {
                                        height: 4,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'divider',
                                        borderRadius: 4,
                                    },
                                }}
                            >
                                {/* All Dark Themes */}
                                {darkThemes?.map((themeItem) => (
                                    <Box
                                        key={themeItem.id}
                                        sx={{
                                            mt: 1,
                                            minWidth: 320,
                                            scrollSnapAlign: 'start',
                                        }}
                                    >
                                        <ThemeCard
                                            themeData={themeItem}
                                            isActive={selectedDarkThemeId === themeItem.id}
                                            onSelect={() => handleThemeSelect(themeItem.id, themeItem)}
                                            onEdit={handleEditTheme}
                                            onDelete={handleDeleteTheme}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </>
            )}

            {/* Create/Edit Theme Dialog */}
            {creatingCustomTheme && (
                <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h5" fontWeight={600}>
                            {editingTheme ? 'Edit Theme' : 'Create New Theme'}
                        </Typography>
                        <IconButton onClick={handleCancelCustomTheme} size="small">
                            <Close />
                        </IconButton>
                    </Stack>

                    <Divider sx={{ mb: 3 }} />

                    {/* Live Preview */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Live Preview
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            See how your theme will look
                        </Typography>
                        <Box sx={{ maxWidth: 400 }}>
                            <ThemePreview colors={customThemeData} />
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Theme Details */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Theme Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter a name and select theme type
                        </Typography>

                        <Grid container spacing={3} alignItems="center">
                            {/* Theme Name */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Theme Name"
                                    value={customThemeData.theme_name}
                                    onChange={(e) => handleColorChange('theme_name', e.target.value)}
                                    fullWidth
                                    required
                                    placeholder="e.g., Ocean Wave, Forest Green"
                                />
                            </Grid>

                            {/* Theme Type */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" sx={{ mt: -4, mb: 1 }}>
                                    Theme Type
                                </Typography>
                                <ToggleButtonGroup
                                    value={customThemeData.is_dark ? 'dark' : 'light'}
                                    exclusive
                                    onChange={handleThemeTypeChange}
                                    aria-label="theme type"
                                >
                                    <ToggleButton value="light">
                                        <LightMode sx={{ mr: 1 }} />
                                        Light
                                    </ToggleButton>
                                    <ToggleButton value="dark">
                                        <DarkMode sx={{ mr: 1 }} />
                                        Dark
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Colors Section */}
                    <Grid container sx={{ mb: 4 }}>
                        <Grid size={12}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Colors
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Layout, Surface, Active, Interactive, Notifications
                            </Typography>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <ColorPicker
                                    value={customThemeData.layout}
                                    label="Layout"
                                    onChange={(value) => handleColorChange('layout', value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <ColorPicker
                                    value={customThemeData.surface}
                                    label="Surface"
                                    onChange={(value) => handleColorChange('surface', value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <ColorPicker
                                    value={customThemeData.active}
                                    label="Active"
                                    onChange={(value) => handleColorChange('active', value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <ColorPicker
                                    value={customThemeData.interactive}
                                    label="Interactive"
                                    onChange={(value) => handleColorChange('interactive', value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <ColorPicker
                                    value={customThemeData.notifications}
                                    label="Notifications"
                                    onChange={(value) => handleColorChange('notifications', value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Text Colors Section */}
                    <Grid container sx={{ mb: 4 }}>
                        <Grid size={12}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Text Colors
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Primary and secondary text
                            </Typography>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ColorPicker
                                    value={customThemeData.text_primary}
                                    label="Text Primary"
                                    onChange={(value) => handleColorChange('text_primary', value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ColorPicker
                                    value={customThemeData.text_secondary}
                                    label="Text Secondary"
                                    onChange={(value) => handleColorChange('text_secondary', value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="text"
                            onClick={handleResetCustomTheme}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAddCustomTheme}
                            disableElevation
                            disabled={loading}
                            sx={{ borderRadius: 10 }}
                        >
                            {loading ? 'Loading...' : (editingTheme ? 'Update Theme' : 'Create Theme')}
                        </Button>
                    </Stack>
                </Paper>
            )}

        </Container>
    );
};

export default ThemeSettings;
