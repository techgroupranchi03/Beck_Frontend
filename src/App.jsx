import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout.jsx";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Admin_login from "./auth/admin/Admin_login.jsx";
import Clients_login from "./auth/clients/Clients_login.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Admin_login />} />
      <Route path="/clients/login" element={<Clients_login />} />
      <Route path="/*" element={<PageNotFound />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
      </Route>
    </Routes>
  );
}