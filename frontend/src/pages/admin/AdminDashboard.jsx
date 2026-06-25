import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Hotel, CalendarCheck, Users, TrendingUp, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import api from '../../lib/axios';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  confirmed: '#22c55e', pending: '#f59e0b',
  cancelled: '#ef4444', completed: '#3b82f6',
};

function StatCard({ label, value, icon: Icon, color, sub, to }) {
  const content = (
    <div className={`card p-5 flex items-start gap-4 hover:shadow-md transition-shadow ${to ? 'cursor-pointer' : ''}`}>
      <div className={`p-3 rounded-xl ${color} shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-[#003580] font-bold">${Number(payload[0].value).toLocaleString()}</p>
      {payload[1] && <p className="text-gray-500">{payload[1].value} bookings</p>}
    </div>
  );
  return null;
};

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="p-8 space-y-5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 h-72 bg-gray-100 rounded-xl" />
        <div className="h-72 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );

  const chartData = MONTHS.map((month, i) => {
    const found = stats.revenue_by_month.find(r => r.month === i + 1);
    return { month, revenue: Number(found?.revenue || 0), bookings: Number(found?.bookings || 0) };
  });

  const totalStatuses = Object.values(stats.bookings_by_status).reduce((a, b) => a + Number(b), 0);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Overview of your platform performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"    value={`$${Number(stats.total_revenue).toLocaleString()}`}
          icon={DollarSign} color="bg-[#003580]"
          sub={`$${Number(stats.this_month_revenue).toLocaleString()} this month`} />
        <StatCard label="Total Bookings"   value={stats.total_bookings}
          icon={CalendarCheck} color="bg-emerald-500"
          to="/admin/bookings" />
        <StatCard label="Hotels"           value={stats.total_hotels}
          icon={Hotel} color="bg-amber-500"
          sub={`${stats.pending_hotels} pending approval`}
          to="/admin/hotels" />
        <StatCard label="Users"            value={stats.total_users}
          icon={Users} color="bg-purple-500"
          to="/admin/users" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-5">Monthly revenue ({new Date().getFullYear()})</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={18} margin={{ left: -10 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="revenue" radius={[5, 5, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i}
                    fill={i === new Date().getMonth() ? '#003580' : '#bfdbfe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Booking status */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4">Booking status</h2>
            <div className="space-y-3">
              {Object.entries(stats.bookings_by_status).map(([status, count]) => {
                const pct = totalStatuses > 0 ? Math.round((Number(count) / totalStatuses) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-600">{status}</span>
                      <span className="font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || '#6b7280' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top hotels */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4">Top hotels by revenue</h2>
            <div className="space-y-3">
              {stats.top_hotels.map((hotel, i) => (
                <div key={hotel.id} className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{hotel.name}</p>
                    <p className="text-xs text-gray-400">{hotel.bookings_count} bookings</p>
                  </div>
                  <span className="text-sm font-black text-[#003580] shrink-0">
                    ${Number(hotel.bookings_sum_total_price || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      {stats.recent_bookings?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Recent bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-[#003580] hover:underline">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ref', 'Guest', 'Hotel', 'Check-in', 'Total', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recent_bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#003580]">{b.booking_ref}</td>
                  <td className="px-4 py-3 text-gray-700">{b.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">{b.hotel?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{b.check_in}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">${Number(b.total_price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                      ${b.status === 'confirmed' ? 'bg-green-50 text-green-700'
                        : b.status === 'pending'  ? 'bg-amber-50 text-amber-700'
                        : b.status === 'cancelled'? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
