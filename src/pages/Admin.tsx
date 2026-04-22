import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Trash2, AlertCircle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  is_verified: number;
}

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchListings();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setUsers(await res.json());
    else setError('Acceso no autorizado');
  };

  const fetchListings = async () => {
    const res = await fetch('/api/listings');
    setListings(await res.json());
  };

  const toggleVerify = async (id: number, current: number) => {
    await fetch(`/api/admin/verify/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_verified: !current })
    });
    fetchUsers();
  };

  const deleteListing = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;
    await fetch(`/api/listings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchListings();
  };

  if (error) return (
    <div className="text-center py-20">
      <div className="brutal-card bg-white p-12 inline-block shadow-brutal">
        <AlertCircle className="w-16 h-16 text-[#D5A2A2] mx-auto mb-6" />
        <h2 className="text-3xl font-display font-medium text-brutal-ink tracking-tight">{error}</h2>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brutal-ink/10 pb-8">
        <div className="flex items-center space-x-4">
          <ShieldCheck className="w-12 h-12 text-brutal-accent" />
          <h1 className="text-5xl font-display font-medium text-brutal-ink tracking-tight leading-none">Panel Admin</h1>
        </div>
        <p className="font-sans text-sm text-gray-400">Gestión de usuarios y publicaciones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* User Management */}
        <div className="space-y-8">
          <h2 className="text-2xl font-display font-medium text-brutal-ink flex items-center tracking-tight">
            <UserCheck className="w-6 h-6 mr-3 text-brutal-accent" /> Usuarios
          </h2>
          <div className="brutal-card bg-white overflow-hidden p-0 shadow-brutal">
            <table className="w-full text-left border-collapse">
              <thead className="bg-brutal-ink text-white font-sans text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 border-r border-white/10">Usuario</th>
                  <th className="px-6 py-4 border-r border-white/10">Estado</th>
                  <th className="px-6 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brutal-ink/10">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-brutal-bg transition-colors">
                    <td className="px-6 py-6 border-r border-brutal-ink/10">
                      <div className="font-display font-medium text-base tracking-tight text-brutal-ink">{user.name}</div>
                      <div className="font-sans text-xs text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-6 border-r border-brutal-ink/10">
                      <span className={`px-3 py-1 border border-brutal-ink/10 font-sans text-[10px] font-medium uppercase tracking-widest shadow-brutal ${
                        user.is_verified ? 'bg-brutal-accent text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {user.is_verified ? 'Verificado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <button
                        onClick={() => toggleVerify(user.id, user.is_verified)}
                        className={`font-sans text-[10px] font-medium uppercase tracking-widest px-3 py-2 border border-brutal-ink/10 shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all ${
                          user.is_verified ? 'bg-[#D5A2A2]/10 text-[#8B5E5E]' : 'bg-brutal-accent/10 text-brutal-accent'
                        }`}
                      >
                        {user.is_verified ? 'Revocar' : 'Verificar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Listing Management */}
        <div className="space-y-8">
          <h2 className="text-2xl font-display font-medium text-brutal-ink flex items-center tracking-tight">
            <Trash2 className="w-6 h-6 mr-3 text-[#D5A2A2]" /> Publicaciones
          </h2>
          <div className="brutal-card bg-white overflow-hidden p-0 shadow-brutal">
            <table className="w-full text-left border-collapse">
              <thead className="bg-brutal-ink text-white font-sans text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 border-r border-white/10">Publicación</th>
                  <th className="px-6 py-4 border-r border-white/10">Precio</th>
                  <th className="px-6 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brutal-ink/10">
                {listings.map(listing => (
                  <tr key={listing.id} className="hover:bg-brutal-bg transition-colors">
                    <td className="px-6 py-6 border-r border-brutal-ink/10">
                      <div className="font-display font-medium text-base tracking-tight text-brutal-ink truncate max-w-[200px]">{listing.title}</div>
                      <div className="font-sans text-xs text-gray-400">{listing.zone_name}</div>
                    </td>
                    <td className="px-6 py-6 border-r border-brutal-ink/10 font-display font-medium text-lg text-brutal-ink">${listing.price.toLocaleString()}</td>
                    <td className="px-6 py-6">
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="p-3 border border-brutal-ink/10 bg-[#D5A2A2]/10 text-[#8B5E5E] shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
