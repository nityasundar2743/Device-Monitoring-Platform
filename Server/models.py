from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON  # ✅ Import these
from typing import Optional
from datetime import datetime

class DeviceLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: str
    deviceId: str
    metrics: dict = Field(sa_column=Column(JSON))  # ✅ Explicit JSON type
    timestamp: datetime
