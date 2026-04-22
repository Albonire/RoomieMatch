import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Users, Star } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  price: number;
  address: string;
  available_from: string;
  max_occupants: number;
  photos: string[];
  zone_name: string;
  safety_level: string;
  avg_rating: number | null;
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    zoneId: '',
    date: ''
  });

  useEffect(() => {
    fetchZones();
    fetchListings();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/zones');
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setZones(data);
    } catch (e) {
      console.error('Error fetching zones:', e);
    }
  };

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/listings?${params.toString()}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error fetching listings: ${res.status} ${res.statusText}`, errorText);
        return;
      }
      const data = await res.json();
      setListings(data);
    } catch (e) {
      console.error('Error fetching listings:', e);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'green': return 'bg-green-500 text-white border-green-600/20';
      case 'yellow': return 'bg-yellow-400 text-white border-yellow-500/20';
      case 'red': return 'bg-red-500 text-white border-red-600/20';
      default: return 'bg-gray-200 border-gray-300 text-gray-600';
    }
  };

  return (
    <div className="space-y-12">
      <header className="mb-20">
        <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight leading-[1.1] mb-8">
          Encuentra tu <br />
          <span className="text-brutal-accent italic">Próximo Hogar</span>
        </h1>
        <p className="font-sans text-lg text-gray-500 max-w-2xl leading-relaxed">
          Explora habitaciones y apartamentos en las mejores zonas de Pamplona. 
          Seguridad verificada por la comunidad con un enfoque minimalista y funcional.
        </p>
      </header>

      <div className="brutal-card p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <label className="brutal-label">Precio Mínimo</label>
            <input
              type="number"
              name="minPrice"
              placeholder="0"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="brutal-input"
            />
          </div>
          <div>
            <label className="brutal-label">Precio Máximo</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="Cualquiera"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="brutal-input"
            />
          </div>
          <div>
            <label className="brutal-label">Zona</label>
            <select
              name="zoneId"
              value={filters.zoneId}
              onChange={handleFilterChange}
              className="brutal-input appearance-none"
            >
              <option value="">Todas las Zonas</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="brutal-label">Disponible Desde</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="brutal-input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            to={`/listing/${listing.id}`}
            className="group brutal-card brutal-card-interactive overflow-hidden bg-white flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden border-b border-brutal-ink/10">
              <img
                src={listing.photos[0] || 'https://picsum.photos/seed/room/800/600'}
                alt={listing.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 border font-mono text-[9px] font-medium uppercase tracking-[0.15em] shadow-brutal ${getSafetyColor(listing.safety_level)}`}>
                  {listing.zone_name}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 bg-brutal-accent text-white px-4 py-1.5 font-display font-medium text-xs tracking-widest uppercase shadow-brutal">
                ${listing.price.toLocaleString()}
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col space-y-6">
              <h3 className="text-xl font-display font-medium leading-tight group-hover:text-brutal-accent transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center text-[10px] font-mono uppercase tracking-widest text-gray-400">
                <MapPin className="w-3 h-3 mr-2 text-brutal-accent/60" />
                <span className="line-clamp-1">{listing.address}</span>
              </div>
              <div className="pt-6 border-t border-brutal-ink/5 flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-6 font-mono text-[9px] uppercase tracking-widest text-gray-400">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2 text-brutal-ink/20" />
                    {listing.max_occupants}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2 text-brutal-ink/20" />
                    {new Date(listing.available_from).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center text-brutal-accent font-bold text-xs tracking-widest">
                  <Star className="w-3 h-3 mr-1.5 fill-current" />
                  {listing.avg_rating ? listing.avg_rating.toFixed(1) : 'NEW'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {listings.length === 0 && (
        <div className="text-center py-32 brutal-card bg-white/50 border-dashed">
          <p className="font-mono text-gray-500 uppercase tracking-widest">No se encontraron publicaciones.</p>
        </div>
      )}
    </div>
  );
}
