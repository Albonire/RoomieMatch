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
      <div className="editorial-card p-12 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-medium tracking-tight leading-none text-editorial-ink">
            {isLogin ? 'Bienvenido' : 'Únete a la'} <br />
            <span className="text-editorial-accent italic">Comunidad</span>
          </h1>
          <p className="font-sans text-editorial-tertiary text-sm">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para comenzar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="flex justify-center mb-8">
                {form.photo_url ? (
                  <div className="p-1 border border-editorial-secondary rounded-full shadow-sm">
                    <Avatar photoUrl={form.photo_url} className="w-24 h-24 rounded-full" iconClassName="w-12 h-12" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border border-dashed border-editorial-secondary rounded-full flex items-center justify-center font-sans text-[11px] text-editorial-tertiary text-center p-4">
                    Sin Foto
                  </div>
                )}
              </div>
              
              <div>
                <label className="editorial-label">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="editorial-input pl-7"
                  />
                </div>
              </div>

              <div>
                <label className="editorial-label">Universidad</label>
                <div className="relative">
                  <GraduationCap className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
                  <input
                    type="text"
                    placeholder="Nombre de la U"
                    required
                    value={form.university}
                    onChange={e => setForm({ ...form, university: e.target.value })}
                    className="editorial-input pl-7"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="editorial-label flex items-center">
                  <ImageIcon className="w-3.5 h-3.5 mr-2 text-editorial-tertiary" /> Elige un Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setForm({ ...form, photo_url: `icon:${avatar.id}` })}
                      className={`p-2 rounded-lg border transition-all duration-300 ${
                        form.photo_url === `icon:${avatar.id}` 
                          ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent shadow-sm scale-105' 
                          : 'border-editorial-secondary/40 hover:border-editorial-secondary text-editorial-tertiary/40 bg-transparent'
                      }`}
                      title={avatar.label}
                    >
                      <avatar.icon className="w-5 h-5 mx-auto" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg border border-dashed border-editorial-secondary/40 hover:border-editorial-accent text-editorial-tertiary/40 hover:text-editorial-accent transition-all flex items-center justify-center"
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
                    className="editorial-input text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="editorial-label">Correo Institucional (@unipamplona.edu.co)</label>
            <div className="relative">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
              <input
                type="email"
                placeholder="usuario@unipamplona.edu.co"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="editorial-input pl-7"
              />
            </div>
          </div>

          <div>
            <label className="editorial-label">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-tertiary" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="editorial-input pl-7"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-sans text-xs rounded-sm">
              {error}
            </div>
          )}

          <button type="submit" className="editorial-btn editorial-btn-primary w-full py-3 text-base">
            {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
            {isLogin ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-editorial-secondary/40">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-sans text-xs text-editorial-tertiary hover:text-editorial-accent transition-colors"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate aquí" : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
