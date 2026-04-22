from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.entity import User, Role, KYCStatus
from api.deps import require_role
from services.marketplace import create_linked_account, get_account_status
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/onboard")
async def onboard_provider(
    current_user: User = Depends(require_role([Role.provider, Role.labour])),
    db: AsyncSession = Depends(get_db)
):
    """
    Onboards the current provider as a Razorpay Linked Account.
    """
    if current_user.razorpay_account_id:
        return {"msg": "Already onboarded", "account_id": current_user.razorpay_account_id}
        
    try:
        account = await create_linked_account(current_user, db)
        return {"msg": "Onboarding successful", "account_id": account['id']}
    except Exception as e:
        logger.error(f"Onboarding error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def check_marketplace_status(
    current_user: User = Depends(require_role([Role.provider, Role.labour]))
):
    """
    Checks the KYC and payout status of the current provider account.
    """
    if not current_user.razorpay_account_id:
        raise HTTPException(status_code=404, detail="Not onboarded to Razorpay")
        
    status = await get_account_status(current_user.razorpay_account_id)
    return {
        "account_id": current_user.razorpay_account_id,
        "kyc_status": current_user.kyc_status,
        "payout_enabled": current_user.payout_enabled,
        "razorpay_raw_status": status
    }
