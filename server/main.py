from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routers import auth, admin, provider, user, public, analytics, marketplace, payments, commissions, payouts, chatbot
from core.database import AsyncSessionLocal, engine
from models.entity import User, Role
from models.base import Base
from core.security import get_password_hash
from sqlalchemy.future import select

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "agro81021@test.com"))
        admin_user = result.scalar_one_or_none()
        if not admin_user:
            new_admin = User(
                email="agro81021@test.com",
                hashed_password=get_password_hash("agro@81021"),
                role=Role.superadmin,
                is_active=True
            )
            session.add(new_admin)
            await session.commit()
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    allow_origin = origin if origin in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"] else "http://localhost:5173"
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "msg": str(exc)},
        headers={
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Credentials": "true",
        }
    )

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(provider.router, prefix=f"{settings.API_V1_STR}/provider", tags=["provider"])
app.include_router(user.router, prefix=f"{settings.API_V1_STR}/user", tags=["user"])
app.include_router(public.router, prefix=f"{settings.API_V1_STR}/public", tags=["public"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(marketplace.router, prefix=f"{settings.API_V1_STR}/marketplace", tags=["marketplace"])
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
app.include_router(commissions.router, prefix=f"{settings.API_V1_STR}/commissions", tags=["commissions"])
app.include_router(payouts.router, prefix=f"{settings.API_V1_STR}/payouts", tags=["payouts"])
app.include_router(chatbot.router, prefix=f"{settings.API_V1_STR}/chatbot", tags=["chatbot"])

@app.get("/")
def root():
    return {"message": "Welcome to Agro-Tech API"}
