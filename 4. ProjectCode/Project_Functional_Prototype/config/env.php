<?php
/**
 * Carga estricta de variables de entorno.
 *
 * Este archivo NO inyecta secretos por defecto para evitar que entornos
 * de producción usen credenciales hardcodeadas. Si falta una variable
 * crítica, se lanza un error temprano.
 */

// Helper para requerir variable sensible
function env_required(string $key): string {
	$val = getenv($key);
	if ($val === false || $val === '') {
		http_response_code(500);
		echo "Falta variable de entorno requerida: {$key}";
		error_log("ENV missing: {$key}");
		exit; // Parar ejecución inmediata (fail fast)
	}
	return $val;
}

// Variables sensibles (sin fallback)
// Se asume que Render / .env local las define.
$DB_DRIVER          = getenv('DB_DRIVER') ?: 'mongo'; // no sensible
$MONGO_URI          = env_required('MONGO_URI');
$MONGO_DB           = env_required('MONGO_DB');
$OPENWEATHER_API_KEY= env_required('OPENWEATHER_API_KEY');
$CURRENCY_PROVIDER  = getenv('CURRENCY_PROVIDER') ?: 'erapi';
$MAPBOX_TOKEN       = getenv('MAPBOX_TOKEN') ?: ''; // opcional

// Zona horaria: si APP_TIMEZONE no está, usar TZ; si no existe ninguno, default regional
$appTz = getenv('APP_TIMEZONE') ?: (getenv('TZ') ?: 'America/Guayaquil');
if (function_exists('date_default_timezone_set')) {
	@date_default_timezone_set($appTz);
}

// Exponer configuración no sensible (opcional)
global $appConfig;
$appConfig = [
	'DB_DRIVER' => $DB_DRIVER,
	'MONGO_DB'  => $MONGO_DB,
	'CURRENCY_PROVIDER' => $CURRENCY_PROVIDER,
	'APP_TIMEZONE' => $appTz,
];