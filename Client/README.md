# Device Monitoring Client

A Python-based monitoring client that collects system resource usage (CPU, memory, disk) and sends the data to the monitoring server.

## Features

- **Cross-platform monitoring** using psutil
- **Configurable monitoring intervals**
- **Retry mechanism** for network failures
- **Environment-based configuration**
- **Docker support** for containerized monitoring

## Quick Start

### Local Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run the client
python client.py
```

### Docker Installation

```bash
# Build the image
docker build -t device-monitoring-client .

# Run with environment variables
docker run -d \
  -e USER_ID=your-user-id \
  -e SERVER_URL=http://host.docker.internal:8000/api/devices/data \
  -e SEND_INTERVAL=10 \
  device-monitoring-client
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
USER_ID=your-unique-user-id
SERVER_URL=http://localhost:8000/api/devices/data
SEND_INTERVAL=10        # Seconds between data submissions
MAX_RETRIES=5           # Maximum retry attempts on failure
RETRY_DELAY=5           # Seconds to wait between retries
```

## Monitoring Metrics

The client collects and sends the following metrics:

- **System Information:**
  - OS and version
  - Processor and architecture
  - Physical and logical cores
  - Hostname and IP address

- **Real-time Metrics:**
  - CPU usage percentage
  - Memory usage (total, available, used)
  - Disk usage (total, free, used)
  - Network statistics
  - System uptime

## Platform Support

- **Windows:** Full support with WMI integration
- **Linux:** Full support with procfs integration
- **macOS:** Full support with system APIs
- **Docker:** Container resource monitoring

## Troubleshooting

### Common Issues

1. **Permission denied errors:**
   - Run with appropriate privileges
   - Some metrics require elevated permissions

2. **Network connection failures:**
   - Check server URL and connectivity
   - Verify firewall settings

3. **Missing dependencies:**
   - Ensure all packages in requirements.txt are installed
   - Use virtual environment for isolation

### Windows-specific Notes

- Requires `pywin32` and `wmi` packages
- May need Windows Admin privileges for some metrics
- Use the provided `.bat` scripts for convenience

### Linux/Docker Notes

- No special privileges required for basic monitoring
- Container monitoring shows container resources, not host
- For host monitoring, run client directly on host

## Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install development dependencies
pip install -r requirements.txt

# Run in development mode
python client.py
```