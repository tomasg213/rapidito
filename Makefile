.PHONY: help setup backend frontend start seed lint

BACKEND_DIR := backend
FRONTEND_DIR := frontend

help:
	@echo "Uso:"
	@echo "  make setup     - Instala dependencias (pip + npm)"
	@echo "  make start     - Levanta backend y frontend en paralelo"
	@echo "  make backend   - Solo backend  (uvicorn --reload)"
	@echo "  make frontend  - Solo frontend (npm run dev)"
	@echo "  make seed      - Ejecuta database/seed.sql en Supabase"
	@echo "  make lint      - Verifica sintaxis Python y TypeScript"

setup:
	cd $(BACKEND_DIR) && pip install -r requirements.txt
	cd $(FRONTEND_DIR) && npm install

backend:
	cd $(BACKEND_DIR) && uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd $(FRONTEND_DIR) && npm run dev

start:
	@echo "=== Rapidito: levantando backend (8000) y frontend (3000) ==="
	@trap 'kill 0' EXIT; \
		$(MAKE) backend & \
		$(MAKE) frontend & \
		wait

seed:
	@echo "Ejecuta database/seed.sql manualmente desde el SQL Editor de Supabase"
	@echo "  o con: psql \"\$$SUPABASE_DB_URL\" -f database/seed.sql"

lint:
	@echo "=== Python ==="
	cd $(BACKEND_DIR) && python3 -m py_compile main.py auth.py schemas.py
	cd $(BACKEND_DIR) && python3 -m py_compile routers/*.py
	@echo "=== TypeScript ==="
	cd $(FRONTEND_DIR) && npx tsc --noEmit
