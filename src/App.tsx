import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Matching from './pages/Matching';
import SafetyMap from './pages/SafetyMap';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import Avatar from './components/Avatar';
import { LogOut, User, Map as MapIcon, Users, Home as HomeIcon, ShieldCheck, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b-4 border-brutal-ink sticky top-0 z-[1001]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="text-2xl font-display font-bold text-brutal-ink tracking-tighter group-hover:bg-brutal-accent transition-all px-1 hover:text-white">
                Roomie<span className="text-brutal-secondary group-hover:text-brutal-ink">Match</span>
              </span>
            </Link>
            <div className="hidden lg:ml-10 lg:flex lg:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 text-[10px] font-display font-bold uppercase tracking-widest text-brutal-ink hover:bg-brutal-accent transition-all border-b-2 border-transparent hover:border-brutal-ink hover:text-white">
                Publicaciones
              </Link>
              <Link to="/map" className="inline-flex items-center px-1 pt-1 text-[10px] font-display font-bold uppercase tracking-widest text-brutal-ink/40 hover:bg-brutal-tertiary hover:text-black transition-all border-b-2 border-transparent hover:border-brutal-ink">
                Mapa
              </Link>
              {user && (
                <>
                  <Link to="/matching" className="inline-flex items-center px-1 pt-1 text-[10px] font-display font-bold uppercase tracking-widest text-brutal-ink/40 hover:bg-brutal-secondary hover:text-white transition-all border-b-2 border-transparent hover:border-brutal-ink">
                    Roommates
                  </Link>
                  <Link to="/create-listing" className="inline-flex items-center px-1 pt-1 text-[10px] font-display font-bold uppercase tracking-widest text-brutal-ink/40 hover:bg-brutal-accent transition-all border-b-2 border-transparent hover:border-brutal-ink">
                    Publicar
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {user.email === 'admin@unipamplona.edu.co' && (
                  <Link to="/admin" className="text-brutal-ink hover:text-brutal-tertiary transition-all hover:scale-125">
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center group">
                  <div className="border-2 border-brutal-ink p-0.5 shadow-brutal group-hover:shadow-[2px_2px_0px_0px_#FF00FF] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all bg-white">
                    <Avatar photoUrl={user.photo_url} className="w-8 h-8 border-0" iconClassName="w-4 h-4" />
                  </div>
                  <div className="hidden md:flex flex-col ml-3">
                    <span className="font-display font-bold text-xs tracking-tighter text-brutal-ink leading-none uppercase bg-brutal-accent px-1">{user.name}</span>
                    <span className="font-mono text-[7px] font-bold uppercase tracking-widest text-brutal-secondary mt-0.5">Mi Perfil</span>
                  </div>
                </Link>
                <button onClick={logout} className="text-brutal-ink hover:text-brutal-tertiary cursor-pointer transition-all hover:rotate-45">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="brutal-btn brutal-btn-primary px-6 py-1.5 text-sm">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-brutal-accent">
      <div className="brutal-card bg-white p-24 flex flex-col items-center space-y-12 shadow-[20px_20px_0px_0px_#000000]">
        <div className="w-24 h-24 border-8 border-brutal-ink border-t-brutal-tertiary animate-spin"></div>
        <div className="font-display font-bold text-5xl tracking-tighter text-brutal-ink uppercase animate-pulse">Cargando...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-brutal-bg font-sans selection:bg-brutal-accent selection:text-white">
          <Navbar />
          <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/map" element={<SafetyMap />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/matching" element={<ProtectedRoute><Matching /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
