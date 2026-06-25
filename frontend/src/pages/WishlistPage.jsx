import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../lib/axios';
import HotelCard from '../components/HotelCard';

export default function WishlistPage() {
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist')
      .then(({ data }) => setHotels(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Saved properties</h1>
        {!loading && <span className="text-gray-400 text-sm">· {hotels.length} saved</span>}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-20 card">
          <Heart className="w-14 h-14 mx-auto mb-4 text-gray-200" />
          <p className="font-semibold text-gray-500">No saved properties yet</p>
          <p className="text-sm text-gray-400 mt-1">Tap the heart icon on any hotel to save it here.</p>
          <Link to="/search" className="btn-primary mt-5 inline-block px-6">Browse hotels</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {hotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}
