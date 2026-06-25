import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, MapPin, BedDouble, ChevronDown, Star, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../lib/axios';
import WriteReview from '../components/WriteReview';
import toast from 'react-hot-toast';

const STATUS = {
  confirmed: { cls: 'badge-green',  label: 'Confirmed'  },
  pending:   { cls: 'badge-amber',  label: 'Pending'    },
  cancelled: { cls: 'badge-red',    label: 'Cancelled'  },
  completed: { cls: 'badge-blue',   label: 'Completed'  },
};

function BookingCard({ booking, onCancel, onReviewSubmit }) {
  const [showReview, setShowReview] = useState(false);
  const nights = Math.max(1, Math.round(
    (new Date(booking.check_out) - new Date(booking.check_in)) / 86400000
  ));
  const s = STATUS[booking.status] || STATUS.pending;

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex gap-4">
            {/* Hotel thumbnail */}
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
              {booking.hotel?.thumbnail
                ? <img src={booking.hotel.thumbnail} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />}
            </div>
            <div>
              <p className="font-mono text-xs text-gray-400 mb-0.5">{booking.booking_ref}</p>
              <Link to={`/hotels/${booking.hotel_id}`}
                className="font-bold text-[#003580] hover:underline text-base leading-tight">
                {booking.hotel?.name}
              </Link>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {booking.hotel?.city}, {booking.hotel?.country}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                {booking.room?.name}
              </p>
            </div>
          </div>
          <span className={`${s.cls} capitalize shrink-0`}>{s.label}</span>
        </div>

        {/* Dates & price */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
            <p className="text-sm font-semibold text-gray-800">{booking.check_in}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
            <p className="text-sm font-semibold text-gray-800">{booking.check_out}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Duration</p>
            <p className="text-sm font-semibold text-gray-800">{nights} night{nights !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total paid</p>
            <p className="text-sm font-black text-gray-900">${Number(booking.total_price).toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link to={`/hotels/${booking.hotel_id}`}
            className="btn-outline text-xs px-3 py-1.5">
            View hotel
          </Link>

          {['pending', 'confirmed'].includes(booking.status) && (
            <button onClick={() => onCancel(booking.id)}
              className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" />
              Cancel booking
            </button>
          )}

          {booking.status === 'completed' && !booking.review && (
            <button onClick={() => setShowReview(s => !s)}
              className="flex items-center gap-1.5 text-xs text-[#003580] border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              <Star className="w-3.5 h-3.5" />
              Write a review
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showReview ? 'rotate-180' : ''}`} />
            </button>
          )}

          {booking.review && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-green-500" />
              Reviewed · {booking.review.rating}/10
            </div>
          )}
        </div>
      </div>

      {/* Inline review form */}
      {showReview && (
        <div className="border-t border-gray-100 bg-gray-50 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Share your experience</h3>
          <WriteReview booking={booking} onSubmit={() => {
            setShowReview(false);
            onReviewSubmit(booking.id);
          }} />
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    api.get('/bookings')
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    }
  };

  const onReviewSubmit = (id) => {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, review: { rating: 8 } } : b));
    toast.success('Review submitted!');
  };

  const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">{bookings.length} total reservation{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/search" className="btn-primary text-sm px-4 py-2">
          + New booking
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize
              ${filter === f
                ? 'bg-[#003580] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? `All (${bookings.length})` : `${f} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 card">
          <CalendarCheck className="w-14 h-14 mx-auto mb-4 text-gray-200" />
          <p className="font-semibold text-gray-500">
            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'all' ? 'Start exploring and book your first stay!' : 'Try a different filter.'}
          </p>
          {filter === 'all' && (
            <Link to="/search" className="btn-primary mt-5 inline-block px-6">
              Browse hotels
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <BookingCard key={b.id} booking={b} onCancel={cancel} onReviewSubmit={onReviewSubmit} />
          ))}
        </div>
      )}
    </div>
  );
}
