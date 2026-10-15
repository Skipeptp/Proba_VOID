import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './authContext';
import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';

function App() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.role === 'CLIENT') return <ClientDashboard />;
  return <div>Панель для ролей {user.role}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
