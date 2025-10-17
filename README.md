# Team 4 Demo 1

## Community Recipee Book
Dockerized Flask application. A shared cookbook app where users can add, browse, and rate recipes.

## Project setup
### 1️ Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd Team4Demo1
```

### 2 Build and start all services
```bash
./init.sh
```

### 3 Stop services
```bash
docker compose down
```

## Testing

## Run tests inside the running container
```bash
docker compose exec web pytest -v
```
## Run pre-commit
```bash
docker compose exec web pre-commit run --all-files
```
