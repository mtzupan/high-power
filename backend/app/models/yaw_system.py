from typing import Optional
from sqlmodel import Field, SQLModel


class YawSystem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    turbine_id: int = Field(foreign_key="turbine.id", index=True)
    drive_type: str = Field(default="active")             # "active" | "free"
    num_drives: int = Field(default=4)
    yaw_rate_deg_per_s: float = Field(default=0.5)        # deg/s
    activation_threshold_deg: float = Field(default=5.0) # min error before correction (deg)
    brake_torque_kNm: float = Field(default=400.0)        # holding brake torque
