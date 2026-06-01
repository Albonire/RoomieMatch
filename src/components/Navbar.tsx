import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { LogOut, User, ShieldCheck, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  dark: boolean;
  toggleDark: () => void;
}

export default function Navbar({ dark, toggleDark }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-editorial-bg/90 backdrop-blur-md border-b border-editorial-secondary sticky top-0 z-[1001]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:justify-between lg:items-center lg:h-20">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="text-2xl sm:text-3xl font-display font-medium text-editorial-ink tracking-tight transition-colors group-hover:text-editorial-accent">
                Roomie<span className="italic">Match</span>
              </span>
            </Link>
            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={toggleDark}
                className="p-2 rounded-full border border-editorial-secondary/50 text-editorial-tertiary hover:text-editorial-ink hover:border-editorial-secondary transition-all cursor-pointer"
                aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {user ? (
                <div className="flex items-center gap-3">
                  {user.email === 'admin@unipamplona.edu.co' && (
                    <Link to="/admin" className="text-editorial-tertiary hover:text-editorial-ink transition-colors" aria-label="Panel de administración">
                      <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                    </Link>
                  )}
                  <Link to="/profile" className="text-editorial-tertiary hover:text-editorial-ink transition-colors" aria-label="Mi Perfil">
                    <User className="w-5 h-5 stroke-[1.5]" />
                  </Link>
                  <button onClick={logout} className="text-editorial-tertiary hover:text-editorial-accent transition-colors cursor-pointer" aria-label="Cerrar sesión">
                    <LogOut className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="editorial-btn editorial-btn-primary text-xs px-4 py-2">
                  Entrar
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:ml-12">
            <Link to="/" className="inline-flex items-center text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-editorial-tertiary hover:text-editorial-ink transition-colors">
              Publicaciones
            </Link>
            <Link to="/map" className="inline-flex items-center text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-editorial-tertiary hover:text-editorial-ink transition-colors">
              Mapa
            </Link>
            {user && (
              <>
                <Link to="/matching" className="inline-flex items-center text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-editorial-tertiary hover:text-editorial-ink transition-colors">
                  Roommates
                </Link>
                <Link to="/create-listing" className="inline-flex items-center text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-editorial-accent hover:text-editorial-ink transition-colors">
                  Publicar
                </Link>
              </>
            )}
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={toggleDark}
              className="p-2 rounded-full border border-editorial-secondary/50 text-editorial-tertiary hover:text-editorial-ink hover:border-editorial-secondary transition-all cursor-pointer"
              aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {user.email === 'admin@unipamplona.edu.co' && (
                  <Link to="/admin" className="text-editorial-tertiary hover:text-editorial-ink transition-colors" aria-label="Panel de administración">
                    <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center group space-x-3">
                  <div className="text-right hidden md:block">
                    <div className="font-display font-medium text-sm text-editorial-ink leading-none">{user.name}</div>
                    <div className="font-sans text-[9px] uppercase tracking-[0.15em] text-editorial-tertiary mt-1">Mi Perfil</div>
                  </div>
                  <div className="p-0.5 rounded-full border border-transparent group-hover:border-editorial-secondary transition-colors">
                    <Avatar photoUrl={user.photo_url} className="w-9 h-9 border border-editorial-secondary shadow-sm" iconClassName="w-4 h-4" />
                  </div>
                </Link>
                <button onClick={logout} className="text-editorial-tertiary hover:text-editorial-accent transition-colors cursor-pointer" aria-label="Cerrar sesión">
                  <LogOut className="w-5 h-5 stroke-[1.5]" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="editorial-btn editorial-btn-primary">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
