import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Landing from './components/Landing';
import CreatorDashboard from './components/CreatorDashboard';
import ApproverADashboard from './components/ApproverADashboard';
import ApproverBDashboard from './components/ApproverBDashboard';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #101820 0%, #1a2742 100%)' }}>
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-white mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white mt-4 text-lg">Cargando Alicorp...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return (
        <Landing onLogin={() => setShowAuth(true)} />
      );
    }
    
    return <Login />;
  }

  console.log('User role:', user.role);

  const renderDashboard = () => {
    const validRoles = ['CREATOR', 'APPROVER_A', 'APPROVER_B', 'ADMIN'];
    
    if (!user.role || !validRoles.includes(user.role)) {
      console.error('Rol inválido:', user.role);
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #101820 0%, #1a2742 100%)' }}>
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold text-[#101820] mb-4">Error de configuración</h2>
            <p className="text-[#64748B] mb-4">Tu cuenta no tiene un rol asignado. Contacta al administrador.</p>
            <button 
              onClick={() => {
                localStorage.removeItem('contentSuite_user');
                window.location.reload();
              }}
              className="btn-primary"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      );
    }

    switch (user.role) {
      case 'CREATOR':
        return <CreatorDashboard />;
      case 'APPROVER_A':
        return <ApproverADashboard />;
      case 'APPROVER_B':
        return <ApproverBDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <CreatorDashboard />;
    }
  };

  return renderDashboard();
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}