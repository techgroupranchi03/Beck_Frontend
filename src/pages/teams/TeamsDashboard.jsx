import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Typography, CircularProgress, Alert,
  Card, useTheme, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
  Apartment, CheckBox, Inventory, People,
  TaskAlt, PendingActions, Schedule, Assignment
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import { StatCard } from '../../resuable_components/StatCard';
import EscalationCard from '../../resuable_components/EscalationCard';
import InventoryAlertCard from '../../resuable_components/InventoryAlertCard';
import StaffTaskList from '../../resuable_components/StaffTaskList';
import {
  getTeamDashboard, getEscalatedTasks,
  getLowStockInventory, getNewInventory, getStaffTodayTasks, getStaffPendingTasks
} from '../../service/Teams/Dashboard';
import { useAuth } from '../../context/AuthContext';
import { createTeamTask, getTeamsTeamMembers, getTeamInventoryByPropertyId } from '../../service/Teams/Team_Task';
import { TaskContext } from '../clients/task/TaskManagement';
import TileView_AddEdit_Dialog from '../clients/task/TileView_AddEdit_Dialog';
import { ROLES } from '../../utils/permissions';

const TeamsDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseTask, setPurchaseTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [trendDays, setTrendDays] = useState(7);
  const [trendLoading, setTrendLoading] = useState(false);

  const canCreateTask = [ROLES.PROPERTY_MANAGER, ROLES.PROPERTY_SUPERVISOR].includes(user?.teamRole);

  const fetchInventoryByProperty = useCallback(async (propertyId) => {
    try {
      const res = await getTeamInventoryByPropertyId(propertyId);
      return res.data || [];
    } catch { return []; }
  }, []);

  const miniTaskContext = {
    inventoryItems: [],
    properties: [],
    propertyPagination: {},
    inventoryPagination: {},
    teamMembers,
    createTask: createTeamTask,
    updateTask: async () => { },
    fetchInventoryByProperty,
    fetchProperties: async () => { },
    fetchInventoryItems: async () => { },
    updateTaskCompletionStatus: async () => { },
  };

  const handlePurchaseTask = (item) => {
    setPurchaseTask({
      title: `Purchase ${item.name}`,
      description: '',
      property: { id: item.property_id, name: item.property_name },
      property_id: item.property_id,
      inventory_details: { id: item.id, name: item.name },
      inventory_id: item.id,
      schedule: { type: 'fixed_dates' },
      requires_photo: true,
      allows_inventory_update: true,
    });
    setPurchaseDialogOpen(true);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, membersRes] = await Promise.all([
          getTeamDashboard(trendDays),
          getTeamsTeamMembers().catch(() => ({ data: [] }))
        ]);
        if (dashRes.success) {
          setData(dashRes.data);
        } else {
          setError('Failed to load dashboard data');
        }
        setTeamMembers(membersRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Refetch only chart data when trendDays changes (skip initial load)
  useEffect(() => {
    if (!data) return;
    const refetchTrend = async () => {
      try {
        setTrendLoading(true);
        const dashRes = await getTeamDashboard(trendDays);
        if (dashRes.success && dashRes.data.tasksDonePerDay) {
          setData(prev => ({ ...prev, tasksDonePerDay: dashRes.data.tasksDonePerDay }));
        }
      } catch (err) {
        console.error('Failed to refetch trend data:', err);
      } finally {
        setTrendLoading(false);
      }
    };
    refetchTrend();
  }, [trendDays]);

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

  const tickColor = theme.palette.text.secondary;
  const tooltipBg = theme.palette.background.paper;
  const tooltipBorder = theme.palette.divider;
  const tooltipLabelColor = theme.palette.text.primary;

  // ============================
  // SUPERVISOR VIEW
  // ============================
  if (data.viewType === 'supervisor') {
    const { stats, tasksDonePerDay, tasksPerStaff } = data;

    return (
      <React.Fragment>
        <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 2, sm: 3 } }}>
          {/* Welcome Banner */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Welcome, {user?.name || 'Supervisor'} 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.teamRole || 'Supervisor'} Dashboard — here's your overview
            </Typography>
          </Box>

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
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InventoryAlertCard
                fetchLowStock={getLowStockInventory}
                fetchNewInventory={getNewInventory}
                onPurchaseTask={canCreateTask ? handlePurchaseTask : undefined}
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{
                border: '1px solid', borderColor: 'divider', borderRadius: 2,
                p: 2, height: 450,
                transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', mb: 0.5 }}>
                      Tasks Trend Per Day
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last {trendDays} days trend
                    </Typography>
                  </Box>
                  <ToggleButtonGroup
                    value={trendDays}
                    exclusive
                    onChange={(e, val) => val !== null && setTrendDays(val)}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        px: 1.5, py: 0.25,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                      },
                    }}
                  >
                    <ToggleButton value={3}>3D</ToggleButton>
                    <ToggleButton value={7}>7D</ToggleButton>
                    <ToggleButton value={15}>15D</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
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
                        fill={theme.palette.taskStatus?.completed || theme.palette.success.main}
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="pending" name="Pending"
                        fill={theme.palette.taskStatus?.pending || theme.palette.warning.main}
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
                          fill={theme.palette.taskStatus?.completed || theme.palette.success.main}
                        />
                        <Bar
                          dataKey="pending_tasks" name="Pending" stackId="a"
                          fill={theme.palette.taskStatus?.pending || theme.palette.warning.main}
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

        {/* Purchase Task Dialog */}
        <TaskContext.Provider value={miniTaskContext}>
          <TileView_AddEdit_Dialog
            open={purchaseDialogOpen}
            onClose={() => setPurchaseDialogOpen(false)}
            task={purchaseTask}
            purchaseMode
          />
        </TaskContext.Provider>
      </React.Fragment>
    );
  }

  // ============================
  // STAFF VIEW
  // ============================
  const { stats, todayTasks, pendingTasks } = data;

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 2, sm: 3 } }}>
        {/* Welcome Banner */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Welcome, {user?.name || 'Team Member'} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's your task overview for today
          </Typography>
        </Box>

        {/* Task Lists */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <StaffTaskList
              fetchTodayTasks={getStaffTodayTasks}
              fetchPendingTasks={getStaffPendingTasks}
            />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default TeamsDashboard;