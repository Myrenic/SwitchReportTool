#!/bin/sh

echo "Injecting environment variables into JavaScript files..."

for file in /usr/share/nginx/html/static/js/*.js; do
  sed -i "s|REACT_APP_DATABASE_API_URL_PLACEHOLDER|${REACT_APP_DATABASE_API_URL}|g" $file
  sed -i "s|REACT_APP_CISCO_API_URL_PLACEHOLDER|${REACT_APP_CISCO_API_URL}|g" $file
done

exec "$@"
