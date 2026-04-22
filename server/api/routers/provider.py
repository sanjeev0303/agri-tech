from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.entity import User, Role, Equipment, LabourService, Booking, Wallet, BankDetail, WithdrawalRequest, WithdrawalStatus
from schemas.equipment import EquipmentCreate, EquipmentOut, EquipmentUpdate
from schemas.labour import LabourServiceCreate, LabourServiceOut, LabourServiceUpdate
from schemas.booking import BookingOut
from schemas.finance import WalletOut, BankDetailCreate, BankDetailOut, WithdrawalRequestCreate, WithdrawalRequestOut
from api.deps import require_role
from typing import List

from sqlalchemy.orm import joinedload
from models.entity import User, Role, Equipment, LabourService, Booking, BookingStatus

router = APIRouter()

@router.post("/bookings/{booking_id}/service-complete", response_model=BookingOut)
async def mark_service_complete(
    booking_id: int,
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Provider marks the service as performed. 
    Moves booking from CONFIRMED -> AWAITING_FINAL_PAYMENT.
    """
    # Fetch booking and ensure it belongs to this provider
    # Check both equipment and labour sources
    result = await db.execute(
        select(Booking)
        .options(joinedload(Booking.equipment), joinedload(Booking.labour))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Ownership Check
    owner_id = None
    if booking.equipment:
        owner_id = booking.equipment.owner_id
    elif booking.labour:
        owner_id = booking.labour.provider_id
        
    if owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this booking")
        
    if booking.status != BookingStatus.confirmed:
        raise HTTPException(status_code=400, detail=f"Booking must be confirmed before marking as complete. Current state: {booking.status}")
        
    booking.status = BookingStatus.awaiting_final_payment
    await db.commit()
    await db.refresh(booking)
    return booking

@router.get("/bookings", response_model=List[BookingOut])
async def get_provider_bookings(current_user: User = Depends(require_role([Role.provider, Role.labour])), db: AsyncSession = Depends(get_db)):
    # Enhanced query to fetch all bookings (Equipment + Labour) for this provider
    result = await db.execute(
        select(Booking)
        .outerjoin(Equipment, Booking.equipment_id == Equipment.id)
        .outerjoin(LabourService, Booking.labour_id == LabourService.id)
        .where((Equipment.owner_id == current_user.id) | (LabourService.provider_id == current_user.id))
    )
    return result.scalars().all()

# --- Equipment Management ---

@router.post("/equipment", response_model=EquipmentOut)
async def create_provider_equipment(
    equipment_in: EquipmentCreate,
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Provider lists a new piece of equipment.
    """
    new_equipment = Equipment(
        **equipment_in.model_dump(),
        owner_id=current_user.id
    )
    db.add(new_equipment)
    await db.commit()
    await db.refresh(new_equipment)
    return new_equipment

@router.get("/equipment", response_model=List[EquipmentOut])
async def list_provider_equipment(
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all equipment owned by the current provider.
    """
    result = await db.execute(select(Equipment).where(Equipment.owner_id == current_user.id))
    return result.scalars().all()

@router.delete("/equipment/{equipment_id}")
async def delete_provider_equipment(
    equipment_id: int,
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a piece of equipment owned by the current provider.
    """
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    if equipment.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this equipment")
        
    await db.delete(equipment)
    await db.commit()
    return {"detail": "Equipment deleted"}

@router.put("/equipment/{equipment_id}", response_model=EquipmentOut)
async def update_provider_equipment(
    equipment_id: int,
    equipment_in: EquipmentUpdate,
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update details of a piece of equipment owned by the current provider.
    """
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if equipment.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this equipment")

    update_data = equipment_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(equipment, key, value)

    await db.commit()
    await db.refresh(equipment)
    return equipment


# --- Labour Management ---

@router.post("/labour", response_model=LabourServiceOut)
async def create_provider_labour(
    labour_in: LabourServiceCreate,
    current_user: User = Depends(require_role([Role.labour, Role.provider])),
    db: AsyncSession = Depends(get_db)
):
    """
    Provider registers a new labour service.
    """
    new_labour = LabourService(
        **labour_in.model_dump(),
        provider_id=current_user.id
    )
    db.add(new_labour)
    await db.commit()
    await db.refresh(new_labour)
    return new_labour

@router.get("/labour", response_model=List[LabourServiceOut])
async def list_provider_labour(
    current_user: User = Depends(require_role([Role.labour, Role.provider])),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all labour services provided by the current user.
    """
    result = await db.execute(select(LabourService).where(LabourService.provider_id == current_user.id))
    return result.scalars().all()

@router.put("/labour/{labour_id}", response_model=LabourServiceOut)
async def update_provider_labour(
    labour_id: int,
    labour_in: LabourServiceUpdate,
    current_user: User = Depends(require_role([Role.labour, Role.provider])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update details of a labour service owned by the current provider.
    """
    result = await db.execute(select(LabourService).where(LabourService.id == labour_id))
    labour = result.scalar_one_or_none()

    if not labour:
        raise HTTPException(status_code=404, detail="Labour service not found")

    if labour.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this service")

    update_data = labour_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(labour, key, value)

    await db.commit()
    await db.refresh(labour)
    return labour

@router.delete("/labour/{labour_id}")
async def delete_provider_labour(
    labour_id: int,
    current_user: User = Depends(require_role([Role.labour, Role.provider])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a labour service owned by the current provider.
    """
    result = await db.execute(select(LabourService).where(LabourService.id == labour_id))
    labour = result.scalar_one_or_none()
    
    if not labour:
        raise HTTPException(status_code=404, detail="Labour service not found")
        
    if labour.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this service")
        
    await db.delete(labour)
    await db.commit()
    return {"detail": "Labour service deleted"}


# --- Wallet & Finance ---

@router.get("/wallet", response_model=WalletOut)
async def get_wallet_balance(
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        # Fallback wallet creation
        wallet = Wallet(user_id=current_user.id, balance=0.0, total_earned=0.0)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    return wallet

@router.get("/bank-details", response_model=List[BankDetailOut])
async def list_bank_details(
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BankDetail).where(BankDetail.user_id == current_user.id))
    return result.scalars().all()

@router.post("/bank-details", response_model=BankDetailOut)
async def add_bank_detail(
    bank_in: BankDetailCreate,
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    new_bank = BankDetail(**bank_in.model_dump(), user_id=current_user.id)
    db.add(new_bank)
    await db.commit()
    await db.refresh(new_bank)
    return new_bank

@router.post("/withdraw", response_model=WithdrawalRequestOut)
async def request_withdrawal(
    withdraw_in: WithdrawalRequestCreate,
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Provider requests a withdrawal (ACID).
    """
    async with db.begin():
        # 1. Check wallet
        result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
        wallet = result.scalar_one_or_none()
        
        if not wallet or wallet.balance < withdraw_in.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
            
        # 2. Check bank details
        bank_result = await db.execute(
            select(BankDetail).where(BankDetail.id == withdraw_in.bank_detail_id, BankDetail.user_id == current_user.id)
        )
        if not bank_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Invalid bank account selected")
            
        # 3. Deduct from wallet and create request
        wallet.balance -= withdraw_in.amount
        
        request = WithdrawalRequest(
            user_id=current_user.id,
            amount=withdraw_in.amount,
            status=WithdrawalStatus.pending,
            bank_detail_id=withdraw_in.bank_detail_id
        )
        db.add(request)
        
    await db.refresh(request)
    return request

@router.get("/withdrawals", response_model=List[WithdrawalRequestOut])
async def list_withdrawals(
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WithdrawalRequest).where(WithdrawalRequest.user_id == current_user.id).order_by(WithdrawalRequest.created_at.desc())
    )
    return result.scalars().all()
