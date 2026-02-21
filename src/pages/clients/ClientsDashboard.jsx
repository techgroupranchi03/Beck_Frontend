import React from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'
import { StatCard } from '../../resuable_components/StatCard'
import { Apartment, CheckBox, Inventory, People } from '@mui/icons-material'
import TaskOverview from '../../resuable_components/TaskOverview'
import RecentActivity from '../../resuable_components/RecentActivity'

const ClientsDashboard = () => {
  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Properties"
              value={48}
              change="+3 this month"
              changeType="positive"
              icon={Apartment}
              iconColor="primary.contrastText"
              iconBgColor="primary.main"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Active Tasks"
              value={23}
              change="8 due today"
              changeType="neutral"
              icon={CheckBox}
              iconColor="warning.main"
              iconBgColor="warning.light"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Team Members"
              value={12}
              change="+2 this week"
              changeType="positive"
              icon={People}
              iconColor="success.main"
              iconBgColor="success.light"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Inventory Items"
              value={156}
              change="12 low stock"
              changeType="negative"
              icon={Inventory}
              iconColor="error.main"
              iconBgColor="error.light"
            />
          </Grid>


        </Grid>

        {/* Task Overview and Recent Activity */}
        <Grid container spacing={3}>
          <Grid size={{sm: 6}}>
            <TaskOverview />
          </Grid>
          
          <Grid size={{sm: 6}}>
            <RecentActivity />
          </Grid>
        </Grid>
                 
      </Container>
    </React.Fragment>
  )
}

export default ClientsDashboard