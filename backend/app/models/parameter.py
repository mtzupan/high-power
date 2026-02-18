from typing import Optional
from sqlmodel import Field, SQLModel


class TurbineParameter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    field: str = Field(index=True)
    symbol: Optional[str] = Field(default=None)
    example: str
    purpose: str
    category: str = Field(default="general")
    sort_order: int = Field(default=0)
