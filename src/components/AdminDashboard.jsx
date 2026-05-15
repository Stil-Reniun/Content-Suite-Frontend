import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalBrands: 12,
    totalContents: 45,
    pendingApproval: 8,
    approved: 32,
    rejected: 5
  });

  const [users, setUsers] = useState([
    { id: '1', full_name: 'Juan Pérez', email: 'juan@alicorp.com', role: 'CREATOR', is_active: true },
    { id: '2', full_name: 'María García', email: 'maria@alicorp.com', role: 'APPROVER_A', is_active: true },
    { id: '3', full_name: 'Carlos López', email: 'carlos@alicorp.com', role: 'APPROVER_B', is_active: true },
    { id: '4', full_name: 'Ana Martínez', email: 'ana@alicorp.com', role: 'CREATOR', is_active: true },
    { id: '5', full_name: 'Pedro Sánchez', email: 'pedro@alicorp.com', role: 'APPROVER_A', is_active: false },
  ]);

  const [contents, setContents] = useState([
    { id: '1', prompt: 'Descripción snack quinoa', brand: 'Brand 1', status: 'pending', created_at: '2026-05-13' },
    { id: '2', prompt: 'Guión video promocional', brand: 'Brand 1', status: 'approved', created_at: '2026-05-12' },
    { id: '3', prompt: 'Copy Instagram', brand: 'Brand 2', status: 'rejected', created_at: '2026-05-11' },
    { id: '4', prompt: 'Banner web', brand: 'Brand 3', status: 'approved', created_at: '2026-05-10' },
  ]);

  const getRoleBadge = (role) => {
    const badges = {
      CREATOR: { class: 'bg-purple-100 text-purple-700', label: 'Creador' },
      APPROVER_A: { class: 'bg-blue-100 text-blue-700', label: 'Aprobador A' },
      APPROVER_B: { class: 'bg-green-100 text-green-700', label: 'Aprobador B' },
      ADMIN: { class: 'bg-red-100 text-red-700', label: 'Administrador' }
    };
    return badges[role] || badges.CREATOR;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pendiente' },
      approved: { class: 'status-approved', text: 'Aprobado' },
      rejected: { class: 'status-rejected', text: 'Rechazado' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://www.alicorp.com.pe/images/logo-alicorp-header.svg" 
              alt="Alicorp" 
              className="h-8"
            />
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              ADMINISTRADOR
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-[#101820]">{user.full_name}</p>
              <p className="text-xs text-[#64748B]">{user.email}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Total Brands</p>
                <p className="text-3xl font-bold text-[#101820]">{stats.totalBrands}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Total Contenidos</p>
                <p className="text-3xl font-bold text-[#101820]">{stats.totalContents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Pendientes</p>
                <p className="text-3xl font-bold text-[#101820]">{stats.pendingApproval}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Aprobados</p>
                <p className="text-3xl font-bold text-[#101820]">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <nav className="w-56 shrink-0">
            <div className="card p-4 space-y-2 sticky top-24">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'overview' ? 'bg-[#EEF2FF] text-[#0D6EFD]' : 'text-[#64748B] hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'users' ? 'bg-[#EEF2FF] text-[#0D6EFD]' : 'text-[#64748B] hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('contents')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'contents' ? 'bg-[#EEF2FF] text-[#0D6EFD]' : 'text-[#64748B] hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Contenidos
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'settings' ? 'bg-[#EEF2FF] text-[#0D6EFD]' : 'text-[#64748B] hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </button>
            </div>
          </nav>

          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[#101820] mb-6">Resumen del Sistema</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-[#101820] mb-2">Actividad Reciente</h3>
                    <ul className="space-y-2 text-sm text-[#64748B]">
                      <li>• 5 nuevos contenidos generados hoy</li>
                      <li>• 3 contenidos aprobados</li>
                      <li>• 2 auditorías de imagen completadas</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-[#101820] mb-2">Usuarios por Rol</h3>
                    <ul className="space-y-2 text-sm text-[#64748B]">
                      <li>• Creadores: 8</li>
                      <li>• Aprobadores A: 4</li>
                      <li>• Aprobadores B: 3</li>
                      <li>• Administradores: 2</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#101820]">Gestión de Usuarios</h2>
                  <button className="btn-primary text-sm">
                    + Nuevo Usuario
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Usuario</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Rol</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const badge = getRoleBadge(u.role);
                        return (
                          <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-[#101820]">{u.full_name}</td>
                            <td className="py-3 px-4 text-[#64748B]">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {u.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-[#0D6EFD] hover:underline text-sm">Editar</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'contents' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[#101820] mb-6">Todos los Contenidos</h2>
                <div className="space-y-3">
                  {contents.map((content) => {
                    const status = getStatusBadge(content.status);
                    return (
                      <div key={content.id} className="p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#101820]">{content.prompt}</p>
                          <p className="text-sm text-[#64748B]">{content.brand} • {content.created_at}</p>
                        </div>
                        <span className={`status-badge ${status.class}`}>{status.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[#101820] mb-6">Configuración del Sistema</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="font-medium text-[#101820] mb-2">Configuración General</h3>
                    <p className="text-sm text-[#64748B]">Nombre de la empresa: Alicorp</p>
                    <p className="text-sm text-[#64748B]">API URL: https://backend-fastapi-it4axo2unq-uc.a.run.app</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="font-medium text-[#101820] mb-2">Roles disponibles</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">CREATOR</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">APPROVER_A</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">APPROVER_B</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">ADMIN</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}