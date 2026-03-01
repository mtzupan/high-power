from typing import Optional
from sqlmodel import Field, SQLModel


class Gearbox(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    turbine_id: int = Field(foreign_key="turbine.id", index=True)
    gear_ratio: float = Field(default=100.0)               # overall ratio (rotor RPM × ratio = gen RPM)
    num_stages: int = Field(default=3)                     # typically 2–3
    stage_configuration: str = Field(default="planetary-helical-helical")  # e.g. "planetary-helical-helical"
    efficiency: float = Field(default=0.97)                # fraction at rated load (per full drivetrain)
    lubrication_type: str = Field(default="forced_oil")    # "forced_oil" | "splash"
    input_speed_rpm: float = Field(default=15.0)           # low-speed shaft (rotor side)
    output_speed_rpm: float = Field(default=1500.0)        # high-speed shaft (generator side)
    mass_tonnes: float = Field(default=50.0)               # gearbox mass
