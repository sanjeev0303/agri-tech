from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.entity import Booking, Role, User, TransactionStage, PaymentStatus, BookingStatus, Equipment, LabourService, KYCStatus
from api.deps import require_role
from services.payments import create_booking_order, verify_payment
from services.refunds import initiate_proportional_refund
from core.config import settings
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class PaymentVerification(BaseModel):
    booking_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

async def get_booking_provider(booking: Booking, db: AsyncSession):
    """
    Helper to fetch the provider (owner/labour) of a booking.
    """
    if booking.equipment_id:
        result = await db.execute(select(Equipment).where(Equipment.id == booking.equipment_id))
        equip = result.scalar_one_or_none()
        if equip:
            return equip.owner_id
    elif booking.labour_id:
        result = await db.execute(select(LabourService).where(LabourService.id == booking.labour_id))
        labour = result.scalar_one_or_none()
        if labour:
            return labour.provider_id
    return None

@router.post("/booking/{id}/advance")
async def initiate_advance_payment(
    id: int,
    current_user: User = Depends(require_role([Role.user])),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiates the 30% advance payment for a booking.
    """
    result = await db.execute(select(Booking).where(Booking.id == id, Booking.user_id == current_user.id))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.payment_status != PaymentStatus.pending:
        raise HTTPException(status_code=400, detail="Advance already paid or in progress")
        
    provider_id = await get_booking_provider(booking, db)
    if not provider_id:
        raise HTTPException(status_code=400, detail="Provider not found for booking")
        
    result = await db.execute(select(User).where(User.id == provider_id))
    provider = result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider user not found")
        
    # NOTE: In the new architecture, payments go direct to Admin first.
    # Provider's Razorpay KYC/Payout status is not required for the initial payment.
    
    order = await create_booking_order(booking, TransactionStage.advance, provider, db)
    return {**order, "key_id": settings.RAZORPAY_KEY_ID}

@router.post("/booking/{id}/final")
async def initiate_final_payment(
    id: int,
    current_user: User = Depends(require_role([Role.user])),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiates the 70% final payment for a booking (After service complete).
    """
    result = await db.execute(select(Booking).where(Booking.id == id, Booking.user_id == current_user.id))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.payment_status != PaymentStatus.partially_paid:
        raise HTTPException(status_code=400, detail="Cannot pay final: advance not paid or already fully paid")
        
    # Security check: Ensure service is marked as complete before final payment
    if booking.status != BookingStatus.awaiting_final_payment:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot initiate final payment. Service must be marked as complete by the provider first. Current state: {booking.status}"
        )
    
    provider_id = await get_booking_provider(booking, db)
    result = await db.execute(select(User).where(User.id == provider_id))
    provider = result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider user not found")

    # NOTE: Payments go to Admin first, then manually released to Provider wallet.
    
    order = await create_booking_order(booking, TransactionStage.final, provider, db)
    return {**order, "key_id": settings.RAZORPAY_KEY_ID}

@router.post("/booking/{id}/refund")
async def refund_booking(
    id: int,
    current_user: User = Depends(require_role([Role.superadmin])),
    db: AsyncSession = Depends(get_db)
):
    """
    Administrator cancels booking and initiates full proportional refund.
    """
    try:
        refunds = await initiate_proportional_refund(id, db)
        return {"msg": f"Refund initiated for booking {id}", "refund_count": len(refunds)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def verify_razorpay_payment(
    pyld: PaymentVerification,
    db: AsyncSession = Depends(get_db)
):
    """
    Verifies Razorpay payment and updates DB.
    """
    success = await verify_payment(
        pyld.booking_id,
        pyld.razorpay_order_id,
        pyld.razorpay_payment_id,
        pyld.razorpay_signature,
        db
    )
    if success:
        return {"msg": "Payment verified successfully"}
    else:
        raise HTTPException(status_code=400, detail="Payment verification failed")
