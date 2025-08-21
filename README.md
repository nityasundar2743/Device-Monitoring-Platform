# 📡 Device Monitoring Platform

A comprehensive real-time dashboard for monitoring multiple devices' **CPU**, **memory**, and **disk** usage — featuring a responsive UI, theme switching, historical charts, and modern design. Built with **Next.js** (React), **FastAPI** (Python), and **MySQL**, styled using **Tailwind CSS** and **ShadCN UI** components.

---

## 🚀 Features

- 📊 **Real-time monitoring** with live resource usage charts (CPU, Memory, Disk) via **Recharts**
- 💡 **Dark/Light mode** with localStorage persistence
- 🟢 **Device status indicators** with online/offline detection
- 🎯 **System information badges** showing OS & Architecture
- 🔄 **Auto-refresh** every 10 seconds + manual refresh capability
- 📱 **Mobile-first responsive** layout with seamless experience across devices
- 🧩 **Collapsible sections** for organized data presentation (General, CPU, Disk, Memory)
- ⚡ **Smooth animations** using **Framer Motion**
- 🐳 **Docker containerization** for easy deployment and scalability
- 🛠️ **Multi-platform support** (Windows, Linux, macOS)

---

## 🧱 Tech Stack

- **Frontend:** Next.js 14+, TypeScript, Tailwind CSS
- **Charts & UI:** Recharts, ShadCN UI, Radix UI, Framer Motion
- **Backend:** FastAPI (Python), MySQL
- **Monitoring Client:** Python with psutil
- **Containerization:** Docker & Docker Compose
- **Data Flow:** REST APIs with real-time updates

---

## 📸 Preview

![Dashboard Screenshot](screenshot.png)

---

## 🐳 Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose, which will set up all services automatically.

### Prerequisites

- Docker and Docker Compose installed
- At least 2GB of available RAM
- Ports 3000, 8000, and 3306 available

### 1. Clone and Start

```bash
# Clone the repository
git clone https://github.com/nityasundar2743/Device-Monitoring-Platform.git
cd Device-Monitoring-Platform

# Start all services
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### 2. Access the Platform

- **Dashboard:** http://localhost:3000
- **API Server:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Database:** localhost:3306 (root/rootpassword)

### 3. Monitor Your Host Machine

The containerized client only monitors the container itself. To monitor your host machine:

```bash
# Navigate to the Client directory
cd Client

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set USER_ID and SERVER_URL=http://localhost:8000/api/devices/data

# Run the client
python client.py
```

### 4. Stop Services

```bash
docker-compose down
# To remove volumes as well: docker-compose down -v
```

---

## 🛠️ Manual Setup (Development)

If you prefer to run services individually for development:

### Prerequisites

- Node.js (v18+) for the frontend
- Python 3.9+ for backend and client
- MySQL 8.0+ for the database

### Database Setup

```bash
# Install and start MySQL
# Create database
mysql -u root -p
CREATE DATABASE device_monitoring;
CREATE USER 'monitoring_user'@'localhost' IDENTIFIED BY 'monitoring_password';
GRANT ALL PRIVILEGES ON device_monitoring.* TO 'monitoring_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Backend Setup

```bash
cd Server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database (set DATABASE_URL environment variable)
export DATABASE_URL="mysql+pymysql://monitoring_user:monitoring_password@localhost:3306/device_monitoring"

# Run the server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Client Setup

```bash
cd Client

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run the monitoring client
python client.py
```

---

## 🌐 API Endpoints

| Endpoint                         | Method | Description                    |
| -------------------------------- | ------ | ------------------------------ |
| `POST /api/devices/data`         | POST   | Submit device monitoring data  |
| `GET /api/devices/logs?userId=x` | GET    | Fetch real-time usage logs     |
| `GET /docs`                      | GET    | Interactive API documentation  |

### Example API Usage

```bash
# Get device logs
curl "http://localhost:8000/api/devices/logs?userId=your-user-id"

# Submit monitoring data
curl -X POST "http://localhost:8000/api/devices/data" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "deviceId": "device-name",
    "metrics": {"cpu_avg": 25.5, "memory_avg": 60.2},
    "timestamp": "2023-12-01T10:00:00Z"
  }'
```

---

---

## 📂 Project Structure

```
Device-Monitoring-Platform/
├── Client/                     # Python monitoring client
│   ├── Dockerfile             # Container configuration
│   ├── .dockerignore          # Docker build exclusions
│   ├── .env.example           # Environment configuration template
│   ├── requirements.txt       # Python dependencies
│   ├── client.py              # Main client application
│   ├── monitor.py             # Resource monitoring logic
│   ├── systemInfo.py          # System information collection
│   └── statsUpdater.py        # Statistics processing
├── Server/                     # FastAPI backend server
│   ├── Dockerfile             # Container configuration
│   ├── .dockerignore          # Docker build exclusions
│   ├── requirements.txt       # Python dependencies
│   ├── server.py              # Main FastAPI application
│   ├── database.py            # Database connection and setup
│   ├── models.py              # Data models and schemas
│   └── run.sh                 # Development startup script
├── dashboard/                  # Next.js frontend application
│   ├── Dockerfile             # Container configuration
│   ├── .dockerignore          # Docker build exclusions
│   ├── package.json           # Node.js dependencies
│   ├── next.config.mjs        # Next.js configuration
│   ├── tailwind.config.ts     # Tailwind CSS configuration
│   ├── app/                   # Next.js 14 app directory
│   │   ├── components/        # React components
│   │   │   └── Dashboard.tsx  # Main dashboard component
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # ShadCN UI components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
├── docker-compose.yml          # Multi-service orchestration
├── README.md                   # This documentation
└── screenshot.png              # Dashboard preview image
```

---

## 🔧 Configuration

### Environment Variables

#### Client (`Client/.env`)
```env
USER_ID=your-unique-user-id
SERVER_URL=http://localhost:8000/api/devices/data
SEND_INTERVAL=10
MAX_RETRIES=5
RETRY_DELAY=5
```

#### Server
```env
DATABASE_URL=mysql+pymysql://monitoring_user:monitoring_password@localhost:3306/device_monitoring
```

#### Dashboard
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Deployment

### Production Deployment with Docker

```bash
# Build for production
docker-compose -f docker-compose.yml up --build -d

# Scale services (if needed)
docker-compose up --scale client=3 -d

# Monitor services
docker-compose ps
docker-compose logs -f [service-name]
```

### Cloud Deployment

1. **AWS ECS/EKS:** Use the provided Dockerfiles with AWS container services
2. **Google Cloud Run:** Deploy individual services using the Docker images
3. **Azure Container Instances:** Utilize docker-compose with Azure
4. **DigitalOcean App Platform:** Deploy directly from this repository

---

## 🔍 Monitoring & Troubleshooting

### Service Health Checks

```bash
# Check all services status
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Check health endpoints
curl http://localhost:8000/api/devices/logs  # Server health
curl http://localhost:3000                   # Dashboard health
```

### Common Issues

#### Client Not Sending Data
- Verify `SERVER_URL` in `.env` file
- Check network connectivity to server
- Ensure client has proper permissions for system monitoring

#### Dashboard Not Loading Data
- Confirm server is running on port 8000
- Check CORS settings in server configuration
- Verify API endpoints are accessible

#### Database Connection Issues
- Ensure MySQL is running and accessible
- Verify database credentials and connection string
- Check database permissions

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure Docker builds work correctly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/nityasundar2743/Device-Monitoring-Platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/nityasundar2743/Device-Monitoring-Platform/discussions)
- **Wiki:** [Project Wiki](https://github.com/nityasundar2743/Device-Monitoring-Platform/wiki)

---

## ⭐ Acknowledgments

- **ShadCN UI** for beautiful component library
- **Recharts** for powerful charting capabilities
- **FastAPI** for high-performance backend framework
- **Next.js** for excellent React framework
- **psutil** for cross-platform system monitoring
