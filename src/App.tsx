import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import PatientDashboard from "./pages/dashboard/PatientDashboard";

import QueueManagement from "./pages/admin/QueueManagement";
import UserManagement from "./pages/admin/UserManagement";
import PatientDatabase from "./pages/admin/PatientDatabase";

import Schedule from "./pages/doctor/Schedule";
import MedicalRecords from "./pages/doctor/MedicalRecords";
import TodayPatients from "./pages/doctor/TodayPatients";

import Registration from "./pages/patient/Registration";
import Consultation from "./pages/patient/Consultation";
import QueueStatus from "./pages/patient/QueueStatus";
import History from "./pages/patient/History";

import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  } else if (user?.role === 'dokter') {
    return <Navigate to="/dashboard/doctor" replace />;
  } else if (user?.role === 'pasien') {
    return <Navigate to="/dashboard/patient" replace />;
  }
  
  return <Navigate to="/auth" replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    
    <Route path="/dashboard" element={<DashboardRedirect />} />
    
    {/* Admin Routes */}
    <Route
      path="/dashboard/admin"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/admin/queue"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <QueueManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/admin/users"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ErrorBoundary>
            <UserManagement />
          </ErrorBoundary>
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/admin/patients"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PatientDatabase />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/admin/notifications"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Notifications />
        </ProtectedRoute>
      }
    />
    
    {/* Doctor Routes */}
    <Route
      path="/dashboard/doctor"
      element={
        <ProtectedRoute allowedRoles={['dokter', 'admin']}>
          <DoctorDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/doctor/schedule"
      element={
        <ProtectedRoute allowedRoles={['dokter', 'admin']}>
          <Schedule />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/doctor/medical-records"
      element={
        <ProtectedRoute allowedRoles={['dokter', 'admin']}>
          <MedicalRecords />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/doctor/patients"
      element={
        <ProtectedRoute allowedRoles={['dokter', 'admin']}>
          <TodayPatients />
        </ProtectedRoute>
      }
    />
    
    {/* Patient Routes */}
    <Route
      path="/dashboard/patient"
      element={
        <ProtectedRoute allowedRoles={['pasien', 'admin']}>
          <PatientDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/patient/registration"
      element={
        <ProtectedRoute allowedRoles={['pasien', 'admin']}>
          <Registration />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/patient/consultation"
      element={
        <ProtectedRoute allowedRoles={['pasien', 'admin']}>
          <Consultation />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/patient/queue"
      element={
        <ProtectedRoute allowedRoles={['pasien', 'admin']}>
          <QueueStatus />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/patient/history"
      element={
        <ProtectedRoute allowedRoles={['pasien', 'admin']}>
          <History />
        </ProtectedRoute>
      }
    />
    
    {/* Settings & Notifications - Shared across all roles */}
    <Route
      path="/dashboard/settings"
      element={
        <ProtectedRoute allowedRoles={['admin', 'dokter', 'pasien']}>
          <Settings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/notifications"
      element={
        <ProtectedRoute allowedRoles={['admin', 'dokter', 'pasien']}>
          <Notifications />
        </ProtectedRoute>
      }
    />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
