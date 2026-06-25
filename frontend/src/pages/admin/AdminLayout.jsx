import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Hotel, CalendarCheck, Users,
  Star, LogOut, ChevronRight, Home
} from 'lucide-react';

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/hotels',   icon: Hotel,           label: 'Hotels'             },
  { to: '/admin/bookings', icon: CalendarCheck,   label: 'Bookings'           },
  { to: '/admin/users',    icon: Users,           label: 'Users'              },
  { to: '/admin/reviews',  icon: Star,            label: 'Reviews'            },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[#003580] text-white flex flex-col shrink-0 fixed inset-y-0 left-0 z-40">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-black text-lg tracking-tight">StayBook</p>
          <p className="text-xs text-blue-300 mt-0.5 font-medium">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                 ${isActive
                   ? 'bg-white/20 text-white font-semibold'
                   : 'text-blue-100 hover:bg-white/10 hover:text-white'}`
              }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <NavLink to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-white/10 transition-colors">
            <Home className="w-4 h-4" />
            Back to site
          </NavLink>
          <div className="px-3 py-2 mt-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-blue-300 truncate">{user.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-blue-100 hover:bg-white/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
