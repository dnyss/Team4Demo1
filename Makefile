# Makefile for Team4Demo1 - Community Recipe Book
# This Makefile provides convenient commands for development and production workflows

.PHONY: help init rebuild up down clean test test-front test-cov lint logs logs-api logs-web logs-db db-setup db-seed db-shell prod-build prod-up prod-down prod-logs status ps

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[36m
RESET := \033[0m

help: ## Show this help message
	@echo "$(BLUE)Available targets:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'

# Development Environment Commands

init: ## Initialize project (full setup with DB) - Development
	@echo "$(BLUE)Taking down any running services...$(RESET)"
	@docker compose -f docker-compose.dev.yaml down -v || true
	@echo "$(BLUE)Building and starting all services...$(RESET)"
	@docker compose -f docker-compose.dev.yaml up --build -d
	@echo "$(BLUE)Waiting for services to be ready...$(RESET)"
	@sleep 20
	@echo "$(BLUE)Setting up database...$(RESET)"
	@$(MAKE) db-setup
	@echo "$(BLUE)Seeding database with sample data...$(RESET)"
	@$(MAKE) db-seed
	@echo "$(BLUE)Done! All services are up and running.$(RESET)"
	@echo "  Frontend: http://localhost:5173"
	@echo "  API: http://localhost:5000"
	@echo "  API Docs: http://localhost:5000/apidocs"

rebuild: ## Rebuild and restart web and api services - Development
	@echo "$(BLUE)Stopping web and api services...$(RESET)"
	@docker compose -f docker-compose.dev.yaml stop web api
	@echo "$(BLUE)Rebuilding services...$(RESET)"
	@docker compose -f docker-compose.dev.yaml up --build -d web api
	@echo "$(BLUE)Done! Services rebuilt and running.$(RESET)"
	@echo "  Frontend: http://localhost:5173"
	@echo "  API: http://localhost:5000"

up: ## Start all services (without rebuild) - Development
	@echo "$(BLUE)Starting all services...$(RESET)"
	@docker compose -f docker-compose.dev.yaml up -d
	@echo "$(BLUE)Services started.$(RESET)"

down: ## Stop all services - Development
	@echo "$(BLUE)Stopping all services...$(RESET)"
	@docker compose -f docker-compose.dev.yaml down
	@echo "$(BLUE)Services stopped.$(RESET)"

clean: ## Remove all containers, volumes, and images - Development
	@echo "$(BLUE)Cleaning up all resources...$(RESET)"
	@docker compose -f docker-compose.dev.yaml down -v --rmi all
	@echo "$(BLUE)Cleanup complete.$(RESET)"

restart: ## Restart all services - Development
	@echo "$(BLUE)Restarting all services...$(RESET)"
	@docker compose -f docker-compose.dev.yaml restart
	@echo "$(BLUE)Services restarted.$(RESET)"

# Testing Commands

test: ## Run backend tests - Development
	@echo "$(BLUE)Running backend tests...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec api pytest -v

test-cov: ## Run backend tests with coverage report - Development
	@echo "$(BLUE)Running backend tests with coverage...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec api pytest -v --cov --cov-report=html --cov-report=term

test-front: ## Run frontend tests - Development
	@echo "$(BLUE)Running frontend tests...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec web pnpm test --run

# Test Database Commands

test-db-setup: ## Set up test database environment
	@echo "$(BLUE)Setting up test database environment...$(RESET)"
	@docker compose -f docker-compose.test.yaml up -d db-test
	@echo "$(BLUE)Waiting for test database to be ready...$(RESET)"
	@sleep 15
	@echo "$(BLUE)Test database is ready.$(RESET)"

test-db-init: ## Initialize test database with tables
	@echo "$(BLUE)Initializing test database tables...$(RESET)"
	@docker compose -f docker-compose.test.yaml run --rm api-test python create_tables.py
	@echo "$(BLUE)Test database tables created.$(RESET)"

test-db: ## Run tests with isolated test database
	@echo "$(BLUE)Starting test database...$(RESET)"
	@docker compose -f docker-compose.test.yaml up -d db-test
	@echo "$(BLUE)Waiting for test database to be ready...$(RESET)"
	@sleep 15
	@echo "$(BLUE)Running tests with test database...$(RESET)"
	@docker compose -f docker-compose.test.yaml run --rm api-test pytest -v
	@echo "$(BLUE)Stopping test database...$(RESET)"
	@docker compose -f docker-compose.test.yaml down

test-db-cov: ## Run tests with coverage using isolated test database
	@echo "$(BLUE)Starting test database...$(RESET)"
	@docker compose -f docker-compose.test.yaml up -d db-test
	@echo "$(BLUE)Waiting for test database to be ready...$(RESET)"
	@sleep 15
	@echo "$(BLUE)Running tests with coverage using test database...$(RESET)"
	@docker compose -f docker-compose.test.yaml run --rm api-test pytest -v --cov --cov-report=html --cov-report=term
	@echo "$(BLUE)Stopping test database...$(RESET)"
	@docker compose -f docker-compose.test.yaml down

test-db-shell: ## Open MySQL shell for test database
	@echo "$(BLUE)Opening test database MySQL shell...$(RESET)"
	@docker compose -f docker-compose.test.yaml exec db-test mysql -uroot -p$${MYSQL_TEST_ROOT_PASSWORD:-test_admin} $${MYSQL_TEST_DATABASE:-bdd_test}

test-db-clean: ## Stop and remove test database containers and volumes
	@echo "$(BLUE)Cleaning up test database environment...$(RESET)"
	@docker compose -f docker-compose.test.yaml down -v
	@echo "$(BLUE)Test database cleanup complete.$(RESET)"

test-db-logs: ## Show test database logs
	@docker compose -f docker-compose.test.yaml logs -f db-test

# Code Quality Commands

lint: ## Run linters on backend and frontend - Development
	@echo "$(BLUE)Running backend linter...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec api pylint app.py models repositories services schemas utils --disable=C0114,C0115,C0116 || true
	@echo "$(BLUE)Running frontend linter...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec web pnpm lint || true

lint-fix: ## Run linters with auto-fix - Development
	@echo "$(BLUE)Backend linter (pylint) does not support auto-fix$(RESET)"
	@echo "$(BLUE)Running frontend linter with auto-fix...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec web pnpm lint --fix || true

format: ## Format code with pre-commit - Development
	@echo "$(BLUE)Running pre-commit hooks...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec api pre-commit run --all-files || true

# Logging Commands

logs: ## Show logs from all services - Development
	@docker compose -f docker-compose.dev.yaml logs -f

logs-api: ## Show API logs only - Development
	@docker compose -f docker-compose.dev.yaml logs -f api

logs-web: ## Show frontend logs only - Development
	@docker compose -f docker-compose.dev.yaml logs -f web

logs-db: ## Show database logs only - Development
	@docker compose -f docker-compose.dev.yaml logs -f db

# Database Commands

db-setup: ## Create database tables - Development
	@echo "$(BLUE)Creating database tables...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec api python create_tables.py
	@echo "$(BLUE)Database tables created.$(RESET)"

db-seed: ## Seed database with sample data - Development
	@echo "$(BLUE)Seeding database with sample data...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec api python seed_data.py
	@echo "$(BLUE)Database seeded successfully.$(RESET)"

db-shell: ## Open MySQL shell - Development
	@echo "$(BLUE)Opening MySQL shell...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec db mysql -uroot -p$${MYSQL_ROOT_PASSWORD:-admin} bdd

db-reset: ## Reset database (drop, recreate, and seed) - Development
	@echo "$(BLUE)Resetting database...$(RESET)"
	@$(MAKE) down
	@docker volume rm team4demo1_mysql_data_dev 2>/dev/null || true
	@$(MAKE) init

# Status Commands

status: ## Show status of all services - Development
	@docker compose -f docker-compose.dev.yaml ps

ps: ## Alias for status
	@$(MAKE) status

# Shell Access Commands

shell-api: ## Open a shell in the API container - Development
	@docker compose -f docker-compose.dev.yaml exec api /bin/bash

shell-web: ## Open a shell in the web container - Development
	@docker compose -f docker-compose.dev.yaml exec web /bin/sh

shell-db: ## Open a shell in the database container - Development
	@docker compose -f docker-compose.dev.yaml exec db /bin/bash

# Production Environment Commands

prod-build: ## Build production images
	@echo "$(BLUE)Building production images...$(RESET)"
	@docker compose -f docker-compose.prod.yaml build
	@echo "$(BLUE)Production images built successfully.$(RESET)"

prod-up: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(RESET)"
	@docker compose -f docker-compose.prod.yaml up -d
	@echo "$(BLUE)Production environment started.$(RESET)"
	@echo "  Frontend: http://localhost:80"
	@echo "  API: http://localhost:5000"

prod-down: ## Stop production environment
	@echo "$(BLUE)Stopping production environment...$(RESET)"
	@docker compose -f docker-compose.prod.yaml down
	@echo "$(BLUE)Production environment stopped.$(RESET)"

prod-logs: ## Show logs from production environment
	@docker compose -f docker-compose.prod.yaml logs -f

prod-status: ## Show status of production services
	@docker compose -f docker-compose.prod.yaml ps

prod-clean: ## Remove all production containers, volumes, and images
	@echo "$(BLUE)Cleaning up production resources...$(RESET)"
	@docker compose -f docker-compose.prod.yaml down -v --rmi all
	@echo "$(BLUE)Production cleanup complete.$(RESET)"

prod-restart: ## Restart production services
	@echo "$(BLUE)Restarting production services...$(RESET)"
	@docker compose -f docker-compose.prod.yaml restart
	@echo "$(BLUE)Production services restarted.$(RESET)"

# Utility Commands

check-env: ## Check if .env file exists and show configuration
	@if [ -f .env ]; then \
		echo "$(BLUE).env file found$(RESET)"; \
		echo "Configuration:"; \
		grep -v '^#' .env | grep -v '^$$'; \
	else \
		echo "$(BLUE)WARNING: .env file not found!$(RESET)"; \
		echo "Please copy .env.example to .env and configure it."; \
		echo "  cp .env.example .env"; \
	fi

install-deps: ## Install/update Python dependencies - Development
	@echo "$(BLUE)Installing Python dependencies...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec api pip install -r requirements.txt
	@docker compose -f docker-compose.dev.yaml exec api pip install -e ".[dev]"

install-deps-front: ## Install/update frontend dependencies - Development
	@echo "$(BLUE)Installing frontend dependencies...$(RESET)"
	@docker compose -f docker-compose.dev.yaml exec web pnpm install

update-requirements: ## Regenerate requirements.txt from pyproject.toml
	@echo "$(BLUE)Regenerating requirements.txt...$(RESET)"
	@pip-compile --allow-unsafe --generate-hashes --output-file=requirements.txt extra-requirements.in pyproject.toml
	@echo "$(BLUE)requirements.txt updated.$(RESET)"

# Documentation

docs: ## Open API documentation in browser
	@echo "$(BLUE)Opening API documentation...$(RESET)"
	@echo "API Docs: http://localhost:5000/apidocs"
	@xdg-open http://localhost:5000/apidocs 2>/dev/null || open http://localhost:5000/apidocs 2>/dev/null || echo "Please open http://localhost:5000/apidocs in your browser"
