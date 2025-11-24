<?php
namespace App;

class Config
{
    public static function env(string $key, ?string $default = null): ?string
    {
        $val = getenv($key);
        return $val !== false ? $val : $default;
    }

    public static function mongoUri(): string
    {
        $uri = self::env('MONGODB_URI');
        if (!$uri) {
            throw new \RuntimeException('MONGODB_URI is not set');
        }
        return $uri;
    }

    public static function dbName(): string
    {
        return self::env('DB_NAME', 'sw_db');
    }

    public static function collectionName(): string
    {
        return self::env('COLLECTION_NAME', 'starships');
    }

    public const LY_PER_PARSEC = 3.26;
}
