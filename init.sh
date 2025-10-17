#!/bin/bash
# Initializes and starts the entire application stack

set -e

echo "Taking down any running services..."
docker compose down -v

echo "Building and starting all services..."
docker compose up --build -d

echo "Waiting for services to be ready..."
sleep 15

echo "Loading DB schema..."
docker compose exec api python create_tables.py

echo "Seeding data..."
docker compose exec api python seed_data.py

echo "Done. All services were built, set up and running."
echo "Frontend: http://localhost:5173"
echo "API: http://localhost:5000"