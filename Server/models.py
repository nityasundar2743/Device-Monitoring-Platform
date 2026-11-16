from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON, Index
from typing import Optional
from datetime import datetime, timezone

class DeviceLog(SQLModel, table=True):
    __tablename__ = "devicelog"

    id: Optional[int] = Field(default=None, primary_key=True)
    userId: str = Field(index=True)
    deviceId: str = Field(index=True)
    metrics: dict = Field(sa_column=Column(JSON))  # ✅ Explicit JSON type
    timestamp: datetime = Field(index=True, default_factory=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_devicelog_user_timestamp", "userId", "timestamp"),
        Index("idx_devicelog_user_device", "userId", "deviceId"),
    )
