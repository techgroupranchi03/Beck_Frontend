import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../Layout.jsx';
import ProtectedRoute from '../ProtectedRoute.jsx';
import { CircularProgress, Box } from '@mui/material';

const ClientsDashboard = lazy(() => import('../../pages/clients/ClientsDashboard.jsx'));
const PropertyManagement = lazy(() => import('../../pages/clients/property/PropertyManagement.jsx'));
const TeamManagement = lazy(() => import('../../pages/clients/team/TeamManagement.jsx'));
const Clients_login = lazy(() => import('../../auth/clients/Clients_login.jsx'));
const TaskManagement = lazy(() => import('../../pages/clients/task/TaskManagement.jsx'));
const InventoryManagement = lazy(() => import('../../pages/clients/inventory/InventoryManagement.jsx'));
const GroupTaskDetails = lazy(() => import('../../pages/clients/task/GroupTaskDetails.jsx'));
const TaskDetails = lazy(() => import('../../pages/clients/task/TaskDetails.jsx'));
const ThemeSettings = lazy(() => import('../../pages/ThemeSettings.jsx'));

const Loader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress />
  </Box>
);

const ClientsRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {/* Public route - Login page */}
      <Route path="/login" element={<Clients_login />} />

      {/* Protected routes - Require client authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="client">
            <Layout role="client" />
          </ProtectedRoute>
        }
      >
        {/* Nested routes inside Layout */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientsDashboard />} />
        <Route path="property-management" element={<PropertyManagement />} />
        <Route path="inventory-management" element={<InventoryManagement />} />
        <Route path="task-management" element={<TaskManagement />} />
        <Route path="task-management/group/:groupTaskName" element={<GroupTaskDetails />} />
        <Route path="task-management/task/:taskName" element={<TaskDetails />} />
        <Route path="team-management" element={<TeamManagement />} />
        <Route path="themeSetting" element={<ThemeSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
        {/* <Route path="all-task" element={<TaskList />} /> */}
        {/* <Route path="task-management" element={<AllTask />} /> */}
      </Route>
    </Routes>
  </Suspense>
);

export default ClientsRoutes;

