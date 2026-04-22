import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { Users, Heart, CheckCircle, ArrowRight } from 'lucide-react';

interface Match {
  id: number;
  name: string;
  photo_url: string;
  university: string;
  score: number;
}

export default function Matching() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matching', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      
      if (res.ok) {
        setMatches(data);
      } else {
        setError(data.error || 'Error al cargar coincidencias');
      }
    } catch (e) {
      setError('Error de conexión');
    }
  };

  if (error) {
    return (
      <div className="text-center py-20 space-y-8 max-w-2xl mx-auto">
        <div className="brutal-card bg-white p-12 space-y-8">
          <div className="bg-brutal-accent w-24 h-24 border-4 border-brutal-ink flex items-center justify-center mx-auto shadow-brutal">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black text-brutal-ink uppercase tracking-tighter">Completa tu perfil</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 leading-relaxed">Para encontrar compañeros compatibles, necesitas completar tus preferencias de compatibilidad en tu perfil.</p>
          </div>
          <Link to="/profile" className="brutal-btn brutal-btn-primary inline-flex">
            Ir al Perfil <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-brutal-ink/10 pb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-brutal-ink tracking-tight leading-none mb-6">Compatibilidad</h1>
          <p className="font-sans text-gray-400 text-lg">Encuentra a tu roommate ideal basado en tus preferencias</p>
        </div>
        <div className="bg-white px-8 py-4 border border-brutal-ink/10 shadow-brutal flex items-center space-x-4">
          <Users className="w-6 h-6 text-brutal-accent" />
          <span className="font-display font-medium text-xl tracking-tight text-brutal-ink">{matches.length} Coincidencias</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {matches.map(match => (
          <div key={match.id} className="brutal-card bg-white overflow-hidden group">
            <div className="p-10 flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="border border-brutal-ink/10 p-1 shadow-brutal bg-white">
                  <Avatar photoUrl={match.photo_url} className="w-28 h-28 border-0" iconClassName="w-14 h-14" />
                </div>
                <div className="absolute -top-4 -right-4 bg-brutal-accent text-white w-14 h-14 border-4 border-white flex items-center justify-center font-display font-bold text-lg shadow-brutal">
                  {match.score}%
                </div>
              </div>
              <div className="space-y-3 w-full">
                <h3 className="font-display font-medium text-2xl text-brutal-ink tracking-tight flex items-center justify-center">
                  {match.name}
                  <CheckCircle className="w-5 h-5 ml-2 text-brutal-secondary" />
                </h3>
                <p className="font-mono text-[9px] text-gray-400 uppercase tracking-[0.2em]">{match.university}</p>
                <div className="mt-6 w-full bg-brutal-bg border border-brutal-ink/5 h-2 shadow-inner overflow-hidden">
                  <div className="bg-brutal-accent h-full transition-all duration-1500 ease-out" style={{ width: `${match.score}%` }}></div>
                </div>
              </div>
            </div>
            <div className="px-10 pb-10">
              <Link to={`/profile/${match.id}`} className="brutal-btn w-full flex items-center justify-center group/btn">
                Ver Perfil <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
