from typing import Optional
from sqlmodel import Field, SQLModel


class Generator(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    turbine_id: int = Field(foreign_key="turbine.id", index=True)
    gearbox_id: Optional[int] = Field(default=None, foreign_key="gearbox.id")  # None = direct-drive
    generator_type: str = Field(default="DFIG")            # "DFIG" | "PMSG" | "SCIG" | "EESG"
    rated_power_kw: float = Field(default=2000.0)          # kW — nameplate capacity
    rated_voltage_v: float = Field(default=690.0)          # V — stator voltage
    rated_speed_rpm: float = Field(default=1500.0)         # rpm at rated output
    pole_pairs: int = Field(default=2)                     # determines synchronous speed
    efficiency: float = Field(default=0.95)                # fraction at rated load
    power_factor: float = Field(default=0.90)              # lagging, at rated load
    cooling_type: str = Field(default="air")               # "air" | "liquid"
    mass_tonnes: float = Field(default=70.0)               # nacelle generator mass
