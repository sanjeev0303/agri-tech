from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.database import get_db
from models.entity import User, Role, Transaction, TransactionStage
from api.deps import require_role
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/provider/summary")
async def get_provider_earnings_summary(
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns total earnings for the current provider, split by Advance and Final stages.
    """
    # Total earnings
    result = await db.execute(
        select(func.sum(Transaction.provider_amount))
        .where(Transaction.provider_id == current_user.id, Transaction.status == "success")
    )
    total_earnings = result.scalar() or 0.0
    
    # Split by stage
    advance_result = await db.execute(
        select(func.sum(Transaction.provider_amount))
        .where(
            Transaction.provider_id == current_user.id, 
            Transaction.payment_stage == TransactionStage.advance, 
            Transaction.status == "success"
        )
    )
    advance_earnings = advance_result.scalar() or 0.0
    
    final_result = await db.execute(
        select(func.sum(Transaction.provider_amount))
        .where(
            Transaction.provider_id == current_user.id, 
            Transaction.payment_stage == TransactionStage.final, 
            Transaction.status == "success"
        )
    )
    final_earnings = final_result.scalar() or 0.0
    
    # Recent transactions
    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.provider_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .limit(10)
    )
    recent_transactions = tx_result.scalars().all()
    
    return {
        "total_earnings": total_earnings,
        "breakdown": {
            "advance_payments": advance_earnings,
            "final_payments": final_earnings
        },
        "recent_transactions": [
            {
                "id": tx.id,
                "amount": tx.provider_amount,
                "stage": tx.payment_stage,
                "status": tx.status,
                "created_at": tx.created_at
            }
            for tx in recent_transactions
        ]
    }
