# StayBook — Booking.com Clone

A full-stack hotel booking platform built with **Laravel 11**, **React 18**, **MySQL**, and **Tailwind CSS**.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS 3, Zustand, Axios  |
| Backend   | Laravel 11, Laravel Sanctum (API auth)          |
| Database  | MySQL 8                                         |
| Payments  | Stripe (PaymentIntents API)                     |
| Charts    | Recharts                                        |

---

## Features

- 🔍 **Hotel search** — city, dates, guests, price range, star rating, amenities
- 🏨 **Hotel detail page** — image gallery, room cards, live availability check
- 📅 **Booking flow** — multi-step: guest details → Stripe payment → confirmation
- ⭐ **Reviews system** — per-category scores (cleanliness, comfort, location, service), rating distribution
- 🔐 **Auth** — register, login, profile, password change (Sanctum token auth)
- ❤️ **Wishlist** — save and view favourite hotels
- 📋 **My Bookings** — view, cancel, write reviews
- 🛡️ **Admin panel** — dashboard with charts, hotel approval, bookings table, users, reviews moderation

---

## Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- MySQL 8

---

### 1. Clone & setup backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env`:
```
DB_DATABASE=booking_clone
DB_USERNAME=root
DB_PASSWORD=your_password

STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
```

```bash
php artisan migrate
php artisan db:seed
php artisan serve
# Runs on http://localhost:8000
```

---

### 2. Setup frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PK=pk_test_your_key
```

```bash
npm run dev
# Runs on http://localhost:5173
```

---

## Demo Credentials

| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@bookingclone.com    | password   |
| User  | user@bookingclone.com     | password   |

---

## Stripe Test Cards

| Card Number          | Result   |
|----------------------|----------|
| 4242 4242 4242 4242  | Success  |
| 4000 0000 0000 9995  | Declined |

Use any future expiry date and any 3-digit CVC.

---

## Project Structure

```
booking-clone/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/      # Auth, Hotel, Room, Booking, Review
│   │   ├── Http/Controllers/Api/Admin/ # Admin dashboard controller
│   │   ├── Http/Middleware/           # AdminMiddleware
│   │   ├── Models/                    # User, Hotel, Room, Booking, Review, Wishlist
│   │   └── Policies/                  # BookingPolicy, HotelPolicy
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/DatabaseSeeder.php
│   │   └── factories/UserFactory.php
│   └── routes/api.php
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── HotelCard.jsx
        │   ├── ReviewList.jsx
        │   ├── WriteReview.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── SearchPage.jsx
        │   ├── HotelPage.jsx
        │   ├── BookingPage.jsx
        │   ├── MyBookingsPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── WishlistPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── admin/
        │       ├── AdminLayout.jsx
        │       ├── AdminDashboard.jsx
        │       ├── AdminHotels.jsx
        │       ├── AdminBookings.jsx
        │       ├── AdminUsers.jsx
        │       └── AdminReviews.jsx
        ├── store/authStore.js
        └── lib/axios.js
```

---

## API Endpoints

### Public
| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| POST   | /api/register                   | Register              |
| POST   | /api/login                      | Login                 |
| GET    | /api/hotels                     | List/search hotels    |
| GET    | /api/hotels/{id}                | Hotel detail          |
| GET    | /api/hotels/{id}/availability   | Check room availability|
| GET    | /api/hotels/{id}/reviews        | Hotel reviews         |
| GET    | /api/rooms/{id}                 | Room detail           |

### Authenticated
| Method | Endpoint                                | Description              |
|--------|-----------------------------------------|--------------------------|
| GET    | /api/me                                 | Current user             |
| PUT    | /api/me                                 | Update profile           |
| GET    | /api/bookings                           | My bookings              |
| POST   | /api/bookings                           | Create booking           |
| POST   | /api/bookings/{id}/payment-intent       | Create Stripe intent     |
| POST   | /api/bookings/{id}/confirm-payment      | Confirm payment          |
| POST   | /api/bookings/{id}/cancel               | Cancel booking           |
| POST   | /api/bookings/{id}/review               | Submit review            |
| POST   | /api/hotels/{id}/wishlist               | Toggle wishlist          |

### Admin
| Method | Endpoint                          | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | /api/admin/stats                  | Dashboard stats       |
| GET    | /api/admin/hotels                 | All hotels            |
| POST   | /api/admin/hotels/{id}/approve    | Approve hotel         |
| POST   | /api/admin/hotels/{id}/reject     | Reject hotel          |
| GET    | /api/admin/bookings               | All bookings          |
| GET    | /api/admin/users                  | All users             |
| POST   | /api/admin/users/{id}/toggle-admin| Toggle admin role     |
| GET    | /api/admin/reviews                | All reviews           |
| DELETE | /api/admin/reviews/{id}           | Delete review         |
