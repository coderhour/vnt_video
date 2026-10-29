#!/usr/bin/env bash
# Start the preview server. Usage: ./start.sh [port]
cd "$(dirname "$0")" && exec python3 tools/serve.py "${1:-8000}"
