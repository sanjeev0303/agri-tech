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
from sqlalchemy import text
import time
import platform
import os

_start_time = time.time()

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
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    allowed = settings.cors_origins_list
    allow_origin = origin if origin in allowed else allowed[0]
    
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

@app.get("/health", tags=["health"])
async def health_check():
    """Detailed server health check endpoint."""
    uptime_seconds = time.time() - _start_time
    days, remainder = divmod(int(uptime_seconds), 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)

    # Database connectivity
    db_status = "healthy"
    db_latency_ms = None
    try:
        db_start = time.time()
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - db_start) * 1000, 2)
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # Service integration status (non-intrusive checks)
    services = {
        "razorpay": "configured" if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_ID != "rzp_test_your_key_id" else "not_configured",
        "gemini_ai": "configured" if settings.GEMINI_API_KEY else "not_configured",
        "cloudinary": "configured" if settings.CLOUDINARY_CLOUD_NAME else "not_configured",
    }

    # Memory info (cross-platform via /proc on Linux, fallback otherwise)
    memory_mb = None
    try:
        import resource
        usage = resource.getrusage(resource.RUSAGE_SELF)
        memory_mb = round(usage.ru_maxrss / 1024, 2)  # Linux: KB -> MB
    except Exception:
        pass

    overall_status = "healthy" if db_status == "healthy" else "degraded"

    return {
        "status": overall_status,
        "project": settings.PROJECT_NAME,
        "uptime": f"{days}d {hours}h {minutes}m {seconds}s",
        "uptime_seconds": round(uptime_seconds, 2),
        "server": {
            "python_version": platform.python_version(),
            "os": f"{platform.system()} {platform.release()}",
            "architecture": platform.machine(),
            "pid": os.getpid(),
            "memory_mb": memory_mb,
        },
        "database": {
            "status": db_status,
            "latency_ms": db_latency_ms,
        },
        "services": services,
        "api_version": settings.API_V1_STR,
        "cors_origins": settings.cors_origins_list,
    }

