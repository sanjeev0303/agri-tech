from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.database import get_db
from models.entity import User, Role, Transaction, TransactionStage, Booking
from api.deps import require_role
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/admin/summary")
async def get_admin_commission_summary(
    current_user: User = Depends(require_role([Role.superadmin])),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns total platform commission earned, split by Advance and Final stages.
    """
    # Total commission
    result = await db.execute(select(func.sum(Transaction.admin_commission)).where(Transaction.status == "success"))
    total_commission = result.scalar() or 0.0
    
    # Split by stage
    advance_result = await db.execute(
        select(func.sum(Transaction.admin_commission))
        .where(Transaction.payment_stage == TransactionStage.advance, Transaction.status == "success")
    )
    advance_comm = advance_result.scalar() or 0.0
    
    final_result = await db.execute(
        select(func.sum(Transaction.admin_commission))
        .where(Transaction.payment_stage == TransactionStage.final, Transaction.status == "success")
    )
    final_comm = final_result.scalar() or 0.0
    
    return {
        "total_platform_commission": total_commission,
        "breakdown": {
            "advance_payments": advance_comm,
            "final_payments": final_comm
        }
    }

@router.get("/admin/vendor-wise")
async def get_vendor_commissions(
    current_user: User = Depends(require_role([Role.superadmin])),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns commission and earnings breakdown per vendor.
    """
    query = (
        select(
            User.email,
            func.sum(Transaction.provider_amount).label("vendor_earnings"),
            func.sum(Transaction.admin_commission).label("platform_commission"),
            func.count(Transaction.id).label("total_transactions")
        )
        .join(Transaction, User.id == Transaction.provider_id)
        .where(Transaction.status == "success")
        .group_by(User.id)
    )
    
    result = await db.execute(query)
    stats = result.all()
    
    return [
        {
            "vendor_email": s.email,
            "earnings": s.vendor_earnings,
            "platform_commission": s.platform_commission,
            "transaction_count": s.total_transactions
        }
        for s in stats
    ]
