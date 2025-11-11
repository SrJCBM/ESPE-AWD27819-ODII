## Build stage: install PHP dependencies with Composer
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --optimize-autoloader || true
COPY . .
RUN composer dump-autoload -o || true

## Runtime stage: PHP CLI with built-in server (simple, no Apache/Nginx)
FROM php:8.2-cli-alpine AS runtime
WORKDIR /app

# Install system deps for pecl and MongoDB extension
RUN apk add --no-cache $PHPIZE_DEPS openssl-dev && \
    pecl install mongodb && docker-php-ext-enable mongodb && \
    apk del --no-cache $PHPIZE_DEPS

# Copy app sources and vendor from builder
COPY --from=vendor /app /app

# Render sets PORT; default to 8080 for local runs
ENV PORT=8080
EXPOSE 8080

# Start PHP built-in server pointing to public/
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public"]
