"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
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

interface RawMetrics {
  os?: string
  version?: string
  processor?: string
  architecture?: string
  physical_cores?: number
  logical_cores?: number
  max_frequency?: number
  total_memory?: number
  available_memory?: number
  used_memory?: number
  disk_total_space?: number
  disk_used_space?: number
  disk_free_space?: number
  disk_usage?: number
  total_bytes_sent?: number | string
  total_bytes_received?: number | string
  hostname?: string
  ip_address?: string
  uptime?: string
  cpu_avg?: number
  memory_avg?: number
  disk_avg?: number
}

interface RawLog {
  id?: number
  userId?: string
  deviceId: string
  metrics: RawMetrics
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

interface DeviceListItemProps {
  device: Device
  isSelected: boolean
  onSelect: (deviceId: string) => void
}

const DeviceListItem = React.memo(function DeviceListItem({
  device,
  isSelected,
  onSelect
}: DeviceListItemProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-between mb-2 text-left ${isSelected ? "bg-blue-100 dark:bg-blue-800" : ""}`}
        onClick={() => onSelect(device._id)}
      >
        <span className="flex items-center gap-2">
          <Laptop className="h-4 w-4" />
          {device.Name}
        </span>
        <Circle className="h-3 w-3 text-green-500" fill="currentColor" />
      </Button>
    </motion.div>
  )
})

export function Dashboard() {
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [mergedData, setMergedData] = useState<Device[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const selectedDevice = useMemo(() => {
    if (!selectedDeviceId) return null
    return mergedData.find((d) => d._id === selectedDeviceId) ?? null
  }, [mergedData, selectedDeviceId])

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") setIsDarkMode(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const fetchLogs = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await axios.get("http://localhost:8000/api/devices/logs?userId=nitya", { signal })
      const logs: RawLog[] = res.data.logs || []
      const devicesMap: Record<string, Device> = {}

      logs.forEach((log) => {
        const id = log.deviceId
        const metrics = log.metrics || {}
        if (!devicesMap[id]) {
          devicesMap[id] = {
            _id: id,
            Name: id,
            OS: metrics.os || "Unknown",
            Version: metrics.version || "",
            Status: "active",
            Processor: metrics.processor || "Unknown",
            Architecture: metrics.architecture || "",
            'Physical cores': metrics.physical_cores ?? 0,
            'Logical cores': metrics.logical_cores ?? 0,
            'Max Frequency': metrics.max_frequency ?? 0,
            'Current Frequency': metrics.max_frequency ?? 0,
            'Total Memory': metrics.total_memory ?? 0,
            'Available Memory': metrics.available_memory ?? 0,
            'Used Memory': metrics.used_memory ?? 0,
            'Disk Total Space': metrics.disk_total_space ?? 0,
            'Disk Used Space': metrics.disk_used_space ?? 0,
            'Disk Free Space': metrics.disk_free_space ?? 0,
            'Disk Usage': metrics.disk_usage ?? 0,
            'Total Bytes Sent': (metrics.total_bytes_sent ?? 0).toString(),
            'Total Bytes Received': (metrics.total_bytes_received ?? 0).toString(),
            Hostname: metrics.hostname || "",
            'IP Address': metrics.ip_address || "",
            Uptime: metrics.uptime || "",
            Timestamp: log.timestamp,
            cpuUsageHistory: [],
            memUsageHistory: [],
            diskUsageHistory: []
          }
        } else {
          devicesMap[id].Timestamp = log.timestamp
          if (metrics.used_memory !== undefined) devicesMap[id]['Used Memory'] = metrics.used_memory
          if (metrics.available_memory !== undefined) devicesMap[id]['Available Memory'] = metrics.available_memory
          if (metrics.disk_used_space !== undefined) devicesMap[id]['Disk Used Space'] = metrics.disk_used_space
          if (metrics.disk_free_space !== undefined) devicesMap[id]['Disk Free Space'] = metrics.disk_free_space
          if (metrics.disk_usage !== undefined) devicesMap[id]['Disk Usage'] = metrics.disk_usage
          if (metrics.uptime) devicesMap[id].Uptime = metrics.uptime
        }

        const entry: UsageEntry = {
          timestamp: log.timestamp,
          cpuUsage: metrics.cpu_avg ?? 0,
          memoryUsage: metrics.memory_avg ?? 0,
          diskUsage: metrics.disk_avg ?? 0
        }

        devicesMap[id].cpuUsageHistory?.push(entry)
        devicesMap[id].memUsageHistory?.push(entry)
        devicesMap[id].diskUsageHistory?.push(entry)
      })

      // Limit usage histories to the most recent 100 entries for fast chart rendering
      Object.values(devicesMap).forEach((device) => {
        if (device.cpuUsageHistory && device.cpuUsageHistory.length > 100) {
          device.cpuUsageHistory = device.cpuUsageHistory.slice(-100)
        }
        if (device.memUsageHistory && device.memUsageHistory.length > 100) {
          device.memUsageHistory = device.memUsageHistory.slice(-100)
        }
        if (device.diskUsageHistory && device.diskUsageHistory.length > 100) {
          device.diskUsageHistory = device.diskUsageHistory.slice(-100)
        }
      })

      setMergedData(Object.values(devicesMap))
    } catch (err: unknown) {
      if (axios.isCancel(err)) return
      console.error("Failed to fetch logs:", err)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchLogs(controller.signal)
    const interval = setInterval(() => {
      fetchLogs(controller.signal)
    }, 10000)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
  }, [fetchLogs])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await fetchLogs()
      toast({ title: "Refreshed", description: "Data updated." })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Could not update device data.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchLogs, toast])

  const handleSelectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId)
  }, [])

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
                {mergedData.map((device) => (
                  <DeviceListItem
                    key={device._id}
                    device={device}
                    isSelected={selectedDeviceId === device._id}
                    onSelect={handleSelectDevice}
                  />
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
                      <p className="text-sm text-muted-foreground">
                        Last updated:{" "}
                        {(() => {
                          try {
                            return format(new Date(selectedDevice.Timestamp), "dd MMM yyyy, HH:mm:ss")
                          } catch {
                            return selectedDevice.Timestamp
                          }
                        })()}
                      </p>
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
                          <InfoItem label="Disk Usage" value={`${selectedDevice["Disk Usage"]} %`} />
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

const InfoItem = React.memo(function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return <p><strong>• {label}:</strong> {value ?? "N/A"}</p>
})

const ChartCard = React.memo(function ChartCard({
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
            tickFormatter={(str) => {
              try {
                return format(new Date(str), "HH:mm")
              } catch {
                return String(str)
              }
            }}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip
            labelFormatter={(value) => {
              try {
                return new Date(value).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })
              } catch {
                return String(value)
              }
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})
