import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { Shield, Info, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Zone {
  id: number;
  name: string;
  safety_level: string;
  description: string;
  geojson: any;
}

export default function SafetyMap() {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    console.log("SafetyMap mounted");
    console.log("Fetching zones...");
    fetch('/api/zones')
      .then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then(data => {
        console.log("Zones received from API:", data);
        setZones(data);
      })
      .catch(err => console.error("Error fetching zones:", err));
  }, []);

  const getZoneColor = (level: string) => {
    switch (level) {
      case 'green': return '#22C55E';
      case 'yellow': return '#EAB308';
      case 'red': return '#EF4444';
      default: return '#E8E4DE';
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-editorial-secondary/40 pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-editorial-ink tracking-tight leading-none mb-4">Mapa de Seguridad</h1>
          <p className="font-sans text-editorial-tertiary text-lg">Zonas de riesgo y seguridad estudiantil en Pamplona</p>
        </div>
        <div className="flex flex-wrap gap-5 bg-editorial-surface p-4 px-6 border border-editorial-secondary/60 shadow-editorial rounded-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="font-sans text-[11px] font-medium text-editorial-tertiary">Seguro</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="font-sans text-[11px] font-medium text-editorial-tertiary">Moderado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="font-sans text-[11px] font-medium text-editorial-tertiary">Alto Riesgo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 editorial-card overflow-hidden h-[600px] relative p-0">
          <MapContainer 
            key={zones.length}
            center={[7.375, -72.648]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {zones.map(zone => {
              if (!zone.geojson || !zone.geojson.coordinates || !zone.geojson.coordinates[0]) return null;
              const positions = zone.geojson.coordinates[0].map((c: any) => [c[1], c[0]]);
              
              return (
                <Polygon
                  key={zone.id}
                  positions={positions as any}
                  pathOptions={{
                    fillColor: getZoneColor(zone.safety_level),
                    fillOpacity: 0.35,
                    color: getZoneColor(zone.safety_level),
                    weight: 2,
                    fill: true
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({ fillOpacity: 0.6, weight: 3 });
                    },
                    mouseout: (e) => {
                      const layer = e.target;
                      layer.setStyle({ fillOpacity: 0.35, weight: 2 });
                    }
                  }}
                >
                  <Popup>
                    <div className="p-4 space-y-3 font-sans">
                      <h3 className="font-display font-medium text-lg tracking-tight border-b border-editorial-secondary/30 pb-2">{zone.name}</h3>
                      <div className={`px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-wider inline-block rounded-sm ${
                        zone.safety_level === 'green' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 
                        zone.safety_level === 'yellow' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        Riesgo {zone.safety_level === 'green' ? 'Bajo' : zone.safety_level === 'yellow' ? 'Moderado' : 'Alto'}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{zone.description}</p>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </MapContainer>
          
          <div className="absolute bottom-6 left-6 z-[1000] bg-editorial-surface/90 backdrop-blur-sm p-5 border border-editorial-secondary/40 shadow-editorial max-w-xs hidden md:block rounded-sm">
            <h4 className="font-display font-medium text-sm tracking-tight flex items-center mb-2">
              <Info className="w-4 h-4 mr-2 text-editorial-accent" /> Info Mapa
            </h4>
            <p className="font-sans text-[11px] text-editorial-tertiary leading-relaxed">
              Datos basados en reportes históricos. Mantente siempre alerta a tu entorno.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="editorial-card p-8 flex-1 flex flex-col">
            <h3 className="text-xl font-display font-medium text-editorial-ink mb-6 tracking-tight">
              Barrios
            </h3>
            <div className="space-y-3 overflow-y-auto pr-2 flex-1 max-h-[400px]">
              {zones.map(zone => (
                <div key={zone.id} className="p-4 border border-editorial-secondary/30 bg-editorial-surface hover:bg-editorial-bg transition-all cursor-pointer group rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-medium text-sm tracking-tight group-hover:text-editorial-accent transition-colors">{zone.name}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      zone.safety_level === 'green' ? 'bg-emerald-500' : 
                      zone.safety_level === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></div>
                  </div>
                  <p className="font-sans text-xs text-editorial-tertiary line-clamp-3 leading-relaxed">{zone.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-editorial-accent/5 border border-editorial-accent/20 p-5 rounded-sm">
            <h4 className="font-display font-medium text-sm tracking-tight mb-2 flex items-center text-editorial-ink">
              <MapPin className="w-4 h-4 mr-2 text-editorial-accent" /> Tip de Seguridad
            </h4>
            <p className="font-sans text-xs text-editorial-tertiary leading-relaxed">
              Prioriza barrios <span className="text-emerald-700 font-medium">Verdes</span> como El Humilladero o Chapinero por su alta densidad estudiantil y patrullaje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
