import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import NewComplaintPage from './pages/NewComplaintPage';
import ComplaintsPage from './pages/ComplaintsPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import ConfirmationPage from './pages/ConfirmationPage';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/new" element={<NewComplaintPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/confirmation/:id" element={<ConfirmationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
