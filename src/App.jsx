import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ViewModeProvider } from "./context/ViewModeContext.jsx";
import { CircularProgress, Box } from "@mui/material";

const AdminRoutes = lazy(() => import("./routes/admin/AdminRoutes.jsx"));
const ClientsRoutes = lazy(() => import("./routes/clients/ClientsRoutes.jsx"));
const TeamsRoutes = lazy(() => import("./routes/teams/TeamsRoutes.jsx"));
const CommingSoon = lazy(() => import("./CommingSoon.jsx"));
const PageNotFound = lazy(() => import("./PageNotFound.jsx"));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

export default function App() {
  return (
    <ViewModeProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/clients/login" replace />} /> */}
          <Route path="/" element={<CommingSoon />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/clients/*" element={<ClientsRoutes />} />
          <Route path="/teams/*" element={<TeamsRoutes />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </ViewModeProvider>
  );
}