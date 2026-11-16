"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import {
  Laptop,
  Moon,
  Sun,
  ChevronRight,
  RefreshCw,
  Search,
  X,
  Activity,
  Clock,
  CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface UsageEntry {
  timestamp: string
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

interface RawMetrics {
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
  total_bytes_sent: number | string
  total_bytes_received: number | string
  hostname: string
  ip_address: string
  uptime: string
  cpu_avg: number
  memory_avg: number
  disk_avg: number
}

interface RawLog {
  deviceId: string
  timestamp: string
  metrics: RawMetrics
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

function formatDateSafe(dateStr?: string, pattern = "dd MMM yyyy, HH:mm:ss") {
  if (!dateStr) return "N/A"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return format(d, pattern)
  } catch {
    return dateStr
  }
}

export function Dashboard() {
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [mergedData, setMergedData] = useState<Device[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") setIsDarkMode(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/devices/logs?userId=nitya")
      const logs = (res.data?.logs || []) as RawLog[]
      const devicesMap: Record<string, Device> = {}

      logs.forEach((log) => {
        const id = log.deviceId
        const metrics = log.metrics
        if (!metrics) return

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
            'Total Bytes Sent': (metrics.total_bytes_sent ?? "").toString(),
            'Total Bytes Received': (metrics.total_bytes_received ?? "").toString(),
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

      const deviceList = Object.values(devicesMap)
      setMergedData(deviceList)
      setSelectedDevice((prev) => {
        if (!prev) return null
        return devicesMap[prev._id] || prev
      })
    } catch (err) {
      console.error("Failed to fetch logs:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchLogs(),
        new Promise((res) => setTimeout(res, 600))
      ])
      toast({ title: "Refreshed", description: "Data updated." })
    } catch {
      toast({
        title: "Refresh Failed",
        description: "Could not update device data.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredDevices = mergedData.filter((device) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      (device.Name && device.Name.toLowerCase().includes(query)) ||
      (device.OS && device.OS.toLowerCase().includes(query)) ||
      (device.Hostname && device.Hostname.toLowerCase().includes(query)) ||
      (device["IP Address"] && device["IP Address"].toLowerCase().includes(query))
    )
  })

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 text-foreground transition-colors duration-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Device Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Real-time telemetry and hardware resource monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="default"
              className="shadow-sm font-medium"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <div
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border bg-card text-card-foreground shadow-sm"
              role="group"
              aria-label="Theme toggle"
            >
              <Sun className={cn("h-4 w-4 transition-colors shrink-0", !isDarkMode ? "text-amber-500" : "text-muted-foreground")} />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className={cn("h-4 w-4 transition-colors shrink-0", isDarkMode ? "text-indigo-400" : "text-muted-foreground")} />
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sidebar / Device List */}
          <Card className="flex flex-col h-[520px] lg:h-[calc(100vh-12rem)] min-h-[480px] shadow-sm border border-border/80">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-primary" />
                  Devices
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {mergedData.length} {mergedData.length === 1 ? "device" : "devices"}
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search devices..."
                  className="pl-8 pr-8 h-9 text-xs sm:text-sm bg-background/50 focus:bg-background"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="space-y-3 p-1 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/40"
                    >
                      <div className="h-8 w-8 rounded-md bg-muted shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-muted rounded w-2/3" />
                        <div className="h-2.5 bg-muted/60 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground my-auto">
                  {searchQuery ? (
                    <>
                      <Search className="h-8 w-8 opacity-40 mb-2" />
                      <p className="text-sm font-semibold text-foreground">No devices match</p>
                      <p className="text-xs mt-1 max-w-[200px]">
                        No devices match &quot;{searchQuery}&quot;
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-xs"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear filter
                      </Button>
                    </>
                  ) : (
                    <>
                      <Laptop className="h-10 w-10 opacity-30 mb-2" />
                      <p className="text-sm font-semibold text-foreground">No Devices Connected</p>
                      <p className="text-xs mt-1 max-w-[220px]">
                        Devices running the monitoring client will automatically appear here.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-full pr-2">
                  <div className="space-y-2">
                    {filteredDevices.map((device) => {
                      const isSelected = selectedDevice?._id === device._id
                      return (
                        <motion.div key={device._id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-between p-3 h-auto text-left font-normal border transition-all rounded-lg",
                              isSelected
                                ? "bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/40 shadow-xs"
                                : "border-border/40 hover:border-border hover:bg-accent/60"
                            )}
                            onClick={() => setSelectedDevice(device)}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "p-2 rounded-md shrink-0 transition-colors",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                <Laptop className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate leading-tight text-foreground">
                                  {device.Name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {device.OS} • {device.Hostname || device["IP Address"] || "Unknown"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform",
                                  isSelected && "text-primary translate-x-0.5"
                                )}
                              />
                            </div>
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2 flex flex-col min-h-[520px] lg:h-[calc(100vh-12rem)] shadow-sm border border-border/80">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Device Details
              </CardTitle>
              {selectedDevice && (
                <Badge variant="success" className="font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isLoading && !selectedDevice ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 animate-pulse"
                  >
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted/60 rounded w-1/4" />
                    </div>
                    <div className="h-36 bg-muted/30 rounded-lg border border-border/40" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-muted/30 rounded-xl border border-border/40" />
                      ))}
                    </div>
                  </motion.div>
                ) : selectedDevice ? (
                  <motion.div
                    key={selectedDevice._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Device Overview Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                          {selectedDevice.Name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Last updated: {formatDateSafe(selectedDevice.Timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="info" className="font-medium text-xs">
                          {selectedDevice.OS || "Unknown OS"}
                        </Badge>
                        <Badge variant="secondary" className="font-medium text-xs">
                          {selectedDevice.Architecture || "Unknown Arch"}
                        </Badge>
                        {selectedDevice.Version && (
                          <Badge variant="outline" className="font-mono text-xs">
                            v{selectedDevice.Version}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Accordion Specs */}
                    <Accordion type="multiple" defaultValue={["general", "memory", "disk"]} className="space-y-3">
                      {/* General */}
                      <AccordionItem value="general" className="border rounded-lg px-4 bg-card/60 shadow-xs">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                          General Information
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 pb-3">
                          <InfoItem label="OS" value={selectedDevice.OS} />
                          <InfoItem label="Version" value={selectedDevice.Version} />
                          <InfoItem label="Architecture" value={selectedDevice.Architecture} />
                          <InfoItem label="Processor" value={selectedDevice.Processor} />
                          <InfoItem label="Physical Cores" value={selectedDevice["Physical cores"]} />
                          <InfoItem label="Logical Cores" value={selectedDevice["Logical cores"]} />
                          <InfoItem label="Hostname" value={selectedDevice.Hostname} />
                          <InfoItem label="IP Address" value={selectedDevice["IP Address"]} />
                          <InfoItem label="Uptime" value={selectedDevice.Uptime} />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Memory */}
                      <AccordionItem value="memory" className="border rounded-lg px-4 bg-card/60 shadow-xs">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                          Memory Statistics
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 pb-3">
                          <InfoItem
                            label="Total Memory"
                            value={selectedDevice["Total Memory"] ? `${selectedDevice["Total Memory"]} MB` : undefined}
                          />
                          <InfoItem
                            label="Available Memory"
                            value={selectedDevice["Available Memory"] ? `${selectedDevice["Available Memory"]} MB` : undefined}
                          />
                          <InfoItem
                            label="Used Memory"
                            value={selectedDevice["Used Memory"] ? `${selectedDevice["Used Memory"]} MB` : undefined}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Disk */}
                      <AccordionItem value="disk" className="border rounded-lg px-4 bg-card/60 shadow-xs">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                          Disk & Storage
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 pb-3">
                          <InfoItem
                            label="Disk Total Space"
                            value={selectedDevice["Disk Total Space"] ? `${selectedDevice["Disk Total Space"]} GB` : undefined}
                          />
                          <InfoItem
                            label="Disk Used Space"
                            value={selectedDevice["Disk Used Space"] ? `${selectedDevice["Disk Used Space"]} GB` : undefined}
                          />
                          <InfoItem
                            label="Disk Free Space"
                            value={selectedDevice["Disk Free Space"] ? `${selectedDevice["Disk Free Space"]} GB` : undefined}
                          />
                          <InfoItem
                            label="Disk Usage"
                            value={selectedDevice["Disk Usage"] !== undefined ? `${selectedDevice["Disk Usage"]} %` : undefined}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Telemetry Charts */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">Resource Utilization</h3>
                          <p className="text-xs text-muted-foreground">Historical telemetry trends for CPU, Memory, and Disk</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ChartCard
                          title="CPU Usage"
                          color="#6366f1"
                          dataKey="cpuUsage"
                          data={selectedDevice.cpuUsageHistory}
                          isDarkMode={isDarkMode}
                        />
                        <ChartCard
                          title="Memory Usage"
                          color="#10b981"
                          dataKey="memoryUsage"
                          data={selectedDevice.memUsageHistory}
                          isDarkMode={isDarkMode}
                        />
                        <ChartCard
                          title="Disk Usage"
                          color="#f59e0b"
                          dataKey="diskUsage"
                          data={selectedDevice.diskUsageHistory}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center my-auto"
                  >
                    <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground mb-4 ring-1 ring-border/50">
                      <Laptop className="h-10 w-10 opacity-60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No Device Selected</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Select a device from the sidebar to inspect its hardware specifications, network configuration, and real-time performance telemetry.
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

function InfoItem({ label, value }: { label: string; value: string | number | undefined | null }) {
  const displayValue = value !== undefined && value !== null && value !== "" ? String(value) : "—"
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors border border-border/40 text-xs sm:text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span
        className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-[240px] text-right"
        title={displayValue}
      >
        {displayValue}
      </span>
    </div>
  )
}

function ChartCard({
  title,
  color,
  dataKey,
  data,
  isDarkMode,
  unit = "%"
}: {
  title: string
  color: string
  dataKey: "cpuUsage" | "memoryUsage" | "diskUsage"
  data: UsageEntry[] | undefined
  isDarkMode: boolean
  unit?: string
}) {
  const latestEntry = data && data.length > 0 ? data[data.length - 1] : undefined
  const latestValue = latestEntry ? latestEntry[dataKey] : undefined

  return (
    <div className="p-4 rounded-xl border border-border/70 bg-card text-card-foreground shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {title}
        </h4>
        {latestValue !== undefined && (
          <Badge variant="outline" className="font-mono text-xs">
            {typeof latestValue === "number" ? `${latestValue.toFixed(1)}${unit}` : `${latestValue}${unit}`}
          </Badge>
        )}
      </div>
      <div className="w-full h-[180px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} opacity={0.6} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(str) => {
                  try {
                    return format(new Date(str), "HH:mm")
                  } catch {
                    return ""
                  }
                }}
                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                fontSize={11}
                tickLine={false}
                unit={unit}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                  borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
                  color: isDarkMode ? "#fafafa" : "#09090b",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  fontSize: "0.75rem",
                  padding: "8px 12px",
                }}
                labelFormatter={(value) => formatDateSafe(String(value))}
                formatter={(val: unknown) => [`${String(val ?? "")}${unit}`, title]}
              />
              <Legend wrapperStyle={{ paddingTop: "6px", fontSize: "11px" }} />
              <Area
                type="monotone"
                dataKey={dataKey}
                name={title}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${dataKey})`}
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg">
            No telemetry data recorded
          </div>
        )}
      </div>
    </div>
  )
}
