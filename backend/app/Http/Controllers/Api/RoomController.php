<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Hotel $hotel)
    {
        return response()->json($hotel->rooms()->get());
    }

    public function show(Room $room)
    {
        return response()->json($room->load('hotel'));
    }

    public function store(Request $request, Hotel $hotel)
    {
        $this->authorize('update', $hotel);

        $request->validate([
            'name'            => 'required|string|max:255',
            'type'            => 'required|in:single,double,twin,suite,deluxe,family,studio',
            'capacity'        => 'required|integer|min:1',
            'beds'            => 'required|integer|min:1',
            'price_per_night' => 'required|numeric|min:0',
            'quantity'        => 'required|integer|min:1',
            'amenities'       => 'nullable|array',
            'size_sqm'        => 'nullable|integer',
            'smoking'         => 'nullable|boolean',
        ]);

        $room = $hotel->rooms()->create($request->all());
        return response()->json($room, 201);
    }

    public function update(Request $request, Room $room)
    {
        $this->authorize('update', $room->hotel);
        $room->update($request->all());
        return response()->json($room);
    }

    public function destroy(Room $room)
    {
        $this->authorize('update', $room->hotel);
        $room->delete();
        return response()->json(['message' => 'Room deleted']);
    }
}
