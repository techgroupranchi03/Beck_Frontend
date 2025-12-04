import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../Layout.jsx';
import ClientsDashboard from '../../pages/clients/ClientsDashboard.jsx';
import PropertyManagement from '../../pages/clients/property/PropertyManagement.jsx';
import TeamManagement from '../../pages/clients/team/TeamManagement.jsx';
import Clients_login from '../../auth/clients/Clients_login.jsx';
import TaskList from '../../../Trash/TaskList.jsx'
import ProtectedRoute from '../ProtectedRoute.jsx';
import TaskManagement from '../../pages/clients/task/TaskManagement.jsx';
import InventoryManagement from '../../pages/clients/inventory/InventoryManagement.jsx';

const ClientsRoutes = () => (
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
      <Route path="team-management" element={<TeamManagement />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
      {/* <Route path="all-task" element={<TaskList />} /> */}
      {/* <Route path="task-management" element={<AllTask />} /> */}
    </Route>
  </Routes>
);

export default ClientsRoutes;

