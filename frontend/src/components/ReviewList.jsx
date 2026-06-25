import { useEffect, useState } from 'react';
import { Star, User, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../lib/axios';

const RATING_LABELS = ['','Terrible','Poor','Disappointing','Below avg','Average',
                       'Above avg','Good','Very Good','Excellent','Exceptional'];

function ScoreBar({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#003580] rounded-full transition-all duration-700"
          style={{ width: `${(Number(value) / 10) * 100}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-800 w-8 text-right">{Number(value).toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > 280;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#003580] to-blue-400 rounded-full
                          flex items-center justify-center text-white font-bold text-sm shrink-0">
            {review.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.user?.name}</p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {review.would_recommend && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full">
              <ThumbsUp className="w-3 h-3" />
              Recommends
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="bg-[#003580] text-white font-bold px-2.5 py-1 rounded-lg text-sm">
              {review.rating}
            </span>
            <span className="text-sm text-gray-600 hidden sm:block">
              {RATING_LABELS[review.rating] || 'Good'}
            </span>
          </div>
        </div>
      </div>

      {review.title && (
        <p className="font-semibold text-gray-800 mb-1.5">{review.title}</p>
      )}

      <div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {expanded || !isLong ? review.body : `${review.body.slice(0, 280)}…`}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-[#003580] text-sm font-medium mt-1.5 hover:underline">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Sub-scores */}
      {(review.cleanliness || review.comfort || review.location || review.service) && (
        <div className="mt-4 pt-3 border-t border-gray-50 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {[
            ['Cleanliness',     review.cleanliness],
            ['Comfort',         review.comfort],
            ['Location',        review.location],
            ['Service',         review.service],
            ['Value for money', review.value_for_money],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{label}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#003580] rounded-full"
                    style={{ width: `${(value / 10) * 100}%` }} />
                </div>
                <span className="font-semibold text-gray-700 w-4 text-right">{value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewList({ hotel }) {
  const [data, setData]     = useState(null);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/hotels/${hotel.id}/reviews`, { params: { page } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [hotel.id, page]);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-100 rounded-xl" />
      ))}
    </div>
  );

  const { reviews, breakdown, distribution } = data;
  const avg = Number(breakdown?.avg_rating || 0);

  const bandMap = { 9: 0, 7: 0, 5: 0, 3: 0, 1: 0 };
  distribution?.forEach(d => { if (bandMap[d.band] !== undefined) bandMap[d.band] = d.count; });

  return (
    <div className="space-y-6" id="reviews">
      <h2 className="text-xl font-bold text-gray-900">Guest reviews</h2>

      {breakdown?.total > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Big score */}
            <div className="text-center md:shrink-0">
              <div className="text-7xl font-black text-[#003580] leading-none">{avg.toFixed(1)}</div>
              <div className="text-base font-semibold text-gray-700 mt-2">
                {RATING_LABELS[Math.round(avg)] || 'Good'}
              </div>
              <div className="text-sm text-gray-400 mt-0.5">{breakdown.total} reviews</div>
            </div>

            {/* Category breakdown */}
            <div className="flex-1 space-y-3">
              <ScoreBar label="Cleanliness"     value={breakdown.avg_cleanliness} />
              <ScoreBar label="Comfort"         value={breakdown.avg_comfort} />
              <ScoreBar label="Location"        value={breakdown.avg_location} />
              <ScoreBar label="Service"         value={breakdown.avg_service} />
              <ScoreBar label="Value for money" value={breakdown.avg_value} />
            </div>

            {/* Distribution */}
            <div className="md:w-48 shrink-0">
              <p className="text-sm font-semibold text-gray-700 mb-3">Score breakdown</p>
              {[
                { label: '9–10 ★★★★★', band: 9 },
                { label: '7–8 ★★★★',   band: 7 },
                { label: '5–6 ★★★',    band: 5 },
                { label: '3–4 ★★',     band: 3 },
                { label: '1–2 ★',      band: 1 },
              ].map(({ label, band }) => {
                const count = bandMap[band] || 0;
                const pct   = breakdown.total > 0 ? (count / breakdown.total) * 100 : 0;
                return (
                  <div key={band} className="flex items-center gap-2 mb-2 text-xs">
                    <span className="text-gray-500 w-16 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#003580] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review cards */}
      <div className="space-y-4">
        {reviews?.data.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this property.</p>
          </div>
        ) : (
          reviews?.data.map(review => <ReviewCard key={review.id} review={review} />)
        )}
      </div>

      {/* Pagination */}
      {reviews?.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: reviews.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                ${p === page ? 'bg-[#003580] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
