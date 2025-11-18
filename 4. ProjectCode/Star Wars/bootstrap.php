<?php
// Unified bootstrap for autoload + environment

require_once __DIR__ . '/vendor/autoload.php';

// Load .env if present, otherwise rely on real env vars (Render/CI)
$envPath = __DIR__;
if (is_file($envPath . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($envPath);
    $dotenv->safeLoad();
}
