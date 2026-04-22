from pydantic import BaseModel
from typing import Optional

class EquipmentBase(BaseModel):
    name: str
    type: str
    hourly_rate: float
    daily_rate: float
    is_available: bool = True

class EquipmentCreate(EquipmentBase):
    image_url: Optional[str] = None

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    hourly_rate: Optional[float] = None
    daily_rate: Optional[float] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None

class EquipmentOut(EquipmentBase):
    id: int
    owner_id: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True
