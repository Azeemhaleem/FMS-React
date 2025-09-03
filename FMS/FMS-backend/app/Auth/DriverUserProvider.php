<?php

namespace App\Auth;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;
use App\Models\driverInDept; // Import the related model

class DriverUserProvider extends EloquentUserProvider
{
    /**
     * Retrieve a user by the given credentials.
     * Overridden to look up via email in the related table.
     *
     * @param  array  $credentials
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveByCredentials(array $credentials)
    {
        if (empty($credentials) ||
           (count($credentials) === 1 &&
            array_key_exists('password', $credentials))) {
            return null;
        }

        // Check if email is provided for lookup
        if (isset($credentials['email'])) {
            $email = $credentials['email'];

            // Find the driverInDept record by email
            $driverInfo = driverInDept::where('email', $email)->first();

            if ($driverInfo) {
                // If found, retrieve the associated DriverUser
                // Adjust 'driverUser' if your relationship name is different
                $user = $driverInfo->driverUser()->first(); 

                // Important: We return the DriverUser instance here
                return $user; 
            }
            return null; // Email not found in driverInDept
        }

        // Fallback to default Eloquent provider behavior for other credentials
        // (like username lookup if you implement that elsewhere)
        return parent::retrieveByCredentials($credentials);
    }

    // You might need to override other methods depending on your exact auth needs,
    // but retrieveByCredentials is key for password resets and login based on email.
    // Ensure validation logic remains correct (e.g., validateCredentials).

    /**
     * Validate a user against the given credentials.
     * NOTE: Ensure this works correctly if you allow login via username too.
     * The default implementation should work fine if retrieveByCredentials returns 
     * the correct user and you hash passwords normally.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @param  array  $credentials
     * @return bool
     */
     // public function validateCredentials(UserContract $user, array $credentials)
     // {
     //     return parent::validateCredentials($user, $credentials);
     // }
}