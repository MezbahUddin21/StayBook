#!/bin/bash
set -e

echo "================================================"
echo "  StayBook — Booking Clone Setup Script"
echo "================================================"
echo ""

# ── Backend ──────────────────────────────────────────
echo "📦 Installing Laravel dependencies..."
cd backend
composer install --no-interaction --prefer-dist

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created backend/.env from example"
fi

php artisan key:generate --ansi

echo ""
echo "⚠️  Please edit backend/.env with your database credentials."
echo "   Then press ENTER to continue..."
read -r

php artisan migrate --force
php artisan db:seed --force

echo ""
echo "✅ Backend ready!"
echo ""

# ── Frontend ─────────────────────────────────────────
cd ../frontend
echo "📦 Installing Node dependencies..."
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created frontend/.env from example"
fi

echo ""
echo "================================================"
echo "  ✅ Setup complete!"
echo ""
echo "  Start backend:   cd backend && php artisan serve"
echo "  Start frontend:  cd frontend && npm run dev"
echo ""
echo "  Admin login:  admin@bookingclone.com / password"
echo "  User login:   user@bookingclone.com  / password"
echo "================================================"
