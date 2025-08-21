# Device Monitoring Dashboard

A modern, responsive Next.js dashboard for visualizing real-time device monitoring data with beautiful charts, dark/light mode, and intuitive user interface.

## Features

- **Real-time Data Visualization** with interactive charts using Recharts
- **Dark/Light Mode** with system preference detection and localStorage persistence
- **Responsive Design** optimized for desktop, tablet, and mobile devices
- **Device Management** with status indicators and detailed information panels
- **Historical Data Charts** for CPU, memory, and disk usage trends
- **Modern UI Components** using ShadCN UI and Radix UI primitives
- **Smooth Animations** powered by Framer Motion
- **TypeScript** for type safety and better development experience

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI, Radix UI
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Build Tool:** Next.js built-in bundler

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Docker Deployment

```bash
# Build the image
docker build -t device-monitoring-dashboard .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  device-monitoring-dashboard
```

## Project Structure

```
dashboard/
├── app/                       # Next.js 14 App Router
│   ├── components/           # React components
│   │   └── Dashboard.tsx     # Main dashboard component
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page
├── components/               # ShadCN UI components
│   └── ui/                  # Base UI components
├── hooks/                   # Custom React hooks
│   └── use-toast.ts         # Toast notification hook
├── lib/                     # Utility functions
│   └── utils.ts             # General utilities
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── Dockerfile               # Container configuration
└── README.md                # This file
```

## Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Device Monitoring Dashboard
```

### API Integration

The dashboard expects the following API endpoints:

- `GET /api/devices/logs?userId=x` - Fetch device monitoring data

Example API response:
```json
{
  "logs": [
    {
      "deviceId": "laptop-001",
      "metrics": {
        "os": "Linux",
        "architecture": "x86_64",
        "cpu_avg": 25.5,
        "memory_avg": 60.2,
        "disk_avg": 45.8,
        // ... other metrics
      },
      "timestamp": "2023-12-01T10:00:00Z"
    }
  ]
}
```

## Features in Detail

### Dashboard Components

1. **Device List Sidebar**
   - Shows all connected devices
   - Online/offline status indicators
   - Device selection for detailed view
   - Search and filtering capabilities

2. **Device Details Panel**
   - System information (OS, processor, memory, etc.)
   - Collapsible sections for organized data
   - Real-time metrics display

3. **Resource Usage Charts**
   - CPU usage over time
   - Memory utilization trends
   - Disk usage patterns
   - Interactive tooltips and legends

4. **Theme Switching**
   - Light and dark mode support
   - System preference detection
   - Persistent user choice

### Responsive Design

- **Mobile-first approach** with progressive enhancement
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly interactions** for mobile devices
- **Optimized chart rendering** for different viewports

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Linting with auto-fix
npm run lint:fix
```

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking
- **Tailwind CSS** for styling consistency

### Component Development

Create new components in the `app/components/` directory:

```tsx
// app/components/MyComponent.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        Component content here
      </CardContent>
    </Card>
  )
}
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Docker Production

```bash
# Build production image
docker build -t device-monitoring-dashboard:latest .

# Run in production mode
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --name dashboard \
  device-monitoring-dashboard:latest
```

### Cloud Deployment

The dashboard can be deployed to various platforms:

- **Vercel:** Connect your GitHub repository for automatic deployments
- **Netlify:** Build and deploy with automatic CI/CD
- **AWS Amplify:** Deploy with AWS infrastructure
- **Google Cloud Run:** Containerized deployment
- **Azure Static Web Apps:** Static deployment with API integration

## Troubleshooting

### Common Issues

1. **API Connection Problems:**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify CORS settings on the backend
   - Ensure API server is running and accessible

2. **Build Errors:**
   - Clear `.next` directory: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Styling Issues:**
   - Verify Tailwind CSS configuration
   - Check for conflicting CSS classes
   - Ensure dark mode is properly configured

### Performance Optimization

- Use React DevTools to identify performance bottlenecks
- Optimize chart rendering with data pagination
- Implement proper memoization for expensive calculations
- Use Next.js Image component for optimized images

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Test your changes thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write TypeScript for type safety
- Add proper error handling
- Test components thoroughly
- Update documentation as needed
