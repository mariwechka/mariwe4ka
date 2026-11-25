#!/usr/bin/env bash
# One-click launcher (macOS / Linux). First run creates a virtualenv and installs dependencies.
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt || { echo "Install failed"; read -r; exit 1; }
fi
exec .venv/bin/python -m nexus --open
