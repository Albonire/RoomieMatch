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
      <div className="editorial-card p-12 inline-block">
        <AlertCircle className="w-14 h-14 text-rose-400 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-medium text-editorial-ink tracking-tight">{error}</h2>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-editorial-secondary/40 pb-8">
        <div className="flex items-center space-x-4">
          <ShieldCheck className="w-10 h-10 text-editorial-accent" />
          <h1 className="text-4xl font-display font-medium text-editorial-ink tracking-tight leading-none">Panel Admin</h1>
        </div>
        <p className="font-sans text-sm text-editorial-tertiary">Gestión de usuarios y publicaciones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* User Management */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-medium text-editorial-ink flex items-center tracking-tight">
            <UserCheck className="w-5 h-5 mr-3 text-editorial-accent" /> Usuarios
          </h2>
          <div className="editorial-card overflow-hidden p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-editorial-ink text-white font-sans text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-r border-white/10">Usuario</th>
                  <th className="px-6 py-3 border-r border-white/10">Estado</th>
                  <th className="px-6 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-secondary/30">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-editorial-bg transition-colors">
                    <td className="px-6 py-5 border-r border-editorial-secondary/20">
                      <div className="font-display font-medium text-sm tracking-tight text-editorial-ink">{user.name}</div>
                      <div className="font-sans text-xs text-editorial-tertiary">{user.email}</div>
                    </td>
                    <td className="px-6 py-5 border-r border-editorial-secondary/20">
                      <span className={`px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-wider rounded-sm ${
                        user.is_verified ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-editorial-secondary/20 text-editorial-tertiary border border-editorial-secondary/30'
                      }`}>
                        {user.is_verified ? 'Verificado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => toggleVerify(user.id, user.is_verified)}
                        className={`font-sans text-[10px] font-medium uppercase tracking-wider px-3 py-1.5 border rounded-sm transition-all ${
                          user.is_verified ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' : 'bg-editorial-accent/5 border-editorial-accent/20 text-editorial-accent hover:bg-editorial-accent/10'
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
        <div className="space-y-6">
          <h2 className="text-xl font-display font-medium text-editorial-ink flex items-center tracking-tight">
            <Trash2 className="w-5 h-5 mr-3 text-rose-400" /> Publicaciones
          </h2>
          <div className="editorial-card overflow-hidden p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-editorial-ink text-white font-sans text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-r border-white/10">Publicación</th>
                  <th className="px-6 py-3 border-r border-white/10">Precio</th>
                  <th className="px-6 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-secondary/30">
                {listings.map(listing => (
                  <tr key={listing.id} className="hover:bg-editorial-bg transition-colors">
                    <td className="px-6 py-5 border-r border-editorial-secondary/20">
                      <div className="font-display font-medium text-sm tracking-tight text-editorial-ink truncate max-w-[200px]">{listing.title}</div>
                      <div className="font-sans text-xs text-editorial-tertiary">{listing.zone_name}</div>
                    </td>
                    <td className="px-6 py-5 border-r border-editorial-secondary/20 font-display font-medium text-base text-editorial-ink">${listing.price.toLocaleString()}</td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="p-2 border border-rose-200 bg-rose-50 text-rose-600 rounded-sm hover:bg-rose-100 transition-all"
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
