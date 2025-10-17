#!/bin/bash
# Rebuilds only the "web" and "api" services using docker compose

set -e

echo "Stopping web and api services..."
docker compose stop web api

echo "Rebuilding and starting web and api services in detached mode..."
docker compose up --build -d web api

echo "Done. Both services are rebuilt and running."
echo "Frontend: http://localhost:5173"
echo "API: http://localhost:5000"