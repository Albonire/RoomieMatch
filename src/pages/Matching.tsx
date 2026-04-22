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
        <div className="editorial-card p-12 space-y-8">
          <div className="bg-editorial-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-editorial-accent" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-display font-medium text-editorial-ink tracking-tight">Completa tu perfil</h2>
            <p className="font-sans text-sm text-editorial-tertiary leading-relaxed">Para encontrar compañeros compatibles, necesitas completar tus preferencias de compatibilidad en tu perfil.</p>
          </div>
          <Link to="/profile" className="editorial-btn editorial-btn-primary inline-flex">
            Ir al Perfil <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-editorial-secondary/40 pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-editorial-ink tracking-tight leading-none mb-4">Compatibilidad</h1>
          <p className="font-sans text-editorial-tertiary text-lg">Encuentra a tu roommate ideal basado en tus preferencias</p>
        </div>
        <div className="bg-editorial-surface px-6 py-3 border border-editorial-secondary/60 shadow-editorial flex items-center space-x-3 rounded-sm">
          <Users className="w-5 h-5 text-editorial-accent" />
          <span className="font-display font-medium text-lg tracking-tight text-editorial-ink">{matches.length} Coincidencias</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {matches.map(match => (
          <div key={match.id} className="editorial-card overflow-hidden group">
            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="p-1 bg-editorial-surface rounded-full shadow-sm border border-editorial-secondary/40">
                  <Avatar photoUrl={match.photo_url} className="w-24 h-24 rounded-full border-0" iconClassName="w-12 h-12" />
                </div>
                <div className="absolute -top-2 -right-2 bg-editorial-accent text-white w-12 h-12 rounded-full flex items-center justify-center font-sans font-medium text-sm shadow-sm">
                  {match.score}%
                </div>
              </div>
              <div className="space-y-2 w-full">
                <h3 className="font-display font-medium text-xl text-editorial-ink tracking-tight flex items-center justify-center">
                  {match.name}
                  <CheckCircle className="w-4 h-4 ml-2 text-emerald-500" />
                </h3>
                <p className="font-sans text-[11px] text-editorial-tertiary">{match.university}</p>
                <div className="mt-4 w-full bg-editorial-secondary/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-editorial-accent h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${match.score}%` }}></div>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <Link to={`/profile/${match.id}`} className="editorial-btn w-full flex items-center justify-center group/btn">
                Ver Perfil <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
