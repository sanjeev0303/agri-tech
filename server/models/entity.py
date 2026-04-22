from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

class Role(str, enum.Enum):
    superadmin = "superadmin"
    provider = "provider"
    labour = "labour"
    user = "user"

class TransactionStage(str, enum.Enum):
    advance = "advance"
    final = "final"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    partially_paid = "partially_paid"
    fully_paid = "fully_paid"
    failed = "failed"

class KYCStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    rejected = "rejected"

class WithdrawalStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    rejected = "rejected"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.user, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Razorpay Marketplace Fields
    razorpay_account_id = Column(String, nullable=True)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.pending)
    payout_enabled = Column(Boolean, default=False)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    equipment = relationship("Equipment", back_populates="owner", cascade="all, delete-orphan")
    labour_services = relationship("LabourService", back_populates="provider", cascade="all, delete-orphan")
    bookings_made = relationship("Booking", back_populates="user", foreign_keys="Booking.user_id", cascade="all, delete-orphan")
    
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bank_details = relationship("BankDetail", back_populates="user", cascade="all, delete-orphan")
    withdrawal_requests = relationship("WithdrawalRequest", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profile")

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    hourly_rate = Column(Float, nullable=False)
    daily_rate = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
    
    owner = relationship("User", back_populates="equipment")
    bookings = relationship("Booking", back_populates="equipment", foreign_keys="Booking.equipment_id", cascade="all, delete-orphan")

class LabourService(Base):
    __tablename__ = "labour_services"
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("users.id"))
    skills = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    hourly_rate = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)
    
    provider = relationship("User", back_populates="labour_services")
    bookings = relationship("Booking", back_populates="labour", foreign_keys="Booking.labour_id", cascade="all, delete-orphan")

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    awaiting_final_payment = "awaiting_final_payment"
    completed = "completed"
    cancelled = "cancelled"

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    labour_id = Column(Integer, ForeignKey("labour_services.id"), nullable=True)
    
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    total_price = Column(Float, nullable=False)
    advance_amount = Column(Float, nullable=True)
    remaining_amount = Column(Float, nullable=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="bookings_made", foreign_keys=[user_id])
    equipment = relationship("Equipment", back_populates="bookings", foreign_keys=[equipment_id])
    labour = relationship("LabourService", back_populates="bookings", foreign_keys=[labour_id])
    transactions = relationship("Transaction", back_populates="booking", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Direct link for analytics
    payment_stage = Column(Enum(TransactionStage), nullable=False)
    total_amount = Column(Float, nullable=False)
    admin_commission = Column(Float, nullable=False)
    provider_amount = Column(Float, nullable=False)
    razorpay_payment_id = Column(String, nullable=True)
    razorpay_order_id = Column(String, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    status = Column(String, default="success") # success, failed
    is_released = Column(Boolean, default=False) # Released to provider wallet
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking = relationship("Booking", back_populates="transactions")
    provider = relationship("User")

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="wallet")

class BankDetail(Base):
    __tablename__ = "bank_details"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_holder_name = Column(String, nullable=False)
    account_number = Column(String, nullable=False)
    ifsc_code = Column(String, nullable=False)
    bank_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="bank_details")

class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    status = Column(Enum(WithdrawalStatus), default=WithdrawalStatus.pending)
    bank_detail_id = Column(Integer, ForeignKey("bank_details.id"), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="withdrawal_requests")
    bank_detail = relationship("BankDetail")
