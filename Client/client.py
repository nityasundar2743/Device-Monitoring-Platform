import requests
import systemInfo
import time
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

DEVICE_ID = os.getenv("DEVICE_ID")
SERVER_URL = os.getenv("SERVER_URL")
SEND_INTERVAL = int(os.getenv("SEND_INTERVAL"))

def send_system_info():
    max_retries = 5
    for attempt in range(1, max_retries + 1):
        try:
            info = systemInfo.get_system_info()

            # Override device_id with .env value (to avoid leaking hostname if needed)
            metrics = {k: v for k, v in info.items() if k != "device_id"}

            payload = {
                "deviceId": DEVICE_ID,
                "metrics": metrics,
                "timestamp": datetime.utcnow().isoformat()
            }

            response = requests.post(SERVER_URL, json=payload)
            if response.status_code == 201:
                print(f"[{datetime.now()}] ✅ Sent: {payload}")
                break
            else:
                print(f"[{datetime.now()}] ❌ Failed ({response.status_code}): {response.text}")
        except Exception as e:
            print(f"[{datetime.now()}] ⚠️  Error: {e}")

        if attempt < max_retries:
            print("🔁 Retrying in 5 seconds...")
            time.sleep(5)
        else:
            print("⛔ Max retries reached.")

if __name__ == "__main__":
    while True:
        send_system_info()
        time.sleep(SEND_INTERVAL)
