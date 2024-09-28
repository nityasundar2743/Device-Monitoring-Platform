"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Laptop, Moon, Sun, ChevronRight, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
  const {toast} = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [mergedData, setMergedData] = useState<Device[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesResponse, usageResponse] = await Promise.all([
          axios.get<Device[]>('http://localhost:5000/api/devices'),
          axios.get<Device[]>('http://localhost:5000/api/usage'),
        ])

        const devices = devicesResponse.data
        const usageData = usageResponse.data

        const merged = devices.map(device => {
          const usage = usageData.find(usage => usage.Name === device.Name)
          return { ...device, ...usage }
        })

        setMergedData(merged)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()

    const intervalId = setInterval(fetchData, 10000)

    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const [devicesResponse, usageResponse] = await Promise.all([
        axios.get<Device[]>('http://localhost:5000/api/devices'),
        axios.get<Device[]>('http://localhost:5000/api/usage'),
      ])

      const devices = devicesResponse.data
      const usageData = usageResponse.data

      const updatedDevices = devices.map(device => {
        const usage = usageData.find(usage => usage.Name === device.Name)
        return { ...device, ...usage }
      })

      setMergedData(updatedDevices)
      toast({
        title: "Refresh Complete",
        description: "Device information has been updated.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh Failed",
        description: "An error occurred while updating device information.",
        variant: "destructive",
      })
    }
    setIsRefreshing(false)
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Device Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className={`md:col-span-1 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                {mergedData.map((device) => (
                  <motion.div
                    key={device._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-between mb-2 text-left"
                      onClick={() => setSelectedDevice(device)}
                    >
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

          <Card className={`md:col-span-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle>Device Details</CardTitle>
            </CardHeader>
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
                      {Object.entries(selectedDevice).map(([key, value]) => {
                        if (key !== '_id' && key !== 'Name' && !key.includes('History')) {
                          return (
                            <div key={key} className="mb-2">
                              <span className="font-semibold">{key}:</span> {value}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">CPU Usage</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={selectedDevice.cpuUsageHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="cpuUsage" stroke="#8884d8" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Memory Usage</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={selectedDevice.memUsageHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="memoryUsage" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Disk Usage</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={selectedDevice.diskUsageHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="diskUsage" stroke="#ffc658" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
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