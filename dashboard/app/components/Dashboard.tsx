"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { Laptop, Moon, Sun, ChevronRight, RefreshCw } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UsageEntry {
  timestamp: string
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/devices/logs?userId=nitya")
        const logs = res.data.logs

        const devicesMap: Record<string, Device> = {}

        logs.forEach((log: any) => {
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
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const [devicesRes, usageRes] = await Promise.all([
        axios.get<Device[]>("http://localhost:5000/api/devices"),
        axios.get<Device[]>("http://localhost:5000/api/usage")
      ])

      const devices = devicesRes.data
      const usageData = usageRes.data

      const updatedDevices = devices.map(d => {
        const usage = usageData.find(u => u.Name === d.Name)
        return { ...d, ...usage }
      })

      setMergedData(updatedDevices)

      if (selectedDevice) {
        const updated = updatedDevices.find(d => d._id === selectedDevice._id)
        if (updated) setSelectedDevice(updated)
      }

      toast({ title: "Refreshed", description: "Data updated." })
    } catch (error) {
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Device Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white`}
            >
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className={`md:col-span-1 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <CardHeader><CardTitle>Connected Devices</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                {mergedData.map(device => (
                  <motion.div key={device._id} whileHover={{ scale: 1.03 }}>
                    <Button variant="ghost" className="w-full justify-between mb-2" onClick={() => setSelectedDevice(device)}>
                      <span className="flex items-center">
                        <Laptop className="mr-2 h-4 w-4" />
                        {device.Name}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className={`md:col-span-2 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <CardHeader><CardTitle>Device Details</CardTitle></CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {selectedDevice ? (
                  <motion.div
                    key={selectedDevice._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-4">{selectedDevice.Name}</h2>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {Object.entries(selectedDevice).map(([key, value]) =>
                        key !== "_id" && key !== "Name" && !key.includes("History") ? (
                          <div key={key}><strong>{key}:</strong> {value}</div>
                        ) : null
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      {/* CPU */}
                      <ChartCard title="CPU Usage" color="#8884d8" dataKey="cpuUsage" data={selectedDevice.cpuUsageHistory} />

                      {/* Memory */}
                      <ChartCard title="Memory Usage" color="#82ca9d" dataKey="memoryUsage" data={selectedDevice.memUsageHistory} />

                      {/* Disk */}
                      <ChartCard title="Disk Usage" color="#ffc658" dataKey="diskUsage" data={selectedDevice.diskUsageHistory} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-center text-gray-500">Select a device to view details</p>
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

function ChartCard({
  title,
  color,
  dataKey,
  data
}: {
  title: string
  color: string
  dataKey: string
  data: UsageEntry[] | undefined
}) {
  return (
    <div className="w-full md:w-1/3">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(str) => format(new Date(str), "HH:mm")}
          />
          <YAxis domain={[0, 100]} />
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
          />
          <Legend />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
