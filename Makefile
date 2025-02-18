# Makefile for Docker Compose automation

# Variables
DOCKER_COMPOSE = docker compose

# Build and start all containers
up:
	$(DOCKER_COMPOSE) up --build

# Start all containers in detached mode
up-detached:
	$(DOCKER_COMPOSE) up --build -d

# Stop and remove all containers
down:
	$(DOCKER_COMPOSE) down

# Stop and remove all containers, including volumes
down-volumes:
	$(DOCKER_COMPOSE) down -v

# Rebuild and restart all containers
restart:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up --build -d

# View logs for all containers
logs:
	$(DOCKER_COMPOSE) logs -f

# View logs for a specific service (e.g., make logs-backend)
logs-%:
	$(DOCKER_COMPOSE) logs -f $*

# Open a shell in the backend container
bash-backend:
	$(DOCKER_COMPOSE) exec backend sh

# Open a shell in the db container
bash-db:
	$(DOCKER_COMPOSE) exec db sh

# Open a shell in the redis container
bash-redis:
	$(DOCKER_COMPOSE) exec redis sh

# Clean up unused Docker resources
clean:
	docker system prune -f

show-containers:
	docker ps

show-cache:
	curl http://localhost:3000/api/cache

reset-cache:
	curl http://localhost:3000/api/cache/reset

show-messages:
	curl http://localhost:3000/api/messages


# Help: List all available commands
help:
	@echo "Available commands:"
	@echo "  make up             - Build and start all containers"
	@echo "  make up-detached    - Start all containers in detached mode"
	@echo "  make down           - Stop and remove all containers"
	@echo "  make down-volumes   - Stop and remove all containers, including volumes"
	@echo "  make restart        - Rebuild and restart all containers"
	@echo "  make logs           - View logs for all containers"
	@echo "  make logs-<service> - View logs for a specific service (e.g., make logs-backend)"
	@echo "  make bash-backend   - Open a shell in the backend container"
	@echo "  make bash-db        - Open a shell in the db container"
	@echo "  make bash-redis     - Open a shell in the redis container"
	@echo "  make clean          - Clean up unused Docker resources"
	@echo "  make help           - Show this help message"
	@echo "  make show-containers- Shows the containers"
	@echo "  make reset-cache    - Reset cache"
	@echo "  make show-messages  - Shows the messages"
	@echo "  make show-cache     - Shows the cache"
	