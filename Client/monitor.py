import psutil
import time
from threading import Thread
import wmi
import pythoncom

class CPUUsageMonitor:
    def __init__(self, max_samples=10, sample_interval=1):
        self.max_samples = max_samples
        self.sample_interval = sample_interval
        self.cpu_history = []
        self.running = True
        self.thread = Thread(target=self._monitor_cpu_usage)
        self.thread.daemon = True  # Allow thread to exit when main program exits
        self.thread.start()

    def _monitor_cpu_usage(self):
        while self.running:
            cpu_percent = psutil.cpu_percent(interval=None)
            timestamp = time.strftime('%H:%M:%S')
            if len(self.cpu_history) >= self.max_samples:
                self.cpu_history.pop(0)  # Remove the oldest sample if we exceed max_samples
            self.cpu_history.append({'timestamp': timestamp, 'cpuUsage': cpu_percent})
            time.sleep(self.sample_interval)

    def stop(self):
        self.running = False
        self.thread.join()

    def get_cpu_usage_history(self):
        return self.cpu_history

    def get_avg_cpu_usage(self):
        if not self.cpu_history:
            return 0
        avg_cpu_usage = sum(entry['cpuUsage'] for entry in self.cpu_history) / len(self.cpu_history)
        return round(avg_cpu_usage, 3)


class MemoryUsageMonitor:
    def __init__(self, max_samples=10, sample_interval=1):
        self.max_samples = max_samples
        self.sample_interval = sample_interval
        self.memory_history = []
        self.running = True
        self.thread = Thread(target=self._monitor_memory_usage)
        self.thread.daemon = True  # Allow thread to exit when main program exits
        self.thread.start()

    def _monitor_memory_usage(self):
        while self.running:
            memory_info = psutil.virtual_memory()
            memory_percent = memory_info.percent
            timestamp = time.strftime('%H:%M:%S')
            if len(self.memory_history) >= self.max_samples:
                self.memory_history.pop(0)  # Remove the oldest sample if we exceed max_samples
            self.memory_history.append({'timestamp': timestamp, 'memoryUsage': memory_percent})
            time.sleep(self.sample_interval)

    def stop(self):
        self.running = False
        self.thread.join()

    def get_memory_usage_history(self):
        return self.memory_history

    def get_avg_memory_usage(self):
        if not self.memory_history:
            return 0
        avg_memory_usage = sum(entry['memoryUsage'] for entry in self.memory_history) / len(self.memory_history)
        return round(avg_memory_usage, 3)

class DiskUsageMonitor:
    def __init__(self, max_samples=10, sample_interval=1):
        self.max_samples = max_samples
        self.sample_interval = sample_interval
        self.disk_history = []
        self.running = True
        self.thread = Thread(target=self._monitor_disk_usage)
        self.thread.daemon = True  # Allow thread to exit when main program exits
        self.thread.start()

    def _monitor_disk_usage(self):
        pythoncom.CoInitialize()
        c = wmi.WMI()
        while self.running:
            disk_percent = None
            try:
                for disk in c.Win32_PerfFormattedData_PerfDisk_LogicalDisk():
                    if disk.Name == '_Total':  # Get the total disk usage
                        disk_percent = disk.PercentDiskTime
                        break
            except Exception as e:
                print(f"Error fetching disk usage data: {e}")

            if disk_percent is not None:
                timestamp = time.strftime('%H:%M:%S')
                if len(self.disk_history) >= self.max_samples:
                    self.disk_history.pop(0)  # Remove the oldest sample if we exceed max_samples
                self.disk_history.append({'timestamp': timestamp, 'diskUsage': disk_percent})

            time.sleep(self.sample_interval)
        
        pythoncom.CoUninitialize()

    def stop(self):
        self.running = False
        self.thread.join()

    def get_disk_usage_history(self):
        return self.disk_history

    def get_avg_disk_usage(self):
        if not self.disk_history:
            return 0
        avg_disk_usage = sum(entry['diskUsage'] for entry in self.disk_history) / len(self.disk_history)
        return round(avg_disk_usage, 3)

# Example usage
def main():
    cpu_monitor = CPUUsageMonitor(max_samples=10, sample_interval=1)
    memory_monitor = MemoryUsageMonitor(max_samples=10, sample_interval=1)
    disk_monitor = DiskUsageMonitor(max_samples=10, sample_interval=1)

    try:
        while True:
            user_input = input("Type 'history' to see usage history, 'avg' for average usage, or 'exit' to stop: ").strip().lower()
            if user_input == 'history':
                cpu_history = cpu_monitor.get_cpu_usage_history()
                memory_history = memory_monitor.get_memory_usage_history()
                disk_history = disk_monitor.get_disk_usage_history()
                print("CPU Usage History (last 10 samples):", cpu_history)
                print("Memory Usage History (last 10 samples):", memory_history)
                print("Disk Usage History (last 10 samples):", disk_history)
            elif user_input == 'avg':
                avg_cpu_usage = cpu_monitor.get_avg_cpu_usage()
                avg_memory_usage = memory_monitor.get_avg_memory_usage()
                avg_disk_usage = disk_monitor.get_avg_disk_usage()
                print("Average CPU Usage (last 10 samples):", avg_cpu_usage, "%")
                print("Average Memory Usage (last 10 samples):", avg_memory_usage, "%")
                print("Average Disk Usage (last 10 samples):", avg_disk_usage, "%")
            elif user_input == 'exit':
                cpu_monitor.stop()
                memory_monitor.stop()
                disk_monitor.stop()
                print("Monitoring stopped.")
                break
    except KeyboardInterrupt:
        cpu_monitor.stop()
        memory_monitor.stop()
        disk_monitor.stop()
        print("Monitoring stopped due to keyboard interrupt.")

if __name__ == "__main__":
    main()
