from typing import Optional
from sqlmodel import SQLModel


class TurbineParameterRead(SQLModel):
    id: int
    field: str
    symbol: Optional[str]
    example: str
    purpose: str
    category: str
    sort_order: int
