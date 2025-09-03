<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Auth\DriverUserProvider;
use App\Models\DriverUser;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // *** Add your custom provider registration code HERE ***
        Auth::provider('custom_driver_provider', function ($app, array $config) {
            // Return an instance of your custom provider
            // Pass the hasher and the model class name
            return new DriverUserProvider($app['hash'], $config['model']);
        });
    }
}
