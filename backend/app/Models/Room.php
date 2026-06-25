<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id', 'name', 'description', 'type', 'capacity',
        'beds', 'price_per_night', 'quantity', 'amenities',
        'images', 'size_sqm', 'smoking',
    ];

    protected $casts = [
        'amenities'      => 'array',
        'images'         => 'array',
        'price_per_night'=> 'float',
        'smoking'        => 'boolean',
    ];

    public function hotel()        { return $this->belongsTo(Hotel::class); }
    public function availability() { return $this->hasMany(RoomAvailability::class); }
    public function bookings()     { return $this->hasMany(Booking::class); }

    public function availableCount(string $checkIn, string $checkOut): int
    {
        $bookedCount = $this->bookings()
            ->whereNotIn('status', ['cancelled'])
            ->where('check_in', '<', $checkOut)
            ->where('check_out', '>', $checkIn)
            ->sum('rooms_count');

        return max(0, $this->quantity - $bookedCount);
    }

    public function getPriceForDates(string $checkIn, string $checkOut): float
    {
        // Check for price overrides, otherwise use base price
        return $this->price_per_night;
    }
}
