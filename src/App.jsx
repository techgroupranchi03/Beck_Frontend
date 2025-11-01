import React from "react";
import { Routes, Route } from "react-router-dom";
import PageNotFound from "./pages/PageNotFound.jsx";
import AdminRoutes from "./routes/admin/AdminRoutes.jsx";
import ClientsRoutes from "./routes/clients/ClientsRoutes.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/clients/*" element={<ClientsRoutes />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}