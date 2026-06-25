import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Shield, ShieldOff } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [data,   setData]   = useState(null);
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const fetch = () =>
    api.get('/admin/users', { params: { search, page } })
       .then(({ data }) => setData(data));

  useEffect(() => { fetch(); }, [search, page]);

  const toggleAdmin = async (user) => {
    const action = user.is_admin ? 'Remove admin role from' : 'Grant admin role to';
    if (!confirm(`${action} ${user.name}?`)) return;
    try {
      await api.post(`/admin/users/${user.id}/toggle-admin`);
      toast.success(`${user.name}'s role updated`);
      fetch();
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Users</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage registered users</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email…"
          className="input pl-9" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['User', 'Joined', 'Bookings', 'Total Spent', 'Role', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003580] to-blue-400
                                      flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.bookings_count}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ${Number(u.bookings_sum_total_price || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.is_admin ? 'badge-purple' : 'badge-gray'}>
                      {u.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAdmin(u)}
                      title={u.is_admin ? 'Remove admin' : 'Make admin'}
                      className={`p-1.5 rounded-lg transition-colors
                        ${u.is_admin
                          ? 'hover:bg-red-50 text-red-400 hover:text-red-600'
                          : 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'}`}>
                      {u.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing {data.from}–{data.to} of {data.total} users</p>
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
