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

### 2 Configure environment variables
Create a `.env` file from the template:
```bash
cp .env.example .env
```

Edit the `.env` file and set your credentials:
```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_password_here
MYSQL_DATABASE=bdd
MYSQL_USER=root
MYSQL_HOST=db
MYSQL_PORT=3306

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here_change_in_production

# Flask Configuration
FLASK_ENV=development
```

**Important**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

### 3 Give execution permissions to init script
```bash
sudo chmod +x init.sh
```

### 4 Build and start all services
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
After modifying `pyproject.toml`, regenerate `requirements.txt`:
```bash
pip-compile --allow-unsafe --generate-hashes --output-file=requirements.txt pyproject.toml
```
