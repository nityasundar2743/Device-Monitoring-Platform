"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, ChevronDown, ChevronUp, Cpu, HardDrive, Wifi } from 'lucide-react'

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

const DeviceDashboard: React.FC = () => {
  const [mergedData, setMergedData] = useState<Device[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesResponse, usageResponse] = await Promise.all([
          axios.get<Device[]>('http://localhost:5000/api/devices'),
          axios.get<Device[]>('http://localhost:5000/api/usage')
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
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    const intervalId = setInterval(fetchData, 20000)

    return () => clearInterval(intervalId)
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prevExpanded => ({ ...prevExpanded, [id]: !prevExpanded[id] }))
  }

  const getUsageChartData = (device: Device): UsageEntry[] => {
    if (!device.cpuUsageHistory || !device.memUsageHistory || !device.diskUsageHistory) return []
  
    return device.cpuUsageHistory.map((entry, index) => ({
      timestamp: entry.timestamp,
      cpuUsage: entry.cpuUsage,
      memoryUsage: device.memUsageHistory![index].memoryUsage,
      diskUsage: device.diskUsageHistory![index].diskUsage,
    }))
  }
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Device Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Device Dashboard</h1>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
      {mergedData.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No devices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mergedData.map(device => (
            <Card key={device._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{device.Name}</CardTitle>
                    <Badge 
                      variant={device.Status === 'Online' ? 'default' : 'destructive'}
                      className={device.Status === 'Online' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {device.Status || 'Unknown'}
                    </Badge>
                  </div>
                  <CardDescription>{device.OS} {device.Version}</CardDescription>
                </CardHeader>
              <CardContent className="pb-2">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="cpu">CPU</TabsTrigger>
                    <TabsTrigger value="memory">Memory</TabsTrigger>
                    <TabsTrigger value="disk">Disk</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                    <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <Progress value={device.cpuUsageHistory?.[0]?.cpuUsage || 0} className="w-full" />
                  <div className="flex items-center">
                      <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Memory Usage</span>
                      </div>
                      <Progress value={device.memUsageHistory?.[0]?.memoryUsage || 0} className="w-full" />
                      <div className="flex items-center">
                        <HardDrive className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Disk Usage</span>
                      </div>
                      <Progress value={device['Disk Usage'] || 0} className="w-full" />
                      <div className="flex items-center">
                        <Wifi className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Network</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ↑ {device['Total Bytes Sent']} ↓ {device['Total Bytes Received']}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="cpu">
                    <div className="space-y-2">
                      <div>Processor: {device.Processor}</div>
                      <div>Architecture: {device.Architecture}</div>
                      <div>Physical cores: {device['Physical cores']}</div>
                      <div>Logical cores: {device['Logical cores']}</div>
                      <div>Max Frequency: {device['Max Frequency']} GHz</div>
                      <div>Current Frequency: {device['Current Frequency']} GHz</div>
                    </div>
                  </TabsContent>
                  <TabsContent value="memory">
                    <div className="space-y-2">
                      <div>Total Memory: {device['Total Memory']} GB</div>
                      <div>Available Memory: {device['Available Memory']} GB</div>
                      <div>Used Memory: {device['Used Memory']} GB</div>
                    </div>
                  </TabsContent>
                  <TabsContent value="disk">
                    <div className="space-y-2">
                      <div>Disk Total Space: {device['Disk Total Space']} GB</div>
                      <div>Disk Used Space: {device['Disk Used Space']} GB</div>
                      <div>Disk Free Space: {device['Disk Free Space']} GB</div>
                      <div>Disk Usage: {device['Disk Usage']}%</div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <div className="px-6 py-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => toggleExpand(device._id)}
                >
                  {expanded[device._id] ? 'Hide Details' : 'Show Details'}
                  {expanded[device._id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              {expanded[device._id] && (
                <CardContent>
                  <ScrollArea className="h-[200px] w-full">
                    <div className="space-y-2">
                      <div>Hostname: {device.Hostname}</div>
                      <div>IP Address: {device['IP Address']}</div>
                      <div>Uptime: {device.Uptime}</div>
                      <div>Timestamp: {device.Timestamp}</div>
                    </div>
                  </ScrollArea>
                  {device.cpuUsageHistory && device.memUsageHistory && (
                    <div className="h-[200px] w-full mt-4">
                      <ResponsiveContainer>
                        <LineChart data={getUsageChartData(device)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="cpuUsage" stroke="#8884d8" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="memoryUsage" stroke="#82ca9d" />
                          <Line type="monotone" dataKey="diskUsage" stroke="#FF5733" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeviceDashboard