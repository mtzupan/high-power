import math

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.pitch_system import PitchSystem
from app.models.yaw_system import YawSystem
from app.models.tower import Tower
from app.models.wake_model import WakeModel


# --- CRUD ---

def get_pitch_system(session: Session, turbine_id: int) -> PitchSystem:
    result = session.exec(select(PitchSystem).where(PitchSystem.turbine_id == turbine_id)).first()
    if not result:
        raise HTTPException(status_code=404, detail="PitchSystem not found for this turbine")
    return result


def get_yaw_system(session: Session, turbine_id: int) -> YawSystem:
    result = session.exec(select(YawSystem).where(YawSystem.turbine_id == turbine_id)).first()
    if not result:
        raise HTTPException(status_code=404, detail="YawSystem not found for this turbine")
    return result


def get_tower(session: Session, turbine_id: int) -> Tower:
    result = session.exec(select(Tower).where(Tower.turbine_id == turbine_id)).first()
    if not result:
        raise HTTPException(status_code=404, detail="Tower not found for this turbine")
    return result


def get_wake_model(session: Session, turbine_id: int) -> WakeModel:
    result = session.exec(select(WakeModel).where(WakeModel.turbine_id == turbine_id)).first()
    if not result:
        raise HTTPException(status_code=404, detail="WakeModel not found for this turbine")
    return result


# --- Physics ---

def yaw_power_loss(yaw_error_deg: float) -> dict:
    """P_yaw = P · cos²(θ)  — cosine squared law for yaw misalignment."""
    theta = math.radians(yaw_error_deg)
    cos2 = math.cos(theta) ** 2
    return {
        "yaw_error_deg": yaw_error_deg,
        "cos2_factor": round(cos2, 6),
        "power_loss_fraction": round(1 - cos2, 6),
    }


def tower_frequency_check(
    tower: Tower,
    rotor_diameter_m: float,
    tip_speed_ratio: float,
    wind_speed_mps: float,
) -> dict:
    """Soft-stiff check: natural freq must sit between 1P and 3P (rotor harmonics)."""
    omega = tip_speed_ratio * wind_speed_mps / (rotor_diameter_m / 2)   # rad/s
    one_p = omega / (2 * math.pi)
    three_p = 3 * one_p
    fn = tower.first_nat_freq_hz
    return {
        "first_nat_freq_hz": fn,
        "one_p_hz": round(one_p, 4),
        "three_p_hz": round(three_p, 4),
        "is_soft_stiff": one_p < fn < three_p,
        "margin_to_1p_hz": round(fn - one_p, 4),
        "margin_to_3p_hz": round(three_p - fn, 4),
    }


def wake_deficit(
    wake: WakeModel,
    distance_m: float,
    wind_speed_mps: float,
    rotor_diameter_m: float,
) -> dict:
    """Jensen top-hat wake model: V_wake = V∞ · (1 − (1−√(1−Ct)) · (D/(D+2kx))²)"""
    Ct = wake.thrust_coefficient
    k = wake.wake_decay_constant
    D = rotor_diameter_m
    x = distance_m
    deficit_factor = (1 - math.sqrt(1 - Ct)) * (D / (D + 2 * k * x)) ** 2
    v_wake = wind_speed_mps * (1 - deficit_factor)
    return {
        "wind_speed_mps": wind_speed_mps,
        "distance_m": distance_m,
        "wake_speed_mps": round(v_wake, 3),
        "speed_deficit_fraction": round(deficit_factor, 4),
    }
