# client.py
import platform
import requests
import systemInfo
import time
from datetime import datetime
from dotenv import load_dotenv
import os
from monitor import CPUUsageMonitor, MemoryUsageMonitor, DiskUsageMonitor

# Load environment variables
load_dotenv()
if not os.getenv("USER_ID"):
    USER_ID = input("Enter your user ID: ").strip()
    with open(".env", "a") as env_file:
        env_file.write(f"\nUSER_ID={USER_ID}")
else:
    USER_ID = os.getenv("USER_ID")

DEVICE_ID = platform.node()
SERVER_URL = os.getenv("SERVER_URL")
SEND_INTERVAL = int(os.getenv("SEND_INTERVAL"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
RETRY_DELAY = int(os.getenv("RETRY_DELAY", 5))

# Start monitors
cpu_monitor = CPUUsageMonitor()
memory_monitor = MemoryUsageMonitor()
disk_monitor = DiskUsageMonitor()

def send_system_info():
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            info = systemInfo.get_system_info()

            # Remove device_id and use env instead
            metrics = {k: v for k, v in info.items() if k != "device_id"}
            # Add monitored data
            metrics["cpu_avg"] = cpu_monitor.get_avg_cpu_usage()
            metrics["memory_avg"] = memory_monitor.get_avg_memory_usage()
            metrics["disk_avg"] = disk_monitor.get_avg_disk_usage()

            payload = {
                "userId": USER_ID,
                "deviceId": DEVICE_ID,
                "metrics": metrics,
                "timestamp": datetime.utcnow().isoformat()
            }

            response = requests.post(SERVER_URL, json=payload)
            if response.status_code == 201:
                print(f"[{datetime.now()}] \u2705 Sent: CPU {metrics['cpu_avg']}%, Mem {metrics['memory_avg']}%, Disk {metrics['disk_avg']}%")
                break
            else:
                print(f"[{datetime.now()}] \u274C Failed ({response.status_code}): {response.text}")
        except Exception as e:
            print(f"[{datetime.now()}] \u26A0\uFE0F Error: {e}")

        if attempt < MAX_RETRIES:
            print(f"\U0001F501 Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
        else:
            print("\u26D4 Max retries reached.")

if __name__ == "__main__":
    try:
        while True:
            send_system_info()
            time.sleep(SEND_INTERVAL)
    except KeyboardInterrupt:
        cpu_monitor.stop()
        memory_monitor.stop()
        disk_monitor.stop()
        print("Monitoring stopped.")
