from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.database import get_db
from models.entity import User, Role, Equipment, LabourService, Booking, Transaction, TransactionStage
from api.deps import require_role
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import time

class SimpleCache:
    def __init__(self, ttl_seconds=60):
        self.cache = {}
        self.ttl = ttl_seconds

    def get(self, key):
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['time'] < self.ttl:
                return entry['data']
        return None

    def set(self, key, data):
        self.cache[key] = {'time': time.time(), 'data': data}

analytics_cache = SimpleCache(ttl_seconds=60)

router = APIRouter()

class ChartData(BaseModel):
    name: str
    value: float

class GrowthData(BaseModel):
    name: str
    users: int
    providers: int
    revenue: float
    commission: float

class RadarData(BaseModel):
    subject: str
    A: int
    fullMark: int

class TransactionRecord(BaseModel):
    id: int
    booking_id: int
    amount: float
    admin_commission: float
    provider_amount: float
    stage: str
    status: str
    created_at: datetime
    provider_email: Optional[str] = None
    customer_email: Optional[str] = None

class AdminAnalytics(BaseModel):
    total_users: int
    total_providers: int
    total_equipment: int
    total_labour: int
    total_bookings: int
    total_revenue: float
    total_commission: float
    success_rate: float
    recent_transactions: List[TransactionRecord]
    user_growth: List[GrowthData]
    resource_distribution: List[Dict[str, Any]]
    platform_radar: List[RadarData]

class ProviderAnalytics(BaseModel):
    active_equipment: int
    active_labour: int
    pending_bookings: int
    total_earnings: float
    advance_earnings: float
    final_earnings: float
    recent_transactions: List[TransactionRecord]

class UserAnalytics(BaseModel):
    my_bookings: int

@router.get("/admin", response_model=AdminAnalytics)
async def get_admin_analytics(current_user: User = Depends(require_role([Role.superadmin])), db: AsyncSession = Depends(get_db)):
    cached = analytics_cache.get("admin")
    if cached:
        return cached

    # 1. Base Counts
    users_count = await db.scalar(select(func.count()).select_from(User).where(User.role == Role.user))
    providers_count = await db.scalar(select(func.count()).select_from(User).where((User.role == Role.provider) | (User.role == Role.labour)))
    equipments_count = await db.scalar(select(func.count()).select_from(Equipment))
    labours_count = await db.scalar(select(func.count()).select_from(LabourService))
    bookings_count = await db.scalar(select(func.count()).select_from(Booking))
    
    # 2. Financial Stats (Real-time from Transaction table)
    revenue_res = await db.execute(
        select(
            func.sum(Transaction.total_amount).label("total_rev"),
            func.sum(Transaction.admin_commission).label("total_comm")
        ).where(Transaction.status == "success")
    )
    rev_row = revenue_res.one()
    total_rev = float(rev_row.total_rev or 0.0)
    total_comm = float(rev_row.total_comm or 0.0)
    
    # Success Rate
    total_tx = await db.scalar(select(func.count()).select_from(Transaction))
    success_tx = await db.scalar(select(func.count()).select_from(Transaction).where(Transaction.status == "success"))
    success_rate = (success_tx / total_tx * 100) if total_tx and total_tx > 0 else 100.0
    
    from sqlalchemy.orm import aliased
    ProviderUser = aliased(User)
    CustomerUser = aliased(User)

    tx_res = await db.execute(
        select(Transaction, ProviderUser.email.label("p_email"), CustomerUser.email.label("c_email"))
        .outerjoin(ProviderUser, Transaction.provider_id == ProviderUser.id)
        .outerjoin(Booking, Transaction.booking_id == Booking.id)
        .outerjoin(CustomerUser, Booking.user_id == CustomerUser.id)
        .order_by(Transaction.created_at.desc())
        .limit(10)
    )
    recent_txs = [
        TransactionRecord(
            id=tx.id,
            booking_id=tx.booking_id,
            amount=tx.total_amount,
            admin_commission=tx.admin_commission,
            provider_amount=tx.provider_amount,
            stage=tx.payment_stage,
            status=tx.status,
            created_at=tx.created_at,
            provider_email=p_email,
            customer_email=c_email
        )
        for tx, p_email, c_email in tx_res.all()
    ]
    
    # 4. Mock Growth Data (for Area/Line Chart)
    # In a real app, you'd group by created_at
    user_growth = [
        {"name": "Jan", "users": 10, "providers": 5, "revenue": 12000, "commission": 1200},
        {"name": "Feb", "users": 25, "providers": 12, "revenue": 34000, "commission": 3400},
        {"name": "Mar", "users": 45, "providers": 18, "revenue": 56000, "commission": 5600},
        {"name": "Apr", "users": users_count or 60, "providers": providers_count or 25, "revenue": int(total_rev), "commission": int(total_comm)}
    ]
    
    # 5. Resource Distribution (for Pie/Bar Chart)
    resource_distribution = [
        {"name": "Equipment", "value": equipments_count or 0, "color": "#10b981"},
        {"name": "Labour", "value": labours_count or 0, "color": "#3b82f6"}
    ]
    
    # 6. Platform Radar Data (for Radar Chart)
    platform_radar = [
        {"subject": "Utilization", "A": 85, "fullMark": 100},
        {"subject": "Growth", "A": 98, "fullMark": 100},
        {"subject": "Safety", "A": 70, "fullMark": 100},
        {"subject": "Revenue", "A": 50, "fullMark": 100},
        {"subject": "Coverage", "A": 90, "fullMark": 100}
    ]
    
    result = {
        "total_users": users_count or 0,
        "total_providers": providers_count or 0,
        "total_equipment": equipments_count or 0,
        "total_labour": labours_count or 0,
        "total_bookings": bookings_count or 0,
        "total_revenue": total_rev,
        "total_commission": total_comm,
        "success_rate": success_rate,
        "recent_transactions": recent_txs,
        "user_growth": user_growth,
        "resource_distribution": resource_distribution,
        "platform_radar": platform_radar
    }
    analytics_cache.set("admin", result)
    return result

@router.get("/provider", response_model=ProviderAnalytics)
async def get_provider_analytics(current_user: User = Depends(require_role([Role.provider, Role.labour])), db: AsyncSession = Depends(get_db)):
    cache_key = f"provider_{current_user.id}"
    cached = analytics_cache.get(cache_key)
    if cached:
        return cached

    # 1. Resource Counts
    equipments = await db.scalar(select(func.count()).select_from(Equipment).where(Equipment.owner_id == current_user.id))
    labours = await db.scalar(select(func.count()).select_from(LabourService).where(LabourService.provider_id == current_user.id))
    
    # 2. Booking Counts
    bookings_eq = await db.scalar(select(func.count(Booking.id)).join(Equipment, Booking.equipment_id == Equipment.id).where(Equipment.owner_id == current_user.id))
    bookings_lab = await db.scalar(select(func.count(Booking.id)).join(LabourService, Booking.labour_id == LabourService.id).where(LabourService.provider_id == current_user.id))
    pending_bookings = (bookings_eq or 0) + (bookings_lab or 0)
    
    # 3. Financial Stats
    # Total earnings
    total_earnings_res = await db.scalar(
        select(func.sum(Transaction.provider_amount))
        .where(Transaction.provider_id == current_user.id, Transaction.status == "success")
    )
    total_earnings = float(total_earnings_res or 0.0)
    
    # Advance vs Final split
    advance_res = await db.scalar(
        select(func.sum(Transaction.provider_amount))
        .where(Transaction.provider_id == current_user.id, Transaction.payment_stage == TransactionStage.advance, Transaction.status == "success")
    )
    final_res = await db.scalar(
        select(func.sum(Transaction.provider_amount))
        .where(Transaction.provider_id == current_user.id, Transaction.payment_stage == TransactionStage.final, Transaction.status == "success")
    )
    
    # 4. Recent Transactions
    tx_res = await db.execute(
        select(Transaction)
        .where(Transaction.provider_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .limit(10)
    )
    recent_txs = [
        TransactionRecord(
            id=tx.id,
            booking_id=tx.booking_id,
            amount=tx.total_amount,
            admin_commission=tx.admin_commission,
            provider_amount=tx.provider_amount,
            stage=tx.payment_stage,
            status=tx.status,
            created_at=tx.created_at
        )
        for tx in tx_res.scalars().all()
    ]
    
    result = {
        "active_equipment": equipments or 0,
        "active_labour": labours or 0,
        "pending_bookings": pending_bookings,
        "total_earnings": total_earnings,
        "advance_earnings": float(advance_res or 0.0),
        "final_earnings": float(final_res or 0.0),
        "recent_transactions": recent_txs
    }
    analytics_cache.set(cache_key, result)
    return result

@router.get("/user", response_model=UserAnalytics)
async def get_user_analytics(current_user: User = Depends(require_role([Role.user])), db: AsyncSession = Depends(get_db)):
    bookings = await db.scalar(select(func.count()).select_from(Booking).where(Booking.user_id == current_user.id))
    return {"my_bookings": bookings or 0}
