"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { Laptop, Moon, Sun, ChevronRight, RefreshCw, Circle } from "lucide-react"
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
      await new Promise((res) => setTimeout(res, 1000)) // simulate
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
            <CardHeader><CardTitle>Devices</CardTitle></CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-full">
                {mergedData.map(device => (
                  <motion.div key={device._id} whileHover={{ scale: 1.02 }}>
                    <Button
                      variant={selectedDevice?._id === device._id ? "secondary" : "ghost"}
                      className={`w-full justify-between mb-2 text-left ${selectedDevice?._id === device._id ? "bg-blue-100 dark:bg-blue-800" : ""}`}
                      onClick={() => setSelectedDevice(device)}
                    >
                      <span className="flex items-center gap-2">
                        <Laptop className="h-4 w-4" />
                        {device.Name}
                      </span>
                      <Circle className="h-3 w-3 text-green-500" fill="currentColor" />
                    </Button>
                  </motion.div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="md:col-span-2 h-[75vh] flex flex-col">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
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
                    <div className="flex flex-wrap justify-between items-center mb-2">
                      <h2 className="text-2xl font-bold">{selectedDevice.Name}</h2>
                      <p className="text-sm text-muted-foreground">Last updated: {format(new Date(selectedDevice.Timestamp), "dd MMM yyyy, HH:mm:ss")}</p>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{selectedDevice.OS}</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">{selectedDevice.Architecture}</span>
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

function InfoItem({ label, value }: { label: string, value: any }) {
  return <p><strong>• {label}:</strong> {value}</p>
}

function ChartCard({
  title, color, dataKey, data
}: {
  title: string
  color: string
  dataKey: string
  data: UsageEntry[] | undefined
}) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
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
