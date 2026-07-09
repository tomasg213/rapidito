#!/bin/bash
set -e

echo "=== Rapidito: levantando backend (8000) y frontend (3000) ==="

trap 'echo "Deteniendo..."; kill 0' EXIT

cd "$(dirname "$0")/backend" && uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
cd "$(dirname "$0")/frontend" && npm run dev &

wait
