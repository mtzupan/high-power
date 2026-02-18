import math
from app.models.turbine import Turbine


def swept_area_m2(rotor_diameter_m: float) -> float:
    return math.pi * (rotor_diameter_m / 2) ** 2


def wind_power_mw(wind_speed_mps: float, rotor_diameter_m: float, air_density_kg_m3: float) -> float:
    """Theoretical power available in the wind (before Cp)."""
    A = swept_area_m2(rotor_diameter_m)
    return 0.5 * air_density_kg_m3 * A * wind_speed_mps ** 3 / 1_000_000


def actual_power_mw(wind_speed_mps: float, turbine: Turbine) -> float:
    """P_actual = ½ρAv³·Cp, clamped to rated capacity."""
    if wind_speed_mps < turbine.cut_in_wind_speed_mps:
        return 0.0
    if wind_speed_mps >= turbine.cut_out_wind_speed_mps:
        return 0.0
    A = swept_area_m2(turbine.rotor_diameter_m)
    p_mw = (0.5 * turbine.air_density_kg_m3 * A * wind_speed_mps ** 3 * turbine.power_coefficient) / 1_000_000
    return min(p_mw, turbine.capacity_mw)


def rotor_rpm(wind_speed_mps: float, turbine: Turbine) -> float:
    """RPM = λ·v·60 / (2π·R)"""
    if wind_speed_mps <= 0:
        return 0.0
    R = turbine.rotor_diameter_m / 2
    tip_speed = turbine.tip_speed_ratio * wind_speed_mps
    return tip_speed * 60 / (2 * math.pi * R)


def compute(wind_speed_mps: float, turbine: Turbine) -> dict:
    A = swept_area_m2(turbine.rotor_diameter_m)
    tip_spd = turbine.tip_speed_ratio * wind_speed_mps
    return {
        "wind_speed_mps": wind_speed_mps,
        "power_mw": actual_power_mw(wind_speed_mps, turbine),
        "wind_power_available_mw": wind_power_mw(wind_speed_mps, turbine.rotor_diameter_m, turbine.air_density_kg_m3),
        "rotor_rpm": rotor_rpm(wind_speed_mps, turbine),
        "swept_area_m2": A,
        "tip_speed_mps": tip_spd,
    }
