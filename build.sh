#!/usr/bin/env bash
set -e

echo "=== AOTMS CRM RENDER BUILD START ==="
echo "Current directory: $(pwd)"
ls -la

if [ -f "requirements.txt" ]; then
    echo "Installing from requirements.txt..."
    pip install -r requirements.txt
elif [ -f "Backend/requirements.txt" ]; then
    echo "Installing from Backend/requirements.txt..."
    pip install -r Backend/requirements.txt
elif [ -f "requirements.tx" ]; then
    echo "Installing from requirements.tx..."
    pip install -r requirements.tx
fi

echo "=== AOTMS CRM RENDER BUILD COMPLETE ==="
