from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class DeviceLog(SQLModel, table=True):
    __tablename__ = "devicelog"

    id: Optional[int] = Field(default=None, primary_key=True)
    userId: str = Field(index=True, max_length=255, description="User identifier")
    deviceId: str = Field(index=True, max_length=255, description="Device identifier")
    metrics: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSON, nullable=False),
        description="Captured system metrics",
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="Timestamp of when metrics were recorded",
    )
