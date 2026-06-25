<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'description', 'city', 'country', 'address',
        'latitude', 'longitude', 'star_rating', 'base_price',
        'thumbnail', 'images', 'amenities', 'status',
        'check_in_time', 'check_out_time', 'policies',
    ];

    protected $casts = [
        'images'    => 'array',
        'amenities' => 'array',
        'latitude'  => 'float',
        'longitude' => 'float',
        'base_price'=> 'float',
    ];

    public function owner()    { return $this->belongsTo(User::class, 'user_id'); }
    public function rooms()    { return $this->hasMany(Room::class); }
    public function bookings() { return $this->hasMany(Booking::class); }
    public function reviews()  { return $this->hasMany(Review::class); }
    public function wishlists(){ return $this->hasMany(Wishlist::class); }

    public function getAverageRatingAttribute(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('city', 'like', "%{$term}%")
              ->orWhere('country', 'like', "%{$term}%")
              ->orWhere('address', 'like', "%{$term}%");
        });
    }
}
