from typing import Optional
from sqlmodel import Field, SQLModel


class WakeModel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    turbine_id: int = Field(foreign_key="turbine.id", index=True)
    model_type: str = Field(default="jensen")
    thrust_coefficient: float = Field(default=0.8)        # Ct (dimensionless)
    wake_decay_constant: float = Field(default=0.04)      # k (onshore typical)
    ambient_turbulence_intensity: float = Field(default=0.06)  # I (fraction)
