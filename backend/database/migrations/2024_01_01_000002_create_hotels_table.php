<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->string('city');
            $table->string('country');
            $table->string('address');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('star_rating')->default(3);
            $table->decimal('base_price', 10, 2);
            $table->string('thumbnail')->nullable();
            $table->json('images')->nullable();
            $table->json('amenities')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->string('check_in_time')->default('14:00');
            $table->string('check_out_time')->default('11:00');
            $table->text('policies')->nullable();
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['single', 'double', 'twin', 'suite', 'deluxe', 'family', 'studio']);
            $table->integer('capacity');
            $table->integer('beds')->default(1);
            $table->decimal('price_per_night', 10, 2);
            $table->integer('quantity');
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->integer('size_sqm')->nullable();
            $table->boolean('smoking')->default(false);
            $table->timestamps();
        });

        Schema::create('room_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('available_count');
            $table->decimal('price_override', 10, 2)->nullable();
            $table->unique(['room_id', 'date']);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('room_availability');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('hotels');
    }
};
