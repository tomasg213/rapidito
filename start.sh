#!/bin/bash

echo "=== Rapidito: levantando backend (8000) y frontend (3000) ==="
echo "Presiona Ctrl+C para detener ambos."
echo ""

ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT/backend"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
PID_BACKEND=$!

cd "$ROOT/frontend"
npm run dev &
PID_FRONTEND=$!

trap 'echo ""; echo "Deteniendo..."; kill $PID_BACKEND $PID_FRONTEND 2>/dev/null; exit' INT TERM

wait $PID_BACKEND $PID_FRONTEND
