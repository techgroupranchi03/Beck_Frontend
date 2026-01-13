import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PageNotFound from "./PageNotFound.jsx";
import AdminRoutes from "./routes/admin/AdminRoutes.jsx";
import ClientsRoutes from "./routes/clients/ClientsRoutes.jsx";
import { ViewModeProvider } from "./context/ViewModeContext.jsx";
import TeamsRoutes from "./routes/teams/TeamsRoutes.jsx";
import CommingSoon from "./CommingSoon.jsx";

export default function App() {
  return (
    <ViewModeProvider>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/clients/login" replace />} /> */}
        <Route path="/" element={<CommingSoon />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/clients/*" element={<ClientsRoutes />} />
        <Route path="/teams/*" element={<TeamsRoutes />} />
        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </ViewModeProvider>
  );
}