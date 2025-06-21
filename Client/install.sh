#!/bin/bash

echo "[SETUP] Setting up the client..."

# Step 1: Check Python installation
if ! command -v python3 &>/dev/null; then
    echo "[ERROR] Python is not installed. Please install Python 3.8+ and rerun this script."
    exit 1
fi

# Step 2: Create virtual environment
python3 -m venv venv
if [ -d "venv" ]; then
    echo "[OK] Virtual environment created."
else
    echo "[ERROR] Failed to create virtual environment."
    exit 1
fi

# Step 3: Activate and install dependencies
source venv/bin/activate
pip install -r requirements.txt

echo "[DONE] Installation complete."
echo "[INFO] You can now run the app using: ./run.sh"
