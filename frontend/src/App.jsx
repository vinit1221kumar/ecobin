import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import TargetCursor from './components/TargetCursor';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import ResidentDashboard from './pages/ResidentDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TestJenkins from './pages/TestJenkins';

const AppRoutes = () => {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState({ isHealthy: true, showWarning: false });

  useEffect(() => {
    // Check API health on mount
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          setApiStatus({ isHealthy: false, showWarning: true });
        } else {
          setApiStatus({ isHealthy: true, showWarning: false });
        }
      } catch (error) {
        // Ignore abort errors (timeout) - just mark as unhealthy
        if (error.name !== 'AbortError') {
          setApiStatus({ isHealthy: false, showWarning: true });
        }
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {apiStatus.showWarning && !apiStatus.isHealthy && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 p-4 text-center"
          style={{ 
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}
        >
          <p className="m-0">
            ⚠️ Cannot connect to backend server. Please ensure the backend is running.
            <button
              onClick={() => setApiStatus({ isHealthy: true, showWarning: false })}
              className="ml-4 underline"
            >
              Dismiss
            </button>
          </p>
        </div>
      )}
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/test-jenkins" element={<TestJenkins />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register />} 
      />
      <Route 
        path="/admin/login" 
        element={user ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} 
      />
      <Route 
        path="/admin/register" 
        element={user ? <Navigate to="/admin/dashboard" replace /> : <AdminRegister />} 
      />
      <Route
        path="/resident/dashboard"
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <ResidentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/dashboard"
        element={
          <ProtectedRoute allowedRoles={['collector']}>
            <CollectorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <TargetCursor targetSelector="button, a, input, select, textarea, [role='button'], .cursor-target" />
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
