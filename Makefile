DOCKER_COMPOSE := docker compose -f docker/docker-compose.local.yml --env-file .env

.PHONY: start stop logs stats pull

start:
	@$(DOCKER_COMPOSE) up -d
	@echo "Services démarrés avec succès."

stop:
	@$(DOCKER_COMPOSE) down
	@echo "Services arrêtés avec succès."

logs:
	@$(DOCKER_COMPOSE) logs -f

stats:
	@$(DOCKER_COMPOSE) stats

pull:
	@$(DOCKER_COMPOSE) pull

watch:
	@$(DOCKER_COMPOSE) watch
