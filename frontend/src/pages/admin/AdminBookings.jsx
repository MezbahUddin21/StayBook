import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';

const STATUS_CLS = {
  confirmed: 'badge-green',
  pending:   'badge-amber',
  cancelled: 'badge-red',
  completed: 'badge-blue',
};

export default function AdminBookings() {
  const [data,   setData]   = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);

  useEffect(() => {
    api.get('/admin/bookings', { params: { search, status, page } })
       .then(({ data }) => setData(data));
  }, [search, status, page]);

  const totalRevenue = data?.data.reduce((s, b) =>
    b.status === 'confirmed' ? s + Number(b.total_price) : s, 0) || 0;

  return (
    <div className="p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bookings</h1>
        <p className="text-gray-400 text-sm mt-0.5">All reservations across the platform</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ref or guest name…"
            className="input pl-9" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="input w-auto">
          <option value="">All statuses</option>
          {['pending','confirmed','cancelled','completed'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ref', 'Guest', 'Hotel', 'Room', 'Check-in', 'Check-out', 'Nights', 'Total', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data.map(b => {
                const nights = Math.max(1, Math.round(
                  (new Date(b.check_out) - new Date(b.check_in)) / 86400000
                ));
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#003580]">{b.booking_ref}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{b.user?.name}</p>
                      <p className="text-xs text-gray-400">{b.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">{b.hotel?.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[100px]">{b.room?.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.check_in}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.check_out}</td>
                    <td className="px-4 py-3 text-gray-600">{nights}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">${Number(b.total_price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`${STATUS_CLS[b.status] || 'badge-gray'} capitalize`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {data.from}–{data.to} of {data.total} bookings
              {status === 'confirmed' && (
                <span className="ml-3 text-green-600 font-semibold">
                  · ${totalRevenue.toLocaleString()} revenue on this page
                </span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 py-1 text-xs text-gray-500">{page} / {data.last_page}</span>
              <button disabled={page === data.last_page} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
