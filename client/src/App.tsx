import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { setCredentials, logout } from './store/authSlice';
import { apiClient } from './api/axios';

import { LandingPage } from './features/public';
import { LoginPage, RegisterUserPage, RegisterProviderPage } from './features/auth';
import Layout from './layouts/Layout';

import { 
  AdminDashboard, 
  AdminUserManagement, 
  AdminFarmers, 
  AdminProviders, 
  AdminEquipment, 
  AdminLabour, 
  AdminBookings, 
  AdminPayments,
  ProviderDashboard, 
  LabourDashboard,
  ProviderPayments,
  ProviderEquipment,
  ProviderBookings,
  UserDashboard,
  UserBookings,
  ProfilePage,
  SettingsPage
} from './features/dashboard';
import { EquipmentListing, LabourListing } from './features/listings';
import { useNotifications } from './hooks/useNotifications';

export default function App() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(!!token && !user);

  // Initialize Background Notifications
  useNotifications();

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          const res = await apiClient.get('/auth/me');
          dispatch(setCredentials({ user: res.data, token }));
        } catch (error) {
          console.error("Session restoration failed:", error);
          dispatch(logout());
        } finally {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, [token, user, dispatch]);

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Synchronizing Agro-Tech Session...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register/user" element={<RegisterUserPage />} />
          <Route path="register/provider" element={<RegisterProviderPage />} />
          <Route path="equipment" element={<EquipmentListing />} />
          <Route path="labour" element={<LabourListing />} />
        </Route>

        {/* Protected Dashboard Routes (Un-nested from main Layout) */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<AdminUserManagement />} />
          <Route path="/dashboard/admin/farmers" element={<AdminFarmers />} />
          <Route path="/dashboard/admin/providers" element={<AdminProviders />} />
          <Route path="/dashboard/admin/equipment" element={<AdminEquipment />} />
          <Route path="/dashboard/admin/labour" element={<AdminLabour />} />
          <Route path="/dashboard/admin/bookings" element={<AdminBookings />} />
          <Route path="/dashboard/admin/payments" element={<AdminPayments />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
          <Route path="/dashboard/provider" element={<ProviderDashboard />} />
          <Route path="/dashboard/provider/equipment" element={<ProviderEquipment />} />
          <Route path="/dashboard/provider/payments" element={<ProviderPayments />} />
          <Route path="/dashboard/provider/bookings" element={<ProviderBookings />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['labour']} />}>
          <Route path="/dashboard/labour" element={<LabourDashboard />} />
          {/* Reusing provider sub-pages for now as they handle combined logic, or can create specific ones if needed */}
          <Route path="/dashboard/labour/payments" element={<ProviderPayments />} />
          <Route path="/dashboard/labour/bookings" element={<ProviderBookings />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/user/bookings" element={<UserBookings />} />
        </Route>

        {/* Unified Profile & Settings (Access controlled by content if needed) */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin', 'provider', 'labour', 'user']} />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Legacy Dashboard Redirects for robustness */}
        <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/provider" element={<Navigate to="/dashboard/provider" replace />} />

        {/* Catch-all dashboard redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
      </Routes>
    </Router>
  );
}

function DashboardRedirect() {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'superadmin') return <Navigate to="/dashboard/admin" replace />;
  if (user.role === 'provider') return <Navigate to="/dashboard/provider" replace />;
  if (user.role === 'labour') return <Navigate to="/dashboard/labour" replace />;
  return <Navigate to="/dashboard/user" replace />;
}
