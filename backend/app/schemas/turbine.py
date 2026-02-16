from typing import Optional

from sqlmodel import SQLModel


class TurbineCreate(SQLModel):
    name: str
    latitude: float
    longitude: float
    capacity_mw: float


class TurbineUpdate(SQLModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_mw: Optional[float] = None


class TurbineRead(SQLModel):
    id: int
    name: str
    latitude: float
    longitude: float
    capacity_mw: float
