import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { SlidersHorizontal, Search, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/axios';
import HotelCard from '../components/HotelCard';

const AMENITY_OPTIONS = [
  'Free WiFi','Swimming Pool','Fitness Center','Spa',
  'Restaurant','Bar','Free Parking','Airport Shuttle',
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta,    setMeta]    = useState(null);
  const [page,    setPage]    = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [city,     setCity]     = useState(searchParams.get('city') || '');
  const [checkIn,  setCheckIn]  = useState(searchParams.get('check_in')  ? new Date(searchParams.get('check_in'))  : null);
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') ? new Date(searchParams.get('check_out')) : null);
  const [guests,   setGuests]   = useState(Number(searchParams.get('guests') || 2));

  const [filters, setFilters] = useState({
    min_price: '', max_price: '',
    stars: [], amenities: [],
    sort: 'recommended',
  });

  useEffect(() => { fetchHotels(); }, [searchParams, page]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hotels', {
        params: {
          city:      searchParams.get('city') || '',
          check_in:  searchParams.get('check_in') || '',
          check_out: searchParams.get('check_out') || '',
          guests:    searchParams.get('guests') || 2,
          min_price: filters.min_price,
          max_price: filters.max_price,
          stars:     filters.stars.join(','),
          amenities: filters.amenities.join(','),
          sort:      filters.sort,
          page,
        },
      });
      setHotels(data.data || []);
      setMeta(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (city)     p.set('city', city);
    if (checkIn)  p.set('check_in',  checkIn.toISOString().split('T')[0]);
    if (checkOut) p.set('check_out', checkOut.toISOString().split('T')[0]);
    p.set('guests', guests);
    setSearchParams(p);
    setPage(1);
  };

  const toggleStar = (s) => {
    setFilters(f => ({
      ...f,
      stars: f.stars.includes(s) ? f.stars.filter(x => x !== s) : [...f.stars, s],
    }));
    setPage(1);
  };

  const toggleAmenity = (a) => {
    setFilters(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ min_price: '', max_price: '', stars: [], amenities: [], sort: 'recommended' });
    setPage(1);
  };

  const hasActiveFilters = filters.min_price || filters.max_price ||
    filters.stars.length > 0 || filters.amenities.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearch}
        className="bg-[#f5a623] p-1.5 rounded-xl flex flex-wrap gap-1.5 mb-6 shadow-md">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 flex-1 min-w-[160px]">
          <input type="text" placeholder="Destination" value={city}
            onChange={e => setCity(e.target.value)}
            className="py-2.5 outline-none text-gray-800 w-full text-sm" />
        </div>
        <div className="flex items-center bg-white rounded-lg px-3">
          <DatePicker selected={checkIn} onChange={setCheckIn}
            placeholderText="Check-in" minDate={new Date()}
            className="py-2.5 outline-none text-sm text-gray-800 w-24" />
        </div>
        <div className="flex items-center bg-white rounded-lg px-3">
          <DatePicker selected={checkOut} onChange={setCheckOut}
            placeholderText="Check-out" minDate={checkIn || new Date()}
            className="py-2.5 outline-none text-sm text-gray-800 w-24" />
        </div>
        <select value={guests} onChange={e => setGuests(Number(e.target.value))}
          className="bg-white rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none">
          {[1,2,3,4,5,6,7,8].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'adult' : 'adults'}</option>
          ))}
        </select>
        <button type="submit"
          className="bg-[#003580] hover:bg-[#00264d] text-white font-bold px-5 py-2.5
                     rounded-lg text-sm transition-colors flex items-center gap-1.5">
          <Search className="w-4 h-4" />
          Search
        </button>
      </form>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 hidden lg:block">
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold text-gray-800">
                <SlidersHorizontal className="w-4 h-4" />
                Filter results
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="text-xs text-[#003580] hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Price */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Price per night</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min $" value={filters.min_price}
                  onChange={e => { setFilters(f => ({...f, min_price: e.target.value})); setPage(1); }}
                  className="input text-xs py-2" />
                <input type="number" placeholder="Max $" value={filters.max_price}
                  onChange={e => { setFilters(f => ({...f, max_price: e.target.value})); setPage(1); }}
                  className="input text-xs py-2" />
              </div>
            </div>

            {/* Stars */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Star rating</p>
              {[5,4,3,2,1].map(s => (
                <label key={s} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                  <input type="checkbox" checked={filters.stars.includes(s)}
                    onChange={() => toggleStar(s)}
                    className="accent-[#003580]" />
                  <span className="text-yellow-400 text-sm">{'★'.repeat(s)}</span>
                  <span className="text-xs text-gray-500">{s} stars</span>
                </label>
              ))}
            </div>

            {/* Amenities */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
              {AMENITY_OPTIONS.map(a => (
                <label key={a} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                  <input type="checkbox" checked={filters.amenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                    className="accent-[#003580]" />
                  <span className="text-xs text-gray-600">{a}</span>
                </label>
              ))}
            </div>

            {/* Sort */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Sort by</p>
              <select value={filters.sort}
                onChange={e => { setFilters(f => ({...f, sort: e.target.value})); setPage(1); }}
                className="input text-sm">
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="rating">Star rating</option>
                <option value="reviews">Most reviewed</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 text-sm">
              {loading ? 'Searching…' : (
                <>
                  <span className="font-bold text-gray-900">{meta?.total || 0}</span> properties found
                  {searchParams.get('city') && ` in ${searchParams.get('city')}`}
                </>
              )}
            </p>
            <select value={filters.sort}
              onChange={e => { setFilters(f => ({...f, sort: e.target.value})); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 lg:hidden">
              <option value="recommended">Sort: Recommended</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20 text-gray-400 card">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No hotels found</p>
              <p className="text-sm mt-1">Try adjusting your search criteria or dates</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {hotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} searchParams={searchParams} />
                ))}
              </div>

              {/* Pagination */}
              {meta?.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${p === page ? 'bg-[#003580] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
