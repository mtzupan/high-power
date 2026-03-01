from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.schemas.components import (
    GearboxRead,
    GeneratorRead,
    BladeRead,
    PitchSystemRead,
    YawSystemRead,
    TowerRead,
    WakeModelRead,
    YawPowerLossResponse,
    TowerFrequencyResponse,
    WakeDeficitResponse,
)
from app.services import turbine as turbine_service
from app.services import components as component_service

router = APIRouter(prefix="/api/turbines", tags=["components"])


@router.get("/{turbine_id}/gearbox", response_model=GearboxRead)
def get_gearbox(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.get_turbine(session, turbine_id)
    return component_service.get_gearbox(session, turbine_id)


@router.get("/{turbine_id}/generator", response_model=GeneratorRead)
def get_generator(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.get_turbine(session, turbine_id)
    return component_service.get_generator(session, turbine_id)


@router.get("/{turbine_id}/blade", response_model=BladeRead)
def get_blade(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.get_turbine(session, turbine_id)
    return component_service.get_blade(session, turbine_id)


@router.get("/{turbine_id}/pitch-system", response_model=PitchSystemRead)
def get_pitch_system(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.get_turbine(session, turbine_id)
    return component_service.get_pitch_system(session, turbine_id)


@router.get("/{turbine_id}/yaw-system", response_model=YawSystemRead)
def get_yaw_system(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.get_turbine(session, turbine_id)
    return component_service.get_yaw_system(session, turbine_id)


@router.get("/{turbine_id}/tower", response_model=TowerRead)
def get_tower(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.get_turbine(session, turbine_id)
    return component_service.get_tower(session, turbine_id)


@router.get("/{turbine_id}/wake-model", response_model=WakeModelRead)
def get_wake_model(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.get_turbine(session, turbine_id)
    return component_service.get_wake_model(session, turbine_id)


@router.get("/{turbine_id}/yaw-system/power-loss", response_model=YawPowerLossResponse)
def get_yaw_power_loss(
    turbine_id: int,
    yaw_error_deg: float = Query(..., ge=0, le=180, description="Yaw misalignment angle in degrees"),
    session: Session = Depends(get_session),
):
    turbine_service.get_turbine(session, turbine_id)
    component_service.get_yaw_system(session, turbine_id)
    return component_service.yaw_power_loss(yaw_error_deg)


@router.get("/{turbine_id}/tower/frequency-check", response_model=TowerFrequencyResponse)
def get_tower_frequency_check(
    turbine_id: int,
    wind_speed: float = Query(..., ge=0, le=50, description="Wind speed in m/s"),
    session: Session = Depends(get_session),
):
    turbine = turbine_service.get_turbine(session, turbine_id)
    tower = component_service.get_tower(session, turbine_id)
    return component_service.tower_frequency_check(
        tower,
        rotor_diameter_m=turbine.rotor_diameter_m,
        tip_speed_ratio=turbine.tip_speed_ratio,
        wind_speed_mps=wind_speed,
    )


@router.get("/{turbine_id}/wake-model/deficit", response_model=WakeDeficitResponse)
def get_wake_deficit(
    turbine_id: int,
    distance_m: float = Query(..., gt=0, description="Downwind distance in metres"),
    wind_speed: float = Query(..., ge=0, le=50, description="Free-stream wind speed in m/s"),
    session: Session = Depends(get_session),
):
    turbine = turbine_service.get_turbine(session, turbine_id)
    wake = component_service.get_wake_model(session, turbine_id)
    return component_service.wake_deficit(
        wake,
        distance_m=distance_m,
        wind_speed_mps=wind_speed,
        rotor_diameter_m=turbine.rotor_diameter_m,
    )
