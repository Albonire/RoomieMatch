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

  if (!profile) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="brutal-card bg-white overflow-hidden shadow-[20px_20px_0px_0px_#000000]">
        <div className="h-64 bg-brutal-ink flex items-center justify-center overflow-hidden relative border-b-8 border-brutal-ink">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFFF00_2px,transparent_2px)] [background-size:32px_32px] animate-pulse"></div>
          <h1 className="text-7xl md:text-9xl font-display font-black text-white tracking-tighter z-10 uppercase transform -rotate-2">Tu Perfil</h1>
        </div>
        <div className="px-12 pb-16">
          <div className="relative -mt-32 mb-16 flex flex-col md:flex-row items-center md:items-end gap-12">
            <div className="relative group">
              <div className="border-8 border-brutal-ink p-2 shadow-[12px_12px_0px_0px_#FF00FF] bg-white transform group-hover:scale-105 transition-all">
                <Avatar photoUrl={form.photo_url} className="w-48 h-48 border-0" iconClassName="w-24 h-24" />
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-brutal-accent/80 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-brutal-ink font-mono text-[12px] font-black uppercase tracking-widest cursor-pointer"
              >
                <Upload className="w-12 h-12 mb-4" />
                Cambiar Foto
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div className="text-center md:text-left pb-8 space-y-4">
              <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none uppercase bg-brutal-accent px-4 py-1 inline-block">{form.name}</h2>
              <p className="font-sans text-brutal-ink/60 text-2xl font-bold uppercase tracking-tight">{form.university}</p>
              {profile.is_verified === 1 && (
                <div className="inline-flex items-center bg-brutal-secondary text-white px-6 py-2 font-mono text-[11px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#000000] transform rotate-1">
                  <CheckCircle className="w-5 h-5 mr-3" /> Verificado
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSave} className="space-y-16">
            <div className="space-y-10">
              <div className="space-y-8">
                <label className="brutal-label flex items-center">
                  <ImageIcon className="w-3.5 h-3.5 mr-3 text-brutal-accent/40" /> Elige un Avatar o Sube una Foto
                </label>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-4">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setForm({ ...form, photo_url: `icon:${avatar.id}` })}
                      className={`p-4 border-4 transition-all duration-200 ${
                        form.photo_url === `icon:${avatar.id}` 
                          ? 'border-brutal-ink bg-brutal-accent text-brutal-ink shadow-[6px_6px_0px_0px_#0000FF] -translate-x-1 -translate-y-1' 
                          : 'border-brutal-ink/10 hover:border-brutal-ink/40 text-brutal-ink/20 bg-white'
                      }`}
                      title={avatar.label}
                    >
                      <avatar.icon className="w-8 h-8 mx-auto" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 border border-dashed border-brutal-ink/10 hover:border-brutal-ink/20 text-gray-300 hover:text-brutal-accent transition-all flex items-center justify-center"
                  >
                    <Upload className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="brutal-label">Nombre Completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="brutal-input"
                  />
                </div>
                <div>
                  <label className="brutal-label">Universidad</label>
                  <input
                    type="text"
                    value={form.university}
                    onChange={e => setForm({ ...form, university: e.target.value })}
                    className="brutal-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="brutal-label">URL de la Foto (Opcional)</label>
                  <input
                    type="text"
                    value={form.photo_url.startsWith('data:') || form.photo_url.startsWith('icon:') ? '' : form.photo_url}
                    onChange={e => setForm({ ...form, photo_url: e.target.value })}
                    placeholder="https://..."
                    className="brutal-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="brutal-label">Biografía</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    className="brutal-input min-h-[120px]"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="pt-20 border-t-8 border-brutal-ink">
              <h3 className="text-5xl font-display font-black text-brutal-ink mb-12 flex items-center tracking-tighter uppercase">
                <Heart className="w-12 h-12 mr-5 text-brutal-tertiary" /> Compatibilidad
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                <div>
                  <label className="brutal-label flex items-center"><Coffee className="w-4 h-4 mr-3 text-brutal-secondary" /> Horario</label>
                  <select
                    value={form.compatibility_form.schedule}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, schedule: e.target.value } })}
                    className="brutal-input appearance-none bg-brutal-accent/5"
                  >
                    <option value="morning">Persona Mañanera</option>
                    <option value="night">Búho Nocturno</option>
                  </select>
                </div>
                <div>
                  <label className="brutal-label flex items-center"><Music className="w-4 h-4 mr-3 text-brutal-tertiary" /> Ruido</label>
                  <select
                    value={form.compatibility_form.noise}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, noise: e.target.value } })}
                    className="brutal-input appearance-none bg-brutal-accent/5"
                  >
                    <option value="low">Baja (Silencio)</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta (Ruidoso)</option>
                  </select>
                </div>
                <div>
                  <label className="brutal-label flex items-center"><PawPrint className="w-4 h-4 mr-3 text-brutal-secondary" /> Mascotas</label>
                  <select
                    value={form.compatibility_form.pets}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, pets: e.target.value } })}
                    className="brutal-input appearance-none bg-brutal-accent/5"
                  >
                    <option value="no">Sin Mascotas</option>
                    <option value="yes">Mascotas OK</option>
                  </select>
                </div>
                <div>
                  <label className="brutal-label flex items-center"><Info className="w-4 h-4 mr-3 text-brutal-tertiary" /> Fumar</label>
                  <select
                    value={form.compatibility_form.smoking}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, smoking: e.target.value } })}
                    className="brutal-input appearance-none bg-brutal-accent/5"
                  >
                    <option value="no">No Fumar</option>
                    <option value="yes">Fumar OK</option>
                  </select>
                </div>
                <div>
                  <label className="brutal-label flex items-center"><BookOpen className="w-4 h-4 mr-3 text-brutal-secondary" /> Estudio</label>
                  <select
                    value={form.compatibility_form.study}
                    onChange={e => setForm({ ...form, compatibility_form: { ...form.compatibility_form, study: e.target.value } })}
                    className="brutal-input appearance-none bg-brutal-accent/5"
                  >
                    <option value="quiet">Estudio Tranquilo</option>
                    <option value="social">Estudio Social</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-16 border-t-8 border-brutal-ink">
              {message && (
                <div className="px-8 py-4 bg-brutal-secondary text-white font-mono text-[12px] font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#000000]">
                  {message}
                </div>
              )}
              <button type="submit" className="brutal-btn brutal-btn-primary ml-auto text-xl px-12 py-6 shadow-[12px_12px_0px_0px_#0000FF] hover:shadow-none">
                <Save className="w-6 h-6 mr-4" /> Guardar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
