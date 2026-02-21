// import React from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import Layout from '../../Layout.jsx'
// import Dashboard from '../../pages/admin/Dashboard.jsx'
// import Clients from '../../pages/admin/Clients.jsx'
// import Admin_login from '../../auth/admin/Admin_login.jsx'

// const AdminRoutes = () => (
//   <Routes>
//     <Route path="/login" element={<Admin_login />} />
//     <Route path="/" element={<Layout role="admin" />}>
//       <Route index element={<Navigate to="dashboard" replace />} />
//       <Route path="dashboard" element={<Dashboard />} />
//       <Route path="clients" element={<Clients />} />
//     </Route>
//   </Routes>
// )

// export default AdminRoutes



import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../Layout.jsx';
import Dashboard from '../../pages/admin/Dashboard.jsx';
import ClientsManagement from '../../pages/admin/ClientsManagement.jsx';
import Admin_login from '../../auth/admin/Admin_login.jsx';
import ProtectedRoute from '../ProtectedRoute.jsx';
import ThemeSettings from '../../pages/ThemeSettings.jsx';

const AdminRoutes = () => (
  <Routes>
    {/* Public route - Login page */}
    <Route path="/login" element={<Admin_login />} />
    
    {/* Protected routes - Require admin authentication */}
    <Route
      path="/"
      element={
        <ProtectedRoute requiredRole="admin">
          <Layout role="admin" />
        </ProtectedRoute>
      }
    >
      {/* Nested routes inside Layout */}
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="clients" element={<ClientsManagement />} />
      <Route path="themeSetting" element={<ThemeSettings />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);

export default AdminRoutes;