from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.entity import BookingStatus, PaymentStatus

class BookingBase(BaseModel):
    equipment_id: Optional[int] = None
    labour_id: Optional[int] = None
    start_time: datetime
    end_time: datetime

class BookingCreate(BookingBase):
    pass

class BookingOut(BookingBase):
    id: int
    user_id: int
    status: BookingStatus
    total_price: float
    advance_amount: Optional[float] = None
    remaining_amount: Optional[float] = None
    payment_status: PaymentStatus
    created_at: datetime
    resource_name: Optional[str] = None

    class Config:
        from_attributes = True
