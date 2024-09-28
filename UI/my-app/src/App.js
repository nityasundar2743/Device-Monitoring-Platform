import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, List, ListItem, ListItemText, Divider, 
  CircularProgress, Paper, Button, Collapse 
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const App = () => {
  const [mergedData, setMergedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesResponse, usageResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/devices'),
          axios.get('http://localhost:5000/api/usage')
        ]);

        const devices = devicesResponse.data;
        const usageData = usageResponse.data;

        const merged = devices.map(device => {
          const usage = usageData.find(usage => usage.Name === device.Name);
          return { ...device, ...usage };
        });

        setMergedData(merged);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const intervalId = setInterval(fetchData, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleExpand = (id) => {
    setExpanded(prevExpanded => ({ ...prevExpanded, [id]: !prevExpanded[id] }));
  };

  const getUsageChartData = (device) => {
    if (!device.cpuUsageHistory || !device.memUsageHistory || !device.diskUsageHistory) return [];
  
    return device.cpuUsageHistory.map((entry, index) => ({
      timestamp: entry.timestamp,
      cpuUsage: entry.cpuUsage,
      memoryUsage: device.memUsageHistory[index].memoryUsage,
      diskUsage: device.diskUsageHistory[index].diskUsage,
    }));
  };
  
  if (loading) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>Devices</Typography>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>Devices</Typography>
      {mergedData.length === 0 ? (
        <Typography variant="body1">No devices found</Typography>
      ) : (
        <List>
          {mergedData.map(device => (
            <Paper key={device._id} style={{ marginBottom: '20px', padding: '20px' }}>
              <ListItem>
                <ListItemText
                  primary={device.Name}
                  secondary={
                    <>
                      <strong>OS:</strong> {device.OS}<br />
                      <strong>Version:</strong> {device.Version}<br />
                      <strong>IP Address:</strong> {device['IP Address']}<br />
                      <Button 
                        variant="contained" 
                        color="primary" 
                        endIcon={expanded[device._id] ? <ExpandLess /> : <ExpandMore />}
                        onClick={() => toggleExpand(device._id)}
                        style={{ marginTop: '10px' }}
                      >
                        {expanded[device._id] ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </>
                  }
                />
              </ListItem>
              <Collapse in={expanded[device._id]} timeout="auto" unmountOnExit>
                <Divider />
                <ListItem>
                  <ListItemText
                    secondary={
                      <>
                        <strong>Processor:</strong> {device.Processor}<br />
                        <strong>Architecture:</strong> {device.Architecture}<br />
                        <strong>Hostname:</strong> {device.Hostname}<br />
                        <strong>Physical cores:</strong> {device['Physical cores']}<br />
                        <strong>Logical cores:</strong> {device['Logical cores']}<br />
                        <strong>Max Frequency:</strong> {device['Max Frequency']} GHz<br />
                        <strong>Current Frequency:</strong> {device['Current Frequency']} GHz<br />
                        <strong>Total Memory:</strong> {device['Total Memory']} GB<br />
                        <strong>Available Memory:</strong> {device['Available Memory']} GB<br />
                        <strong>Used Memory:</strong> {device['Used Memory']} GB<br />
                        <strong>Disk Total Space:</strong> {device['Disk Total Space']} GB<br />
                        <strong>Disk Used Space:</strong> {device['Disk Used Space']} GB<br />
                        <strong>Disk Free Space:</strong> {device['Disk Free Space']} GB<br />
                        <strong>Disk Usage:</strong> {device['Disk Usage']}%<br />
                        <strong>Total Bytes Sent:</strong> {device['Total Bytes Sent']}<br />
                        <strong>Total Bytes Received:</strong> {device['Total Bytes Received']}<br />
                        <strong>Uptime:</strong> {device.Uptime}<br />
                        <strong>Timestamp:</strong> {device.Timestamp}<br />
                      </>
                    }
                  />
                </ListItem>
                <Divider />
                {device.cpuUsageHistory && device.memUsageHistory && (
                  <ListItem>
                    <div style={{ width: '100%', height: 300 }}>
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
                  </ListItem>
                )}
              </Collapse>
              <Divider />
            </Paper>
          ))}
        </List>
      )}
      <Button variant="contained" color="secondary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
        Refresh
      </Button>
    </Container>
  );
};

export default App;