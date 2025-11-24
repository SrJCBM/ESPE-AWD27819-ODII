########### BUILD STAGE ###########
FROM php:8.2-cli AS build
ENV COMPOSER_ALLOW_SUPERUSER=1

# System deps (git for composer downloads, zip support optional, ssl)
RUN apt-get update \
 && apt-get install -y --no-install-recommends git unzip pkg-config libssl-dev libzip-dev $PHPIZE_DEPS \
 && rm -rf /var/lib/apt/lists/* \
 && docker-php-ext-install zip || true

# MongoDB extension (required by mongodb/mongodb library)
RUN pecl install mongodb \
 && docker-php-ext-enable mongodb

# Install Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock /app/
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress

# Copy application sources
COPY src/ /app/src/
COPY public/ /app/public/
COPY docker-entrypoint.sh /app/
COPY bootstrap.php /app/
RUN chmod +x /app/docker-entrypoint.sh

########### RUNTIME STAGE ###########
FROM php:8.2-cli AS runtime
ENV APP_ENV=production \
		COMPOSER_ALLOW_SUPERUSER=1

# Only needed runtime libs + mongodb ext
RUN apt-get update \
 && apt-get install -y --no-install-recommends libssl-dev libzip-dev curl \
 && rm -rf /var/lib/apt/lists/*

# Bring the built MongoDB extension from the build stage
COPY --from=build /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=build /usr/local/etc/php/conf.d/docker-php-ext-mongodb.ini /usr/local/etc/php/conf.d/docker-php-ext-mongodb.ini

WORKDIR /app
COPY --from=build /app /app

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD curl -fsS http://localhost:8080/health.php || exit 1

CMD ["/app/docker-entrypoint.sh"]
