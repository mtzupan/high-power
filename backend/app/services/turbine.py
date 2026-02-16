from typing import List

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.turbine import Turbine
from app.schemas.turbine import TurbineCreate, TurbineUpdate


def get_turbines(session: Session) -> List[Turbine]:
    return list(session.exec(select(Turbine)).all())


def get_turbine(session: Session, turbine_id: int) -> Turbine:
    turbine = session.get(Turbine, turbine_id)
    if not turbine:
        raise HTTPException(status_code=404, detail="Turbine not found")
    return turbine


def create_turbine(session: Session, data: TurbineCreate) -> Turbine:
    turbine = Turbine.model_validate(data)
    session.add(turbine)
    session.commit()
    session.refresh(turbine)
    return turbine


def update_turbine(session: Session, turbine_id: int, data: TurbineUpdate) -> Turbine:
    turbine = get_turbine(session, turbine_id)
    update_data = data.model_dump(exclude_unset=True)
    turbine.sqlmodel_update(update_data)
    session.add(turbine)
    session.commit()
    session.refresh(turbine)
    return turbine


def delete_turbine(session: Session, turbine_id: int) -> None:
    turbine = get_turbine(session, turbine_id)
    session.delete(turbine)
    session.commit()
