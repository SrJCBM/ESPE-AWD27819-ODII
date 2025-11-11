<?php
/**
 * Carga de variables de entorno con fallback local.
 * En producción (Render) se usarán variables ya definidas en el contenedor.
 */

function env_default(string $key, string $default): void {
	if (getenv($key) === false) {
		putenv("{$key}={$default}");
	}
}

env_default('DB_DRIVER', 'mongo');
env_default('MONGO_URI', 'mongodb+srv://SrJCBM:bdd2025@cluster0.tjvfmrk.mongodb.net/');
env_default('MONGO_DB', 'travel_brain');
env_default('OPENWEATHER_API_KEY', '51355211649b0894257fe06250faa40d');
env_default('CURRENCY_PROVIDER', 'erapi');