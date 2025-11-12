import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../Layout.jsx'
import ClientsDashboard from '../../pages/clients/ClientsDashboard.jsx'
import PropertyManagement from '../../pages/clients/PropertyManagement.jsx'
import InventoryManagement from '../../pages/clients/InventoryManagement.jsx'
import TeamManagement from '../../pages/clients/TeamManagement.jsx'
import Clients_login from '../../auth/clients/Clients_login.jsx'

const ClientsRoutes = () => (
  <Routes>
    <Route path="/login" element={<Clients_login />} />
    <Route path="/" element={<Layout role="client" />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<ClientsDashboard />} />
      <Route path="property-management" element={<PropertyManagement />} />
      <Route path="inventory-management" element={<InventoryManagement />} />
      <Route path="team-management" element={<TeamManagement />} />
    </Route>
  </Routes>
)

export default ClientsRoutes
