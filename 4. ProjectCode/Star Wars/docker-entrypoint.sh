#!/usr/bin/env sh
set -e
PORT="${PORT:-8080}"
echo "Starting PHP server on 0.0.0.0:${PORT}"
exec php -S 0.0.0.0:"${PORT}" -t public
