import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Hotel, User, LogOut, CalendarCheck, Heart,
  ChevronDown, Settings, Shield, Menu, X
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#003580] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl shrink-0">
            <div className="bg-white/10 rounded-lg p-1.5">
              <Hotel className="w-5 h-5" />
            </div>
            StayBook
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/wishlist"
                  className="flex items-center gap-1.5 text-sm text-blue-100 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                  Saved
                </Link>
                <Link to="/my-bookings"
                  className="flex items-center gap-1.5 text-sm text-blue-100 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                  <CalendarCheck className="w-4 h-4" />
                  My Bookings
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(o => !o)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-white text-xs">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="w-4 h-4 text-gray-400" />
                        Account settings
                      </Link>
                      {user.is_admin && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors">
                          <Shield className="w-4 h-4" />
                          Admin panel
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/register"
                  className="text-sm text-blue-100 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                  Register
                </Link>
                <Link to="/login"
                  className="text-sm bg-white text-[#003580] font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1 pb-4">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-white">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-blue-200">{user.email}</p>
                  </div>
                </div>
                {[
                  { to: '/wishlist',     icon: Heart,          label: 'Saved'           },
                  { to: '/my-bookings',  icon: CalendarCheck,  label: 'My Bookings'     },
                  { to: '/profile',      icon: Settings,       label: 'Account settings'},
                  ...(user.is_admin ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
                ].map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-blue-100 hover:bg-white/10 transition-colors">
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-white/10 transition-colors w-full mt-2">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="block text-center py-2.5 text-sm font-semibold bg-white text-[#003580] rounded-lg mx-3">
                  Sign in
                </Link>
                <Link to="/register"
                  className="block text-center py-2.5 text-sm text-blue-100 hover:bg-white/10 rounded-lg mx-3 transition-colors">
                  Create account
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
