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
      <div className="editorial-card p-12 md:p-16 space-y-14">
        <div className="text-center space-y-4 border-b border-editorial-secondary/40 pb-10">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-editorial-ink tracking-tight leading-none">Publicar Habitación</h1>
          <p className="font-sans text-editorial-tertiary text-lg">Comparte tu espacio con otros estudiantes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div>
              <label className="editorial-label">Título de la Publicación</label>
              <div className="relative">
                <Home className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                <input
                  type="text"
                  placeholder="Ej: Habitación amplia cerca al campus"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="editorial-input pl-7"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="editorial-label">Precio Mensual (COP)</label>
                <div className="relative">
                  <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                  <input
                    type="number"
                    placeholder="400000"
                    required
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="editorial-input pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="editorial-label">Zona de Pamplona</label>
                <div className="relative">
                  <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                  <select
                    value={form.zone_id}
                    onChange={e => setForm({ ...form, zone_id: e.target.value })}
                    className="editorial-input pl-7 appearance-none bg-transparent"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="editorial-label">Dirección Exacta</label>
              <div className="relative">
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                <input
                  type="text"
                  placeholder="Ej: Calle 5 #4-20"
                  required
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="editorial-input pl-7"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="editorial-label">Disponible Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                  <input
                    type="date"
                    required
                    value={form.available_from}
                    onChange={e => setForm({ ...form, available_from: e.target.value })}
                    className="editorial-input pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="editorial-label">Ocupantes Máximos</label>
                <div className="relative">
                  <Users className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.max_occupants}
                    onChange={e => setForm({ ...form, max_occupants: e.target.value })}
                    className="editorial-input pl-7"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="editorial-label">Descripción</label>
              <div className="relative">
                <FileText className="absolute left-0 top-4 w-4 h-4 text-editorial-tertiary" />
                <textarea
                  placeholder="Describe la habitación, servicios incluidos, etc."
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="editorial-input pl-7 min-h-[120px] border border-editorial-secondary rounded-sm p-4"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="editorial-label">Reglas de la Casa</label>
              <div className="relative">
                <FileText className="absolute left-0 top-4 w-4 h-4 text-editorial-tertiary" />
                <textarea
                  placeholder="Ej: No fumar, no mascotas, etc."
                  value={form.rules}
                  onChange={e => setForm({ ...form, rules: e.target.value })}
                  className="editorial-input pl-7 min-h-[80px] border border-editorial-secondary rounded-sm p-4"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="editorial-label">Ubicación en el Mapa (Haz clic para marcar)</label>
              <div className="h-[300px] editorial-card overflow-hidden">
                <MapContainer center={[7.3755, -72.6455]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <p className="mt-2 font-sans text-[11px] text-editorial-tertiary">
                Lat: {position[0].toFixed(6)} · Lng: {position[1].toFixed(6)}
              </p>
            </div>

            <div>
              <label className="editorial-label">URLs de Fotos (separadas por coma)</label>
              <div className="relative">
                <Camera className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                <input
                  type="text"
                  placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg"
                  value={form.photos}
                  onChange={e => setForm({ ...form, photos: e.target.value })}
                  className="editorial-input pl-7"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-sans text-xs rounded-sm">
              {error}
            </div>
          )}

          <button type="submit" className="editorial-btn editorial-btn-primary w-full py-4 text-base">
            <Save className="w-5 h-5 mr-2" /> Publicar Habitación
          </button>
        </form>
      </div>
    </div>
  );
}
