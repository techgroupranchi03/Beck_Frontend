import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import Layout from '../../Layout'
import { CircularProgress, Box } from '@mui/material'

const Teams_login = lazy(() => import('../../auth/teams/Teams_login'))
const TeamsDashboard = lazy(() => import('../../pages/teams/TeamsDashboard'))
const TaskManagement = lazy(() => import('../../pages/clients/task/TaskManagement'))
const InventoryManagement = lazy(() => import('../../pages/clients/inventory/InventoryManagement'))
const PropertyManagement = lazy(() => import('../../pages/clients/property/PropertyManagement'))
const TeamManagement = lazy(() => import('../../pages/clients/team/TeamManagement'))
const GroupTaskDetails = lazy(() => import('../../pages/clients/task/GroupTaskDetails'))
const TaskDetails = lazy(() => import('../../pages/clients/task/TaskDetails'))
const ThemeSettings = lazy(() => import('../../pages/ThemeSettings.jsx'))

const Loader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress />
  </Box>
)

const TeamsRoutes = () => {
    return (
        <Suspense fallback={<Loader />}>
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
                    <Route path="task-management" element={<TaskManagement />} />
                    <Route path="task-management/group/:groupId" element={<GroupTaskDetails />} />
                    <Route path="task-management/task/:taskId" element={<TaskDetails />} />
                    <Route path="inventory-management" element={<InventoryManagement />} />
                    <Route path="property-management" element={<PropertyManagement />} />
                    <Route path="team-management" element={<TeamManagement />} />
                    <Route path="themeSetting" element={<ThemeSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

export default TeamsRoutes