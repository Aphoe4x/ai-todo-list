FROM php:8.2-apache

# Install pgsql extension
RUN apt-get update && apt-get install -y libpq-dev && docker-php-ext-install pdo pgsql pdo_pgsql

# Enable Apache rewrite module
RUN a2enmod rewrite

# Copy application files
COPY . /var/www/html/

# Set working directory
WORKDIR /var/html/

# Expose port 80
EXPOSE 80
