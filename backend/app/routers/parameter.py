from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.parameter import TurbineParameterRead
from app.services import parameter as parameter_service

router = APIRouter(prefix="/api/parameters", tags=["parameters"])


@router.get("/", response_model=List[TurbineParameterRead])
def list_parameters(session: Session = Depends(get_session)):
    return parameter_service.get_parameters(session)
