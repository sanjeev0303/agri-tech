from .razorpay_client import client
from models.entity import Booking, Transaction, BookingStatus, PaymentStatus
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

logger = logging.getLogger(__name__)

async def initiate_proportional_refund(booking_id: int, db: AsyncSession, amount: float = None):
    """
    Initiates a refund for a booking. 
    If amount is None, full refund of all successful transactions is initiated.
    Razorpay Route 'reverse_all_transfers' is used to ensure both admin and provider 
    shares are reversed proportionally.
    """
    try:
        # Fetch all successful transactions for this booking
        result = await db.execute(
            select(Transaction).where(Transaction.booking_id == booking_id, Transaction.status == "success")
        )
        transactions = result.scalars().all()
        
        if not transactions:
            raise ValueError("No successful transactions found for this booking.")
            
        refund_results = []
        
        for txn in transactions:
            # We use Razorpay refund API on the payment_id
            # reverse_all_transfers=True ensures the split transfer to the linked account is also reversed
            refund_data = {
                "amount": int(txn.total_amount * 100), # Full transaction amount in paise
                "speed": "normal",
                "notes": {"booking_id": str(booking_id), "stage": txn.payment_stage},
                "reverse_all_transfers": True 
            }
            
            refund = client.payment.refund(txn.razorpay_payment_id, refund_data)
            
            # Update Transaction status
            txn.status = "refunded"
            refund_results.append(refund)
            
        # Update Booking status
        booking_result = await db.execute(select(Booking).where(Booking.id == booking_id))
        booking = booking_result.scalar_one_or_none()
        if booking:
            booking.status = BookingStatus.cancelled
            booking.payment_status = PaymentStatus.failed # Or a new REFUNDED status if we had one
            
        await db.commit()
        return refund_results
        
    except Exception as e:
        logger.error(f"Refund failed for booking {booking_id}: {str(e)}")
        raise e
