from typing import Optional
from sqlmodel import SQLModel


class TurbineCreate(SQLModel):
    name: str
    latitude: float
    longitude: float
    capacity_mw: float
    current_output_mw: float = 0.0
    rotor_diameter_m: float = 112.0
    hub_height_m: float = 94.0
    cut_in_wind_speed_mps: float = 3.0
    rated_wind_speed_mps: float = 13.0
    cut_out_wind_speed_mps: float = 25.0
    power_coefficient: float = 0.40
    tip_speed_ratio: float = 8.0
    air_density_kg_m3: float = 1.225


class TurbineUpdate(SQLModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_mw: Optional[float] = None
    current_output_mw: Optional[float] = None
    rotor_diameter_m: Optional[float] = None
    hub_height_m: Optional[float] = None
    cut_in_wind_speed_mps: Optional[float] = None
    rated_wind_speed_mps: Optional[float] = None
    cut_out_wind_speed_mps: Optional[float] = None
    power_coefficient: Optional[float] = None
    tip_speed_ratio: Optional[float] = None
    air_density_kg_m3: Optional[float] = None


class TurbineRead(SQLModel):
    id: int
    name: str
    latitude: float
    longitude: float
    capacity_mw: float
    current_output_mw: float
    rotor_diameter_m: float
    hub_height_m: float
    cut_in_wind_speed_mps: float
    rated_wind_speed_mps: float
    cut_out_wind_speed_mps: float
    power_coefficient: float
    tip_speed_ratio: float
    air_density_kg_m3: float


class TurbinePhysicsResponse(SQLModel):
    wind_speed_mps: float
    power_mw: float
    wind_power_available_mw: float
    rotor_rpm: float
    swept_area_m2: float
    tip_speed_mps: float
