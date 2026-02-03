import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import ReportLayout from './components/ReportLayout';
import RequireAdmin from './components/RequireAdmin';
import NewComplaintPage from './pages/NewComplaintPage';
import ComplaintsPage from './pages/ComplaintsPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import ConfirmationPage from './pages/ConfirmationPage';
import { applyTheme, getStoredTheme } from './services/themeService';

const App = () => {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/report" replace />} />
      <Route path="/report" element={<ReportLayout />}>
        <Route index element={<NewComplaintPage mode="report" />} />
        <Route path="confirmation/:id" element={<ConfirmationPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="new" element={<NewComplaintPage mode="admin" />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="confirmation/:id" element={<ConfirmationPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/report" replace />} />
    </Routes>
  );
};

export default App;
