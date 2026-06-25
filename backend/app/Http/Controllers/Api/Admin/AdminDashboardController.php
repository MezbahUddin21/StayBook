<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        $totalRevenue      = Booking::where('status', 'confirmed')->sum('total_price');
        $thisMonthRevenue  = Booking::where('status', 'confirmed')
            ->whereMonth('created_at', now()->month)
            ->sum('total_price');

        $revenueByMonth = Booking::where('status', 'confirmed')
            ->whereYear('created_at', now()->year)
            ->selectRaw('MONTH(created_at) as month, SUM(total_price) as revenue, COUNT(*) as bookings')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topHotels = Hotel::withCount('bookings')
            ->withSum(['bookings' => fn($q) => $q->where('status', 'confirmed')], 'total_price')
            ->orderByDesc('bookings_sum_total_price')
            ->limit(5)
            ->get();

        $bookingsByStatus = Booking::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $recentBookings = Booking::with(['user', 'hotel'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'total_revenue'      => $totalRevenue,
            'this_month_revenue' => $thisMonthRevenue,
            'total_bookings'     => Booking::count(),
            'total_hotels'       => Hotel::count(),
            'total_users'        => User::count(),
            'total_reviews'      => Review::count(),
            'pending_hotels'     => Hotel::where('status', 'pending')->count(),
            'revenue_by_month'   => $revenueByMonth,
            'top_hotels'         => $topHotels,
            'bookings_by_status' => $bookingsByStatus,
            'recent_bookings'    => $recentBookings,
        ]);
    }

    public function hotels(Request $request)
    {
        $hotels = Hotel::with('owner')
            ->withCount(['bookings', 'reviews'])
            ->withAvg('reviews', 'rating')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(15);

        return response()->json($hotels);
    }

    public function approveHotel(Hotel $hotel)
    {
        $hotel->update(['status' => 'active']);
        return response()->json($hotel);
    }

    public function rejectHotel(Hotel $hotel)
    {
        $hotel->update(['status' => 'inactive']);
        return response()->json($hotel);
    }

    public function deleteHotel(Hotel $hotel)
    {
        $hotel->delete();
        return response()->json(['message' => 'Hotel deleted']);
    }

    public function bookings(Request $request)
    {
        $bookings = Booking::with(['user', 'hotel', 'room'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('booking_ref', 'like', "%{$request->search}%")
                                                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(15);

        return response()->json($bookings);
    }

    public function users(Request $request)
    {
        $users = User::withCount('bookings')
            ->withSum(['bookings' => fn($q) => $q->where('status', 'confirmed')], 'total_price')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                                                  ->orWhere('email', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(15);

        return response()->json($users);
    }

    public function toggleAdminRole(User $user)
    {
        $user->update(['is_admin' => ! $user->is_admin]);
        return response()->json($user);
    }

    public function reviews(Request $request)
    {
        $reviews = Review::with(['user', 'hotel'])
            ->when($request->search, fn($q) => $q->whereHas('hotel', fn($h) => $h->where('name', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(15);

        return response()->json($reviews);
    }

    public function deleteReview(Review $review)
    {
        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
