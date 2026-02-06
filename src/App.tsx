import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import RequireAdmin from './components/RequireAdmin';
import SettingsPage from './pages/SettingsPage';
import StartPage from './pages/StartPage';
import SurveyPage from './pages/SurveyPage';
import SurveyThankYouPage from './pages/SurveyThankYouPage';
import SurveyDashboardPage from './pages/SurveyDashboardPage';
import SurveyResponsesPage from './pages/SurveyResponsesPage';
import SurveyResponseDetailPage from './pages/SurveyResponseDetailPage';
import SurveyComplaintsPage from './pages/SurveyComplaintsPage';
import { applyTheme, getStoredTheme } from './services/themeService';

const App = () => {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/survey/danke" element={<SurveyThankYouPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<SurveyDashboardPage />} />
        <Route path="responses" element={<SurveyResponsesPage />} />
        <Route path="responses/:id" element={<SurveyResponseDetailPage />} />
        <Route path="complaints" element={<SurveyComplaintsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
