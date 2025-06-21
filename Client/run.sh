#!/bin/bash

echo "[INFO] Setting up the Device Client..."

# Step 1: Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed. Please install Python 3.8+."
    exit 1
fi

# Step 2: Create virtual environment
python3 -m venv venv
if [ ! -d "venv" ]; then
    echo "[ERROR] Failed to create virtual environment."
    exit 1
fi
echo "[OK] Virtual environment created."

# Step 3: Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip > /dev/null
pip install -r requirements.txt

# Step 4: Launch client
echo "[INFO] Launching client..."
python3 client.py
