from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Depends
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session
from datetime import datetime
from contextlib import asynccontextmanager

from database import create_db_and_tables, get_session
from models import DeviceLog

# ✅ Lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Payload model
class DevicePayload(BaseModel):
    userId: str
    deviceId: str
    metrics: dict
    timestamp: Optional[str] = None

@app.post("/api/devices/data")
def receive_data(payload: DevicePayload, session: Session = Depends(get_session)):
    try:
        # Auto timestamp if missing
        timestamp = payload.timestamp or datetime.datetime.utcnow().isoformat()
        entry = {
            "userId": payload.userId,
            "deviceId": payload.deviceId,
            "metrics": payload.metrics,
            "timestamp": timestamp
        }

        # Save to memory (replace with DB insert)
        device_logs.append(entry)
        print(f"✅ Received from {payload.deviceId}: {entry}")

        return JSONResponse(status_code=201, content={"message": "Data received"})

    except Exception as e:
        print(f"❌ DB Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/devices/logs")
def get_logs(userId: Optional[str] = None, session: Session = Depends(get_session)):
    query = session.query(DeviceLog)
    if userId:
        query = query.filter(DeviceLog.userId == userId)
    logs = query.all()
    return {"logs": [log.dict() for log in logs]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
