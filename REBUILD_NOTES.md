# Rebuild Notes — Laravel Skeleton Restored

The original `backend/` export only contained custom code (`app/`,
`routes/api.php`, `database/migrations`, `database/seeders`, a couple of
`config/*.php` files, and `bootstrap/app.php`). The standard Laravel 11
skeleton was missing, so the project couldn't run. This zip adds it back:

- `artisan`
- `public/index.php`, `public/.htaccess`
- `routes/web.php`, `routes/console.php`
- `app/Providers/AppServiceProvider.php` + `bootstrap/providers.php`
- All core `config/*.php` files (`app`, `auth`, `database`, `cache`,
  `session`, `queue`, `logging`, `mail`, `hashing`, `broadcasting`, `sanctum`)
- `storage/` and `bootstrap/cache/` directory structure
- `.gitignore`, `phpunit.xml`

Also removed: a stray empty `{app` folder left over from however the
original zip was generated. Also changed: enabled `supports_credentials` in
`config/cors.php`, which Sanctum's SPA cookie auth needs (implied by your
`AuthController` + Sanctum middleware setup) — it was `false` before.

Nothing in your `app/`, `database/`, or `routes/api.php` logic was touched.

## Setup (run yourself — needs PHP 8.2+, Composer, MySQL, Redis, Node)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your DB credentials, Stripe/Cloudinary keys, then:

```bash
php artisan migrate
php artisan db:seed
php artisan serve
```

Frontend:

```bash
cd ../frontend
npm install
npm run dev
```

Or just run `./setup.sh` from the project root to automate all of the above.

## Notes

- `.env.example` defaults assume MySQL on `127.0.0.1:3306` and Redis on
  `127.0.0.1:6379` — adjust if yours differ.
- `SESSION_DRIVER`/`CACHE_DRIVER`/`QUEUE_CONNECTION` default to `file`/`sync`,
  so you only need the tables from your own migrations (no `sessions`,
  `cache`, or `jobs` DB tables required).
- If you change `SANCTUM_STATEFUL_DOMAINS`/`SESSION_DOMAIN` for production,
  make sure `FRONTEND_URL` in `.env` matches your deployed frontend origin.
