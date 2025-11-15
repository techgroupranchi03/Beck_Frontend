// import React from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import Layout from '../../Layout.jsx'
// import ClientsDashboard from '../../pages/clients/ClientsDashboard.jsx'
// import PropertyManagement from '../../pages/clients/property/PropertyManagement.jsx'
// import InventoryManagement from '../../pages/clients/inventory/InventoryManagement.jsx'
// import TeamManagement from '../../pages/clients/team/TeamManagement.jsx'
// import Clients_login from '../../auth/clients/Clients_login.jsx'
// import { TaskList } from '../../pages/clients/task/TaskList.jsx'

// const ClientsRoutes = () => (
//   <Routes>
//     <Route path="/login" element={<Clients_login />} />
//     <Route path="/" element={<Layout role="client" />}>
//       <Route index element={<Navigate to="dashboard" replace />} />
//       <Route path="dashboard" element={<ClientsDashboard />} />
//       <Route path="property-management" element={<PropertyManagement />} />
//       <Route path="inventory-management" element={<InventoryManagement />} />
//       <Route path="team-management" element={<TeamManagement />} />
//       <Route path="task-management" element={<TaskList />} />
//     </Route>
//   </Routes>
// )

// export default ClientsRoutes



import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../Layout.jsx';
import ClientsDashboard from '../../pages/clients/ClientsDashboard.jsx';
import PropertyManagement from '../../pages/clients/property/PropertyManagement.jsx';
import InventoryManagement from '../../pages/clients/inventory/InventoryManagement.jsx';
import TeamManagement from '../../pages/clients/team/TeamManagement.jsx';
import Clients_login from '../../auth/clients/Clients_login.jsx';
import { TaskList } from '../../pages/clients/task/TaskList.jsx';
import ProtectedRoute from '../ProtectedRoute.jsx';

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
      <Route path="team-management" element={<TeamManagement />} />
      <Route path="task-management" element={<TaskList />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);

export default ClientsRoutes;