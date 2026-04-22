from pydantic import BaseModel
from typing import Optional

class LabourServiceBase(BaseModel):
    skills: str
    hourly_rate: float
    is_available: bool = True
    is_public: bool = True

class LabourServiceCreate(LabourServiceBase):
    pass

class LabourServiceUpdate(BaseModel):
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None
    is_available: Optional[bool] = None
    is_public: Optional[bool] = None
    image_url: Optional[str] = None

class LabourServiceOut(LabourServiceBase):
    id: int
    provider_id: int
    image_url: Optional[str] = None
    provider_name: Optional[str] = None

    class Config:
        from_attributes = True
