# Lightweight PHP CLI image with built-in server
FROM php:8.2-cli

# Install dependencies for pecl and composer
RUN apt-get update \
 && apt-get install -y --no-install-recommends git unzip pkg-config libssl-dev \
 && rm -rf /var/lib/apt/lists/*

# Install MongoDB PHP extension
RUN pecl install mongodb \
 && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files and install deps
COPY composer.json /app/
RUN composer install --no-dev --prefer-dist --no-interaction

# Copy source
COPY src/ /app/src/
COPY public/ /app/public/
COPY docker-entrypoint.sh /app/

# Ensure entrypoint is executable
RUN chmod +x /app/docker-entrypoint.sh

ENV APP_ENV=production

CMD ["/app/docker-entrypoint.sh"]
