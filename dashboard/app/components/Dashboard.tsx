"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { Laptop, Moon, Sun, RefreshCw, Circle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion"

interface UsageEntry {
  timestamp: string
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

interface LogData {
  deviceId: string
  metrics: {
    os: string
    version: string
    processor: string
    architecture: string
    physical_cores: number
    logical_cores: number
    max_frequency: number
    total_memory: number
    available_memory: number
    used_memory: number
    disk_total_space: number
    disk_used_space: number
    disk_free_space: number
    disk_usage: number
    total_bytes_sent: number
    total_bytes_received: number
    hostname: string
    ip_address: string
    uptime: string
    cpu_avg: number
    memory_avg: number
    disk_avg: number
  }
  timestamp: string
}

interface Device {
  _id: string
  Name: string
  OS: string
  Version: string
  Status?: string
  Processor: string
  Architecture: string
  'Physical cores': number
  'Logical cores': number
  'Max Frequency': number
  'Current Frequency': number
  'Total Memory': number
  'Available Memory': number
  'Used Memory': number
  'Disk Total Space': number
  'Disk Used Space': number
  'Disk Free Space': number
  'Disk Usage': number
  'Total Bytes Sent': string
  'Total Bytes Received': string
  Hostname: string
  'IP Address': string
  Uptime: string
  Timestamp: string
  cpuUsageHistory?: UsageEntry[]
  memUsageHistory?: UsageEntry[]
  diskUsageHistory?: UsageEntry[]
}

export function Dashboard() {
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [mergedData, setMergedData] = useState<Device[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") setIsDarkMode(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setError(null)
        const res = await axios.get("http://localhost:8000/api/devices/logs?userId=nitya")
        const logs = res.data.logs
        const devicesMap: Record<string, Device> = {}

        logs.forEach((log: LogData) => {
          const id = log.deviceId
          const metrics = log.metrics
          if (!devicesMap[id]) {
            devicesMap[id] = {
              _id: id,
              Name: id,
              OS: metrics.os,
              Version: metrics.version,
              Status: "active",
              Processor: metrics.processor,
              Architecture: metrics.architecture,
              'Physical cores': metrics.physical_cores,
              'Logical cores': metrics.logical_cores,
              'Max Frequency': metrics.max_frequency,
              'Current Frequency': metrics.max_frequency,
              'Total Memory': metrics.total_memory,
              'Available Memory': metrics.available_memory,
              'Used Memory': metrics.used_memory,
              'Disk Total Space': metrics.disk_total_space,
              'Disk Used Space': metrics.disk_used_space,
              'Disk Free Space': metrics.disk_free_space,
              'Disk Usage': metrics.disk_usage,
              'Total Bytes Sent': metrics.total_bytes_sent.toString(),
              'Total Bytes Received': metrics.total_bytes_received.toString(),
              Hostname: metrics.hostname,
              'IP Address': metrics.ip_address,
              Uptime: metrics.uptime,
              Timestamp: log.timestamp,
              cpuUsageHistory: [],
              memUsageHistory: [],
              diskUsageHistory: []
            }
          }

          devicesMap[id].cpuUsageHistory?.push({
            timestamp: log.timestamp,
            cpuUsage: metrics.cpu_avg,
            memoryUsage: metrics.memory_avg,
            diskUsage: metrics.disk_avg
          })

          devicesMap[id].memUsageHistory?.push({
            timestamp: log.timestamp,
            cpuUsage: metrics.cpu_avg,
            memoryUsage: metrics.memory_avg,
            diskUsage: metrics.disk_avg
          })

          devicesMap[id].diskUsageHistory?.push({
            timestamp: log.timestamp,
            cpuUsage: metrics.cpu_avg,
            memoryUsage: metrics.memory_avg,
            diskUsage: metrics.disk_avg
          })
        })

        setMergedData(Object.values(devicesMap))
      } catch (err) {
        console.error("Failed to fetch logs:", err)
        setError("Unable to connect to monitoring server. Please ensure the server is running.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await new Promise((res) => setTimeout(res, 1000)) // simulate
      toast({ title: "Refreshed", description: "Data updated." })
    } catch (error) {
      console.error("Refresh error:", error)
      toast({
        title: "Refresh Failed",
        description: "Could not update device data.",
        variant: "destructive"
      })
    }
    setIsRefreshing(false)
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Device Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} disabled={isRefreshing} className="text-white bg-blue-600 hover:bg-blue-700">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <Card className="h-[75vh] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                Devices
                {mergedData.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">({mergedData.length})</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <Button 
                      onClick={handleRefresh} 
                      variant="outline" 
                      size="sm"
                      className="mx-auto"
                    >
                      Retry Connection
                    </Button>
                  </div>
                ) : mergedData.length === 0 ? (
                  <div className="text-center py-8">
                    <Laptop className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No devices found</h3>
                    <p className="text-sm text-gray-500 mb-4">Start the monitoring client to see devices here</p>
                    <Button 
                      onClick={handleRefresh} 
                      variant="outline" 
                      size="sm"
                      className="mx-auto"
                    >
                      Check for devices
                    </Button>
                  </div>
                ) : (
                  mergedData.map(device => (
                    <motion.div 
                      key={device._id} 
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant={selectedDevice?._id === device._id ? "secondary" : "ghost"}
                        className={`w-full justify-between mb-2 text-left h-auto p-3 ${
                          selectedDevice?._id === device._id 
                            ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setSelectedDevice(device)}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="flex items-center gap-2 font-medium">
                            <Laptop className="h-4 w-4" />
                            {device.Name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {device.OS} • {device.Architecture}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Circle className="h-3 w-3 text-green-500" fill="currentColor" />
                          <span className="text-xs text-gray-500">Online</span>
                        </div>
                      </Button>
                    </motion.div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="md:col-span-2 h-[75vh] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Details
                {selectedDevice && (
                  <span className="text-sm font-normal text-gray-500">
                    • {selectedDevice.Name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedDevice ? (
                  <motion.div
                    key={selectedDevice._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-wrap justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">{selectedDevice.Name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {format(new Date(selectedDevice.Timestamp), "dd MMM yyyy, HH:mm:ss")}
                      </p>
                    </div>
                    <div className="flex gap-2 mb-6">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium">
                        {selectedDevice.OS}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-full font-medium">
                        {selectedDevice.Architecture}
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full font-medium flex items-center gap-1">
                        <Circle className="h-2 w-2" fill="currentColor" />
                        Online
                      </span>
                    </div>

                    <Accordion type="multiple" defaultValue={["general"]} className="space-y-4">
                      {/* General */}
                      <AccordionItem value="general">
                        <AccordionTrigger>General Info</AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <InfoItem label="OS" value={selectedDevice.OS} />
                          <InfoItem label="Version" value={selectedDevice.Version} />
                          <InfoItem label="Architecture" value={selectedDevice.Architecture} />
                          <InfoItem label="Processor" value={selectedDevice.Processor} />
                          <InfoItem label="Hostname" value={selectedDevice.Hostname} />
                          <InfoItem label="IP Address" value={selectedDevice["IP Address"]} />
                          <InfoItem label="Uptime" value={selectedDevice.Uptime} />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Memory */}
                      <AccordionItem value="memory">
                        <AccordionTrigger>Memory</AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <InfoItem label="Total Memory" value={selectedDevice["Total Memory"]} />
                          <InfoItem label="Available Memory" value={selectedDevice["Available Memory"]} />
                          <InfoItem label="Used Memory" value={selectedDevice["Used Memory"]} />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Disk */}
                      <AccordionItem value="disk">
                        <AccordionTrigger>Disk</AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <InfoItem label="Disk Total Space" value={selectedDevice["Disk Total Space"]} />
                          <InfoItem label="Disk Used Space" value={selectedDevice["Disk Used Space"]} />
                          <InfoItem label="Disk Free Space" value={selectedDevice["Disk Free Space"]} />
                          <InfoItem label="Disk Usage" value={selectedDevice["Disk Usage"] + " %"} />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ChartCard title="CPU Usage" color="#8884d8" dataKey="cpuUsage" data={selectedDevice.cpuUsageHistory} />
                      <ChartCard title="Memory Usage" color="#82ca9d" dataKey="memoryUsage" data={selectedDevice.memUsageHistory} />
                      <ChartCard title="Disk Usage" color="#ffc658" dataKey="diskUsage" data={selectedDevice.diskUsageHistory} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-16"
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
                      <Laptop className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Select a device
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      Choose a device from the sidebar to view detailed monitoring information including 
                      system specs, resource usage, and real-time charts.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
        {value}
      </div>
    </div>
  )
}

function ChartCard({
  title, color, dataKey, data
}: {
  title: string
  color: string
  dataKey: string
  data: UsageEntry[] | undefined
}) {
  const hasData = data && data.length > 0
  const latestValue = hasData ? data[data.length - 1]?.[dataKey as keyof UsageEntry] : 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          {hasData && (
            <span 
              className="text-2xl font-bold" 
              style={{ color }}
            >
              {typeof latestValue === 'number' ? latestValue.toFixed(1) : latestValue}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(str) => format(new Date(str), "HH:mm")}
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })
                }
                formatter={(value: number) => [`${value.toFixed(1)}%`, title]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                📊
              </div>
              <p className="text-sm">No data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
