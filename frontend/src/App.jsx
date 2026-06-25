import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout   from './components/layouts/MainLayout';
import AdminLayout  from './pages/admin/AdminLayout';

// Public pages
import HomePage       from './pages/HomePage';
import SearchPage     from './pages/SearchPage';
import HotelPage      from './pages/HotelPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';

// Protected pages
import BookingPage    from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage    from './pages/ProfilePage';
import WishlistPage   from './pages/WishlistPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHotels    from './pages/admin/AdminHotels';
import AdminBookings  from './pages/admin/AdminBookings';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminReviews   from './pages/admin/AdminReviews';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        }}
      />
      <Routes>
        {/* Main layout */}
        <Route element={<MainLayout />}>
          <Route path="/"           element={<HomePage />} />
          <Route path="/search"     element={<SearchPage />} />
          <Route path="/hotels/:id" element={<HotelPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />

          <Route path="/booking/:roomId" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute><WishlistPage /></ProtectedRoute>
          } />
        </Route>

        {/* Admin layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index            element={<AdminDashboard />} />
          <Route path="hotels"    element={<AdminHotels />} />
          <Route path="bookings"  element={<AdminBookings />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="reviews"   element={<AdminReviews />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
