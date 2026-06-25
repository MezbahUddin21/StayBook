<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomAvailability extends Model
{
    protected $table = 'room_availability';

    protected $fillable = [
        'room_id', 'date', 'available_count', 'price_override',
    ];

    protected $casts = [
        'date'           => 'date',
        'price_override' => 'float',
    ];

    public function room() { return $this->belongsTo(Room::class); }
}
