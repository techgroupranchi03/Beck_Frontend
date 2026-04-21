import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

export function StatCard({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "primary.main",
    iconBgColor = "primary.light"
}) {
    const getChangeColor = () => {
        switch (changeType) {
            case "positive":
                return "success.main";
            case "negative":
                return "error.main";
            default:
                return "text.secondary";
        }
    };

    return (
        <Card
            sx={{
                borderRadius: 4,
                border: 1,
                borderColor: 'divider',
                boxShadow: 0,
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                    boxShadow: 3,
                    transform: 'scale(1.02)',
                },
            }}>
            <CardContent>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                        <Typography
                            variant="body1"
                            sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.2rem' }}
                            gutterBottom
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{ mb: change ? 1 : 0 }}
                        >
                            {value}
                        </Typography>
                        {change && (
                            <Typography
                                variant="body1"
                                color={getChangeColor()}
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                            >
                                {change}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            height: 48,
                            width: 48,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: iconBgColor,
                            color: iconColor
                        }}
                    >
                        <Icon sx={{ fontSize: 28, color: 'inherit' }} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}