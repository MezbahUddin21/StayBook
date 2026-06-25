<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['hotel', 'room', 'review'])
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);
        return response()->json($booking->load(['hotel', 'room', 'review']));
    }

    public function store(Request $request)
    {
        $request->validate([
            'hotel_id'         => 'required|exists:hotels,id',
            'room_id'          => 'required|exists:rooms,id',
            'check_in'         => 'required|date|after_or_equal:today',
            'check_out'        => 'required|date|after:check_in',
            'guests'           => 'required|integer|min:1',
            'rooms_count'      => 'required|integer|min:1',
            'guest_details'    => 'required|array',
            'guest_details.first_name' => 'required|string',
            'guest_details.last_name'  => 'required|string',
            'guest_details.email'      => 'required|email',
            'guest_details.phone'      => 'required|string',
            'special_requests' => 'nullable|string|max:500',
        ]);

        $room = Room::findOrFail($request->room_id);

        // Verify the room belongs to the hotel
        if ($room->hotel_id != $request->hotel_id) {
            return response()->json(['message' => 'Invalid room for this hotel'], 422);
        }

        // Check guest capacity
        if ($room->capacity < $request->guests) {
            return response()->json(['message' => 'Room capacity exceeded'], 422);
        }

        // Check availability
        $available = $room->availableCount($request->check_in, $request->check_out);
        if ($available < $request->rooms_count) {
            return response()->json([
                'message' => "Only {$available} room(s) available for those dates"
            ], 422);
        }

        // Calculate total
        $checkIn  = \Carbon\Carbon::parse($request->check_in);
        $checkOut = \Carbon\Carbon::parse($request->check_out);
        $nights   = $checkIn->diffInDays($checkOut);
        $total    = $room->price_per_night * $nights * $request->rooms_count;

        $booking = $request->user()->bookings()->create([
            'hotel_id'         => $request->hotel_id,
            'room_id'          => $request->room_id,
            'check_in'         => $request->check_in,
            'check_out'        => $request->check_out,
            'guests'           => $request->guests,
            'rooms_count'      => $request->rooms_count,
            'total_price'      => $total,
            'status'           => 'pending',
            'guest_details'    => $request->guest_details,
            'special_requests' => $request->special_requests,
        ]);

        return response()->json($booking->load(['hotel', 'room']), 201);
    }

    public function createPaymentIntent(Booking $booking)
    {
        $this->authorize('view', $booking);

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Booking is not pending payment'], 422);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $intent = PaymentIntent::create([
            'amount'   => (int) ($booking->total_price * 100),
            'currency' => 'usd',
            'metadata' => [
                'booking_ref' => $booking->booking_ref,
                'booking_id'  => $booking->id,
            ],
        ]);

        $booking->update(['stripe_payment_intent' => $intent->id]);

        return response()->json(['client_secret' => $intent->client_secret]);
    }

    public function confirmPayment(Request $request, Booking $booking)
    {
        $this->authorize('view', $booking);

        $request->validate(['payment_intent_id' => 'required|string']);

        $booking->update([
            'status'           => 'confirmed',
            'stripe_payment_id'=> $request->payment_intent_id,
            'confirmed_at'     => now(),
        ]);

        return response()->json($booking->load(['hotel', 'room']));
    }

    public function cancel(Booking $booking)
    {
        $this->authorize('view', $booking);

        if (! in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'This booking cannot be cancelled'], 422);
        }

        $booking->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return response()->json($booking);
    }
}
