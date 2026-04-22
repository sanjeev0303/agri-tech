from pydantic import BaseModel, EmailStr
from typing import Optional
from models.entity import Role

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Role = Role.user
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class ProfileOut(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    role: Role
    is_active: bool
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
