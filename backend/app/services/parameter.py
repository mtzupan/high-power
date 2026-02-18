from typing import List
from sqlmodel import Session, select
from app.models.parameter import TurbineParameter


def get_parameters(session: Session) -> List[TurbineParameter]:
    return list(session.exec(select(TurbineParameter).order_by(TurbineParameter.sort_order)).all())
