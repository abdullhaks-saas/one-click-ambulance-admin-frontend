import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { DriverManagementPage } from '@/pages/admin/DriverManagementPage';
import { AmbulanceManagementPage } from '@/pages/admin/AmbulanceManagementPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { BookingManagementPage } from '@/pages/admin/BookingManagementPage';
import { RideManagementPage } from '@/pages/admin/RideManagementPage';
import { PricingManagementPage } from '@/pages/admin/PricingManagementPage';
import { ZoneManagementPage } from '@/pages/admin/ZoneManagementPage';
import { ComingSoonPage } from '@/pages/admin/ComingSoonPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { PaymentOverviewPage } from '@/pages/admin/PaymentOverviewPage';
import { DriverPayoutsPage } from '@/pages/admin/DriverPayoutsPage';

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
      { path: 'users', element: <UserManagementPage /> },
      { path: 'ambulances', element: <AmbulanceManagementPage /> },
      { path: 'bookings', element: <BookingManagementPage /> },
      { path: 'rides', element: <RideManagementPage /> },
      { path: 'pricing', element: <PricingManagementPage /> },
      { path: 'zones', element: <ZoneManagementPage /> },
      { path: 'payments', element: <PaymentOverviewPage /> },
      { path: 'payouts', element: <DriverPayoutsPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
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
