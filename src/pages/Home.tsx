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
      case 'green': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'yellow': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'red': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-editorial-secondary/30 border-editorial-secondary text-editorial-tertiary';
    }
  };

  return (
    <div className="space-y-12">
      <header className="mb-20 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight leading-[1.05] mb-8 text-editorial-ink">
          Encuentra tu <br />
          <span className="text-editorial-accent italic">Próximo Hogar</span>
        </h1>
        <p className="font-sans text-lg text-editorial-tertiary max-w-2xl leading-relaxed">
          Explora habitaciones y apartamentos en las mejores zonas de Pamplona. 
          Seguridad verificada por la comunidad con un enfoque minimalista y funcional.
        </p>
      </header>

      <div className="editorial-card p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <label className="editorial-label">Precio Mínimo</label>
            <input
              type="number"
              name="minPrice"
              placeholder="0"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="editorial-input px-0"
            />
          </div>
          <div>
            <label className="editorial-label">Precio Máximo</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="Cualquiera"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="editorial-input px-0"
            />
          </div>
          <div>
            <label className="editorial-label">Zona</label>
            <select
              name="zoneId"
              value={filters.zoneId}
              onChange={handleFilterChange}
              className="editorial-input px-0 appearance-none bg-transparent"
            >
              <option value="">Todas las Zonas</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="editorial-label">Disponible Desde</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="editorial-input px-0 text-editorial-tertiary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            to={`/listing/${listing.id}`}
            className="group editorial-card editorial-card-interactive flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-sm">
              <img
                src={listing.photos[0] || 'https://picsum.photos/seed/room/800/600'}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className={`editorial-tag backdrop-blur-md bg-editorial-surface/90 ${getSafetyColor(listing.safety_level)}`}>
                  {listing.zone_name}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 bg-editorial-bg text-editorial-ink px-3 py-1.5 font-sans font-medium text-xs tracking-wide shadow-sm rounded-sm">
                ${listing.price.toLocaleString()}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <h3 className="text-2xl font-display font-medium leading-tight group-hover:text-editorial-accent transition-colors text-editorial-ink">
                {listing.title}
              </h3>
              <div className="flex items-center text-[11px] font-sans text-editorial-tertiary">
                <MapPin className="w-3.5 h-3.5 mr-2 text-editorial-tertiary/70" />
                <span className="line-clamp-1">{listing.address}</span>
              </div>
              <div className="pt-6 border-t border-editorial-secondary/40 flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-5 font-sans text-[11px] text-editorial-tertiary">
                  <div className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-editorial-tertiary/60" />
                    {listing.max_occupants}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-editorial-tertiary/60" />
                    {new Date(listing.available_from).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center text-editorial-accent font-sans font-medium text-[11px] tracking-wide">
                  <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                  {listing.avg_rating ? listing.avg_rating.toFixed(1) : 'NEW'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {listings.length === 0 && (
        <div className="text-center py-32 editorial-card bg-editorial-bg/50 border-dashed">
          <p className="font-sans text-editorial-tertiary">No se encontraron publicaciones.</p>
        </div>
      )}
    </div>
  );
}
