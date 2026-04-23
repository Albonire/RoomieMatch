import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { MapPin, Calendar, Users, Star, Shield, Info, MessageSquare, Send } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Rating {
  id: number;
  stars: number;
  comment: string;
  user_name: string;
  user_photo: string;
  created_at: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  address: string;
  price: number;
  available_from: string;
  max_occupants: number;
  photos: string[];
  rules: string;
  zone_name: string;
  safety_level: string;
  owner_name: string;
  owner_photo: string;
  user_id: number;
  lat: number;
  lng: number;
  ratings: Rating[];
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [newRating, setNewRating] = useState({ stars: 5, comment: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (data) setListing(data);
    } catch (e) {
      console.error('Error fetching listing:', e);
    }
  };

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`/api/listings/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRating)
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setNewRating({ stars: 5, comment: '' });
        fetchListing();
      } else {
        setError(data.error || 'Error al calificar');
      }
    } catch (e) {
      setError('Error de conexión');
    }
  };

  if (!listing) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center space-y-4 opacity-60">
        <div className="w-10 h-10 border-2 border-editorial-secondary border-t-editorial-ink rounded-full animate-spin"></div>
        <span className="font-display text-lg italic text-editorial-tertiary">Cargando...</span>
      </div>
    </div>
  );

  const avgRating = listing.ratings.length > 0
    ? (listing.ratings.reduce((acc, r) => acc + r.stars, 0) / listing.ratings.length).toFixed(1)
    : null;

  const getSafetyStyle = (level: string) => {
    switch (level) {
      case 'green': return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50';
      case 'yellow': return 'bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700/50';
      case 'red': return 'bg-rose-50 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700/50';
      default: return 'bg-editorial-secondary/30 text-editorial-tertiary border-editorial-secondary';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-sm overflow-hidden">
        <div className="md:col-span-2 aspect-video overflow-hidden">
          <img 
            src={listing.photos[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80'} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]" 
            referrerPolicy="no-referrer" 
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
          {[1, 2].map((idx) => (
            <div key={idx} className="aspect-square overflow-hidden">
              <img 
                src={listing.photos[idx] || `https://images.unsplash.com/photo-${['7pCFUybP_P8', 'i9Lp1hd5M-c'][idx-1]}?w=600&q=80`} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]" 
                referrerPolicy="no-referrer" 
              />
            </div>
          ))}
          {listing.photos.length < 2 && <div className="bg-editorial-secondary/20 flex items-center justify-center text-editorial-tertiary font-sans text-xs">No hay más fotos</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-14">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight leading-[1.1] text-editorial-ink">
                {listing.title}
              </h1>
              {avgRating && (
                <div className="flex items-center text-editorial-accent font-display text-3xl font-medium">
                  <Star className="w-7 h-7 mr-2 fill-current" />
                  {avgRating}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="editorial-tag border-editorial-secondary text-editorial-tertiary"><MapPin className="w-3.5 h-3.5 mr-2 text-editorial-tertiary/60" /> {listing.address}</div>
              <div className="editorial-tag border-editorial-secondary text-editorial-tertiary"><Calendar className="w-3.5 h-3.5 mr-2 text-editorial-tertiary/60" /> {new Date(listing.available_from).toLocaleDateString()}</div>
              <div className="editorial-tag border-editorial-secondary text-editorial-tertiary"><Users className="w-3.5 h-3.5 mr-2 text-editorial-tertiary/60" /> {listing.max_occupants} Ocupantes</div>
              <div className={`editorial-tag ${getSafetyStyle(listing.safety_level)}`}>
                <Shield className="w-3.5 h-3.5 mr-2" /> Zona {listing.zone_name}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-medium tracking-tight text-editorial-ink flex items-center">
              <Info className="w-5 h-5 mr-3 text-editorial-accent" /> Descripción
            </h2>
            <p className="text-editorial-ink/70 leading-relaxed whitespace-pre-wrap font-sans pl-8">{listing.description}</p>
          </div>

          {/* Rules */}
          <div className="editorial-card p-8 bg-editorial-bg/50 border-dashed border-editorial-secondary">
            <h2 className="text-lg font-display font-medium tracking-tight text-editorial-ink mb-4">Reglas del Espacio</h2>
            <p className="text-editorial-ink/60 italic font-display text-xl leading-relaxed">"{listing.rules}"</p>
          </div>

          {/* Map */}
          <div className="editorial-card overflow-hidden h-[400px] relative z-0">
            <MapContainer 
              center={[listing.lat || 7.37, listing.lng || -72.64]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[listing.lat || 7.37, listing.lng || -72.64]}>
                <Popup>
                  <div className="font-sans font-medium text-xs">{listing.title}</div>
                  <div className="text-[10px] font-sans text-gray-500">{listing.address}</div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Ratings & Comments */}
          <div className="space-y-8">
            <h2 className="text-2xl font-display font-medium tracking-tight text-editorial-ink flex items-center">
              <MessageSquare className="w-5 h-5 mr-3 text-editorial-accent" /> Comentarios
              {listing.ratings.length > 0 && <span className="ml-3 text-sm text-editorial-tertiary font-sans font-normal">({listing.ratings.length})</span>}
            </h2>
            
            {user && (
              <form onSubmit={handleRate} className="editorial-card p-8 space-y-6">
                <div className="flex items-center space-x-6">
                  <span className="editorial-label mb-0">Tu Calificación</span>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating({ ...newRating, stars: s })}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          newRating.stars >= s ? 'bg-editorial-accent text-white border-editorial-accent shadow-sm scale-110' : 'bg-transparent text-editorial-secondary border-editorial-secondary hover:border-editorial-tertiary'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Comparte tu experiencia..."
                  value={newRating.comment}
                  onChange={e => setNewRating({ ...newRating, comment: e.target.value })}
                  className="editorial-input min-h-[120px] border border-editorial-secondary rounded-sm p-4"
                />
                {error && <p className="text-rose-600 font-sans text-xs">{error}</p>}
                <button type="submit" className="editorial-btn editorial-btn-accent">
                  <Send className="w-4 h-4 mr-2" /> Publicar
                </button>
              </form>
            )}

            <div className="space-y-4">
              {listing.ratings.map(r => (
                <div key={r.id} className="editorial-card p-6 flex space-x-5">
                  <Avatar photoUrl={r.user_photo} className="w-11 h-11 border border-editorial-secondary rounded-full shadow-sm" iconClassName="w-5 h-5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-medium text-base text-editorial-ink">{r.user_name}</span>
                      <div className="flex items-center text-editorial-accent text-sm font-sans font-medium">
                        <Star className="w-4 h-4 mr-1 fill-current" /> {r.stars}
                      </div>
                    </div>
                    <p className="text-editorial-ink/60 font-sans text-sm leading-relaxed">{r.comment}</p>
                    <span className="font-sans text-[10px] text-editorial-tertiary">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {listing.ratings.length === 0 && (
                <p className="text-editorial-tertiary font-sans text-sm py-8 text-center">Aún no hay comentarios. ¡Sé el primero!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="editorial-card p-8 sticky top-28">
            <div className="space-y-8">
              <div className="space-y-1">
                <span className="editorial-label">Precio Mensual</span>
                <div className="text-4xl font-display font-medium text-editorial-ink tracking-tight">${listing.price.toLocaleString()}</div>
              </div>
              
              <div className="pt-8 border-t border-editorial-secondary/40">
                <p className="editorial-label mb-4">Publicado por</p>
                <Link to={`/profile/${listing.user_id}`} className="flex items-center space-x-4 group">
                  <Avatar photoUrl={listing.owner_photo} className="w-12 h-12 border border-editorial-secondary rounded-full shadow-sm" iconClassName="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-display font-medium text-base tracking-tight group-hover:text-editorial-accent transition-colors">{listing.owner_name}</div>
                    <div className="font-sans text-[10px] text-editorial-tertiary">Ver Perfil →</div>
                  </div>
                </Link>
              </div>

              <button className="editorial-btn editorial-btn-primary w-full py-3">
                Contactar Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
