# Team 4 Demo 1

## Community Recipe Book
Dockerized Flask application. A shared cookbook app where users can add, browse, and rate recipes.

## Tech Stack
- **Frontend**: Vite + React.js + SWC + Tailwind CSS
- **Backend**: Python + Flask + SQLAlchemy
- **Database**: MySQL 8.0
- **Container Orchestration**: Docker + Docker Compose

## Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (for convenience commands)
- Git

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/dnyss/Team4Demo1.git
cd Team4Demo1
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration (default values work for development)
```

### 3. Initialize the project
```bash
make init
```

This will:
- Build all Docker images
- Start all services
- Create database tables
- Seed the database with sample data

The application will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/apidocs

## Development Commands

The project uses a `Makefile` for convenient development workflows. Run `make help` to see all available commands.

### Core Commands

| Command | Description |
|---------|-------------|
| `make init` | Initialize project (full setup with DB) |
| `make up` | Start all services |
| `make down` | Stop all services |
| `make rebuild` | Rebuild and restart web and api services |
| `make restart` | Restart all services |
| `make clean` | Remove all containers, volumes, and images |
| `make status` | Show status of all services |

### Testing Commands

| Command | Description |
|---------|-------------|
| `make test` | Run backend tests (dev database) |
| `make test-cov` | Run backend tests with coverage report (dev database) |
| `make test-front` | Run frontend tests |
| `make test-db` | Run tests with isolated test database |
| `make test-db-cov` | Run tests with coverage using test database |
| `make test-db-clean` | Clean up test database environment |

**For comprehensive testing documentation, see [TESTING.md](TESTING.md)**

### Code Quality Commands

| Command | Description |
|---------|-------------|
| `make lint` | Run linters on backend and frontend |
| `make lint-fix` | Run linters with auto-fix |
| `make format` | Format code with pre-commit hooks |

### Database Commands

| Command | Description |
|---------|-------------|
| `make db-setup` | Create database tables |
| `make db-seed` | Seed database with sample data |
| `make db-shell` | Open MySQL shell |
| `make db-reset` | Reset database (drop, recreate, and seed) |

### Logging Commands

| Command | Description |
|---------|-------------|
| `make logs` | Show logs from all services |
| `make logs-api` | Show API logs only |
| `make logs-web` | Show frontend logs only |
| `make logs-db` | Show database logs only |

### Shell Access Commands

| Command | Description |
|---------|-------------|
| `make shell-api` | Open a shell in the API container |
| `make shell-web` | Open a shell in the web container |
| `make shell-db` | Open a shell in the database container |

## Production Deployment

### Build and run production environment
```bash
# Build production images
make prod-build

# Start production environment
make prod-up

# View production logs
make prod-logs

# Stop production environment
make prod-down
```

The production setup includes:
- Multi-stage Docker builds for optimized image sizes
- Non-root users for enhanced security
- Health checks for all services
- Nginx for serving the frontend
- Gunicorn for serving the Flask API
- Resource limits (CPU and memory)

## Monitoring and Observability

The project includes a comprehensive monitoring stack for production-ready observability.

### Quick Start Monitoring

```bash
# Start monitoring stack only
make monitoring-up

# Start app + monitoring
make full-up
```

Access monitoring services:
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **API Metrics Endpoint**: http://localhost:5000/metrics

### Monitoring Features

#### Metrics Collection
- **Request Rate**: Track HTTP requests per second
- **Error Rate**: Monitor 5xx errors
- **Response Time**: p50, p95, p99 latency percentiles
- **Custom Metrics**: Recipe operations, comment operations, user operations
- **System Metrics**: CPU, memory, disk usage

#### Health Checks
```bash
# Basic health check
curl http://localhost:5000/health

# Liveness probe (is app running?)
curl http://localhost:5000/healthz/live

# Readiness probe (is app ready to serve traffic?)
curl http://localhost:5000/healthz/ready
```

#### Structured Logging
- JSON-formatted logs with correlation IDs
- Centralized log aggregation with Loki
- Log visualization in Grafana
- Request/response logging with full context

#### Alerting
Alerts are automatically sent to Discord for:
- Service down (critical)
- Database connection failures (critical)
- High error rate >5% (warning)
- High response time >2s p95 (warning)
- Unusual activity patterns (info)

### Monitoring Commands

| Command | Description |
|---------|-------------|
| `make monitoring-up` | Start monitoring stack |
| `make monitoring-down` | Stop monitoring stack |
| `make monitoring-clean` | Remove monitoring volumes |
| `make monitoring-logs` | View all monitoring logs |
| `make monitoring-status` | Show monitoring service status |
| `make full-up` | Start app + monitoring |
| `make full-down` | Stop app + monitoring |

### Pre-configured Dashboards

The Grafana instance includes a pre-configured "Recipe Book - Application Metrics" dashboard with:
- Request rate and error rate
- Response time percentiles
- Recipe and comment operation metrics
- Service health status
- Live application logs

**For detailed monitoring documentation, see [docs/MONITORING_GUIDE.md](docs/MONITORING_GUIDE.md)**

## API Documentation
- **Swagger UI**: http://localhost:5000/apidocs
- **OpenAPI Spec**: http://localhost:5000/apispec_1.json

## Environment Configuration

The project uses environment variables for configuration. Key variables include:

```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=bdd
MYSQL_USER=root
MYSQL_HOST=db
MYSQL_PORT=3306

# JWT Configuration
JWT_SECRET_KEY=your_secret_key

# Flask Configuration
FLASK_ENV=development
```

See `.env.example` for a complete list of configuration options.

## Development Workflow

### Working on Backend
```bash
# Make changes to Python files
# The Flask dev server will auto-reload

# Run tests
make test

# Run linter
make lint

# View logs
make logs-api
```

### Working on Frontend
```bash
# Make changes to React files
# Vite dev server will hot-reload

# Run tests
make test-front

# Run linter
make lint

# View logs
make logs-web
```

### Updating Dependencies

#### Python Dependencies
After modifying `pyproject.toml` or `extra-requirements.in`:
```bash
make update-requirements
make rebuild
```

#### Frontend Dependencies
After modifying `package.json`:
```bash
make install-deps-front
make rebuild
```

## Troubleshooting

### Services won't start
```bash
# Check service status
make status

# View logs for errors
make logs

# Clean up and reinitialize
make clean
make init
```

### Database connection issues
```bash
# Reset the database
make db-reset

# Check database logs
make logs-db

# Access database shell
make db-shell
```

### Port conflicts
If ports 5000, 5173, or 3306 are already in use, modify the port mappings in `docker-compose.dev.yaml`.

## Project Structure
```
.
├── app.py                      # Main Flask application
├── database.py                 # Database configuration
├── models/                     # SQLAlchemy models
├── repositories/               # Data access layer
├── services/                   # Business logic layer
├── schemas/                    # Pydantic schemas
├── utils/                      # Utility functions
├── tests/                      # Backend tests
├── recipe-front/               # React frontend
│   ├── src/                    # Frontend source code
│   ├── public/                 # Static assets
│   └── package.json            # Frontend dependencies
├── Dockerfile.dev              # Development Dockerfile (API)
├── Dockerfile.prod             # Production Dockerfile (API)
├── docker-compose.dev.yaml     # Development Docker Compose
├── docker-compose.prod.yaml    # Production Docker Compose
├── Makefile                    # Development commands
├── pyproject.toml              # Python project metadata
├── requirements.txt            # Python dependencies
└── .env                        # Environment variables (not in git)
```

## CI/CD Pipeline (Jenkins)

### 🚀 Jenkins Server Setup

The project includes a complete CI/CD pipeline powered by Jenkins. The pipeline automates:
- Building Docker images
- Running tests with coverage
- Security vulnerability scanning
- Publishing images to Docker Hub
- Discord notifications
- Jira ticket integration

#### Quick Start

1. **Start Jenkins server**:
```bash
make jenkins-up
```

2. **Get initial admin password**:
```bash
make jenkins-password
```

3. **Access Jenkins**:
Open http://localhost:8080 and complete the setup wizard.

4. **Configure credentials**:
Follow the comprehensive guide: [docs/JENKINS_SETUP_GUIDE.md](docs/JENKINS_SETUP_GUIDE.md)

#### Jenkins Commands

| Command | Description |
|---------|-------------|
| `make jenkins-up` | Start Jenkins server |
| `make jenkins-down` | Stop Jenkins server |
| `make jenkins-logs` | View Jenkins logs |
| `make jenkins-password` | Get initial admin password |
| `make jenkins-restart` | Restart Jenkins |
| `make jenkins-clean` | Stop and remove all Jenkins data |

#### Local CI Testing

Test the CI pipeline locally before pushing:

| Command | Description |
|---------|-------------|
| `make ci-build` | Build production Docker images |
| `make ci-test` | Run all tests (backend + frontend) |
| `make ci-scan` | Run security vulnerability scans |
| `make ci-full` | Run complete CI pipeline locally |
| `make ci-push` | Push images to Docker Hub |

#### Pipeline Triggers

The Jenkins pipeline automatically runs on:
- Push to `main`, `develop`, or `MFLP-*` branches
- Pull requests to protected branches
- Manual trigger from Jenkins UI

#### Required Credentials

Configure these in Jenkins (see [JENKINS_SETUP_GUIDE.md](docs/JENKINS_SETUP_GUIDE.md)):
- Docker Hub credentials
- MySQL root password
- JWT secret key
- Discord webhook URL
- Jira API token (optional)

#### Documentation

- **Full Setup**: [docs/JENKINS_SETUP_GUIDE.md](docs/JENKINS_SETUP_GUIDE.md)
- **Quick Reference**: [docs/JENKINS_QUICK_REFERENCE.md](docs/JENKINS_QUICK_REFERENCE.md)
- **Jira Tickets**: [Jira_tickets.md](Jira_tickets.md) (see MFLP-84)

## Migration from Shell Scripts

**Note**: The `init.sh` and `rebuild.sh` scripts were removed. To serve those already gone .sh scripts' purpose, use these commands:
- `./init.sh` → `make init`
- `./rebuild.sh` → `make rebuild`

The Makefile provides better cross-platform support, more features, and follows standard DevOps practices.
