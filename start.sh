#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
FRONTEND_DIR="$ROOT_DIR/src/frontend"

cleanup() {
  echo ""
  echo "[*] Stopping all processes..."
  [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null
  [ -n "${FRONTEND_PID:-}" ] && kill "$FRONTEND_PID" 2>/dev/null
  echo "[*] Done."
  exit 0
}
trap cleanup SIGINT SIGTERM

# --- Env check ---
if [ ! -f "$ROOT_DIR/.env" ]; then
  echo "[!] .env not found, copying from .env.example"
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo "[!] Please edit .env with your API keys, then re-run."
  exit 1
fi

# --- Kill stale processes on 3001 and 3000 ---
for PORT in 3001 3000; do
  STALE_PID=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [ -n "$STALE_PID" ]; then
    echo "[*] Killing stale process on :$PORT (PID $STALE_PID)"
    kill "$STALE_PID" 2>/dev/null || true
  fi
done
sleep 1

# --- Install deps if needed ---
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "[*] Installing backend dependencies..."
  cd "$BACKEND_DIR" && npm install
fi
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "[*] Installing frontend dependencies..."
  cd "$FRONTEND_DIR" && npm install
fi

# --- Start backend ---
echo "[*] Starting backend on :3001 ..."
cd "$BACKEND_DIR"
npx tsx index.ts &
BACKEND_PID=$!

# --- Start frontend ---
echo "[*] Starting frontend on :3000 ..."
cd "$FRONTEND_DIR"
npx vite --port=3000 --host=0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "  Jobro is running!"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  Admin API: http://localhost:3001/api/admin/*"
echo ""
echo "  Press Ctrl+C to stop."
echo "========================================="
echo ""

wait
