<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    public function index(Request $request)
    {
        $query = Hotel::with([])->active();

        if ($request->filled('city')) {
            $query->search($request->city);
        }
        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }
        if ($request->filled('stars')) {
            $stars = array_filter(explode(',', $request->stars));
            if (count($stars)) $query->whereIn('star_rating', $stars);
        }
        if ($request->filled('amenities')) {
            $amenities = explode(',', $request->amenities);
            foreach ($amenities as $amenity) {
                $query->whereJsonContains('amenities', trim($amenity));
            }
        }

        match ($request->get('sort', 'recommended')) {
            'price_asc'  => $query->orderBy('base_price'),
            'price_desc' => $query->orderByDesc('base_price'),
            'rating'     => $query->orderByDesc('star_rating'),
            'reviews'    => $query->withCount('reviews')->orderByDesc('reviews_count'),
            default      => $query->orderByDesc('created_at'),
        };

        $hotels = $query
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->paginate(12);

        return response()->json($hotels);
    }

    public function show(Hotel $hotel)
    {
        $hotel->load(['rooms', 'reviews' => fn($q) => $q->with('user:id,name,created_at')->latest()->limit(5)]);
        $hotel->loadAvg('reviews', 'rating');
        $hotel->loadCount('reviews');

        return response()->json($hotel);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'required|string',
            'city'           => 'required|string|max:100',
            'country'        => 'required|string|max:100',
            'address'        => 'required|string|max:255',
            'star_rating'    => 'required|integer|between:1,5',
            'base_price'     => 'required|numeric|min:0',
            'amenities'      => 'nullable|array',
            'check_in_time'  => 'nullable|string',
            'check_out_time' => 'nullable|string',
            'policies'       => 'nullable|string',
        ]);

        $hotel = $request->user()->hotels()->create($request->all());

        return response()->json($hotel, 201);
    }

    public function update(Request $request, Hotel $hotel)
    {
        $this->authorize('update', $hotel);

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'base_price'  => 'sometimes|numeric|min:0',
            'star_rating' => 'sometimes|integer|between:1,5',
        ]);

        $hotel->update($request->all());

        return response()->json($hotel);
    }

    public function destroy(Hotel $hotel)
    {
        $this->authorize('delete', $hotel);
        $hotel->delete();
        return response()->json(['message' => 'Hotel deleted']);
    }

    public function checkAvailability(Request $request, Hotel $hotel)
    {
        $request->validate([
            'check_in'  => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests'    => 'required|integer|min:1',
        ]);

        $rooms = $hotel->rooms()
            ->where('capacity', '>=', $request->guests)
            ->get()
            ->map(function ($room) use ($request) {
                $room->available_count = $room->availableCount(
                    $request->check_in,
                    $request->check_out
                );
                return $room;
            })
            ->filter(fn($r) => $r->available_count > 0)
            ->values();

        return response()->json($rooms);
    }

    public function toggleWishlist(Request $request, Hotel $hotel)
    {
        $user    = $request->user();
        $wishlist = Wishlist::where('user_id', $user->id)
                            ->where('hotel_id', $hotel->id)
                            ->first();

        if ($wishlist) {
            $wishlist->delete();
            return response()->json(['saved' => false]);
        }

        Wishlist::create(['user_id' => $user->id, 'hotel_id' => $hotel->id]);
        return response()->json(['saved' => true]);
    }

    public function wishlist(Request $request)
    {
        $hotels = $request->user()
            ->wishlists()
            ->with(['hotel' => fn($q) => $q->withCount('reviews')->withAvg('reviews', 'rating')])
            ->get()
            ->pluck('hotel');

        return response()->json($hotels);
    }

    public function myHotels(Request $request)
    {
        $hotels = $request->user()
            ->hotels()
            ->withCount(['bookings', 'reviews'])
            ->withAvg('reviews', 'rating')
            ->latest()
            ->get();

        return response()->json($hotels);
    }
}
