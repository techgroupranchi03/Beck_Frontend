import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Teams_login from '../../auth/teams/Teams_login'
import ProtectedRoute from '../ProtectedRoute'
import TeamsDashboard from '../../pages/teams/TeamsDashboard'
import Layout from '../../Layout'
import TaskManagement from '../../pages/clients/task/TaskManagement'
import InventoryManagement from '../../pages/clients/inventory/InventoryManagement'
import PropertyManagement from '../../pages/clients/property/PropertyManagement'
import TeamManagement from '../../pages/clients/team/TeamManagement'

const TeamsRoutes = () => {
    return (
        <Routes>
            {/* public routes - login page  */}
            <Route path="/login" element={<Teams_login />} />

            {/* protected routes - require team authentication */}
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredRole="team">
                        <Layout role="team" />
                    </ProtectedRoute>
                }
            >
                {/* nested routes inside Layout */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<TeamsDashboard />} />
                <Route path="task-management/*" element={<TaskManagement />} />
                <Route path="inventory-management" element={<InventoryManagement />} />
                <Route path="property-management" element={<PropertyManagement />} />
                <Route path="team-management" element={<TeamManagement />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    )
}

export default TeamsRoutes