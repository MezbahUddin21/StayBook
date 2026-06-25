import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, MapPin, Calendar, Users, Star, Shield, HeadphonesIcon } from 'lucide-react';

const POPULAR_DESTINATIONS = [
  { city: 'Dubai',    country: 'UAE',          color: 'from-amber-400 to-orange-500' },
  { city: 'Paris',    country: 'France',       color: 'from-rose-400 to-pink-500'   },
  { city: 'London',   country: 'UK',           color: 'from-slate-400 to-slate-600' },
  { city: 'New York', country: 'USA',          color: 'from-blue-400 to-blue-600'   },
  { city: 'Tokyo',    country: 'Japan',        color: 'from-red-400 to-rose-600'    },
  { city: 'Bali',     country: 'Indonesia',    color: 'from-green-400 to-emerald-600'},
  { city: 'Bangkok',  country: 'Thailand',     color: 'from-yellow-400 to-amber-500'},
  { city: 'Rome',     country: 'Italy',        color: 'from-orange-400 to-red-500'  },
];

const WHY_US = [
  { icon: Shield,          title: 'Secure Booking',      desc: 'Your payment and personal data are always protected.' },
  { icon: Star,            title: 'Verified Reviews',    desc: 'All reviews are from real guests who stayed at the property.' },
  { icon: HeadphonesIcon,  title: '24/7 Support',        desc: 'Our team is here for you around the clock, every day.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [city,     setCity]     = useState('');
  const [checkIn,  setCheckIn]  = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests,   setGuests]   = useState(2);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ city, guests });
    if (checkIn)  params.set('check_in',  checkIn.toISOString().split('T')[0]);
    if (checkOut) params.set('check_out', checkOut.toISOString().split('T')[0]);
    navigate(`/search?${params}`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#003580] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003580] via-[#003580] to-[#00264d]" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 pb-24">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            Find your next<br />perfect stay
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Discover amazing hotels and resorts worldwide
          </p>

          <form onSubmit={handleSearch}
            className="bg-[#f5a623] p-1.5 rounded-2xl flex flex-wrap gap-1.5 shadow-2xl">
            {/* Destination */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 flex-1 min-w-[200px]">
              <MapPin className="text-[#003580] w-5 h-5 shrink-0" />
              <input type="text" placeholder="Where are you going?"
                value={city} onChange={e => setCity(e.target.value)}
                className="py-3.5 outline-none text-gray-800 w-full text-sm placeholder:text-gray-400" />
            </div>

            {/* Check-in */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 min-w-[140px]">
              <Calendar className="text-[#003580] w-4 h-4 shrink-0" />
              <DatePicker selected={checkIn} onChange={setCheckIn}
                placeholderText="Check-in" minDate={new Date()}
                className="py-3.5 outline-none text-sm text-gray-800 w-28" />
            </div>

            {/* Check-out */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 min-w-[140px]">
              <Calendar className="text-[#003580] w-4 h-4 shrink-0" />
              <DatePicker selected={checkOut} onChange={setCheckOut}
                placeholderText="Check-out" minDate={checkIn || new Date()}
                className="py-3.5 outline-none text-sm text-gray-800 w-28" />
            </div>

            {/* Guests */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-3">
              <Users className="text-[#003580] w-4 h-4 shrink-0" />
              <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                className="py-3.5 outline-none text-sm text-gray-800 bg-transparent pr-1">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'adult' : 'adults'}</option>
                ))}
              </select>
            </div>

            <button type="submit"
              className="bg-[#003580] hover:bg-[#00264d] text-white font-bold px-7 py-3.5
                         rounded-xl transition-colors flex items-center gap-2 text-sm">
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Popular destinations */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popular destinations</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_DESTINATIONS.map(({ city: c, country, color }) => (
            <button key={c}
              onClick={() => navigate(`/search?city=${c}`)}
              className={`relative rounded-2xl overflow-hidden h-32 bg-gradient-to-br ${color}
                          hover:scale-[1.03] transition-transform shadow-md group`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm">{c}</p>
                <p className="text-white/70 text-xs">{country}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Why us */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why book with StayBook?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-[#003580]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
