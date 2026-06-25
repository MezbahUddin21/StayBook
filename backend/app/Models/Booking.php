<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_ref', 'user_id', 'hotel_id', 'room_id',
        'check_in', 'check_out', 'guests', 'rooms_count',
        'total_price', 'status', 'stripe_payment_id',
        'stripe_payment_intent', 'guest_details', 'special_requests',
        'confirmed_at', 'cancelled_at',
    ];

    protected $casts = [
        'guest_details' => 'array',
        'check_in'      => 'date',
        'check_out'     => 'date',
        'total_price'   => 'float',
        'confirmed_at'  => 'datetime',
        'cancelled_at'  => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($booking) {
            $booking->booking_ref = 'BK-' . strtoupper(Str::random(8));
        });
    }

    public function user()   { return $this->belongsTo(User::class); }
    public function hotel()  { return $this->belongsTo(Hotel::class); }
    public function room()   { return $this->belongsTo(Room::class); }
    public function review() { return $this->hasOne(Review::class); }

    public function getNightsAttribute(): int
    {
        return $this->check_in->diffInDays($this->check_out);
    }
}
