<?php
declare(strict_types=1);

if (!function_exists('loadEnvFile')) {
    /**
     * Load environment variables from a dotenv-style file without overriding
     * values that are already provided by the hosting environment.
     */
    function loadEnvFile(string $path): void
    {
        if (!is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (!str_contains($line, '=')) {
                continue;
            }

            [$name, $value] = explode('=', $line, 2);
            $name = trim($name);
            if ($name === '') {
                continue;
            }

            // Do not override variables already set by the environment
            if (getenv($name) !== false || array_key_exists($name, $_ENV) || array_key_exists($name, $_SERVER)) {
                continue;
            }

            $value = trim($value);
            if ($value === '') {
                $value = '';
            } else {
                $value = stripInlineComment($value);
                $value = trimQuotes($value);
                $value = unescapeSpecialChars($value);
            }

            setEnvVar($name, $value);
        }
    }
}

if (!function_exists('setDefaultEnv')) {
    function setDefaultEnv(string $name, string $value): void
    {
        if (getenv($name) === false && !array_key_exists($name, $_ENV) && !array_key_exists($name, $_SERVER)) {
            setEnvVar($name, $value);
        }
    }
}

if (!function_exists('setEnvVar')) {
    function setEnvVar(string $name, string $value): void
    {
        putenv(sprintf('%s=%s', $name, $value));
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

if (!function_exists('stripInlineComment')) {
    function stripInlineComment(string $value): string
    {
        if ($value === '') {
            return $value;
        }

        if ($value[0] === '"' || $value[0] === "'") {
            return $value;
        }

        $withoutComments = preg_replace('/\s+#.*$/', '', $value);
        if ($withoutComments === null) {
            return $value;
        }

        return rtrim($withoutComments);
    }
}

if (!function_exists('trimQuotes')) {
    function trimQuotes(string $value): string
    {
        if ($value === '') {
            return $value;
        }

        $firstChar = $value[0];
        $lastChar = $value[strlen($value) - 1];

        if (($firstChar === '"' && $lastChar === '"') || ($firstChar === "'" && $lastChar === "'")) {
            return substr($value, 1, -1);
        }

        return $value;
    }
}

if (!function_exists('unescapeSpecialChars')) {
    function unescapeSpecialChars(string $value): string
    {
        return strtr($value, [
            '\\n' => "\n",
            '\\r' => "\r",
            '\\t' => "\t",
        ]);
    }
}

// Load .env from project root (one level up from this file)
loadEnvFile(__DIR__ . '/../.env');

// Defaults (will NOT override variables already set in the environment or .env)
setDefaultEnv('DB_DRIVER', 'mongo');
setDefaultEnv('MONGO_URI', 'mongodb+srv://SrJCBM:bdd2025@cluster0.tjvfmrk.mongodb.net/');
setDefaultEnv('MONGO_DB', 'travel_brain');
setDefaultEnv('OPENWEATHER_API_KEY', '51355211649b0894257fe06250faa40d');
