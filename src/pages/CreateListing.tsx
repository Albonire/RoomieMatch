import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, MapPin, DollarSign, Calendar, Users, FileText, Camera, Save } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationPicker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function CreateListing() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [zones, setZones] = useState<any[]>([]);
  const [position, setPosition] = useState<[number, number]>([7.3755, -72.6455]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    available_from: '',
    max_occupants: '1',
    photos: '',
    rules: '',
    zone_id: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const res = await fetch('/api/zones');
    const data = await res.json();
    setZones(data);
    if (data.length > 0) setForm(prev => ({ ...prev, zone_id: data[0].id.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      price: parseFloat(form.price),
      max_occupants: parseInt(form.max_occupants),
      photos: form.photos.split(',').map(p => p.trim()).filter(p => p !== ''),
      zone_id: parseInt(form.zone_id),
      lat: position[0],
      lng: position[1]
    };

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      navigate('/');
    } else {
      const data = await res.json();
      setError(data.error || 'Error al crear la publicación');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16">
      <div className="brutal-card bg-white p-16 space-y-16">
        <div className="text-center space-y-6 border-b border-brutal-ink/5 pb-12">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-brutal-ink tracking-tight leading-none">Publicar Habitación</h1>
          <p className="font-sans text-gray-400 text-lg">Comparte tu espacio con otros estudiantes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div>
              <label className="brutal-label">Título de la Publicación</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-accent/40" />
                <input
                  type="text"
                  placeholder="Ej: Habitación amplia cerca al campus"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="brutal-input pl-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="brutal-label">Precio Mensual (COP)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-accent/40" />
                  <input
                    type="number"
                    placeholder="400000"
                    required
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="brutal-input pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="brutal-label">Zona de Pamplona</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-accent/40" />
                  <select
                    value={form.zone_id}
                    onChange={e => setForm({ ...form, zone_id: e.target.value })}
                    className="brutal-input pl-12 appearance-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="brutal-label">Dirección Exacta</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-accent/40" />
                <input
                  type="text"
                  placeholder="Ej: Calle 5 #4-20"
                  required
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="brutal-input pl-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="brutal-label">Disponible Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-accent/40" />
                  <input
                    type="date"
                    required
                    value={form.available_from}
                    onChange={e => setForm({ ...form, available_from: e.target.value })}
                    className="brutal-input pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="brutal-label">Ocupantes Máximos</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-accent/40" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.max_occupants}
                    onChange={e => setForm({ ...form, max_occupants: e.target.value })}
                    className="brutal-input pl-12"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="brutal-label">Descripción</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-brutal-accent/40" />
                <textarea
                  placeholder="Describe la habitación, servicios incluidos, etc."
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="brutal-input pl-12 min-h-[120px]"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="brutal-label">Reglas de la Casa</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-brutal-accent/40" />
                <textarea
                  placeholder="Ej: No fumar, no mascotas, etc."
                  value={form.rules}
                  onChange={e => setForm({ ...form, rules: e.target.value })}
                  className="brutal-input pl-12 min-h-[80px]"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="brutal-label">Ubicación en el Mapa (Haz clic para marcar)</label>
              <div className="h-[300px] border-4 border-brutal-ink shadow-brutal overflow-hidden">
                <MapContainer center={[7.3755, -72.6455]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <p className="mt-2 font-mono text-[10px] text-gray-400 uppercase tracking-tighter">
                Lat: {position[0].toFixed(6)} | Lng: {position[1].toFixed(6)}
              </p>
            </div>

            <div>
              <label className="brutal-label">URLs de Fotos (separadas por coma)</label>
              <div className="relative">
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-accent/40" />
                <input
                  type="text"
                  placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg"
                  value={form.photos}
                  onChange={e => setForm({ ...form, photos: e.target.value })}
                  className="brutal-input pl-12"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[#D5A2A2]/10 border border-[#D5A2A2]/20 text-[#8B5E5E] font-mono text-[9px] uppercase tracking-widest shadow-brutal">
              {error}
            </div>
          )}

          <button type="submit" className="brutal-btn brutal-btn-primary w-full py-6 text-xl">
            <Save className="w-6 h-6 mr-3" /> Publicar Habitación
          </button>
        </form>
      </div>
    </div>
  );
}
