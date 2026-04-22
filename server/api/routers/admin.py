from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from core.database import get_db
from models.entity import User, Role, Equipment, LabourService, Booking, BookingStatus, Transaction, Wallet, WithdrawalRequest, WithdrawalStatus, BankDetail
from schemas.user import UserOut
from schemas.equipment import EquipmentOut
from schemas.labour import LabourServiceOut
from schemas.booking import BookingOut
from api.deps import require_role
from schemas.finance import WithdrawalRequestAdminOut
from typing import List, Optional

router = APIRouter()

# --- User Management ---

@router.get("/users", response_model=List[UserOut])
async def list_users(
    role: Optional[Role] = None, 
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    query = select(User).options(selectinload(User.profile))
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(require_role([Role.superadmin])), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"detail": "User deleted"}

# --- Equipment Management ---

@router.get("/equipment", response_model=List[EquipmentOut])
async def list_all_equipment(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Equipment).offset(skip).limit(limit))
    return result.scalars().all()

@router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: int, current_user: User = Depends(require_role([Role.superadmin])), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    await db.delete(equipment)
    await db.commit()
    return {"detail": "Equipment deleted"}

# --- Labour Service Management ---

@router.get("/labour", response_model=List[LabourServiceOut])
async def list_all_labour(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LabourService).offset(skip).limit(limit))
    return result.scalars().all()

@router.delete("/labour/{labour_id}")
async def delete_labour(labour_id: int, current_user: User = Depends(require_role([Role.superadmin])), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabourService).where(LabourService.id == labour_id))
    labour = result.scalar_one_or_none()
    if not labour:
        raise HTTPException(status_code=404, detail="Labour service not found")
    await db.delete(labour)
    await db.commit()
    return {"detail": "Labour service deleted"}

# --- Booking Management ---

@router.get("/bookings", response_model=List[BookingOut])
async def list_all_bookings(
    status: Optional[BookingStatus] = None,
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    query = select(Booking)
    if status:
        query = query.where(Booking.status == status)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.patch("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: int, 
    status: BookingStatus,
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = status
    await db.commit()
    return {"detail": f"Booking status updated to {status}"}

@router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: int, current_user: User = Depends(require_role([Role.superadmin])), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await db.delete(booking)
    await db.commit()
    return {"detail": "Booking deleted"}

# --- Finance & Payout Management ---

@router.get("/payments/unreleased")
async def list_unreleased_payments(
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    """
    List successful transactions that haven't been released to the provider wallet.
    """
    from sqlalchemy.orm import aliased
    ProviderUser = aliased(User)
    CustomerUser = aliased(User)

    result = await db.execute(
        select(Transaction, ProviderUser.email.label("provider_email"), CustomerUser.email.label("customer_email"))
        .outerjoin(ProviderUser, Transaction.provider_id == ProviderUser.id)
        .outerjoin(Booking, Transaction.booking_id == Booking.id)
        .outerjoin(CustomerUser, Booking.user_id == CustomerUser.id)
        .where(Transaction.status == "success", Transaction.is_released == False)
    )
    unreleased = []
    for tx, p_email, c_email in result.all():
        tx.provider_email = p_email
        tx.customer_email = c_email
        unreleased.append(tx)
    return unreleased

@router.get("/payments/released")
async def list_released_payments(
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    """
    List transactions that have been successfully released to the provider wallet.
    """
    from sqlalchemy.orm import aliased
    ProviderUser = aliased(User)
    CustomerUser = aliased(User)

    result = await db.execute(
        select(Transaction, ProviderUser.email.label("provider_email"), CustomerUser.email.label("customer_email"))
        .outerjoin(ProviderUser, Transaction.provider_id == ProviderUser.id)
        .outerjoin(Booking, Transaction.booking_id == Booking.id)
        .outerjoin(CustomerUser, Booking.user_id == CustomerUser.id)
        .where(Transaction.status == "success", Transaction.is_released == True)
        .order_by(Transaction.created_at.desc())
    )
    released = []
    for tx, p_email, c_email in result.all():
        tx.provider_email = p_email
        tx.customer_email = c_email
        released.append(tx)
    return released

@router.post("/payments/{transaction_id}/release")
async def release_payment_to_wallet(
    transaction_id: int,
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    """
    Precisely release funds from Admin holding to Provider Wallet (ACID).
    """
    # 1. Fetch Transaction
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn.is_released:
        raise HTTPException(status_code=400, detail="Transaction already released")
    if txn.status != "success":
        raise HTTPException(status_code=400, detail="Cannot release unsuccessful transaction")
        
    # 2. Fetch/Initialize Wallet
    wallet_result = await db.execute(select(Wallet).where(Wallet.user_id == txn.provider_id))
    wallet = wallet_result.scalar_one_or_none()
    
    if not wallet:
        # Fallback wallet creation if seeding missed it
        wallet = Wallet(user_id=txn.provider_id, balance=0.0, total_earned=0.0)
        db.add(wallet)
        await db.flush()
        
    # 3. Release Funds (Atomic Update)
    txn.is_released = True
    wallet.balance += txn.provider_amount
    wallet.total_earned += txn.provider_amount
    
    await db.commit()
        
    return {"msg": f"Released ₹{txn.provider_amount} to {txn.provider_id}'s wallet"}

# --- Withdrawal Fulfillment ---

@router.get("/withdrawals", response_model=List[WithdrawalRequestAdminOut])
async def list_all_withdrawals(
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    """
    List all withdrawal requests with user and bank info.
    """
    result = await db.execute(
        select(WithdrawalRequest)
        .options(selectinload(WithdrawalRequest.user), selectinload(WithdrawalRequest.bank_detail))
        .order_by(WithdrawalRequest.created_at.desc())
    )
    requests = []
    for req in result.scalars().all():
        requests.append({
            "id": req.id,
            "amount": req.amount,
            "status": req.status,
            "created_at": req.created_at,
            "processed_at": req.processed_at,
            "user_email": req.user.email,
            "bank_details": req.bank_detail
        })
    return requests

@router.post("/withdrawals/{request_id}/complete")
async def complete_withdrawal(
    request_id: int,
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a withdrawal as processed and completed.
    """
    result = await db.execute(select(WithdrawalRequest).where(WithdrawalRequest.id == request_id))
    req = result.scalar_one_or_none()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != WithdrawalStatus.pending:
        raise HTTPException(status_code=400, detail="Request is not pending")
        
    req.status = WithdrawalStatus.completed
    from datetime import datetime
    req.processed_at = datetime.now()
    await db.commit()
    return {"msg": f"Withdrawal #{request_id} marked as COMPLETED"}

@router.post("/withdrawals/{request_id}/reject")
async def reject_withdrawal(
    request_id: int,
    current_user: User = Depends(require_role([Role.superadmin])), 
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a withdrawal and REVERT funds to the provider wallet (ACID).
    """
    # 1. Fetch Request
    result = await db.execute(select(WithdrawalRequest).where(WithdrawalRequest.id == request_id))
    req = result.scalar_one_or_none()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != WithdrawalStatus.pending:
        raise HTTPException(status_code=400, detail="Request is not pending")
        
    # 2. Fetch Wallet
    wallet_result = await db.execute(select(Wallet).where(Wallet.user_id == req.user_id))
    wallet = wallet_result.scalar_one_or_none()
    
    if not wallet:
         raise HTTPException(status_code=404, detail="Wallet not found")
         
    # 3. Update Status and Revert Funds
    req.status = WithdrawalStatus.rejected
    wallet.balance += req.amount
    
    await db.commit()
        
    return {"msg": f"Withdrawal #{request_id} REJECTED and ₹{req.amount} reverted to wallet"}
