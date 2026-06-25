<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Hotel $hotel)
    {
        $reviews = Review::where('hotel_id', $hotel->id)
            ->with('user:id,name,created_at')
            ->latest()
            ->paginate(10);

        $breakdown = Review::where('hotel_id', $hotel->id)
            ->selectRaw('
                AVG(rating)          as avg_rating,
                AVG(cleanliness)     as avg_cleanliness,
                AVG(comfort)         as avg_comfort,
                AVG(location)        as avg_location,
                AVG(service)         as avg_service,
                AVG(value_for_money) as avg_value,
                COUNT(*)             as total
            ')
            ->first();

        $distribution = Review::where('hotel_id', $hotel->id)
            ->selectRaw('
                CASE
                    WHEN rating >= 9 THEN 9
                    WHEN rating >= 7 THEN 7
                    WHEN rating >= 5 THEN 5
                    WHEN rating >= 3 THEN 3
                    ELSE 1
                END as band,
                COUNT(*) as count
            ')
            ->groupBy('band')
            ->orderByDesc('band')
            ->get();

        return response()->json([
            'reviews'      => $reviews,
            'breakdown'    => $breakdown,
            'distribution' => $distribution,
        ]);
    }

    public function store(Request $request, Booking $booking)
    {
        // Ensure the booking belongs to the authenticated user
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! in_array($booking->status, ['confirmed', 'completed'])) {
            return response()->json(['message' => 'You can only review confirmed or completed stays'], 422);
        }

        if ($booking->review) {
            return response()->json(['message' => 'You have already reviewed this stay'], 422);
        }

        $request->validate([
            'rating'          => 'required|integer|between:1,10',
            'title'           => 'nullable|string|max:100',
            'body'            => 'required|string|min:20',
            'cleanliness'     => 'nullable|integer|between:1,10',
            'comfort'         => 'nullable|integer|between:1,10',
            'location'        => 'nullable|integer|between:1,10',
            'service'         => 'nullable|integer|between:1,10',
            'value_for_money' => 'nullable|integer|between:1,10',
            'would_recommend' => 'nullable|boolean',
        ]);

        $review = Review::create([
            ...$request->only([
                'rating', 'title', 'body',
                'cleanliness', 'comfort', 'location',
                'service', 'value_for_money', 'would_recommend',
            ]),
            'user_id'    => $request->user()->id,
            'hotel_id'   => $booking->hotel_id,
            'booking_id' => $booking->id,
        ]);

        return response()->json($review->load('user'), 201);
    }

    public function destroy(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id && ! $request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
