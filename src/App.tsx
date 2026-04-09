/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { ServiceStatus } from "./pages/ServiceStatus";
import { Catalog } from "./pages/Catalog";
import { PCBuilder } from "./pages/PCBuilder";
import { Service } from "./pages/Service";
import { Location } from "./pages/Location";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PresenceTracker } from "./components/PresenceTracker";

// Admin
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminTickets } from "./pages/admin/AdminTickets";
import { AdminServices } from "./pages/admin/AdminServices";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminSettings } from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <ErrorBoundary>
      <PresenceTracker />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="katalog" element={<Catalog />} />
            <Route path="rakit-pc" element={<PCBuilder />} />
            <Route path="servis" element={<Service />} />
            <Route path="lokasi" element={<Location />} />
            <Route path="cek-status" element={<ServiceStatus />} />
            <Route path="*" element={<div className="container mx-auto px-4 py-24 text-center text-slate-400">Halaman sedang dalam pengembangan.</div>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
