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

  if (!profile) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center space-y-4 opacity-60">
        <div className="w-10 h-10 border-2 border-editorial-secondary border-t-editorial-ink rounded-full animate-spin"></div>
        <span className="font-display text-lg italic text-editorial-tertiary">Cargando...</span>
      </div>
    </div>
  );

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
      <div className="editorial-card overflow-hidden">
        <div className="h-48 bg-editorial-accent/10 border-b border-editorial-secondary/30 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(29,53,87,0.05)_0%,transparent_60%)]"></div>
          <span className="text-editorial-ink font-display font-medium text-5xl md:text-7xl opacity-[0.04] tracking-tight">Perfil Estudiante</span>
        </div>
        <div className="px-8 md:px-12 pb-12">
          <div className="relative -mt-20 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="relative inline-block">
              <div className="p-1 bg-editorial-surface rounded-full shadow-editorial-hover">
                <Avatar 
                  photoUrl={profile.photo_url} 
                  className="w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-editorial-surface" 
                  iconClassName="w-16 h-16 md:w-20 md:h-20" 
                />
              </div>
              {profile.is_verified === 1 && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-display font-medium text-editorial-ink tracking-tight leading-none">{profile.name}</h1>
                <div className="flex items-center font-sans text-lg text-editorial-tertiary">
                  <GraduationCap className="w-5 h-5 mr-2 text-editorial-tertiary/60" /> {profile.university}
                </div>
              </div>
              <button className="editorial-btn editorial-btn-accent px-8 py-3 text-base flex items-center justify-center group">
                <span className="mr-3 font-medium tracking-wide">WhatsApp</span>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="p-8 border border-editorial-secondary/30 bg-editorial-bg/50 rounded-sm">
              <h3 className="editorial-label mb-4 flex items-center">
                <Info className="w-4 h-4 mr-2 text-editorial-accent" /> Acerca de
              </h3>
              <p className="text-editorial-ink/70 leading-relaxed text-lg font-sans">{profile.bio || "No se ha proporcionado biografía aún."}</p>
            </div>

            {compatibility && (
              <div className="space-y-8">
                <h3 className="text-2xl font-display font-medium text-editorial-ink tracking-tight flex items-center">
                  <Heart className="w-6 h-6 mr-3 text-editorial-accent" /> Estilo de Vida
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="editorial-card p-6 flex items-center space-x-4">
                    <div className="p-3 bg-editorial-accent/5 rounded-lg border border-editorial-secondary/30">
                      <Coffee className="w-5 h-5 text-editorial-accent" />
                    </div>
                    <div>
                      <div className="editorial-label text-[10px] mb-0.5">Horario</div>
                      <div className="text-base font-medium text-editorial-ink tracking-tight">{translateValue('schedule', compatibility.schedule)}</div>
                    </div>
                  </div>
                  <div className="editorial-card p-6 flex items-center space-x-4">
                    <div className="p-3 bg-editorial-accent/5 rounded-lg border border-editorial-secondary/30">
                      <Music className="w-5 h-5 text-editorial-accent" />
                    </div>
                    <div>
                      <div className="editorial-label text-[10px] mb-0.5">Ruido</div>
                      <div className="text-base font-medium text-editorial-ink tracking-tight">{translateValue('noise', compatibility.noise)}</div>
                    </div>
                  </div>
                  <div className="editorial-card p-6 flex items-center space-x-4">
                    <div className="p-3 bg-editorial-accent/5 rounded-lg border border-editorial-secondary/30">
                      <PawPrint className="w-5 h-5 text-editorial-accent" />
                    </div>
                    <div>
                      <div className="editorial-label text-[10px] mb-0.5">Mascotas</div>
                      <div className="text-base font-medium text-editorial-ink tracking-tight">{compatibility.pets === 'yes' ? 'Permitidas' : 'Sin Mascotas'}</div>
                    </div>
                  </div>
                  <div className="editorial-card p-6 flex items-center space-x-4">
                    <div className="p-3 bg-editorial-accent/5 rounded-lg border border-editorial-secondary/30">
                      <Info className="w-5 h-5 text-editorial-accent" />
                    </div>
                    <div>
                      <div className="editorial-label text-[10px] mb-0.5">Fumar</div>
                      <div className="text-base font-medium text-editorial-ink tracking-tight">{compatibility.smoking === 'yes' ? 'Permitido' : 'No Fumar'}</div>
                    </div>
                  </div>
                  <div className="editorial-card p-6 flex items-center space-x-4">
                    <div className="p-3 bg-editorial-accent/5 rounded-lg border border-editorial-secondary/30">
                      <BookOpen className="w-5 h-5 text-editorial-accent" />
                    </div>
                    <div>
                      <div className="editorial-label text-[10px] mb-0.5">Estudio</div>
                      <div className="text-base font-medium text-editorial-ink tracking-tight">{translateValue('study', compatibility.study)}</div>
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
