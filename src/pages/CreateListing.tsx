import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, MapPin, DollarSign, Calendar, Users, FileText, Save, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ImageUploader from '../components/ImageUploader';

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
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    available_from: '',
    max_occupants: '1',
    rules: '',
    zone_id: ''
  });
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);

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

    if (!form.title.trim() || !form.description.trim() || !form.address.trim()) {
      setError('Completa los campos obligatorios');
      return;
    }

    if (photos.length === 0) {
      setError('Sube al menos una foto de la habitación');
      return;
    }

    const price = Number(form.price);
    const maxOccupants = Number(form.max_occupants);
    if (!Number.isFinite(price) || price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    if (!Number.isInteger(maxOccupants) || maxOccupants < 1) {
      setError('Los ocupantes máximos deben ser al menos 1');
      return;
    }

    if (!form.available_from) {
      setError('Selecciona una fecha válida');
      return;
    }

    if (!form.zone_id) {
      setError('Selecciona una zona');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      price,
      max_occupants: maxOccupants,
      photos,
      zone_id: parseInt(form.zone_id),
      lat: position[0],
      lng: position[1]
    };

    try {
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
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-16 px-4 sm:px-0">
      <div className="editorial-card p-5 sm:p-8 md:p-12 lg:p-16 space-y-12">
        <div className="text-center space-y-4 border-b border-editorial-secondary/40 pb-10">
          <h1 className="text-3xl md:text-5xl font-display font-medium text-editorial-ink tracking-tight leading-none">Publicar Habitación</h1>
          <p className="font-sans text-editorial-tertiary text-lg">Comparte tu espacio con otros estudiantes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Información básica */}
          <section className="space-y-6">
            <h2 className="text-xl font-display font-medium text-editorial-ink tracking-tight flex items-center">
              <Home className="w-5 h-5 mr-3 text-editorial-accent" /> Información Básica
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="editorial-label mb-2 block">Título de la Publicación</label>
                <input
                  type="text"
                  placeholder="Ej: Habitación amplia cerca al campus"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="editorial-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="editorial-label mb-2 block">Precio Mensual (COP)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                    <input
                      type="number"
                      placeholder="400000"
                      required
                      min="1"
                      step="1"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="editorial-input pl-7"
                    />
                  </div>
                </div>
                <div>
                  <label className="editorial-label mb-2 block">Zona de Pamplona</label>
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
                <label className="editorial-label mb-2 block">Dirección Exacta</label>
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
            </div>
          </section>

          {/* Detalles */}
          <section className="space-y-6">
            <h2 className="text-xl font-display font-medium text-editorial-ink tracking-tight flex items-center">
              <Info className="w-5 h-5 mr-3 text-editorial-accent" /> Detalles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="editorial-label mb-2 block">Disponible Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                  <input
                    type="date"
                    required
                    min={today}
                    value={form.available_from}
                    onChange={e => setForm({ ...form, available_from: e.target.value })}
                    className="editorial-input pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="editorial-label mb-2 block">Ocupantes Máximos</label>
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
              <label className="editorial-label mb-2 block">Descripción</label>
              <div className="relative">
                <FileText className="absolute left-4 top-5 w-4 h-4 text-editorial-tertiary" />
                <textarea
                  placeholder="Describe la habitación, servicios incluidos, ambiente, etc."
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="editorial-input pl-11 min-h-[120px] border border-editorial-secondary rounded-sm py-4"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="editorial-label mb-2 block">Reglas de la Casa (Opcional)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-5 w-4 h-4 text-editorial-tertiary" />
                <textarea
                  placeholder="Ej: No fumar, no mascotas, silencio después de las 10pm"
                  value={form.rules}
                  onChange={e => setForm({ ...form, rules: e.target.value })}
                  className="editorial-input pl-11 min-h-[80px] border border-editorial-secondary rounded-sm py-4"
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* Ubicación */}
          <section className="space-y-6">
            <h2 className="text-xl font-display font-medium text-editorial-ink tracking-tight flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-editorial-accent" /> Ubicación
            </h2>
            
            <div>
              <label className="editorial-label mb-2 block">Marca la ubicación exacta en el mapa</label>
              <div className="h-[300px] editorial-card overflow-hidden p-0">
                <MapContainer center={[7.3755, -72.6455]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <p className="mt-2 font-sans text-[11px] text-editorial-tertiary">
                Lat: {position[0].toFixed(6)} · Lng: {position[1].toFixed(6)}
              </p>
            </div>
          </section>

          {/* Fotos */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-medium text-editorial-ink tracking-tight">
                Fotos de la Habitación
              </h2>
              <span className="font-sans text-[11px] text-editorial-tertiary uppercase tracking-wider">
                {photos.length}/5
              </span>
            </div>
            
            <div className="bg-editorial-accent/5 border border-editorial-accent/20 p-4 rounded-sm">
              <p className="font-sans text-xs text-editorial-tertiary leading-relaxed">
                <strong className="text-editorial-ink">Tip:</strong> Sube fotos bien iluminadas. La primera imagen será la portada. Las fotos se comprimen automáticamente para optimizar el almacenamiento.
              </p>
            </div>

            <ImageUploader
              value={photos}
              onChange={setPhotos}
              maxImages={5}
              type="listing"
              token={token!}
            />
          </section>

          {/* Submit */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-sans text-xs rounded-sm">
              {error}
            </div>
          )}

          <div className="pt-6 border-t border-editorial-secondary/40">
            <button 
              type="submit" 
              disabled={submitting || photos.length === 0}
              className="editorial-btn editorial-btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" /> 
              {submitting ? 'Publicando...' : 'Publicar Habitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
