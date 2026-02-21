import { Card, CardContent, Typography, Box } from '@mui/material';

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
                transition: 'transform 0.2s',
                '&:hover': {
                    boxShadow: 3,
                    transform: 'scale(1.02)',
                },
            }}>
            <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                        <Typography
                            variant="body2"
                            fontWeight={500}
                            color="text.secondary"
                            gutterBottom
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: change ? 1 : 0 }}
                        >
                            {value}
                        </Typography>
                        {change && (
                            <Typography
                                variant="body2"
                                fontWeight={500}
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
                        <Icon sx={{ fontSize: 28, color: '#ffffff' }} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}