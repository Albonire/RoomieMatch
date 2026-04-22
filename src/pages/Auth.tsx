import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { 
  LogIn, UserPlus, Mail, Lock, User, GraduationCap, 
  Image as ImageIcon, Upload, User as UserIcon, Smile, 
  Ghost, Cat, Dog, Rocket, Coffee, Gamepad2, Palette, 
  Music, Pizza, Bike, Laptop, Headphones, Flame, Zap,
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

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    university: '',
    photo_url: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('Respuesta del servidor no válida');
      }

      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Ocurrió un error inesperado');
      }
    } catch (e: any) {
      setError(e.message || 'Error de conexión');
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

  const renderPhotoPreview = () => {
    if (!form.photo_url) return null;
    return (
      <Avatar photoUrl={form.photo_url} className="w-20 h-20 mx-auto rounded-2xl border-2 border-orange-200" iconClassName="w-10 h-10" />
    );
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="brutal-card p-12 bg-white space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-display font-medium tracking-tight leading-none">
            {isLogin ? 'Bienvenido' : 'Únete a la'} <br />
            <span className="text-brutal-accent/60">Comunidad</span>
          </h1>
          <p className="font-sans text-gray-400 text-sm">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para comenzar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="flex justify-center mb-8">
                {form.photo_url ? (
                  <div className="border border-brutal-ink/10 p-1.5 shadow-brutal">
                    <Avatar photoUrl={form.photo_url} className="w-24 h-24 rounded-none" iconClassName="w-12 h-12" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border border-dashed border-brutal-ink/10 flex items-center justify-center font-mono text-[9px] text-gray-400 uppercase text-center p-4">
                    Sin Foto
                  </div>
                )}
              </div>
              
              <div>
                <label className="brutal-label">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-ink" />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="brutal-input pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="brutal-label">Universidad</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-ink" />
                  <input
                    type="text"
                    placeholder="Nombre de la U"
                    required
                    value={form.university}
                    onChange={e => setForm({ ...form, university: e.target.value })}
                    className="brutal-input pl-12"
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <label className="brutal-label flex items-center">
                  <ImageIcon className="w-3.5 h-3.5 mr-3 text-brutal-accent/40" /> Elige un Avatar
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setForm({ ...form, photo_url: `icon:${avatar.id}` })}
                      className={`p-2.5 border transition-all duration-300 ${
                        form.photo_url === `icon:${avatar.id}` 
                          ? 'border-brutal-accent/20 bg-brutal-accent/5 text-brutal-accent shadow-brutal -translate-x-[1px] -translate-y-[1px]' 
                          : 'border-brutal-ink/5 hover:border-brutal-ink/20 text-gray-300 bg-white'
                      }`}
                      title={avatar.label}
                    >
                      <avatar.icon className="w-5 h-5 mx-auto" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 border border-dashed border-brutal-ink/10 hover:border-brutal-ink/20 text-gray-300 hover:text-brutal-accent transition-all flex items-center justify-center"
                    title="Subir Foto Local"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="O pega una URL de imagen"
                    value={form.photo_url.startsWith('data:') || form.photo_url.startsWith('icon:') ? '' : form.photo_url}
                    onChange={e => setForm({ ...form, photo_url: e.target.value })}
                    className="brutal-input text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="brutal-label">Correo Institucional (@unipamplona.edu.co)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-ink" />
              <input
                type="email"
                placeholder="usuario@unipamplona.edu.co"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="brutal-input pl-12"
              />
            </div>
          </div>

          <div>
            <label className="brutal-label">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-ink" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="brutal-input pl-12"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[#D5A2A2]/10 border border-[#D5A2A2]/20 text-[#8B5E5E] font-mono text-[9px] uppercase tracking-widest">
              ERROR: {error}
            </div>
          )}

          <button type="submit" className="brutal-btn brutal-btn-primary w-full py-4 text-lg">
            {isLogin ? <LogIn className="w-6 h-6 mr-3" /> : <UserPlus className="w-6 h-6 mr-3" />}
            {isLogin ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        <div className="text-center pt-8 border-t border-brutal-ink/5">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-mono text-[9px] uppercase tracking-widest text-gray-400 hover:text-brutal-accent transition-colors"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate aquí" : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
