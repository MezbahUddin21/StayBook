import { useEffect, useState } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [data,   setData]   = useState(null);
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const fetch = () =>
    api.get('/admin/reviews', { params: { search, page } })
       .then(({ data }) => setData(data));

  useEffect(() => { fetch(); }, [search, page]);

  const remove = async (review) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/admin/reviews/${review.id}`);
      toast.success('Review deleted');
      fetch();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const ratingColor = (r) => {
    if (r >= 8) return 'bg-green-500';
    if (r >= 6) return 'bg-blue-500';
    if (r >= 4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reviews</h1>
        <p className="text-gray-400 text-sm mt-0.5">Moderate guest reviews</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by hotel name…"
          className="input pl-9" />
      </div>

      <div className="space-y-3">
        {data?.data.map(review => (
          <div key={review.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#003580] to-blue-400
                                flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {review.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{review.user?.name}</p>
                    <span className="text-xs text-gray-400">
                      {review.created_at ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    re: <span className="font-medium text-gray-600">{review.hotel?.name}</span>
                  </p>
                  {review.title && (
                    <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{review.body}</p>
                  {/* Sub scores */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {[
                      ['Cleanliness', review.cleanliness],
                      ['Comfort',     review.comfort],
                      ['Location',    review.location],
                      ['Service',     review.service],
                    ].filter(([,v]) => v).map(([label, value]) => (
                      <span key={label} className="text-xs text-gray-400">
                        {label}: <span className="font-semibold text-gray-700">{value}/10</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`${ratingColor(review.rating)} text-white font-black px-2.5 py-1 rounded-lg text-sm`}>
                  {review.rating}
                </span>
                <button onClick={() => remove(review)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {data?.data.length === 0 && (
          <div className="text-center py-16 card">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No reviews found</p>
          </div>
        )}
      </div>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {data.from}–{data.to} of {data.total} reviews</p>
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
  );
}
