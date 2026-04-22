from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.entity import Equipment, LabourService, User, Profile
from schemas.equipment import EquipmentOut
from schemas.labour import LabourServiceOut
from typing import List

router = APIRouter()

@router.get("/equipment", response_model=List[EquipmentOut])
async def list_available_equipment(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Equipment).where(Equipment.is_available == True).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/labour", response_model=List[LabourServiceOut])
async def list_available_labour(skip: int = 0, limit: int = 12, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(LabourService, Profile.first_name, Profile.last_name)
        .outerjoin(User, LabourService.provider_id == User.id)
        .outerjoin(Profile, User.id == Profile.user_id)
        .where(LabourService.is_available == True, LabourService.is_public == True)
        .offset(skip)
        .limit(limit)
    )
    
    labours = []
    for lb, fname, lname in result.all():
        lb.provider_name = f"{fname} {lname}" if fname else f"Professional #{lb.id}"
        labours.append(lb)
    return labours
