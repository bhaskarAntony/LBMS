import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LeadProvider } from './contexts/LeadContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import LeadManagement from './components/leads/LeadManagement';
import LeadDetails from './components/leads/LeadDetails';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WhatsappAutomation from './components/whatsapp/WhatsappAutomation';
import ReportsAnalytics from './components/reports/ReportsAnalytics';

function App() {
  return (
    <AuthProvider>
      <LeadProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<LeadManagement />} />
              <Route path="leads/:id" element={<LeadDetails />} />
              <Route path="whatsapp" element={<WhatsappAutomation />} />
              <Route path="reports" element={<ReportsAnalytics />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </LeadProvider>
    </AuthProvider>
  );
}

export default App;