from typing import Optional
from sqlmodel import Field, SQLModel


class PitchSystem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    turbine_id: int = Field(foreign_key="turbine.id", index=True)
    actuator_type: str = Field(default="electric")        # "electric" | "hydraulic"
    control_type: str = Field(default="individual")       # "individual" | "collective"
    pitch_rate_deg_per_s: float = Field(default=8.0)      # deg/s — max pitch change rate
    fine_pitch_angle_deg: float = Field(default=0.0)      # optimal low-wind angle (deg)
    feather_angle_deg: float = Field(default=90.0)        # safe shutdown angle (deg)
