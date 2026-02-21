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
} from '@mui/material';

const activities = [
    {
        name: 'Sarah Johnson',
        action: 'completed task',
        detail: 'Property inspection at Oak Street',
        time: '5 min ago',
        type: 'task',
        avatarColor: '#e91e63', // pinkish
    },
    {
        name: 'Mike Chen',
        action: 'added new property',
        detail: 'Sunset Villa - 3BR',
        time: '23 min ago',
        type: 'property',
        avatarColor: '#009688', // teal
    },
    {
        name: 'Emily Davis',
        action: 'updated inventory',
        detail: 'Kitchen appliances stock',
        time: '1 hour ago',
        type: 'inventory',
        avatarColor: '#607d8b', // blue-grey
    },
    {
        name: 'Alex Turner',
        action: 'joined team',
        detail: 'Maintenance Crew',
        time: '2 hours ago',
        type: 'team',
        avatarColor: '#3f51b5', // indigo
    },

];

const RecentActivity = () => {
    const getChipColor = (type) => {
        switch (type) {
            case 'task':
                return { bgcolor: 'success.main', color: 'white' };
            case 'property':
                return { bgcolor: 'info.main', color: 'white' };
            case 'inventory':
                return { bgcolor: 'warning.main', color: 'white' };
            case 'team':
                return { bgcolor: 'secondary.main', color: 'white' };
            default:
                return { bgcolor: 'grey.500', color: 'white' };
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
                    <Typography variant="h6" component="div" fontWeight={600}>
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
                                            <Typography component="span" variant="subtitle2">
                                                {activity.name}
                                            </Typography>
                                            <Typography component="span" variant="body2" color="text.secondary">
                                                {activity.action}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                                sx={{ display: 'block' }}
                                            >
                                                {activity.detail}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                variant="caption"
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