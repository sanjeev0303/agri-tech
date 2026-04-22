from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.entity import WithdrawalStatus

class WalletOut(BaseModel):
    balance: float
    total_earned: float

class BankDetailBase(BaseModel):
    account_holder_name: str
    account_number: str
    ifsc_code: str
    bank_name: str

class BankDetailCreate(BankDetailBase):
    pass

class BankDetailOut(BankDetailBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class WithdrawalRequestCreate(BaseModel):
    amount: float
    bank_detail_id: int

class WithdrawalRequestOut(BaseModel):
    id: int
    amount: float
    status: WithdrawalStatus
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WithdrawalRequestAdminOut(WithdrawalRequestOut):
    user_email: str
    bank_details: BankDetailOut
