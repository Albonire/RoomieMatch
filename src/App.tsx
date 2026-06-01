import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Matching from './pages/Matching';
import SafetyMap from './pages/SafetyMap';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

function useDarkMode() {
  const [dark, setDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('roomiematch-theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('roomiematch-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, () => setDark(d => !d)] as const;
}

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
  const [dark, toggleDark] = useDarkMode();

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-editorial-bg font-sans selection:bg-editorial-accent selection:text-white flex flex-col">
          <Navbar dark={dark} toggleDark={toggleDark} />
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
