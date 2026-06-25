import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, Globe, Lock, Save } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [tab, setTab] = useState('profile');

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    country: user?.country || '',
  });
  const [pwForm, setPwForm] = useState({
    current_password: '', password: '', password_confirmation: '',
  });
  const [saving,    setSaving]    = useState(false);
  const [savingPw,  setSavingPw]  = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await api.post('/me/password', pwForm);
      toast.success('Password changed!');
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const TABS = [
    { id: 'profile',  label: 'Profile',          icon: User },
    { id: 'security', label: 'Password',          icon: Lock },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#003580] to-blue-400 flex items-center justify-center text-white text-3xl font-black">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          {user?.is_admin && (
            <span className="badge-purple mt-1 inline-block">Admin</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="card p-6 space-y-5">
          <h2 className="font-bold text-gray-900">Personal information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-gray-400" />Full name</span>
            </label>
            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" />Email address</span>
            </label>
            <input type="email" value={user?.email} disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" />Phone number</span>
            </label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+1 234 567 8900"
              className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" />Country</span>
            </label>
            <input type="text" value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              placeholder="United States"
              className="input" />
          </div>
          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={savePassword} className="card p-6 space-y-5">
          <h2 className="font-bold text-gray-900">Change password</h2>
          {[
            ['current_password', 'Current password',   'Enter your current password'],
            ['password',         'New password',        'Min. 8 characters'],
            ['password_confirmation', 'Confirm new password', 'Repeat your new password'],
          ].map(([key, label, placeholder]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input type="password" value={pwForm[key]}
                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required minLength={key !== 'current_password' ? 8 : undefined}
                className="input" />
            </div>
          ))}
          <button type="submit" disabled={savingPw}
            className="btn-primary flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {savingPw ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}
