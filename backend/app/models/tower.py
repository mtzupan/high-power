from typing import Optional
from sqlmodel import Field, SQLModel


class Tower(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    turbine_id: int = Field(foreign_key="turbine.id", index=True)
    hub_height_m: float = Field(default=94.0)
    base_diameter_m: float = Field(default=4.5)
    top_diameter_m: float = Field(default=2.3)
    wall_thickness_mm: float = Field(default=30.0)
    material: str = Field(default="steel")
    mass_tonnes: float = Field(default=250.0)
    first_nat_freq_hz: float = Field(default=0.28)        # soft-stiff design target
