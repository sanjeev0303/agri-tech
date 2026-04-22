import asyncio
from faker import Faker
import random
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.entity import User, Profile, Role, Equipment, LabourService, Booking, Transaction, Wallet, BankDetail, WithdrawalRequest
from core.security import get_password_hash

faker = Faker()

DATABASE_URL = "postgresql://neondb_owner:npg_gTsOWRGY93Ij@ep-orange-base-a1klwas0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Premium Verified Images (Pexels)
EQUIPMENT_ASSETS = {
    "Tractor": "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg",
    "Harvester": "https://images.pexels.com/photos/14878021/pexels-photo-14878021.jpeg",
    "Plow": "https://images.pexels.com/photos/11267252/pexels-photo-11267252.jpeg",
    "Seeder": "https://images.pexels.com/photos/11267237/pexels-photo-11267237.jpeg",
    "Sprayer": "https://images.pexels.com/photos/2132177/pexels-photo-2132177.jpeg",
    "Baler": "https://images.pexels.com/photos/2627063/pexels-photo-2627063.jpeg"
}

LABOUR_ASSETS = [
    "https://images.pexels.com/photos/8413125/pexels-photo-8413125.jpeg", # Agronomist
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg", # Strategy
    "https://images.pexels.com/photos/2581600/pexels-photo-2581600.jpeg", # Operator
    "https://images.pexels.com/photos/14138670/pexels-photo-14138670.jpeg"  # Tech/Drone
]

equipment_types = ["Tractor", "Harvester", "Plow", "Seeder", "Sprayer", "Baler"]

def seed():
    with SessionLocal() as session:
        print("Clearing stale data (Transactions, Bookings, Services, Equipment, Profiles, Users)...")
        session.query(WithdrawalRequest).delete()
        session.query(BankDetail).delete()
        session.query(Transaction).delete()
        session.query(Booking).delete()
        session.query(LabourService).delete()
        session.query(Equipment).delete()
        session.query(Wallet).delete()
        session.query(Profile).delete()
        session.query(User).delete()
        session.commit()
        
        print("Seeding Super Admin...")
        admin = User(
            email="admin@agritech.com",
            hashed_password=get_password_hash("password123"),
            role=Role.superadmin,
            is_active=True
        )
        session.add(admin)
        session.flush()
        
        print("Seeding 10 Users (Farmers)...")
        users = []
        for i in range(10):
            email = "user@agritech.com" if i == 0 else faker.unique.email()
            user = User(
                email=email,
                hashed_password=get_password_hash("password123"),
                role=Role.user,
                is_active=True
            )
            session.add(user)
            session.flush()
            
            profile = Profile(
                user_id=user.id,
                first_name=faker.first_name(),
                last_name=faker.last_name(),
                phone=faker.phone_number()
            )
            session.add(profile)
            users.append(user)
            
        print("Seeding 10 Providers (Service Providers)...")
        providers = []
        for i in range(10):
            email = "provider@agritech.com" if i == 0 else faker.unique.email()
            provider_user = User(
                email=email,
                hashed_password=get_password_hash("password123"),
                role=Role.provider,
                is_active=True
            )
            session.add(provider_user)
            session.flush()
            
            # Initialize Wallet
            wallet = Wallet(user_id=provider_user.id, balance=0.0, total_earned=0.0)
            session.add(wallet)
            
            profile = Profile(
                user_id=provider_user.id,
                first_name=faker.first_name(),
                last_name=faker.last_name(),
                phone=faker.phone_number()
            )
            session.add(profile)
            providers.append(provider_user)

        print("Seeding 30 Dummy Equipments...")
        for _ in range(30):
            owner = random.choice(providers)
            eq_type = random.choice(equipment_types)
            eq = Equipment(
                owner_id=owner.id,
                name=f"{faker.company()} {eq_type}",
                type=eq_type,
                image_url=EQUIPMENT_ASSETS.get(eq_type, EQUIPMENT_ASSETS["Tractor"]),
                hourly_rate=round(random.uniform(15.0, 100.0), 2),
                daily_rate=round(random.uniform(100.0, 800.0), 2),
                is_available=True
            )
            session.add(eq)
            
        print("Seeding 20 Dummy Labours...")
        for _ in range(20):
            provider = random.choice(providers)
            lab = LabourService(
                provider_id=provider.id,
                skills=f"{faker.job()}, Harvesting, Planting",
                image_url=random.choice(LABOUR_ASSETS),
                hourly_rate=round(random.uniform(10.0, 40.0), 2),
                is_available=True
            )
            session.add(lab)

        session.commit()
        print("Successfully Seeded Data into Neon DB!")

if __name__ == "__main__":
    seed()
