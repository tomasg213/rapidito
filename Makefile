.PHONY: install dev dev-backend dev-frontend build clean

BACKEND_PORT ?= 8000
FRONTEND_PORT ?= 3000

install:
	@echo "Instalando dependencias del backend..."
	pip install -r requirements.txt
	@echo "Instalando dependencias del frontend..."
	cd frontend && npm install
	@echo "Todo listo."

dev:
	@echo "=== Iniciando Rapidito ==="
	@echo "  Backend  → http://localhost:$(BACKEND_PORT)"
	@echo "  Frontend → http://localhost:$(FRONTEND_PORT)"
	@echo "  Docs     → http://localhost:$(BACKEND_PORT)/docs"
	@trap 'kill 0' EXIT; \
		uvicorn app.main:app --host 0.0.0.0 --port $(BACKEND_PORT) --reload & \
		cd frontend && npm run dev & \
		wait

build:
	cd frontend && npm run build

clean:
	@echo "Limpiando archivos generados..."
	rm -rf frontend/.next
	rm -rf app/**/__pycache__ app/__pycache__
	rm -rf .pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@echo "OK."
