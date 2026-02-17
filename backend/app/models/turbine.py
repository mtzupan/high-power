from typing import Optional

from sqlmodel import Field, SQLModel


class Turbine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    latitude: float
    longitude: float
    capacity_mw: float
    current_output_mw: float
