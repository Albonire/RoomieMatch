import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { 
  User, Save, CheckCircle, Info, Coffee, PawPrint, 
  Music, BookOpen, Upload, Image as ImageIcon, User as UserIcon, 
  Smile, Ghost, Cat, Dog, Rocket, Gamepad2, Palette, Pizza, 
  Bike, Laptop, Headphones, GraduationCap, Flame, Zap,
  Cloud, Moon, Sun, Star, Heart
} from 'lucide-react';

const AVATARS = [
  { id: 'user', icon: UserIcon, label: 'Usuario' },
  { id: 'smile', icon: Smile, label: 'Sonrisa' },
  { id: 'ghost', icon: Ghost, label: 'Fantasma' },
  { id: 'cat', icon: Cat, label: 'Gato' },
  { id: 'dog', icon: Dog, label: 'Perro' },
  { id: 'rocket', icon: Rocket, label: 'Cohete' },
  { id: 'coffee', icon: Coffee, label: 'Café' },
  { id: 'gamepad', icon: Gamepad2, label: 'Gaming' },
  { id: 'palette', icon: Palette, label: 'Arte' },
  { id: 'music', icon: Music, label: 'Música' },
  { id: 'pizza', icon: Pizza, label: 'Pizza' },
  { id: 'bike', icon: Bike, label: 'Bici' },
  { id: 'grad', icon: GraduationCap, label: 'Estudio' },
  { id: 'laptop', icon: Laptop, label: 'Tech' },
  { id: 'headphones', icon: Headphones, label: 'Audio' },
  { id: 'flame', icon: Flame, label: 'Fuego' },
  { id: 'zap', icon: Zap, label: 'Rayo' },
  { id: 'cloud', icon: Cloud, label: 'Nube' },
  { id: 'moon', icon: Moon, label: 'Luna' },
  { id: 'sun', icon: Sun, label: 'Sol' },
  { id: 'star', icon: Star, label: 'Estrella' },
  { id: 'heart', icon: Heart, label: 'Amor' },
];

export default function Profile() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    photo_url: '',
    university: '',
    bio: '',
    compatibility_form: {
      schedule: 'morning',
      noise: 'low',
      pets: 'no',
      smoking: 'no',
      study: 'quiet'
    }
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profiles/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      
      if (res.ok && data) {
        setProfile(data);
        setForm({
          name: data.name,
          photo_url: data.photo_url || '',
          university: data.university || '',
          bio: data.bio || '',
          compatibility_form: data.compatibility_form ? JSON.parse(data.compatibility_form) : {
            schedule: 'morning', noise: 'low', pets: 'no', smoking: 'no', study: 'quiet'
          }
        });
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profiles/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMessage('¡Perfil actualizado con éxito! Redirigiendo...');
      setTimeout(() => {
        navigate('/matching');
      }, 1500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, photo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPhoto = () => {
    return (
      <Avatar photoUrl={form.photo_url} className="w-32 h-32 rounded-3xl ring-4 ring-white shadow-lg" iconClassName="w-16 h-16" />
    );
  };

  if (!profile) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center space-y-4 opacity-60">
        <div className="w-10 h-10 border-2 border-editorial-secondary border-t-editorial-ink rounded-full animate-spin"></div>
        <span className="font-display text-lg italic text-editorial-tertiary">Cargando...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="editorial-card overflow-hidden">
        {/* Header banner — only decorative, no text on it */}
        <div className="h-40 bg-editorial-accent overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08)_0%,transparent_60%)]"></div>
          <h1 className="absolute inset-0 flex items-center justify-center text-5xl md:text-7xl font-display font-medium text-white/20 tracking-tight italic select-none">Tu Perfil</h1>
        </div>
        <div className="px-8 md:px-12 pb-12">
          {/* Row: avatar overlaps banner with negative margin only on itself; text is always in white space */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10">
            {/* Only the avatar gets the negative margin — text never enters the banner */}
            <div className="relative group flex-shrink-0 -mt-12">
              <div className="p-1 bg-white rounded-full shadow-editorial-hover">
                <Avatar photoUrl={form.photo_url} className="w-28 h-28 rounded-full border-2 border-white" iconClassName="w-14 h-14" />
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-editorial-ink/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-sans text-[11px] font-medium uppercase tracking-wider cursor-pointer"
              >
                <Upload className="w-7 h-7 mb-1" />
                Cambiar
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            {/* Text always stays in white area — mt-4 gives breathing room from banner bottom */}
            <div className="mt-4 space-y-1.5">
              <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight leading-none text-editorial-ink">{form.name}</h2>
              <p className="font-sans text-editorial-tertiary">{form.university}</p>
              {profile.is_verified === 1 && (
                <div className="inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-sm font-sans text-[11px] font-medium uppercase tracking-wider mt-1">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verificado
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSave} className="space-y-14">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="editorial-label flex items-center">
                  <ImageIcon className="w-3.5 h-3.5 mr-2 text-editorial-tertiary" /> Elige un Avatar o Sube una Foto
                </label>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setForm({ ...form, photo_url: `icon:${avatar.id}` })}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        form.photo_url === `icon:${avatar.id}` 
                          ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent shadow-sm scale-105' 
                          : 'border-editorial-secondary/40 hover:border-editorial-secondary text-editorial-tertiary/30 bg-transparent'
                      }`}
                      title={avatar.label}
                    >
                      <avatar.icon className="w-6 h-6 mx-auto" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-lg border border-dashed border-editorial-secondary/40 hover:border-editorial-accent text-editorial-tertiary/30 hover:text-editorial-accent transition-all flex items-center justify-center"
                  >
                    <Upload className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="editorial-label">Nombre Completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="editorial-input"
                  />
                </div>
                <div>
                  <label className="editorial-label">Universidad</label>
                  <input
                    type="text"
                    value={form.university}
                    onChange={e => setForm({ ...form, university: e.target.value })}
                    className="editorial-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="editorial-label">URL de la Foto (Opcional)</label>
                  <input
                    type="text"
                    value={form.photo_url.startsWith('data:') || form.photo_url.startsWith('icon:') ? '' : form.photo_url}
                    onChange={e => setForm({ ...form, photo_url: e.target.value })}
                    placeholder="https://..."
                    className="editorial-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="editorial-label">Biografía</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    className="editorial-input min-h-[120px] border border-editorial-secondary rounded-sm p-4"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-editorial-secondary/40">
              <h3 className="text-3xl font-display font-medium text-editorial-ink mb-8 flex items-center tracking-tight">
                <Heart className="w-7 h-7 mr-4 text-editorial-accent" /> Compatibilidad
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="editorial-label flex items-center"><Coffee className="w-3.5 h-3.5 mr-2 text-editorial-tertiary" /> Horario</label>
                  <select
                    value={form.compatibility_form.schedule}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, schedule: e.target.value } })}
                    className="editorial-input appearance-none bg-transparent"
                  >
                    <option value="morning">Persona Mañanera</option>
                    <option value="night">Búho Nocturno</option>
                  </select>
                </div>
                <div>
                  <label className="editorial-label flex items-center"><Music className="w-3.5 h-3.5 mr-2 text-editorial-tertiary" /> Ruido</label>
                  <select
                    value={form.compatibility_form.noise}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, noise: e.target.value } })}
                    className="editorial-input appearance-none bg-transparent"
                  >
                    <option value="low">Baja (Silencio)</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta (Ruidoso)</option>
                  </select>
                </div>
                <div>
                  <label className="editorial-label flex items-center"><PawPrint className="w-3.5 h-3.5 mr-2 text-editorial-tertiary" /> Mascotas</label>
                  <select
                    value={form.compatibility_form.pets}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, pets: e.target.value } })}
                    className="editorial-input appearance-none bg-transparent"
                  >
                    <option value="no">Sin Mascotas</option>
                    <option value="yes">Mascotas OK</option>
                  </select>
                </div>
                <div>
                  <label className="editorial-label flex items-center"><Info className="w-3.5 h-3.5 mr-2 text-editorial-tertiary" /> Fumar</label>
                  <select
                    value={form.compatibility_form.smoking}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, smoking: e.target.value } })}
                    className="editorial-input appearance-none bg-transparent"
                  >
                    <option value="no">No Fumar</option>
                    <option value="yes">Fumar OK</option>
                  </select>
                </div>
                <div>
                  <label className="editorial-label flex items-center"><BookOpen className="w-3.5 h-3.5 mr-2 text-editorial-tertiary" /> Estudio</label>
                  <select
                    value={form.compatibility_form.study}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, study: e.target.value } })}
                    className="editorial-input appearance-none bg-transparent"
                  >
                    <option value="quiet">Estudio Tranquilo</option>
                    <option value="social">Estudio Social</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-10 border-t border-editorial-secondary/40">
              {message && (
                <div className="px-6 py-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-sans text-xs font-medium rounded-sm">
                  {message}
                </div>
              )}
              <button type="submit" className="editorial-btn editorial-btn-primary ml-auto px-10 py-3">
                <Save className="w-5 h-5 mr-2" /> Guardar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
