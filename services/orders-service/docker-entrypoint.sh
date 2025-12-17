#!/bin/sh
set -e

echo "Waiting for database..."
until nc -z ${DB_HOST} ${DB_PORT}; do
  sleep 1
done

echo "Running migrations..."
npm run migrate

echo "Starting service..."
exec "$@"



