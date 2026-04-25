from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from core.database import get_db
from core.security import verify_password, get_password_hash, create_access_token
from models.entity import User, Profile, Role
from schemas.user import UserCreate, UserOut, Token
from api.deps import get_current_user

router = APIRouter()

@router.post("/register/user", response_model=UserOut)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=Role.user
    )
    db.add(new_user)
    await db.flush()
    
    new_profile = Profile(
        user_id=new_user.id,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone
    )
    db.add(new_profile)
    await db.commit()
    
    # Reload user with profile to avoid lazy-loading error in response serialization
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == new_user.id)
    )
    return result.scalar_one()

@router.post("/register/provider", response_model=UserOut)
async def register_provider(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role
    )
    db.add(new_user)
    await db.flush()
    
    new_profile = Profile(
        user_id=new_user.id,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone
    )
    db.add(new_profile)
    await db.commit()
    
    # Reload user with profile to avoid lazy-loading error in response serialization
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == new_user.id)
    )
    return result.scalar_one()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).options(selectinload(User.profile)).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
