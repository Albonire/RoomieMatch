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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-brutal-ink/10 pb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-brutal-ink tracking-tight leading-none mb-6">Mapa de Seguridad</h1>
          <p className="font-sans text-gray-400 text-lg">Zonas de riesgo y seguridad estudiantil en Pamplona</p>
        </div>
        <div className="flex flex-wrap gap-6 bg-white p-6 border border-brutal-ink/10 shadow-brutal">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border border-brutal-ink/10 bg-[#22C55E] shadow-brutal"></div>
            <span className="font-mono text-[9px] font-medium text-gray-500 uppercase tracking-widest">Seguro</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border border-brutal-ink/10 bg-[#EAB308] shadow-brutal"></div>
            <span className="font-mono text-[9px] font-medium text-gray-500 uppercase tracking-widest">Moderado</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border border-brutal-ink/10 bg-[#EF4444] shadow-brutal"></div>
            <span className="font-mono text-[9px] font-medium text-gray-500 uppercase tracking-widest">Alto Riesgo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 brutal-card bg-white overflow-hidden h-[600px] relative p-0">
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
                    fillOpacity: 0.4,
                    color: '#141414',
                    weight: 2,
                    fill: true
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({ fillOpacity: 0.7, weight: 4 });
                    },
                    mouseout: (e) => {
                      const layer = e.target;
                      layer.setStyle({ fillOpacity: 0.4, weight: 2 });
                    }
                  }}
                >
                  <Popup className="brutal-popup">
                    <div className="p-6 space-y-4 font-sans">
                      <h3 className="font-display font-medium text-xl tracking-tight border-b border-brutal-ink/5 pb-3">{zone.name}</h3>
                      <div className={`px-4 py-1.5 border font-mono text-[9px] font-medium uppercase tracking-widest inline-block shadow-brutal ${
                        zone.safety_level === 'green' ? 'bg-[#22C55E] border-[#22C55E]/20 text-white' : 
                        zone.safety_level === 'yellow' ? 'bg-[#EAB308] border-[#EAB308]/20 text-white' : 'bg-[#EF4444] border-[#EF4444]/20 text-white'
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
          
          <div className="absolute bottom-8 left-8 z-[1000] bg-white p-6 border border-brutal-ink/10 shadow-brutal max-w-xs hidden md:block">
            <h4 className="font-display font-medium text-base tracking-tight flex items-center mb-3">
              <Info className="w-4 h-4 mr-2 text-brutal-accent" /> Info Mapa
            </h4>
            <p className="font-mono text-[8px] text-gray-400 leading-relaxed uppercase tracking-widest">
              Datos basados en reportes históricos. Mantente siempre alerta a tu entorno.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8 flex flex-col">
          <div className="brutal-card bg-white p-8 flex-1 flex flex-col">
            <h3 className="text-2xl font-display font-bold text-brutal-ink mb-6 flex items-center tracking-tight">
              Barrios
            </h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[400px]">
              {zones.map(zone => (
                <div key={zone.id} className="p-5 border border-brutal-ink/5 bg-white hover:bg-brutal-bg transition-all cursor-pointer group shadow-sm hover:shadow-brutal">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-base tracking-tight group-hover:text-brutal-accent transition-colors">{zone.name}</span>
                    <div className={`w-4 h-4 border border-brutal-ink/10 shadow-brutal ${
                      zone.safety_level === 'green' ? 'bg-[#22C55E]' : 
                      zone.safety_level === 'yellow' ? 'bg-[#EAB308]' : 'bg-[#EF4444]'
                    }`}></div>
                  </div>
                  <p className="font-sans text-xs text-gray-500 line-clamp-3 leading-snug">{zone.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-brutal-ink p-8 border border-brutal-ink/10 shadow-brutal text-white">
            <h4 className="font-display font-medium text-lg tracking-tight mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-brutal-accent" /> Tip de Seguridad
            </h4>
            <p className="font-sans text-xs text-gray-300 leading-relaxed">
              Prioriza barrios <span className="text-brutal-secondary font-bold">Verdes</span> como El Humilladero o Chapinero por su alta densidad estudiantil y patrullaje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
