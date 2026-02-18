from typing import Optional
from sqlmodel import Field, SQLModel


class Turbine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    latitude: float
    longitude: float
    capacity_mw: float
    current_output_mw: float = Field(default=0.0)
    # Physical properties
    rotor_diameter_m: float = Field(default=112.0)
    hub_height_m: float = Field(default=94.0)
    cut_in_wind_speed_mps: float = Field(default=3.0)
    rated_wind_speed_mps: float = Field(default=13.0)
    cut_out_wind_speed_mps: float = Field(default=25.0)
    power_coefficient: float = Field(default=0.40)
    tip_speed_ratio: float = Field(default=8.0)
    air_density_kg_m3: float = Field(default=1.225)
