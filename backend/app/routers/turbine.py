from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.turbine import TurbineCreate, TurbineRead, TurbineUpdate
from app.services import turbine as turbine_service

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


@router.delete("/{turbine_id}", status_code=204)
def delete_turbine(turbine_id: int, session: Session = Depends(get_session)):
    turbine_service.delete_turbine(session, turbine_id)
