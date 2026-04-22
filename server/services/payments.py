from .razorpay_client import client
from models.entity import Booking, User, Transaction, TransactionStage, PaymentStatus, BookingStatus
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import hmac
import hashlib
import os
import logging

logger = logging.getLogger(__name__)

from core.config import settings

RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET

def calculate_split(amount: float):
    """
    Calculates the 10% platform commission and 90% employee share.
    Amounts in paise (integer).
    """
    admin_commission = round(amount * 0.10)
    provider_amount = amount - admin_commission
    return admin_commission, provider_amount

async def create_booking_order(booking: Booking, stage: TransactionStage, provider: User, db: AsyncSession):
    """
    Creates a Razorpay order for a booking stage (Advance/Final).
    Payments are settled in the Admin's account for manual release later.
    """
    try:
        # Amount calculations (Convert to paise)
        amount_to_pay = booking.advance_amount if stage == TransactionStage.advance else booking.remaining_amount
        total_paise = int(amount_to_pay * 100)
        
        admin_comm_paise, provider_amt_paise = calculate_split(total_paise)
        
        order_data = {
            "amount": total_paise,
            "currency": "INR",
            "receipt": f"booking_{booking.id}_{stage}"
        }
        
        # Create Razorpay order (Direct to Admin account)
        order = client.order.create(data=order_data)
        
        # Log Transaction as PENDING
        txn = Transaction(
            booking_id=booking.id,
            provider_id=provider.id,
            payment_stage=stage,
            total_amount=amount_to_pay,
            admin_commission=admin_comm_paise / 100.0,
            provider_amount=provider_amt_paise / 100.0,
            razorpay_order_id=order['id'],
            status="pending"
        )
        db.add(txn)
        await db.commit()
        await db.refresh(txn)
        
        return order
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {str(e)}")
        raise e

async def verify_payment(
    booking_id: int, 
    razorpay_order_id: str, 
    razorpay_payment_id: str, 
    razorpay_signature: str,
    db: AsyncSession
):
    """
    Verifies Razorpay payment signature and updates the DB state.
    """
    try:
        # Verify signature
        # In razorpay-python SDK:
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })
        
        # Update Transaction
        result = await db.execute(
            select(Transaction).where(Transaction.razorpay_order_id == razorpay_order_id)
        )
        txn = result.scalar_one_or_none()
        if not txn:
            raise ValueError("Transaction not found")
            
        txn.razorpay_payment_id = razorpay_payment_id
        txn.razorpay_signature = razorpay_signature
        txn.status = "success"
        
        # Update Booking state
        booking_result = await db.execute(select(Booking).where(Booking.id == booking_id))
        booking = booking_result.scalar_one_or_none()
        
        if txn.payment_stage == TransactionStage.advance:
            booking.payment_status = PaymentStatus.partially_paid
            booking.status = BookingStatus.confirmed # Confirmed after advance
        else:
            booking.payment_status = PaymentStatus.fully_paid
            booking.status = BookingStatus.completed # Final payment completes booking
            
        await db.commit()
        return True
    except Exception as e:
        logger.error(f"Payment verification failed: {str(e)}")
        return False
