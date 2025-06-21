from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import datetime

app = FastAPI()

# Allow frontend connections (update origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (replace with DB logic)
device_logs = []

# Pydantic model for incoming device data
class DevicePayload(BaseModel):
    deviceId: str
    metrics: dict
    timestamp: str = None  # Optional, will use current time if not provided

@app.post("/api/devices/data")
async def receive_device_data(payload: DevicePayload):
    try:
        # Auto timestamp if missing
        timestamp = payload.timestamp or datetime.datetime.utcnow().isoformat()
        entry = {
            "deviceId": payload.deviceId,
            "metrics": payload.metrics,
            "timestamp": timestamp
        }

        # Save to memory (replace with DB insert)
        device_logs.append(entry)
        print(f"✅ Received from {payload.deviceId}: {entry}")

        return JSONResponse(status_code=201, content={"message": "Data received"})

    except Exception as e:
        print(f"❌ Error receiving data: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal server error"})


@app.get("/api/devices/logs")
def get_logs():
    return {"logs": device_logs}


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
