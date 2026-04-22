from .razorpay_client import client
from models.entity import User, KYCStatus
from sqlalchemy.ext.asyncio import AsyncSession
import logging

logger = logging.getLogger(__name__)

async def create_linked_account(user: User, db: AsyncSession):
    """
    Creates a Razorpay Linked Account for a provider.
    """
    try:
        # In actual prod, you'd need bank details, business details etc.
        # For Marketplace Route, we create an Account.
        account_data = {
            "type": "route",
            "email": user.email,
            "profile": {
                "category": "agriculture",
                "subcategory": "agriculture_equipment_rental",
                "addresses": {
                    "registered": {
                        "street": "Agro Street",
                        "city": "Bengaluru",
                        "state": "KA",
                        "postal_code": "560001",
                        "country": "IN"
                    }
                }
            },
            "legal_entity_type": "individual",
            "contact_name": f"{user.email.split('@')[0]}"
        }
        
        # Create account in Razorpay
        account = client.account.create(data=account_data)
        
        # Update user with razorpay account id
        user.razorpay_account_id = account['id']
        # In test mode, we can set kyc to active or pending
        user.kyc_status = KYCStatus.pending
        
        await db.commit()
        await db.refresh(user)
        
        return account
    except Exception as e:
        logger.error(f"Error creating Razorpay account: {str(e)}")
        raise e

async def get_account_status(razorpay_account_id: str):
    """
    Fetches the account status from Razorpay.
    """
    try:
        account = client.account.fetch(razorpay_account_id)
        return account
    except Exception as e:
        logger.error(f"Error fetching Razorpay account: {str(e)}")
        return None
