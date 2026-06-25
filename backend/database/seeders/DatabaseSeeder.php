<?php
namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\Review;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@bookingclone.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);

        // Create a regular user
        $user = User::create([
            'name'     => 'John Traveler',
            'email'    => 'user@bookingclone.com',
            'password' => Hash::make('password'),
        ]);

        $amenitiesList = [
            'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa',
            'Restaurant', 'Bar', 'Free Parking', 'Airport Shuttle',
            'Room Service', 'Concierge', 'Laundry Service', 'Business Center',
        ];

        $cities = [
            ['city' => 'Dubai',     'country' => 'United Arab Emirates'],
            ['city' => 'Paris',     'country' => 'France'],
            ['city' => 'London',    'country' => 'United Kingdom'],
            ['city' => 'New York',  'country' => 'United States'],
            ['city' => 'Tokyo',     'country' => 'Japan'],
            ['city' => 'Bali',      'country' => 'Indonesia'],
            ['city' => 'Bangkok',   'country' => 'Thailand'],
            ['city' => 'Rome',      'country' => 'Italy'],
        ];

        $hotelNames = [
            'Grand Palace Hotel', 'The Royal Suites', 'Skyline Resort',
            'Azure Bay Hotel', 'The Metropolitan', 'Sunset Inn',
            'Harbor View Hotel', 'The Continental', 'Oasis Resort',
            'The Pinnacle Hotel',
        ];

        $hotelDescriptions = [
            'Experience luxury at its finest in our award-winning property. Featuring world-class amenities and breathtaking views, our hotel offers an unparalleled hospitality experience.',
            'Nestled in the heart of the city, this elegant property combines modern sophistication with timeless charm. Each room is meticulously designed to ensure maximum comfort.',
            'A sanctuary of tranquility in the heart of the city. Our hotel offers a perfect blend of contemporary design and traditional hospitality, ensuring a memorable stay.',
            'Discover the perfect blend of comfort and luxury. Our hotel features spacious rooms, exceptional dining options, and a dedicated team committed to making your stay extraordinary.',
        ];

        foreach ($cities as $location) {
            $hotelCount = rand(4, 6);
            for ($i = 0; $i < $hotelCount; $i++) {
                $stars     = rand(3, 5);
                $basePrice = match ($stars) {
                    5 => rand(200, 500),
                    4 => rand(100, 250),
                    3 => rand(50, 150),
                };
                $selectedAmenities = array_values(array_intersect_key(
                    $amenitiesList,
                    array_flip(array_rand($amenitiesList, rand(4, 8)))
                ));

                $hotel = Hotel::create([
                    'user_id'     => $admin->id,
                    'name'        => $hotelNames[array_rand($hotelNames)] . ' ' . $location['city'],
                    'description' => $hotelDescriptions[array_rand($hotelDescriptions)],
                    'city'        => $location['city'],
                    'country'     => $location['country'],
                    'address'     => rand(1, 999) . ' ' . ['Main St', 'Park Ave', 'Ocean Blvd', 'City Center'][array_rand(['Main St', 'Park Ave', 'Ocean Blvd', 'City Center'])],
                    'star_rating' => $stars,
                    'base_price'  => $basePrice,
                    'amenities'   => $selectedAmenities,
                    'status'      => 'active',
                    'thumbnail'   => "https://picsum.photos/seed/{$location['city']}{$i}/800/500",
                    'images'      => [
                        "https://picsum.photos/seed/{$location['city']}{$i}a/800/500",
                        "https://picsum.photos/seed/{$location['city']}{$i}b/800/500",
                        "https://picsum.photos/seed/{$location['city']}{$i}c/800/500",
                    ],
                ]);

                // Create rooms
                $roomTypes = [
                    ['name' => 'Standard Double Room',  'type' => 'double',  'capacity' => 2, 'beds' => 1, 'multiplier' => 1.0,  'qty' => 10],
                    ['name' => 'Twin Room',              'type' => 'twin',    'capacity' => 2, 'beds' => 2, 'multiplier' => 1.0,  'qty' => 8],
                    ['name' => 'Deluxe King Room',       'type' => 'deluxe',  'capacity' => 2, 'beds' => 1, 'multiplier' => 1.5,  'qty' => 6],
                    ['name' => 'Family Suite',           'type' => 'family',  'capacity' => 4, 'beds' => 2, 'multiplier' => 2.0,  'qty' => 4],
                    ['name' => 'Executive Suite',        'type' => 'suite',   'capacity' => 2, 'beds' => 1, 'multiplier' => 2.5,  'qty' => 2],
                ];

                foreach ($roomTypes as $rt) {
                    Room::create([
                        'hotel_id'        => $hotel->id,
                        'name'            => $rt['name'],
                        'type'            => $rt['type'],
                        'capacity'        => $rt['capacity'],
                        'beds'            => $rt['beds'],
                        'price_per_night' => round($basePrice * $rt['multiplier'], 2),
                        'quantity'        => $rt['qty'],
                        'size_sqm'        => rand(20, 80),
                        'amenities'       => array_values(array_intersect_key(
                            ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Flat-screen TV', 'Safe', 'Bathtub'],
                            array_flip(array_rand(['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Flat-screen TV', 'Safe', 'Bathtub'], 3))
                        )),
                        'images' => [
                            "https://picsum.photos/seed/room{$hotel->id}{$rt['type']}/600/400",
                        ],
                    ]);
                }

                // Add some reviews
                $reviewTexts = [
                    "Absolutely wonderful stay! The staff were incredibly helpful and the rooms were immaculate. Will definitely be coming back.",
                    "Great location and comfortable rooms. The breakfast was excellent with a wide variety of options. Highly recommended.",
                    "Good value for money. The hotel is clean and well-maintained. Some minor issues with noise but overall a pleasant experience.",
                    "Exceptional service from check-in to check-out. The spa facilities are top-notch and the restaurant serves delicious food.",
                    "Perfect base for exploring the city. Friendly staff and spotless rooms. The pool area is beautiful.",
                ];

                $reviewCount = rand(2, 6);
                for ($r = 0; $r < $reviewCount; $r++) {
                    $guestUser = User::factory()->create(['password' => Hash::make('password')]);

                    $room    = $hotel->rooms()->first();
                    $checkIn = now()->subDays(rand(30, 365));
                    $nights  = rand(2, 7);

                    $booking = Booking::create([
                        'user_id'      => $guestUser->id,
                        'hotel_id'     => $hotel->id,
                        'room_id'      => $room->id,
                        'check_in'     => $checkIn,
                        'check_out'    => $checkIn->copy()->addDays($nights),
                        'guests'       => rand(1, $room->capacity),
                        'rooms_count'  => 1,
                        'total_price'  => $room->price_per_night * $nights,
                        'status'       => 'completed',
                        'guest_details'=> ['first_name' => 'Guest', 'last_name' => 'User', 'email' => $guestUser->email, 'phone' => '+1234567890'],
                        'confirmed_at' => now(),
                    ]);

                    $rating = rand(6, 10);
                    Review::create([
                        'user_id'         => $guestUser->id,
                        'hotel_id'        => $hotel->id,
                        'booking_id'      => $booking->id,
                        'rating'          => $rating,
                        'title'           => ['Amazing stay!', 'Great value', 'Highly recommend', 'Beautiful property', null][array_rand([0,1,2,3,4])],
                        'body'            => $reviewTexts[array_rand($reviewTexts)],
                        'cleanliness'     => rand(6, 10),
                        'comfort'         => rand(6, 10),
                        'location'        => rand(6, 10),
                        'service'         => rand(6, 10),
                        'value_for_money' => rand(6, 10),
                        'would_recommend' => $rating >= 7,
                    ]);
                }
            }
        }

        // Add a pending hotel for admin to review
        Hotel::create([
            'user_id'     => $user->id,
            'name'        => 'Pending Beach Resort',
            'description' => 'A beautiful resort awaiting approval.',
            'city'        => 'Miami',
            'country'     => 'United States',
            'address'     => '123 Beach Blvd',
            'star_rating' => 4,
            'base_price'  => 175,
            'amenities'   => ['Free WiFi', 'Swimming Pool', 'Bar'],
            'status'      => 'pending',
        ]);

        $this->command->info('✅ Seeding complete!');
        $this->command->info('   Admin: admin@bookingclone.com / password');
        $this->command->info('   User:  user@bookingclone.com  / password');
    }
}
