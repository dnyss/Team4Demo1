# Team 4 Demo 1

## Community Recipee Book
Dockerized Flask application. A shared cookbook app where users can add, browse, and rate recipes.

## Tech stack
- Frontend: Vite + React js + SWC + Tailwind CSS
- Backend: Python + Flask
- DB: MySQL

## Project setup
### 1 Clone the repository
```bash
git clone https://github.com/dnyss/Team4Demo1.git
cd Team4Demo1
```
### 2 Give execution permissions to init script
```bash
sudo chmod +x init.sh
```

### 3 Build and start all services
```bash
./init.sh
```

## API Documentation
- **Swagger UI**: http://localhost:5000/apidocs
- **OpenAPI Spec**: http://localhost:5000/apispec_1.json

## Testing

### Run backend tests inside the running container
```bash
docker compose exec api pytest -v
```
### Run frontend tests inside the running container
```bash
docker compose exec web pnpm test --run
```

### Run pre-commit
```bash
docker compose exec api pre-commit run --all-files
```

## Development

### Updating Python Dependencies
After modifying `pyproject.toml` or `extra-requirements.in`, regenerate `requirements.txt`:
```bash
pip-compile --allow-unsafe --generate-hashes --output-file=requirements.txt extra-requirements.in pyproject.toml
```
