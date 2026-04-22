import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { CheckCircle, GraduationCap, Info, Heart, Coffee, PawPrint, Music, BookOpen } from 'lucide-react';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(data => {
        if (data) setProfile(data);
      })
      .catch(err => console.error("Error fetching profile:", err));
  }, [id]);

  if (!profile) return <div className="text-center py-20">Cargando...</div>;

  let compatibility = null;
  try {
    if (profile.compatibility_form) {
      compatibility = typeof profile.compatibility_form === 'string' 
        ? JSON.parse(profile.compatibility_form) 
        : profile.compatibility_form;
    }
  } catch (e) {
    console.error("Error parsing compatibility form:", e);
  }

  const translateValue = (key: string, value: string) => {
    const translations: any = {
      schedule: { morning: 'Mañanero', night: 'Nocturno' },
      noise: { low: 'Bajo', medium: 'Medio', high: 'Alto' },
      study: { quiet: 'Tranquilo', social: 'Social' }
    };
    return translations[key]?.[value] || value;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12">
      <div className="brutal-card bg-white overflow-hidden">
        <div className="h-60 bg-brutal-secondary/30 border-b border-brutal-ink/5 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#2D2A26_1px,transparent_1px)] [background-size:32px_32px]"></div>
          <span className="text-brutal-ink font-display font-medium text-5xl md:text-7xl opacity-10 tracking-tight">Perfil Estudiante</span>
        </div>
        <div className="px-12 pb-16">
          <div className="relative -mt-28 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div className="relative inline-block">
              <Avatar 
                photoUrl={profile.photo_url} 
                className="w-40 h-40 md:w-52 md:h-52 rounded-none border border-brutal-ink/10 shadow-brutal bg-white" 
                iconClassName="w-20 h-20 md:w-24 md:h-24" 
              />
              {profile.is_verified === 1 && (
                <div className="absolute -bottom-5 -right-5 bg-brutal-secondary text-white p-4 border border-brutal-ink/10 shadow-brutal">
                  <CheckCircle className="w-7 h-7 md:w-9 md:h-9" />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-display font-medium text-brutal-ink tracking-tight leading-none">{profile.name}</h1>
                <div className="flex items-center font-sans text-lg text-gray-400">
                  <GraduationCap className="w-6 h-6 mr-3 text-brutal-accent/40" /> {profile.university}
                </div>
              </div>
              <button className="brutal-btn bg-brutal-secondary text-white border-brutal-secondary/20 px-10 py-5 text-lg flex items-center justify-center group hover:bg-brutal-secondary/90 transition-all">
                <span className="mr-4 font-medium tracking-wide">WHATSAPP</span>
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
75:               </button>
            </div>
          </div>

          <div className="space-y-16">
            <div className="p-10 border border-brutal-ink/5 bg-brutal-secondary/10 shadow-brutal">
              <h3 className="brutal-label mb-6 flex items-center">
                <Info className="w-5 h-5 mr-3 text-brutal-accent/40" /> Acerca de
              </h3>
              <p className="text-brutal-ink leading-relaxed text-xl font-sans">{profile.bio || "NO SE HA PROPORCIONADO BIOGRAFÍA AÚN."}</p>
            </div>

            {compatibility && (
              <div className="space-y-10">
                <h3 className="text-3xl font-display font-medium text-brutal-ink tracking-tight flex items-center">
                  <Heart className="w-8 h-8 mr-4 text-brutal-accent/40" /> Estilo de Vida
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="brutal-card bg-white p-8 flex items-center space-x-6">
                    <div className="p-4 bg-brutal-secondary/20 border border-brutal-ink/5">
                      <Coffee className="w-7 h-7 text-brutal-accent" />
                    </div>
                    <div>
                      <div className="brutal-label text-[9px] mb-1">Horario</div>
                      <div className="text-xl font-medium text-brutal-ink tracking-tight">{translateValue('schedule', compatibility.schedule)}</div>
                    </div>
                  </div>
                  <div className="brutal-card bg-white p-8 flex items-center space-x-6">
                    <div className="p-4 bg-brutal-secondary/20 border border-brutal-ink/5">
                      <Music className="w-7 h-7 text-brutal-accent" />
                    </div>
                    <div>
                      <div className="brutal-label text-[9px] mb-1">Ruido</div>
                      <div className="text-xl font-medium text-brutal-ink tracking-tight">{translateValue('noise', compatibility.noise)}</div>
                    </div>
                  </div>
                  <div className="brutal-card bg-white p-8 flex items-center space-x-6">
                    <div className="p-4 bg-brutal-secondary/20 border border-brutal-ink/5">
                      <PawPrint className="w-7 h-7 text-brutal-accent" />
                    </div>
                    <div>
                      <div className="brutal-label text-[9px] mb-1">Mascotas</div>
                      <div className="text-xl font-medium text-brutal-ink tracking-tight">{compatibility.pets === 'yes' ? 'PERMITIDAS' : 'SIN MASCOTAS'}</div>
                    </div>
                  </div>
                  <div className="brutal-card bg-white p-8 flex items-center space-x-6">
                    <div className="p-4 bg-brutal-secondary/20 border border-brutal-ink/5">
                      <Info className="w-7 h-7 text-brutal-accent" />
                    </div>
                    <div>
                      <div className="brutal-label text-[9px] mb-1">Fumar</div>
                      <div className="text-xl font-medium text-brutal-ink tracking-tight">{compatibility.smoking === 'yes' ? 'PERMITIDO' : 'NO FUMAR'}</div>
                    </div>
                  </div>
                  <div className="brutal-card bg-white p-8 flex items-center space-x-6">
                    <div className="p-4 bg-brutal-secondary/20 border border-brutal-ink/5">
                      <BookOpen className="w-7 h-7 text-brutal-accent" />
                    </div>
                    <div>
                      <div className="brutal-label text-[9px] mb-1">Estudio</div>
                      <div className="text-xl font-medium text-brutal-ink tracking-tight">{translateValue('study', compatibility.study)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
