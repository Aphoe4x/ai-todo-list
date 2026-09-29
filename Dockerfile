FROM php:8.2-apache

# Enable Apache rewrite module
RUN a2enmod rewrite

# Copy application files
COPY . /var/html/

# Set working directory
WORKDIR /var/html/

# Expose port 80
EXPOSE 80
