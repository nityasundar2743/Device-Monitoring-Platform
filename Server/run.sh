#!/bin/bash

echo "Activating virtual environment..."
source venv/bin/activate

echo "Running FastAPI server..."
uvicorn server:app --reload
