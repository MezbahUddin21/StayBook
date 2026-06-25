import { useState } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const SCORE_LABELS = ['','Terrible','Poor','Disappointing','Below avg','Average',
                      'Above avg','Good','Very Good','Excellent','Exceptional'];

const CATEGORIES = [
  { key: 'cleanliness',     label: 'Cleanliness'    },
  { key: 'comfort',         label: 'Comfort'        },
  { key: 'location',        label: 'Location'       },
  { key: 'service',         label: 'Service'        },
  { key: 'value_for_money', label: 'Value for money'},
];

function ScoreSlider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-semibold text-[#003580]">
          {value ? `${value} · ${SCORE_LABELS[value]}` : 'Tap to rate'}
        </span>
      </div>
      <input type="range" min={1} max={10} value={value || 5}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 accent-[#003580] cursor-pointer" />
      <div className="flex justify-between text-xs text-gray-300 mt-0.5">
        <span>1</span><span>10</span>
      </div>
    </div>
  );
}

export default function WriteReview({ booking, onSubmit }) {
  const [form, setForm] = useState({
    rating: 8, title: '', body: '',
    cleanliness: null, comfort: null, location: null,
    service: null, value_for_money: null, would_recommend: true,
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.body.trim().length < 20) {
      toast.error('Please write at least 20 characters in your review');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/bookings/${booking.id}/review`, form);
      toast.success('Thank you for your review!');
      onSubmit?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Overall score */}
      <div className="bg-[#003580] rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">Overall experience</p>
            <p className="text-blue-200 text-sm">{SCORE_LABELS[form.rating]}</p>
          </div>
          <span className="text-5xl font-black">{form.rating}</span>
        </div>
        <input type="range" min={1} max={10} value={form.rating}
          onChange={e => set('rating', Number(e.target.value))}
          className="w-full h-2 accent-[#f5a623] cursor-pointer" />
        <div className="flex justify-between text-xs text-blue-300 mt-1">
          <span>1 – Terrible</span>
          <span>10 – Exceptional</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Review title <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input type="text" value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Amazing stay with stunning views!"
          maxLength={100}
          className="input" />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your review <span className="text-red-400">*</span>
        </label>
        <textarea value={form.body}
          onChange={e => set('body', e.target.value)}
          placeholder="Tell other travelers about your experience — what did you like, what could be improved?"
          rows={4}
          className="input resize-none" />
        <div className="flex justify-between mt-1">
          <p className={`text-xs ${form.body.length < 20 ? 'text-amber-500' : 'text-green-600'}`}>
            {form.body.length < 20 ? `${20 - form.body.length} more characters needed` : '✓ Minimum length met'}
          </p>
          <p className="text-xs text-gray-400">{form.body.length} chars</p>
        </div>
      </div>

      {/* Category scores */}
      <div className="space-y-4 bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-800">Rate individual aspects</p>
        {CATEGORIES.map(({ key, label }) => (
          <ScoreSlider key={key} label={label} value={form[key]}
            onChange={v => set(key, v)} />
        ))}
      </div>

      {/* Would recommend */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div onClick={() => set('would_recommend', !form.would_recommend)}
          className={`w-12 h-6 rounded-full transition-colors relative ${form.would_recommend ? 'bg-[#003580]' : 'bg-gray-200'}`}>
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.would_recommend ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm text-gray-700">I would recommend this property to others</span>
      </label>

      <button type="submit" disabled={loading}
        className="btn-primary w-full py-3 text-base">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Submitting…
          </span>
        ) : 'Submit review'}
      </button>
    </form>
  );
}
