.PHONY: build up down restart logs migrate clean

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

migrate-auth:
	docker-compose exec auth-service npm run migrate

migrate-products:
	docker-compose exec products-service npm run migrate

migrate-orders:
	docker-compose exec orders-service npm run migrate

migrate-payments:
	docker-compose exec payments-service npm run migrate

migrate-notifications:
	docker-compose exec notifications-service npm run migrate

migrate-all: migrate-auth migrate-products migrate-orders migrate-payments migrate-notifications

clean:
	docker-compose down -v
	docker system prune -f

dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up


