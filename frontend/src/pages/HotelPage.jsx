import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import {
  MapPin, Star, Wifi, Car, Waves, Dumbbell, Coffee,
  UtensilsCrossed, ChevronLeft, ChevronRight, Users,
  BedDouble, CheckCircle, Share2, Heart, Clock, Info
} from 'lucide-react';
import api from '../lib/axios';
import ReviewList from '../components/ReviewList';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AMENITY_ICONS = {
  'Free WiFi': Wifi, 'Swimming Pool': Waves, 'Free Parking': Car,
  'Fitness Center': Dumbbell, 'Bar': Coffee, 'Restaurant': UtensilsCrossed,
};

const RATING_LABELS = [
  [9,'Exceptional'],[8,'Excellent'],[7,'Very Good'],[6,'Good'],[0,'Pleasant']
];
function getRatingLabel(r) { return (RATING_LABELS.find(([m]) => r >= m) || [0,'Pleasant'])[1]; }

function ImageGallery({ images, thumbnail, name }) {
  const [idx, setIdx] = useState(0);
  const all = [thumbnail, ...(images || [])].filter(Boolean);
  if (!all.length) return <div className="h-80 bg-gradient-to-br from-blue-300 to-blue-500 rounded-2xl" />;

  return (
    <div className="flex gap-2 h-80">
      <div className="relative flex-1 rounded-2xl overflow-hidden cursor-pointer group">
        <img src={all[idx]} alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        {all.length > 1 && <>
          <button onClick={() => setIdx(i => (i - 1 + all.length) % all.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setIdx(i => (i + 1) % all.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {all.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${i === idx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/60'}`} />
            ))}
          </div>
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {idx + 1} / {all.length}
          </span>
        </>}
      </div>
      {all.length > 1 && (
        <div className="flex flex-col gap-2 w-40">
          {all.slice(1, 4).map((img, i) => (
            <button key={i} onClick={() => setIdx(i + 1)}
              className={`flex-1 rounded-xl overflow-hidden border-2 transition-colors
                ${idx === i + 1 ? 'border-[#003580]' : 'border-transparent'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, checkIn, checkOut, guests, onBook }) {
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1;
  const total = (room.price_per_night * nights).toFixed(2);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
      {room.images?.[0] ? (
        <img src={room.images[0]} alt={room.name} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-blue-100 to-blue-200" />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900">{room.name}</h3>
            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
              {room.type}
            </span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-black text-gray-900">${room.price_per_night}</p>
            <p className="text-xs text-gray-400">/ night</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Up to {room.capacity} guests</span>
          <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{room.beds} {room.beds === 1 ? 'bed' : 'beds'}</span>
          {room.size_sqm && <span>{room.size_sqm} m²</span>}
          {room.smoking ? <span className="text-gray-400">Smoking</span> : <span className="text-green-600">Non-smoking</span>}
        </div>

        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 4).map(a => (
              <span key={a} className="text-xs bg-green-50 text-green-700 border border-green-100 rounded px-2 py-0.5">{a}</span>
            ))}
          </div>
        )}

        {checkIn && checkOut && (
          <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm">
            <span className="text-gray-600">
              {nights} night{nights !== 1 ? 's' : ''} total:
            </span>
            <span className="font-black text-gray-900 ml-2">${total}</span>
          </div>
        )}

        <button onClick={() => onBook(room)}
          disabled={room.available_count === 0}
          className="w-full bg-[#003580] hover:bg-[#00264d] text-white font-semibold
                     py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm">
          {room.available_count === 0 ? 'Not available' : 'Reserve this room →'}
        </button>

        {room.available_count > 0 && room.available_count <= 3 && (
          <p className="text-xs text-red-500 text-center font-medium">
            Only {room.available_count} left!
          </p>
        )}
      </div>
    </div>
  );
}

export default function HotelPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();

  const [hotel,    setHotel]    = useState(null);
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [roomLoad, setRoomLoad] = useState(false);
  const [saved,    setSaved]    = useState(false);

  const checkIn  = searchParams.get('check_in')  ? new Date(searchParams.get('check_in'))  : null;
  const checkOut = searchParams.get('check_out') ? new Date(searchParams.get('check_out')) : null;
  const guests   = Number(searchParams.get('guests') || 2);

  useEffect(() => {
    api.get(`/hotels/${id}`).then(({ data }) => {
      setHotel(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut) fetchAvailability();
  }, [id, searchParams]);

  const fetchAvailability = async () => {
    setRoomLoad(true);
    try {
      const { data } = await api.get(`/hotels/${id}/availability`, {
        params: {
          check_in:  searchParams.get('check_in'),
          check_out: searchParams.get('check_out'),
          guests,
        },
      });
      setRooms(data);
    } finally {
      setRoomLoad(false);
    }
  };

  const handleBook = (room) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/booking/${room.id}?${searchParams.toString()}`);
  };

  const updateSearch = (key, val) => {
    const p = new URLSearchParams(searchParams);
    p.set(key, val instanceof Date ? val.toISOString().split('T')[0] : val);
    setSearchParams(p);
  };

  const toggleSave = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post(`/hotels/${hotel.id}/wishlist`);
      setSaved(s => !s);
      toast.success(saved ? 'Removed from saved' : 'Saved to wishlist');
    } catch {}
  };

  const shareHotel = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const avg = Number(hotel?.reviews_avg_rating || 0);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-80 bg-gray-100 rounded-2xl" />
      <div className="h-8 w-64 bg-gray-100 rounded-lg" />
      <div className="h-4 w-40 bg-gray-100 rounded" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Gallery */}
      <ImageGallery images={hotel.images} thumbnail={hotel.thumbnail} name={hotel.name} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div className="flex gap-0.5">
              {Array.from({ length: hotel.star_rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-gray-400 capitalize">{hotel.city}, {hotel.country}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">{hotel.name}</h1>
          <a href={`https://maps.google.com?q=${encodeURIComponent(hotel.address)}`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-sm text-[#003580] hover:underline mt-1.5">
            <MapPin className="w-4 h-4" />
            {hotel.address}
          </a>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Check-in: {hotel.check_in_time}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Check-out: {hotel.check_out_time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={toggleSave}
            className={`p-2.5 rounded-xl border transition-colors
              ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
            <Heart className={`w-5 h-5 ${saved ? 'fill-red-500' : ''}`} />
          </button>
          <button onClick={shareHotel}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          {avg > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">{getRatingLabel(avg)}</span>
                <span className="bg-[#003580] text-white font-black px-3 py-1.5 rounded-xl text-base">
                  {avg.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{hotel.reviews_count} reviews</p>
            </div>
          )}
        </div>
      </div>

      {/* Amenities */}
      {hotel.amenities?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map(a => {
              const Icon = AMENITY_ICONS[a] || CheckCircle;
              return (
                <span key={a} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700">
                  <Icon className="w-4 h-4 text-[#003580]" />
                  {a}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">About this property</h2>
        <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
        {hotel.policies && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#003580] font-semibold mb-1 text-sm">
              <Info className="w-4 h-4" />
              Property policies
            </div>
            <p className="text-sm text-gray-600">{hotel.policies}</p>
          </div>
        )}
      </div>

      {/* Availability search */}
      <div className="bg-[#003580] rounded-2xl p-6" id="availability">
        <h2 className="text-white font-bold text-lg mb-4">Check availability</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 flex-1 min-w-[140px]">
            <DatePicker selected={checkIn}
              onChange={d => updateSearch('check_in', d)}
              placeholderText="Check-in date"
              minDate={new Date()}
              className="py-3 outline-none text-sm text-gray-800 bg-transparent w-full" />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 flex-1 min-w-[140px]">
            <DatePicker selected={checkOut}
              onChange={d => updateSearch('check_out', d)}
              placeholderText="Check-out date"
              minDate={checkIn || new Date()}
              className="py-3 outline-none text-sm text-gray-800 bg-transparent w-full" />
          </div>
          <select value={guests} onChange={e => updateSearch('guests', e.target.value)}
            className="bg-white rounded-xl px-4 py-3 text-sm text-gray-800 outline-none">
            {[1,2,3,4,5,6,7,8].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'adult' : 'adults'}</option>
            ))}
          </select>
          <button onClick={fetchAvailability}
            disabled={!checkIn || !checkOut}
            className="bg-[#f5a623] hover:bg-[#e09020] disabled:opacity-60 text-white font-bold
                       px-6 py-3 rounded-xl transition-colors text-sm">
            {roomLoad ? 'Searching…' : 'Check rooms'}
          </button>
        </div>
      </div>

      {/* Rooms */}
      {roomLoad ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : rooms.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Available rooms
            <span className="text-base font-normal text-gray-400 ml-2">· {rooms.length} option{rooms.length !== 1 ? 's' : ''}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room}
                checkIn={searchParams.get('check_in')}
                checkOut={searchParams.get('check_out')}
                guests={guests}
                onBook={handleBook} />
            ))}
          </div>
        </div>
      ) : checkIn && checkOut ? (
        <div className="text-center py-10 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="font-semibold text-amber-800">No available rooms for the selected dates</p>
          <p className="text-sm text-amber-600 mt-1">Try different dates or number of guests</p>
        </div>
      ) : null}

      {/* Reviews */}
      <ReviewList hotel={hotel} />
    </div>
  );
}
