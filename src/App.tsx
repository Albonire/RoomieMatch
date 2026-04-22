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
    <nav className="bg-editorial-bg/90 backdrop-blur-md border-b border-editorial-secondary sticky top-0 z-[1001]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="text-3xl font-display font-medium text-editorial-ink tracking-tight transition-colors group-hover:text-editorial-accent">
                Roomie<span className="italic">Match</span>
              </span>
            </Link>
            <div className="hidden lg:ml-12 lg:flex lg:space-x-8">
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
          </div>
          <div className="flex items-center space-x-8">
            {user ? (
              <>
                {user.email === 'admin@unipamplona.edu.co' && (
                  <Link to="/admin" className="text-editorial-tertiary hover:text-editorial-ink transition-colors">
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
                <button onClick={logout} className="text-editorial-tertiary hover:text-editorial-accent transition-colors cursor-pointer">
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
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-editorial-bg">
      <div className="flex flex-col items-center space-y-8 opacity-70">
        <div className="w-12 h-12 border-2 border-editorial-secondary border-t-editorial-ink rounded-full animate-spin"></div>
        <div className="font-display font-medium text-2xl tracking-tight text-editorial-ink italic">Cargando...</div>
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
        <div className="min-h-screen bg-editorial-bg font-sans selection:bg-editorial-accent selection:text-white flex flex-col">
          <Navbar />
          <main className="flex-grow w-full max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
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
