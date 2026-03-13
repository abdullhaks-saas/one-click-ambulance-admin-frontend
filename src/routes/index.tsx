import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { DriverManagementPage } from '@/pages/admin/DriverManagementPage';
import { AmbulanceManagementPage } from '@/pages/admin/AmbulanceManagementPage';
import { ComingSoonPage } from '@/pages/admin/ComingSoonPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'drivers', element: <DriverManagementPage /> },
      { path: 'ambulances', element: <AmbulanceManagementPage /> },
      { path: 'bookings', element: <ComingSoonPage /> },
      { path: 'zones', element: <ComingSoonPage /> },
      { path: 'pricing', element: <ComingSoonPage /> },
      { path: 'analytics', element: <ComingSoonPage /> },
      { path: 'notifications', element: <ComingSoonPage /> },
      { path: 'settings', element: <ComingSoonPage /> },
      { path: '*', element: <ComingSoonPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin/login" replace />,
  },
]);
