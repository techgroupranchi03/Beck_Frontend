import React, { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Box, Container, useTheme,
  Alert
} from "@mui/material";
import Loader from "../../resuable_components/Loader.jsx";
import {
  People, PersonAdd, PersonOff, TrendingUp,
} from "@mui/icons-material";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { StatCard } from "../../resuable_components/StatCard";
import { getAdminDashboard } from "../../service/Admin/Dashboard";

export default function Dashboard() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
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
    return <Loader sx={{ minHeight: 400 }} />;
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, px: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { stats, taskTrend, clientGrowth, statusDistribution } = data;

  // Pie chart colors
  const PIE_COLORS = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const tickColor = theme.palette.text.secondary;
  const tooltipBg = theme.palette.background.paper;
  const tooltipBorder = theme.palette.divider;
  const tooltipLabelColor = theme.palette.text.primary;

  // Format task trend data for chart
  const formattedTrend = (taskTrend || []).map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 2, sm: 3 } }}>
      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={People}
            iconColor="primary.contrastText"
            iconBgColor="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon={PersonAdd}
            iconColor="success.contrastText"
            iconBgColor="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inactive Clients"
            value={stats.inactiveClients}
            icon={PersonOff}
            iconColor="error.contrastText"
            iconBgColor="error.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="New / 30 Days"
            value={stats.newClients30Days}
            change="+new this month"
            changeType="positive"
            icon={TrendingUp}
            iconColor="info.contrastText"
            iconBgColor="info.main"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1: Tasks Created vs Executed */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{
            border: '1px solid', borderColor: 'divider', borderRadius: 2,
            p: 2, height: 420,
            transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', mb: 0.5 }}>
              Tasks Created vs Executed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Last 30 days trend
            </Typography>
            <Box sx={{ height: 310, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="date"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: tickColor }}
                    interval={4}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: tickColor }}
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
                  <Line
                    type="monotone" dataKey="tasks_created" name="Created"
                    stroke={theme.palette.info.main} strokeWidth={2.5}
                    dot={{ r: 3 }} activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone" dataKey="tasks_completed" name="Completed"
                    stroke={theme.palette.success.main} strokeWidth={2.5}
                    dot={{ r: 3 }} activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Status Distribution Pie */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{
            border: '1px solid', borderColor: 'divider', borderRadius: 2,
            p: 2, height: 420,
            transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', mb: 0.5 }}>
              Status Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Client status breakdown
            </Typography>
            <Box sx={{ height: 310, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%" cy="45%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ status, count }) => `${status}: ${count}`}
                    labelLine={{ stroke: tickColor, strokeWidth: 1 }}
                  >
                    {(statusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      padding: '12px 16px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2: Client Growth */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{
            border: '1px solid', borderColor: 'divider', borderRadius: 2,
            p: 2, height: 380,
            transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 6 },
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', mb: 0.5 }}>
              Client Growth
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              New client registrations over last 12 months
            </Typography>
            <Box sx={{ height: 280, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="label"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: tickColor }}
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
                    labelStyle={{ fontWeight: 600, color: tooltipLabelColor }}
                  />
                  <Bar
                    dataKey="new_clients" name="New Clients"
                    fill={theme.palette.primary.main}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
      </Container>
    </React.Fragment>
  );
}