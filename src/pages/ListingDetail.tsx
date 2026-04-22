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

  if (!listing) return <div className="text-center py-20">Cargando...</div>;

  const avgRating = listing.ratings.length > 0
    ? (listing.ratings.reduce((acc, r) => acc + r.stars, 0) / listing.ratings.length).toFixed(1)
    : 'Sin calificaciones aún';

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-brutal-ink/10 shadow-brutal bg-brutal-ink/5 p-2">
        <div className="md:col-span-2 aspect-video overflow-hidden">
          <img src={listing.photos[0]} alt="" className="w-full h-full object-cover transition-all duration-700" referrerPolicy="no-referrer" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {listing.photos.slice(1, 3).map((p, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img src={p} alt="" className="w-full h-full object-cover transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
          ))}
          {listing.photos.length < 2 && <div className="bg-white flex items-center justify-center text-gray-300 font-mono text-[10px] uppercase tracking-widest">No hay más fotos</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Header */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight leading-tight">
                {listing.title}
              </h1>
              <div className="flex items-center text-brutal-accent font-bold text-3xl font-display">
                <Star className="w-8 h-8 mr-3 fill-current" />
                {avgRating}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 font-mono text-[9px] uppercase tracking-[0.15em] text-gray-400">
              <div className="flex items-center bg-white px-4 py-2 border border-brutal-ink/10"><MapPin className="w-3 h-3 mr-2 text-brutal-accent/60" /> {listing.address}</div>
              <div className="flex items-center bg-white px-4 py-2 border border-brutal-ink/10"><Calendar className="w-3 h-3 mr-2 text-brutal-accent/60" /> {new Date(listing.available_from).toLocaleDateString()}</div>
              <div className="flex items-center bg-white px-4 py-2 border border-brutal-ink/10"><Users className="w-3 h-3 mr-2 text-brutal-accent/60" /> {listing.max_occupants} Ocupantes</div>
              <div className={`px-4 py-2 border font-bold flex items-center shadow-brutal ${
                listing.safety_level === 'green' ? 'bg-brutal-secondary border-brutal-secondary/20 text-white' : 
                listing.safety_level === 'yellow' ? 'bg-[#8B7E5E] border-[#8B7E5E]/20 text-white' : 'bg-brutal-accent border-brutal-accent/20 text-white'
              }`}>
                <Shield className="w-3 h-3 mr-2" /> Zona {listing.zone_name}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="brutal-card p-8 bg-white">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center uppercase tracking-tight">
              <Info className="w-6 h-6 mr-3 text-brutal-accent" /> Descripción
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{listing.description}</p>
          </div>

          {/* Rules */}
          <div className="brutal-card p-8 bg-white border-dashed">
            <h2 className="text-2xl font-display font-bold mb-6 uppercase tracking-tight">Reglas</h2>
            <p className="text-gray-600 italic font-serif text-lg">"{listing.rules}"</p>
          </div>

          {/* Map */}
          <div className="brutal-card p-2 bg-white h-[400px] relative z-0">
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
                  <div className="font-display font-bold uppercase text-xs">{listing.title}</div>
                  <div className="text-[10px] font-mono">{listing.address}</div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Ratings & Comments */}
          <div className="space-y-8">
            <h2 className="text-3xl font-display font-black flex items-center uppercase tracking-tighter">
              <MessageSquare className="w-8 h-8 mr-3 text-brutal-accent" /> Comentarios
            </h2>
            
            {user && (
              <form onSubmit={handleRate} className="brutal-card p-8 bg-white space-y-6">
                <div className="flex items-center space-x-6">
                  <span className="brutal-label mb-0">Tu Calificación:</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating({ ...newRating, stars: s })}
                        className={`w-12 h-12 border border-brutal-ink/10 flex items-center justify-center transition-all ${
                          newRating.stars >= s ? 'bg-brutal-accent text-white shadow-brutal -translate-x-[1px] -translate-y-[1px]' : 'bg-white text-gray-200'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Comparte tu experiencia..."
                  value={newRating.comment}
                  onChange={e => setNewRating({ ...newRating, comment: e.target.value })}
                  className="brutal-input min-h-[120px]"
                />
                {error && <p className="text-red-600 font-mono text-xs uppercase">{error}</p>}
                <button type="submit" className="brutal-btn brutal-btn-primary">
                  <Send className="w-4 h-4 mr-3" /> Publicar
                </button>
              </form>
            )}

            <div className="space-y-6">
              {listing.ratings.map(r => (
                <div key={r.id} className="brutal-card p-6 bg-white flex space-x-6">
                  <Avatar photoUrl={r.user_photo} className="w-12 h-12 border-2 border-brutal-ink" iconClassName="w-6 h-6" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-lg uppercase tracking-tight">{r.user_name}</span>
                      <div className="flex items-center text-brutal-accent text-sm font-black">
                        <Star className="w-4 h-4 mr-1 fill-current" /> {r.stars}
                      </div>
                    </div>
                    <p className="text-gray-600 font-sans">{r.comment}</p>
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="brutal-card p-8 bg-white sticky top-28">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="brutal-label">Precio Mensual</span>
                <div className="text-5xl font-display font-medium text-brutal-ink tracking-tight">${listing.price.toLocaleString()}</div>
              </div>
              
              <div className="pt-8 border-t border-brutal-ink/5">
                <p className="brutal-label">Publicado por</p>
                <Link to={`/profile/${listing.user_id}`} className="flex items-center space-x-4 group">
                  <div className="border border-brutal-ink/10 p-0.5 group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
                    <Avatar photoUrl={listing.owner_photo} className="w-14 h-14 border-0" iconClassName="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <div className="font-display font-medium text-lg tracking-tight group-hover:text-brutal-accent transition-colors">{listing.owner_name}</div>
                    <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Ver Perfil</div>
                  </div>
                </Link>
              </div>

              <button className="brutal-btn brutal-btn-primary w-full py-4 text-sm">
                Contactar Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
