import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Divider,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Mon', completed: 12, pending: 4 },
  { name: 'Tue', completed: 8, pending: 6 },
  { name: 'Wed', completed: 15, pending: 3 },
  { name: 'Thu', completed: 10, pending: 5 },
  { name: 'Fri', completed: 18, pending: 2 },
  { name: 'Sat', completed: 6, pending: 8 },
  { name: 'Sun', completed: 4, pending: 3 },
];

export default function TaskOverview() {
  const theme = useTheme();
  const completedColor = theme.palette.primary.main;
  const pendingColor = theme.palette.secondary.main;

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
            Task Overview
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Weekly task completion rate
          </Typography>
        }
        sx={{ pb: 1 }}
      />

      <Divider />

      <CardContent sx={{ pt: 2, pb: 3 }}>
        <Box sx={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }} 
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  padding: '12px 16px',
                }}
                labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: 6 }}
                itemStyle={{ paddingTop: 2 }}
              />
              <Bar
                dataKey="completed"
                fill={completedColor}
                radius={[6, 6, 0, 0]}
                name="Completed"
              />
              <Bar
                dataKey="pending"
                fill={pendingColor}
                radius={[6, 6, 0, 0]}
                name="Pending"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            mt: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                bgcolor: completedColor,
                borderRadius: '4px',
              }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Completed
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                bgcolor: pendingColor,
                borderRadius: '4px',
              }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Pending
            </Typography>
          </Box>
        </Box>
      </CardContent>

    </Card>
  );
}