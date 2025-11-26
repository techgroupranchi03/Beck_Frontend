import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PageNotFound from "./PageNotFound.jsx";
import AdminRoutes from "./routes/admin/AdminRoutes.jsx";
import ClientsRoutes from "./routes/clients/ClientsRoutes.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/clients/login" replace />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/clients/*" element={<ClientsRoutes />} />
      <Route path="*" element={<PageNotFound />} />
      
    </Routes>
  );
}