import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, CircularProgress, Alert, Card, useTheme } from '@mui/material';
import { Apartment, CheckBox, Inventory, People } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { StatCard } from '../../resuable_components/StatCard';
import EscalationCard from '../../resuable_components/EscalationCard';
import InventoryAlertCard from '../../resuable_components/InventoryAlertCard';
import {
  getClientDashboard, getEscalatedTasks, getDepletedInventory,
  getLowStockInventory, getNewInventory
} from '../../service/Clients/Dashboard';

const ClientsDashboard = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getClientDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, px: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { stats, tasksDonePerDay, tasksPerStaff } = data;

  const tickColor = theme.palette.text.secondary;
  const tooltipBg = theme.palette.background.paper;
  const tooltipBorder = theme.palette.divider;
  const tooltipLabelColor = theme.palette.text.primary;

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 0, sm: 3 } }}>
        {/* Stats Grid */}
        {/* <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Properties"
              value={stats.totalProperties}
              icon={Apartment}
              iconColor="primary.contrastText"
              iconBgColor="primary.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Today's Tasks"
              value={stats.activeTasks}
              change="scheduled today"
              changeType="neutral"
              icon={CheckBox}
              iconColor="warning.contrastText"
              iconBgColor="warning.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Team Members"
              value={stats.teamMembers}
              change="active"
              changeType="positive"
              icon={People}
              iconColor="success.contrastText"
              iconBgColor="success.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Low Stock Items"
              value={stats.lowStockItems}
              change={stats.lowStockItems > 0 ? 'needs attention' : 'all stocked'}
              changeType={stats.lowStockItems > 0 ? 'negative' : 'positive'}
              icon={Inventory}
              iconColor="error.contrastText"
              iconBgColor="error.main"
            />
          </Grid>
        </Grid> */}

        {/* Escalations & Inventory Alerts */}
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <EscalationCard
              fetchEscalatedTasks={getEscalatedTasks}
              fetchDepletedInventory={getDepletedInventory}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InventoryAlertCard
              fetchLowStock={getLowStockInventory}
              fetchNewInventory={getNewInventory}
            />
          </Grid>
        </Grid>

        {/* Charts: Tasks Done Per Day + Tasks Per Staff */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 2,
              p: 2, height: 450,
              transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
            }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', mb: 0.5 }}>
                Tasks Done Per Day
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Last 7 days completion trend
              </Typography>
              <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tasksDonePerDay}
                    barGap={6}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="day_label"
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 12, fill: tickColor }}
                    />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 12, fill: tickColor }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: 8,
                        boxShadow: theme.shadows[3],
                        padding: '12px 16px',
                      }}
                      labelStyle={{ fontWeight: 600, color: tooltipLabelColor, marginBottom: 6 }}
                    />
                    <Legend />
                    <Bar
                      dataKey="completed" name="Completed"
                      fill={theme.palette.success.main}
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="pending" name="Pending"
                      fill={theme.palette.warning.main}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 2,
              p: 2, height: 450,
              transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
            }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', mb: 0.5 }}>
                Tasks Per Staff Today
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Task allocation across team members
              </Typography>
              <Box sx={{ height: 350, width: '100%' }}>
                {tasksPerStaff.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No tasks allocated today
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tasksPerStaff}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis
                        type="number"
                        axisLine={false} tickLine={false}
                        tick={{ fontSize: 12, fill: tickColor }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category" dataKey="staff_name"
                        axisLine={false} tickLine={false}
                        tick={{ fontSize: 12, fill: tickColor }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          border: `1px solid ${tooltipBorder}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[3],
                          padding: '12px 16px',
                        }}
                        labelStyle={{ fontWeight: 600, color: tooltipLabelColor }}
                      />
                      <Legend />
                      <Bar
                        dataKey="completed_tasks" name="Completed" stackId="a"
                        fill={theme.palette.success.main}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="pending_tasks" name="Pending" stackId="a"
                        fill={theme.palette.warning.main}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default ClientsDashboard;