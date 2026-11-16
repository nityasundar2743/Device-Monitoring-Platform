from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
        if payload.timestamp:
            try:
                parsed_timestamp = datetime.fromisoformat(payload.timestamp.replace("Z", "+00:00"))
            except Exception:
                parsed_timestamp = datetime.utcnow()
        else:
            parsed_timestamp = datetime.utcnow()

        # Create DB entry
        log_entry = DeviceLog(
            userId=payload.userId,
            deviceId=payload.deviceId,
            metrics=payload.metrics,
            timestamp=parsed_timestamp
        )

        session.add(log_entry)
        session.commit()

        print(f"✅ Saved to DB from {payload.deviceId}")
        return JSONResponse(status_code=201, content={"message": "Data received"})

    except Exception as e:
        print(f"❌ DB Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/devices/logs")
def get_logs(
    userId: Optional[str] = None,
    deviceId: Optional[str] = None,
    limit: Optional[int] = Query(default=None, ge=1),
    session: Session = Depends(get_session)
):
    query = session.query(DeviceLog)
    if userId:
        query = query.filter(DeviceLog.userId == userId)
    if deviceId:
        query = query.filter(DeviceLog.deviceId == deviceId)
    query = query.order_by(DeviceLog.timestamp.asc())
    if limit:
        query = query.limit(limit)
    logs = query.all()
    return {"logs": [log.dict() for log in logs]}


@app.get("/api/devices")
def get_devices(userId: Optional[str] = None, session: Session = Depends(get_session)):
    query = session.query(DeviceLog.deviceId).distinct()
    if userId:
        query = query.filter(DeviceLog.userId == userId)
    devices = [row[0] for row in query.all()]
    return {"devices": devices}


@app.get("/api/usage")
def get_recent_usage(
    userId: Optional[str] = None,
    deviceId: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = session.query(DeviceLog)
    if userId:
        query = query.filter(DeviceLog.userId == userId)
    if deviceId:
        query = query.filter(DeviceLog.deviceId == deviceId)
    latest_log = query.order_by(DeviceLog.timestamp.desc()).first()
    if not latest_log:
        return {"usage": None}
    return {"usage": latest_log.dict()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
