import { Link } from 'react-router-dom';
import { Star, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const RATING_LABELS = [
  [9, 'Exceptional'], [8, 'Excellent'], [7, 'Very Good'],
  [6, 'Good'], [5, 'Pleasant'], [0, 'Okay'],
];

function getRatingLabel(r) {
  return (RATING_LABELS.find(([min]) => r >= min) || [0, 'Okay'])[1];
}

export default function HotelCard({ hotel, searchParams }) {
  const { user }     = useAuthStore();
  const [saved, setSaved] = useState(false);
  const rating       = Number(hotel.reviews_avg_rating || 0);
  const reviewCount  = hotel.reviews_count || 0;

  const toggleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.post(`/hotels/${hotel.id}/wishlist`);
      setSaved(s => !s);
    } catch {}
  };

  const queryStr = searchParams?.toString() ? `?${searchParams.toString()}` : '';

  return (
    <Link to={`/hotels/${hotel.id}${queryStr}`}
      className="block bg-white rounded-xl border border-gray-100 hover:shadow-lg
                 transition-all duration-200 overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-56 h-48 sm:h-auto shrink-0 bg-gradient-to-br from-blue-200 to-blue-400 overflow-hidden">
          {hotel.thumbnail && (
            <img src={hotel.thumbnail} alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          {user && (
            <button onClick={toggleSave}
              className={`absolute top-2 right-2 p-1.5 rounded-full shadow transition-colors
                ${saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
            </button>
          )}
          <div className="absolute bottom-2 left-2">
            <span className="bg-white/90 text-yellow-500 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-0.5">
              {'★'.repeat(hotel.star_rating)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 p-4 gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#003580] group-hover:underline truncate">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hotel.city}, {hotel.country}</span>
            </div>

            {hotel.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {hotel.amenities.slice(0, 4).map(a => (
                  <span key={a} className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-2 py-0.5">
                    {a}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="text-xs text-gray-400">+{hotel.amenities.length - 4} more</span>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {hotel.description}
            </p>
          </div>

          {/* Price & Rating */}
          <div className="text-right shrink-0 flex flex-col justify-between min-w-[110px]">
            {rating > 0 ? (
              <div>
                <div className="flex items-center justify-end gap-1.5 mb-0.5">
                  <span className="text-xs text-gray-500">{getRatingLabel(rating)}</span>
                  <span className="bg-[#003580] text-white font-bold px-2 py-1 rounded-lg text-sm">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{reviewCount} reviews</p>
              </div>
            ) : <div />}

            <div>
              <p className="text-xs text-gray-400">From</p>
              <p className="text-xl font-bold text-gray-900">${hotel.base_price}</p>
              <p className="text-xs text-gray-400">per night</p>
              <button className="mt-2 bg-[#f5a623] hover:bg-[#e09020] text-white font-semibold
                                  text-xs px-3 py-2 rounded-lg transition-colors w-full">
                See rooms
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
