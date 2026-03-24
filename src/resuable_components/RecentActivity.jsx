import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Chip,
    Box,
    Divider,
    useTheme,
} from '@mui/material';

const activities = [
    {
        name: 'Sarah Johnson',
        action: 'completed task',
        detail: 'Property inspection at Oak Street',
        time: '5 min ago',
        type: 'task',
        avatarColor: 'success.main',
    },
    {
        name: 'Mike Chen',
        action: 'added new property',
        detail: 'Sunset Villa - 3BR',
        time: '23 min ago',
        type: 'property',
        avatarColor: 'primary.main',
    },
    {
        name: 'Emily Davis',
        action: 'updated inventory',
        detail: 'Kitchen appliances stock',
        time: '1 hour ago',
        type: 'inventory',
        avatarColor: 'warning.dark',
    },
    {
        name: 'Alex Turner',
        action: 'joined team',
        detail: 'Maintenance Crew',
        time: '2 hours ago',
        type: 'team',
        avatarColor: 'secondary.main',
    },

];

const RecentActivity = () => {
    const theme = useTheme();

    const getChipColor = (type) => {
        switch (type) {
            case 'task':
                return { bgcolor: 'success.main', color: 'common.white' };
            case 'property':
                return { bgcolor: 'info.main', color: 'common.white' };
            case 'inventory':
                return { bgcolor: 'warning.main', color: 'common.white' };
            case 'team':
                return { bgcolor: 'secondary.main', color: 'common.white' };
            default:
                return { bgcolor: 'grey.500', color: 'common.white' };
        }
    };

    return (
        <Card
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: '530px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                    boxShadow: 6,
                },
            }}
        >
            <CardHeader
                title={
                    <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.2rem' }} gutterBottom>
                        Recent Activity
                    </Typography>
                }
                subheader={
                    <Typography variant="body2" color="text.secondary">
                        Latest updates from your team
                    </Typography>
                }
                sx={{ pb: 1 }}
            />

            <Divider />

            <CardContent sx={{ pt: 2, pb: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <List dense sx={{ p: 0, flex: 1, overflow: 'auto' }}>
                    {activities.map((activity, index) => (
                        <React.Fragment key={index}>
                            {/* {index > 0 && <Divider variant="inset" component="li" />} */}
                            <ListItem dense alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: activity.avatarColor }}>
                                        {activity.name.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography  variant="body1" color="text.primary" fontWeight={500}>
                                                {activity.name}
                                            </Typography>
                                            <Typography  variant="body1" color="text.secondary">
                                                {activity.action}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography
                                                variant="body1"
                                                color="text.primary"
                                                sx={{ display: 'block' }}
                                            >
                                                {activity.detail}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ display: 'block', mt: 0.5 }}
                                            >
                                                {activity.time}
                                            </Typography>
                                        </>
                                    }
                                />

                                <Chip
                                    label={activity.type}
                                    size="small"
                                    sx={{
                                        ...getChipColor(activity.type),
                                        fontWeight: 'medium',
                                        minWidth: 80,
                                        textTransform: 'capitalize',
                                    }}
                                />
                            </ListItem>
                        </React.Fragment>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default RecentActivity;