# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for monitoring
RUN apt-get update && apt-get install -y \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

# Update requirements to exclude Windows-specific packages for Linux containers
RUN grep -v "wmi\|pywin32" requirements.txt > requirements-linux.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-linux.txt

# Copy the application code
COPY *.py ./

# Copy environment configuration
COPY .env.example .env

# Create a non-root user
RUN useradd -m -u 1000 monitor && chown -R monitor:monitor /app
USER monitor

# Run the client
CMD ["python", "client.py"]