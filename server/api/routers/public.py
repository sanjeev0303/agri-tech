from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.entity import Equipment, LabourService, User, Profile
from schemas.equipment import EquipmentOut
from schemas.labour import LabourServiceOut
from typing import List
import time

router = APIRouter()

class SimpleCache:
    def __init__(self, ttl_seconds: int = 60):
        self.cache = {}
        self.ttl = ttl_seconds

    def get(self, key: str):
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['time'] < self.ttl:
                return entry['data']
        return None

    def set(self, key: str, data):
        self.cache[key] = {'time': time.time(), 'data': data}

public_cache = SimpleCache(ttl_seconds=60)

@router.get("/equipment", response_model=List[EquipmentOut])
async def list_available_equipment(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    cache_key = f"equipment_{skip}_{limit}"
    cached = public_cache.get(cache_key)
    if cached:
        return cached

    result = await db.execute(select(Equipment).where(Equipment.is_available == True).offset(skip).limit(limit))
    items = result.scalars().all()
    
    # Serialize to dict for safe caching
    data = [EquipmentOut.from_orm(item).dict() for item in items]
    public_cache.set(cache_key, data)
    return data

@router.get("/labour", response_model=List[LabourServiceOut])
async def list_available_labour(skip: int = 0, limit: int = 12, db: AsyncSession = Depends(get_db)):
    cache_key = f"labour_{skip}_{limit}"
    cached = public_cache.get(cache_key)
    if cached:
        return cached

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
    
    # Serialize to dict for safe caching
    data = [LabourServiceOut.from_orm(lb).dict() for lb in labours]
    public_cache.set(cache_key, data)
    return data
