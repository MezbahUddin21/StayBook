<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/hotels',                      [HotelController::class, 'index']);
Route::get('/hotels/{hotel}',              [HotelController::class, 'show']);
Route::get('/hotels/{hotel}/availability', [HotelController::class, 'checkAvailability']);
Route::get('/hotels/{hotel}/reviews',      [ReviewController::class, 'index']);

Route::get('/rooms/{room}', [RoomController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/me',               [AuthController::class, 'me']);
    Route::put('/me',               [AuthController::class, 'updateProfile']);
    Route::post('/me/password',     [AuthController::class, 'changePassword']);

    // Hotels (owner/admin)
    Route::post('/hotels',            [HotelController::class, 'store']);
    Route::put('/hotels/{hotel}',     [HotelController::class, 'update']);
    Route::delete('/hotels/{hotel}',  [HotelController::class, 'destroy']);
    Route::get('/my-hotels',          [HotelController::class, 'myHotels']);
    Route::post('/hotels/{hotel}/wishlist', [HotelController::class, 'toggleWishlist']);
    Route::get('/wishlist',           [HotelController::class, 'wishlist']);

    // Rooms (owner)
    Route::post('/hotels/{hotel}/rooms',  [RoomController::class, 'store']);
    Route::put('/rooms/{room}',           [RoomController::class, 'update']);
    Route::delete('/rooms/{room}',        [RoomController::class, 'destroy']);

    // Bookings
    Route::get('/bookings',                                [BookingController::class, 'index']);
    Route::post('/bookings',                               [BookingController::class, 'store']);
    Route::get('/bookings/{booking}',                      [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/payment-intent',      [BookingController::class, 'createPaymentIntent']);
    Route::post('/bookings/{booking}/confirm-payment',     [BookingController::class, 'confirmPayment']);
    Route::post('/bookings/{booking}/cancel',              [BookingController::class, 'cancel']);

    // Reviews
    Route::post('/bookings/{booking}/review', [ReviewController::class, 'store']);
    Route::delete('/reviews/{review}',        [ReviewController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats',                       [AdminDashboardController::class, 'stats']);

    Route::get('/hotels',                      [AdminDashboardController::class, 'hotels']);
    Route::post('/hotels/{hotel}/approve',     [AdminDashboardController::class, 'approveHotel']);
    Route::post('/hotels/{hotel}/reject',      [AdminDashboardController::class, 'rejectHotel']);
    Route::delete('/hotels/{hotel}',           [AdminDashboardController::class, 'deleteHotel']);

    Route::get('/bookings',                    [AdminDashboardController::class, 'bookings']);

    Route::get('/users',                       [AdminDashboardController::class, 'users']);
    Route::post('/users/{user}/toggle-admin',  [AdminDashboardController::class, 'toggleAdminRole']);

    Route::get('/reviews',                     [AdminDashboardController::class, 'reviews']);
    Route::delete('/reviews/{review}',         [AdminDashboardController::class, 'deleteReview']);
});
