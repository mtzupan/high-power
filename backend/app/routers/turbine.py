from typing import List

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from pydantic import BaseModel

from app.schemas.turbine import TurbineCreate, TurbineRead, TurbineUpdate, TurbinePhysicsResponse
from app.services import turbine as turbine_service
from app.services import physics as physics_service

router = APIRouter(prefix="/api/turbines", tags=["turbines"])


@router.get("/", response_model=List[TurbineRead])
def list_turbines(session: Session = Depends(get_session)):
    return turbine_service.get_turbines(session)


@router.get("/{turbine_id}", response_model=TurbineRead)
def get_turbine(turbine_id: int, session: Session = Depends(get_session)):
    return turbine_service.get_turbine(session, turbine_id)


@router.post("/", response_model=TurbineRead, status_code=201)
def create_turbine(data: TurbineCreate, session: Session = Depends(get_session)):
    return turbine_service.create_turbine(session, data)


@router.put("/{turbine_id}", response_model=TurbineRead)
def update_turbine(
    turbine_id: int, data: TurbineUpdate, session: Session = Depends(get_session)
):
    return turbine_service.update_turbine(session, turbine_id, data)


class OutputUpdate(BaseModel):
    current_output_mw: float


@router.patch("/{turbine_id}/output", response_model=TurbineRead)
def update_turbine_output(
    turbine_id: int, data: OutputUpdate, session: Session = Depends(get_session)
):
    update = TurbineUpdate(current_output_mw=data.current_output_mw)
    return turbine_service.update_turbine(session, turbine_id, update)


@router.get("/{turbine_id}/physics", response_model=TurbinePhysicsResponse)
def get_turbine_physics(
    turbine_id: int,
    wind_speed: float = Query(..., ge=0, le=50, description="Wind speed in m/s"),
    session: Session = Depends(get_session),
):
    turbine = turbine_service.get_turbine(session, turbine_id)
    return physics_service.compute(wind_speed, turbine)


@router.delete("/{turbine_id}", status_code=204)
def delete_turbine(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.delete_turbine(session, turbine_id)
