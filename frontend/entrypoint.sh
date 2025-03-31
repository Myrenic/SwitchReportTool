#!/bin/sh

echo "Replacing environment variables in built files..."

# Ensure variables are set, otherwise provide a default empty value
VITE_REACT_APP_DATABASE_API_URL=${VITE_REACT_APP_DATABASE_API_URL:-"http://10.115.202.50:5000"}
VITE_REACT_APP_CISCO_API_URL=${VITE_REACT_APP_CISCO_API_URL:-"http://10.115.202.50:5001"}

# Replace placeholders in JavaScript files
find /usr/share/nginx/html/assets/ -type f -name "*.js" -exec \
    sed -i "s|__DATABASE_API_URL__|${VITE_REACT_APP_DATABASE_API_URL}|g" {} +

find /usr/share/nginx/html/assets/ -type f -name "*.js" -exec \
    sed -i "s|__CISCO_API_URL__|${VITE_REACT_APP_CISCO_API_URL}|g" {} +

echo "Starting Nginx..."
exec "$@"
