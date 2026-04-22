from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.entity import User, Role, Booking, Equipment, LabourService, PaymentStatus
from schemas.booking import BookingCreate, BookingOut
from api.deps import require_role
from typing import List, Optional
from datetime import timezone
from fastapi import File, UploadFile
from core.cloudinary_util import upload_image
from models.entity import Profile

router = APIRouter()

@router.post("/bookings", response_model=BookingOut)
async def create_booking(booking_in: BookingCreate, current_user: User = Depends(require_role([Role.user])), db: AsyncSession = Depends(get_db)):
    # Calculate total price based on duration and rates
    duration = booking_in.end_time - booking_in.start_time
    hours = max(duration.total_seconds() / 3600, 1) # Minimum 1 hour
    
    total_price = 0
    if booking_in.equipment_id:
        result = await db.execute(select(Equipment).where(Equipment.id == booking_in.equipment_id))
        equip = result.scalar_one_or_none()
        if not equip:
            raise HTTPException(status_code=404, detail="Equipment not found")
        total_price = equip.hourly_rate * hours
    elif booking_in.labour_id:
        result = await db.execute(select(LabourService).where(LabourService.id == booking_in.labour_id))
        labour = result.scalar_one_or_none()
        if not labour:
            raise HTTPException(status_code=404, detail="Labour service not found")
        total_price = labour.hourly_rate * hours
    else:
        raise HTTPException(status_code=400, detail="Must provide equipment or labour")
        
    advance_amount = round(total_price * 0.30, 2)
    remaining_amount = round(total_price * 0.70, 2)
    
    new_booking = Booking(
        **booking_in.model_dump(),
        user_id=current_user.id,
        total_price=total_price,
        advance_amount=advance_amount,
        remaining_amount=remaining_amount,
        payment_status=PaymentStatus.pending
    )
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    return new_booking

@router.get("/bookings", response_model=List[BookingOut])
async def my_bookings(current_user: User = Depends(require_role([Role.user])), db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.equipment), selectinload(Booking.labour))
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
    )
    bookings = result.scalars().all()
    for b in bookings:
        if b.equipment:
            b.resource_name = b.equipment.name
        elif b.labour:
            b.resource_name = b.labour.skills
    return bookings

@router.get("/profile")
async def get_profile(current_user: User = Depends(require_role([Role.user, Role.provider, Role.labour])), db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    result = await db.execute(select(User).options(selectinload(User.profile)).where(User.id == current_user.id))
    user = result.scalar_one()
    if not user.profile:
        # Create profile if missing
        new_profile = Profile(user_id=user.id)
        db.add(new_profile)
        await db.commit()
        await db.refresh(new_profile)
        return new_profile
    return user.profile

@router.patch("/profile")
async def update_profile(
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    phone: Optional[str] = None,
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_role([Role.user, Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    result = await db.execute(select(User).options(selectinload(User.profile)).where(User.id == current_user.id))
    user = result.scalar_one()
    
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
    
    if first_name is not None: profile.first_name = first_name
    if last_name is not None: profile.last_name = last_name
    if phone is not None: profile.phone = phone
    
    if image:
        image_url = upload_image(image.file)
        if image_url:
            profile.image_url = image_url
            # If the user is a labour, also update their LabourService image_url for consistency
            if current_user.role == Role.labour:
                labour_res = await db.execute(select(LabourService).where(LabourService.provider_id == current_user.id))
                labour = labour_res.scalar_one_or_none()
                if labour:
                    labour.image_url = image_url
    
    await db.commit()
    await db.refresh(profile)
    return profile
