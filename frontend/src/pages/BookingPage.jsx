import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MapPin, BedDouble, Calendar, Users, ChevronLeft, Lock, AlertCircle } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1e293b',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
};

function PaymentForm({ booking, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading]   = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { data } = await api.post(`/bookings/${booking.id}/payment-intent`);
      const result   = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) throw new Error(result.error.message);

      await api.post(`/bookings/${booking.id}/confirm-payment`, {
        payment_intent_id: result.paymentIntent.id,
      });
      toast.success('Booking confirmed! 🎉');
      onSuccess(booking.booking_ref);
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:ring-2 focus-within:ring-[#003580] transition-all">
        <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Card details</p>
        <CardElement options={CARD_STYLE} onChange={e => setCardReady(e.complete)} />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock className="w-3.5 h-3.5" />
        Secured by Stripe · Your card data is encrypted
      </div>

      <p className="text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-lg p-3">
        Use test card <span className="font-mono font-semibold text-[#003580]">4242 4242 4242 4242</span>,
        any future date, any 3-digit CVC.
      </p>

      <button type="submit" disabled={loading || !stripe || !cardReady}
        className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Processing payment…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ${Number(booking.total_price).toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}

export default function BookingPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [room,    setRoom]    = useState(null);
  const [booking, setBooking] = useState(null);
  const [step,    setStep]    = useState(1); // 1=details, 2=payment, 3=confirmed
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [guest, setGuest] = useState({
    first_name: '', last_name: '', email: '', phone: '',
  });
  const [special, setSpecial] = useState('');

  const checkIn   = searchParams.get('check_in');
  const checkOut  = searchParams.get('check_out');
  const guests    = Number(searchParams.get('guests') || 1);
  const nights    = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1;

  useEffect(() => {
    api.get(`/rooms/${roomId}`).then(({ data }) => {
      setRoom(data);
      setLoading(false);
    }).catch(() => navigate('/'));
  }, [roomId]);

  const createBooking = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/bookings', {
        hotel_id:      room.hotel_id,
        room_id:       room.id,
        check_in:      checkIn,
        check_out:     checkOut,
        guests,
        rooms_count:   1,
        guest_details: guest,
        special_requests: special,
      });
      setBooking(data);
      setStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create booking');
    } finally {
      setCreating(false);
    }
  };

  const handleSuccess = (ref) => {
    setStep(3);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded-lg" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );

  const total = (room.price_per_night * nights).toFixed(2);

  // Confirmed screen
  if (step === 3) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h1>
      <p className="text-gray-500 mb-2">Your reservation has been successfully made.</p>
      <p className="font-mono text-[#003580] font-bold text-lg mb-8">{booking?.booking_ref}</p>
      <div className="card p-5 text-left mb-6 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Hotel</span><span className="font-medium">{room.hotel?.name}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Room</span><span className="font-medium">{room.name}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span className="font-medium">{checkIn}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span className="font-medium">{checkOut}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-medium">{guests}</span></div>
        <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Total paid</span><span className="font-black text-[#003580]">${total}</span></div>
      </div>
      <div className="flex gap-3 justify-center">
        <Link to="/my-bookings" className="btn-primary px-6">View my bookings</Link>
        <Link to="/" className="btn-outline px-6">Back to home</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <button onClick={() => step === 2 ? setStep(1) : navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        {step === 2 ? 'Back to details' : 'Back'}
      </button>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {['Your details', 'Payment'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[#003580] text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left column */}
        <div className="space-y-5">
          {step === 1 && (
            <form onSubmit={createBooking} className="space-y-5">
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4">Your details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['first_name', 'First name',     'text',  'John'],
                    ['last_name',  'Last name',      'text',  'Doe'],
                    ['email',      'Email address',  'email', 'you@example.com'],
                    ['phone',      'Phone number',   'tel',   '+1 234 567 8900'],
                  ].map(([key, label, type, placeholder]) => (
                    <div key={key} className={key === 'email' ? 'col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <input type={type} required value={guest[key]}
                        onChange={e => setGuest(g => ({ ...g, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="input" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-3">Special requests</h2>
                <p className="text-xs text-gray-400 mb-3">Not guaranteed, but we'll do our best to accommodate you.</p>
                <textarea value={special} onChange={e => setSpecial(e.target.value)}
                  rows={3} maxLength={500}
                  placeholder="e.g. Early check-in, high floor, twin beds…"
                  className="input resize-none" />
              </div>

              <button type="submit" disabled={creating}
                className="btn-secondary w-full py-3.5 text-base">
                {creating ? 'Saving…' : 'Continue to payment →'}
              </button>
            </form>
          )}

          {step === 2 && booking && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-1">Payment</h2>
              <p className="text-sm text-gray-400 mb-5">Complete your booking securely.</p>
              <Elements stripe={stripePromise}>
                <PaymentForm booking={booking} onSuccess={handleSuccess} />
              </Elements>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="card p-5 h-fit sticky top-20">
          <h3 className="font-bold text-gray-900 mb-4">Booking summary</h3>

          {room.images?.[0] && (
            <img src={room.images[0]} alt={room.name}
              className="w-full h-32 object-cover rounded-lg mb-4" />
          )}

          <p className="font-semibold text-gray-900 text-sm">{room.hotel?.name}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 mb-3">
            <MapPin className="w-3 h-3" />
            {room.hotel?.city}, {room.hotel?.country}
          </p>
          <p className="text-sm text-gray-700 font-medium mb-4">{room.name}</p>

          <div className="space-y-2 text-sm text-gray-600 border-t border-b border-gray-100 py-3 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{checkIn} → {checkOut}</span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{guests} guest{guests !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>${room.price_per_night} × {nights} nights</span>
              <span>${total}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes & fees</span>
              <span className="text-green-600">Included</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Free cancellation before check-in date. No credit card surcharges.
          </div>
        </div>
      </div>
    </div>
  );
}
