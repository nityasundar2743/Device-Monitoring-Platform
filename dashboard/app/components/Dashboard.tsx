"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import axios from "axios"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import {
  Laptop, Moon, Sun, RefreshCw, Search, Cpu, Activity, HardDrive, Circle, AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

interface RawDeviceLog {
  deviceId: string
  timestamp: string
  metrics?: {
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

function safeFormatDate(dateStr?: string) {
  if (!dateStr) return "N/A"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "Recently"
    return format(d, "dd MMM yyyy, HH:mm:ss")
  } catch {
    return "Recently"
  }
}

export function Dashboard() {
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [mergedData, setMergedData] = useState<Device[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") {
      setIsDarkMode(true)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const fetchLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true)
    }
    setFetchError(null)

    try {
      const res = await axios.get<{ logs: RawDeviceLog[] }>(
        "http://localhost:8000/api/devices/logs?userId=nitya"
      )
      const logs = res.data?.logs || []
      const devicesMap: Record<string, Device> = {}

      logs.forEach((log) => {
        const id = log.deviceId
        const metrics = log.metrics || {}
        if (!devicesMap[id]) {
          devicesMap[id] = {
            _id: id,
            Name: id,
            OS: metrics.os || "Unknown",
            Version: metrics.version || "Unknown",
            Status: "active",
            Processor: metrics.processor || "Unknown",
            Architecture: metrics.architecture || "Unknown",
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
            'Total Bytes Sent': (metrics.total_bytes_sent ?? "").toString(),
            'Total Bytes Received': (metrics.total_bytes_received ?? "").toString(),
            Hostname: metrics.hostname || "Unknown",
            'IP Address': metrics.ip_address || "Unknown",
            Uptime: metrics.uptime || "Unknown",
            Timestamp: log.timestamp,
            cpuUsageHistory: [],
            memUsageHistory: [],
            diskUsageHistory: []
          }
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

      const devices = Object.values(devicesMap)
      setMergedData(devices)

      // Sync selected device with updated telemetry if already selected
      setSelectedDevice((prev) => {
        if (!prev) return devices.length > 0 ? devices[0] : null
        const matching = devices.find((d) => d._id === prev._id)
        return matching || prev
      })
    } catch (err) {
      console.error("Failed to fetch logs:", err)
      setFetchError("Unable to connect to monitoring server. Live telemetry will retry automatically.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(() => {
      fetchLogs(true)
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchLogs(true)
      toast({
        title: "Telemetry Refreshed",
        description: "Device metrics updated successfully."
      })
    } catch {
      toast({
        title: "Refresh Failed",
        description: "Could not update device telemetry.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return mergedData
    const q = searchQuery.toLowerCase().trim()
    return mergedData.filter(
      (device) =>
        device.Name.toLowerCase().includes(q) ||
        device.OS.toLowerCase().includes(q) ||
        device.Hostname.toLowerCase().includes(q) ||
        device["IP Address"].toLowerCase().includes(q)
    )
  }, [mergedData, searchQuery])

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background text-foreground transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 shadow-xs">
              <Laptop className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Device Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Real-time hardware metrics, resource telemetry, and performance insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              variant="outline"
              className="gap-2 font-medium shadow-xs"
            >
              <RefreshCw className={cn("h-4 w-4 shrink-0", isRefreshing && "animate-spin")} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card text-card-foreground shadow-xs"
              title="Toggle light/dark theme"
            >
              <Sun className={cn("h-4 w-4 transition-colors", !isDarkMode ? "text-amber-500" : "text-muted-foreground")} />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className={cn("h-4 w-4 transition-colors", isDarkMode ? "text-blue-400" : "text-muted-foreground")} />
            </div>
          </div>
        </header>

        {/* Global Alert when Server Unreachable */}
        {fetchError && (
          <div className="flex items-center gap-2 p-3 text-xs sm:text-sm rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="flex-1">{fetchError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLogs()}
              className="h-7 px-2 text-xs hover:bg-amber-500/20"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Main Grid: Sidebar + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar / Device List */}
          <Card className="flex flex-col h-auto lg:h-[calc(100vh-13rem)] min-h-[380px] shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 space-y-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <span>Connected Devices</span>
                  {mergedData.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {mergedData.length}
                    </Badge>
                  )}
                </CardTitle>
                {isLoading && (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Search filter input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Filter devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 p-3 sm:p-4">
              {isLoading && mergedData.length === 0 ? (
                /* Loading skeleton */
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="w-full h-12 rounded-lg border border-border/50 bg-muted/40 animate-pulse flex items-center justify-between px-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-4 w-4 rounded bg-muted-foreground/20" />
                        <div className="h-3.5 w-24 rounded bg-muted-foreground/20" />
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                    </div>
                  ))}
                  <p className="text-xs text-center text-muted-foreground pt-3">
                    Fetching device list...
                  </p>
                </div>
              ) : mergedData.length === 0 ? (
                /* Empty state when no devices returned */
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No devices found</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Waiting for telemetry logs from the client daemon.
                  </p>
                </div>
              ) : filteredDevices.length === 0 ? (
                /* Empty filter results */
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4">
                  <p className="text-sm font-medium text-muted-foreground">No matching devices</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="text-xs mt-1"
                  >
                    Clear filter
                  </Button>
                </div>
              ) : (
                /* Device items scroll area */
                <ScrollArea className="h-full pr-1">
                  <div className="space-y-1.5 pb-2">
                    {filteredDevices.map((device) => {
                      const isSelected = selectedDevice?._id === device._id
                      return (
                        <motion.div
                          key={device._id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-between h-auto py-2.5 px-3 text-left transition-all border",
                              isSelected
                                ? "bg-primary/10 border-primary/30 text-foreground font-medium shadow-xs hover:bg-primary/15"
                                : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setSelectedDevice(device)}
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <Laptop
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  isSelected ? "text-primary" : "text-muted-foreground"
                                )}
                              />
                              <span className="truncate text-sm font-medium">
                                {device.Name}
                              </span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
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

          {/* Details Section */}
          <Card className="lg:col-span-2 flex flex-col h-auto lg:h-[calc(100vh-13rem)] min-h-[480px] shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  Device Details
                </CardTitle>
                {selectedDevice && (
                  <span className="text-xs text-muted-foreground">
                    Device ID:{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">
                      {selectedDevice._id}
                    </code>
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {isLoading && !selectedDevice ? (
                  /* Loading placeholder */
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Fetching device data...</p>
                  </div>
                ) : selectedDevice ? (
                  /* Active device details */
                  <motion.div
                    key={selectedDevice._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Header info bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            {selectedDevice.Name}
                          </h2>
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-xs font-medium"
                          >
                            <Circle className="h-1.5 w-1.5 fill-current mr-1.5" />
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-normal">
                            OS: {selectedDevice.OS}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-normal">
                            Arch: {selectedDevice.Architecture}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-normal">
                            Host: {selectedDevice.Hostname}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Last updated</p>
                        <p className="text-xs sm:text-sm font-medium text-foreground">
                          {safeFormatDate(selectedDevice.Timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Accordion Specification Sections */}
                    <Accordion
                      type="multiple"
                      defaultValue={["general", "memory", "disk"]}
                      className="space-y-3"
                    >
                      {/* General Info */}
                      <AccordionItem
                        value="general"
                        className="border rounded-lg px-4 bg-card shadow-xs"
                      >
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary shrink-0" />
                            <span>General Information</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            <InfoItem label="Operating System" value={selectedDevice.OS} />
                            <InfoItem label="OS Version" value={selectedDevice.Version} />
                            <InfoItem label="Architecture" value={selectedDevice.Architecture} />
                            <InfoItem label="Processor" value={selectedDevice.Processor} />
                            <InfoItem label="Physical Cores" value={selectedDevice["Physical cores"]} />
                            <InfoItem label="Logical Cores" value={selectedDevice["Logical cores"]} />
                            <InfoItem
                              label="Max Frequency"
                              value={
                                selectedDevice["Max Frequency"]
                                  ? `${selectedDevice["Max Frequency"]} GHz`
                                  : "—"
                              }
                            />
                            <InfoItem label="Hostname" value={selectedDevice.Hostname} />
                            <InfoItem label="IP Address" value={selectedDevice["IP Address"]} />
                            <InfoItem label="Uptime" value={selectedDevice.Uptime} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Memory & Network */}
                      <AccordionItem
                        value="memory"
                        className="border rounded-lg px-4 bg-card shadow-xs"
                      >
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Memory & Network</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            <InfoItem
                              label="Total Memory"
                              value={
                                selectedDevice["Total Memory"] != null
                                  ? `${selectedDevice["Total Memory"]} GB`
                                  : "—"
                              }
                            />
                            <InfoItem
                              label="Available Memory"
                              value={
                                selectedDevice["Available Memory"] != null
                                  ? `${selectedDevice["Available Memory"]} GB`
                                  : "—"
                              }
                            />
                            <InfoItem
                              label="Used Memory"
                              value={
                                selectedDevice["Used Memory"] != null
                                  ? `${selectedDevice["Used Memory"]} GB`
                                  : "—"
                              }
                            />
                            <InfoItem
                              label="Total Bytes Sent"
                              value={selectedDevice["Total Bytes Sent"] || "—"}
                            />
                            <InfoItem
                              label="Total Bytes Received"
                              value={selectedDevice["Total Bytes Received"] || "—"}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Disk Storage */}
                      <AccordionItem
                        value="disk"
                        className="border rounded-lg px-4 bg-card shadow-xs"
                      >
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-amber-500 shrink-0" />
                            <span>Disk Storage</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            <InfoItem
                              label="Disk Total Space"
                              value={
                                selectedDevice["Disk Total Space"] != null
                                  ? `${selectedDevice["Disk Total Space"]} GB`
                                  : "—"
                              }
                            />
                            <InfoItem
                              label="Disk Used Space"
                              value={
                                selectedDevice["Disk Used Space"] != null
                                  ? `${selectedDevice["Disk Used Space"]} GB`
                                  : "—"
                              }
                            />
                            <InfoItem
                              label="Disk Free Space"
                              value={
                                selectedDevice["Disk Free Space"] != null
                                  ? `${selectedDevice["Disk Free Space"]} GB`
                                  : "—"
                              }
                            />
                            <InfoItem
                              label="Disk Usage"
                              value={
                                selectedDevice["Disk Usage"] != null
                                  ? `${selectedDevice["Disk Usage"]} %`
                                  : "—"
                              }
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Utilization Graphs */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Live Resource Utilization
                      </h3>
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
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
                  /* Empty state when no device is selected */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="h-12 w-12 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center mb-3 text-muted-foreground">
                      <Laptop className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      No device selected
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Select a device from the list to view its hardware specifications and telemetry trends.
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

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  const displayValue =
    value !== undefined && value !== null && value !== "" ? String(value) : "—"

  return (
    <div className="flex flex-col justify-between gap-1 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors border border-border/40 min-w-0">
      <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground truncate">
        {label}
      </span>
      <span
        className="text-sm font-semibold text-foreground truncate"
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
}: {
  title: string
  color: string
  dataKey: string
  data: UsageEntry[] | undefined
  isDarkMode: boolean
}) {
  const hasData = Boolean(data && data.length > 0)
  const latestValue = hasData
    ? data![data!.length - 1][dataKey as keyof UsageEntry]
    : null

  return (
    <Card className="border bg-card/60 shadow-xs overflow-hidden">
      <CardHeader className="p-3.5 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        {latestValue !== null && typeof latestValue === "number" && (
          <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0">
            {latestValue.toFixed(1)}%
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-3.5 pt-1">
        {hasData ? (
          <div className="h-[170px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.07)"}
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(str) => {
                    try {
                      return format(new Date(str), "HH:mm")
                    } catch {
                      return ""
                    }
                  }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                    color: isDarkMode ? "#f3f4f6" : "#111827",
                  }}
                  labelStyle={{
                    fontWeight: "600",
                    marginBottom: "4px",
                    color: isDarkMode ? "#e5e7eb" : "#374151",
                  }}
                  formatter={(value: unknown) => [`${value}%`, title]}
                  labelFormatter={(value) => {
                    try {
                      return new Date(value).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    } catch {
                      return String(value)
                    }
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${dataKey})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[170px] w-full flex flex-col items-center justify-center text-center p-4 rounded border border-dashed border-border/60">
            <p className="text-xs font-medium text-muted-foreground">
              No telemetry recorded
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              Awaiting live metrics
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
