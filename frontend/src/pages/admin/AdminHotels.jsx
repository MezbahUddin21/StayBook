import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const STATUS_CLS = {
  active:   'badge-green',
  pending:  'badge-amber',
  inactive: 'badge-red',
};

export default function AdminHotels() {
  const [data,   setData]   = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);

  const fetch = () =>
    api.get('/admin/hotels', { params: { search, status, page } })
       .then(({ data }) => setData(data));

  useEffect(() => { fetch(); }, [search, status, page]);

  const approve = async (hotel) => {
    await api.post(`/admin/hotels/${hotel.id}/approve`);
    toast.success(`${hotel.name} approved`);
    fetch();
  };
  const reject = async (hotel) => {
    await api.post(`/admin/hotels/${hotel.id}/reject`);
    toast.success(`${hotel.name} rejected`);
    fetch();
  };
  const remove = async (hotel) => {
    if (!confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;
    await api.delete(`/admin/hotels/${hotel.id}`);
    toast.success('Hotel deleted');
    fetch();
  };

  return (
    <div className="p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Hotels</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage and moderate hotel listings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search hotels…"
            className="input pl-9" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="input w-auto">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Hotel', 'City', 'Owner', 'Stars', 'Bookings', 'Avg Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data.map(hotel => (
                <tr key={hotel.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 truncate max-w-[160px]">{hotel.name}</p>
                    <p className="text-xs text-gray-400">${hotel.base_price}/night</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{hotel.city}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[100px]">{hotel.owner?.name}</td>
                  <td className="px-4 py-3 text-yellow-400 whitespace-nowrap">{'★'.repeat(hotel.star_rating)}</td>
                  <td className="px-4 py-3 text-gray-700">{hotel.bookings_count}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {hotel.reviews_avg_rating ? Number(hotel.reviews_avg_rating).toFixed(1) : '—'}
                    <span className="text-xs text-gray-400 ml-1">({hotel.reviews_count})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${STATUS_CLS[hotel.status] || 'badge-gray'} capitalize`}>
                      {hotel.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/hotels/${hotel.id}`} target="_blank"
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      {hotel.status !== 'active' && (
                        <button onClick={() => approve(hotel)}
                          className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {hotel.status !== 'inactive' && (
                        <button onClick={() => reject(hotel)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => remove(hotel)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing {data.from}–{data.to} of {data.total}</p>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 py-1.5 text-xs text-gray-500">{page} / {data.last_page}</span>
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
