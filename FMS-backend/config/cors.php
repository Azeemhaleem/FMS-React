<?php

return [

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174', 
        'https://yourproductiondomain.com',
        'https://www.yourproductiondomain.com'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'Accept'
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];