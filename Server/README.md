# Device Monitoring Server

A FastAPI-based backend server that receives monitoring data from clients and provides APIs for the dashboard to display real-time and historical device information.

## Features

- **FastAPI framework** for high-performance APIs
- **MySQL database** for data persistence
- **Real-time data ingestion** from monitoring clients
- **RESTful API endpoints** for dashboard integration
- **CORS support** for web frontend
- **Docker containerization** for easy deployment
- **Database auto-migration** with SQLModel

## Quick Start

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database environment
export DATABASE_URL="mysql+pymysql://monitoring_user:monitoring_password@localhost:3306/device_monitoring"

# Run the server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Docker Deployment

```bash
# Build the image
docker build -t device-monitoring-server .

# Run with database connection
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL="mysql+pymysql://user:pass@host:3306/db" \
  device-monitoring-server
```

## API Endpoints

### Data Ingestion

#### POST `/api/devices/data`
Receives monitoring data from clients.

**Request Body:**
```json
{
  "userId": "string",
  "deviceId": "string",
  "metrics": {
    "os": "string",
    "version": "string",
    "processor": "string",
    "architecture": "string",
    "physical_cores": 4,
    "logical_cores": 8,
    "max_frequency": 3000000000,
    "total_memory": 16777216000,
    "available_memory": 8388608000,
    "used_memory": 8388608000,
    "disk_total_space": 500000000000,
    "disk_used_space": 250000000000,
    "disk_free_space": 250000000000,
    "disk_usage": 50.0,
    "total_bytes_sent": 1048576,
    "total_bytes_received": 2097152,
    "hostname": "string",
    "ip_address": "192.168.1.100",
    "uptime": "5 days, 10:30:45",
    "cpu_avg": 25.5,
    "memory_avg": 60.2,
    "disk_avg": 45.8
  },
  "timestamp": "2023-12-01T10:00:00Z"
}
```

**Response:**
```json
{
  "message": "Data received"
}
```

### Data Retrieval

#### GET `/api/devices/logs`
Retrieves monitoring logs for dashboard display.

**Query Parameters:**
- `userId` (optional): Filter logs by user ID

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "userId": "string",
      "deviceId": "string",
      "metrics": { ... },
      "timestamp": "2023-12-01T10:00:00Z"
    }
  ]
}
```

### API Documentation

- **Interactive Docs:** `http://localhost:8000/docs`
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`

## Database Schema

The server uses SQLModel for database operations with the following models:

### DeviceLog Table

| Column    | Type     | Description                    |
|-----------|----------|--------------------------------|
| id        | Integer  | Primary key (auto-increment)   |
| userId    | String   | User identifier               |
| deviceId  | String   | Device identifier             |
| metrics   | JSON     | Monitoring data payload       |
| timestamp | String   | ISO formatted timestamp       |

## Configuration

### Environment Variables

```env
DATABASE_URL=mysql+pymysql://user:password@host:port/database
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
DEBUG=false
```

### Database Setup

For MySQL:

```sql
CREATE DATABASE device_monitoring;
CREATE USER 'monitoring_user'@'%' IDENTIFIED BY 'monitoring_password';
GRANT ALL PRIVILEGES ON device_monitoring.* TO 'monitoring_user'@'%';
FLUSH PRIVILEGES;
```

## Development

### Project Structure

```
Server/
├── server.py          # Main FastAPI application
├── database.py        # Database connection and configuration
├── models.py          # SQLModel data models
├── requirements.txt   # Python dependencies
├── Dockerfile         # Container configuration
└── README.md          # This file
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Style

```bash
# Install formatting tools
pip install black isort flake8

# Format code
black .
isort .

# Check style
flake8 .
```

## Deployment

### Production Deployment

```bash
# Build for production
docker build -t device-monitoring-server:latest .

# Run with production settings
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL="mysql+pymysql://user:pass@prod-db:3306/device_monitoring" \
  -e DEBUG=false \
  --name monitoring-server \
  device-monitoring-server:latest
```

### Health Monitoring

The server includes health check endpoints:

- **Health Check:** `GET /api/devices/logs` (returns 200 if healthy)
- **Metrics:** Monitor response times and error rates

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Ensure user permissions are correct

2. **CORS Issues:**
   - Check CORS_ORIGINS configuration
   - Verify frontend URL is included

3. **Performance Issues:**
   - Monitor database query performance
   - Consider adding database indexes
   - Scale horizontally if needed

### Logging

The server logs important events:
- Successful data ingestion
- Database errors
- API request errors

View logs with:
```bash
docker logs device-monitoring-server
```