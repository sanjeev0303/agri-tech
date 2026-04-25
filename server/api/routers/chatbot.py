from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from core.config import settings
import google.generativeai as genai
import logging
from core.database import AsyncSessionLocal
from sqlalchemy.future import select
from sqlalchemy import func
from models.entity import User, Equipment, Booking, LabourService

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


SYSTEM_INSTRUCTION = """
You are the official Agro-Tech AI Assistant. Your sole purpose is to provide support for the Agro-Tech platform—a marketplace for agricultural equipment and professional labour.

CORE FOCUS AREAS:
1. Platform Help: Registration, booking equipment, hiring labour, payments, and account management.
2. Agricultural Knowledge: Farming techniques, equipment specs (tractors, tillers, etc.), and seasonal crop advice.
3. Platform Stats: If the user asks about statistics, numbers, or counts and stats data is provided below, use it directly.

REJECTION POLICY (CRITICAL):
- If the user asks about ANY topic outside of agriculture or the Agro-Tech platform (e.g., general news, politics, celebrities, movies, non-agricultural technology, unrelated science, gaming, or general history), you MUST NOT answer.
- REJECTION MESSAGE: "I apologize, but I am specifically designed to assist with Agro-Tech platform features and agricultural topics. I cannot provide information on other subjects. How can I help you with your farming or equipment needs today?"
- Never break character. Never attempt to answer "just this once".

TONE:
Professional, helpful, and premium. Use clean markdown formatting.
"""

STATS_KEYWORDS = [
    "stat", "statistic", "count", "total", "how many", "number of",
    "users", "equipment", "booking", "labour", "services", "registered"
]


def _is_stats_query(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in STATS_KEYWORDS)


async def _fetch_stats() -> dict:
    async with AsyncSessionLocal() as session:
        users_count = await session.scalar(select(func.count(User.id)))
        equip_count = await session.scalar(select(func.count(Equipment.id)))
        labour_count = await session.scalar(select(func.count(LabourService.id)))
        booking_count = await session.scalar(select(func.count(Booking.id)))
    return {
        "total_users": users_count or 0,
        "total_equipment_listed": equip_count or 0,
        "total_labour_services": labour_count or 0,
        "total_bookings_made": booking_count or 0,
    }


def _configure_model(system_instruction: str) -> genai.GenerativeModel:
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not configured.")
        raise HTTPException(
            status_code=500,
            detail="AI service is not configured on the server."
        )
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_instruction,
    )


def _extract_text(response) -> str:
    """Safely extract text from a Gemini response."""
    try:
        return response.text
    except (ValueError, AttributeError):
        pass

    try:
        candidates = response.candidates
        if candidates and candidates[0].content.parts:
            texts = [
                p.text for p in candidates[0].content.parts
                if hasattr(p, "text") and p.text
            ]
            if texts:
                return " ".join(texts)

        if candidates and candidates[0].finish_reason:
            reason = candidates[0].finish_reason
            if reason == 3:  # SAFETY
                return (
                    "I'm sorry, I cannot answer that query as it violates my "
                    "safety guidelines. Please ask something related to agriculture."
                )
            if reason == 4:  # RECITATION
                return (
                    "I'm sorry, I cannot provide this content as it may be "
                    "protected by copyright. How else can I help?"
                )
    except Exception:
        pass

    return (
        "I processed your request but couldn't generate a text response. "
        "Please try rephrasing."
    )


@router.post("/", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    latest_message = request.messages[-1].content.strip()
    if not latest_message:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    try:
        # Optionally inject live stats into system prompt
        system_instruction = SYSTEM_INSTRUCTION
        if _is_stats_query(latest_message):
            try:
                stats = await _fetch_stats()
                stats_context = (
                    f"\n\nLIVE PLATFORM STATS (use these exact numbers):\n"
                    f"- Total registered users: {stats['total_users']}\n"
                    f"- Total equipment listed: {stats['total_equipment_listed']}\n"
                    f"- Total labour services: {stats['total_labour_services']}\n"
                    f"- Total bookings made: {stats['total_bookings_made']}\n"
                )
                system_instruction = SYSTEM_INSTRUCTION + stats_context
            except Exception as db_err:
                logger.warning(f"Could not fetch stats from DB: {db_err}")

        model = _configure_model(system_instruction)

        # Build history (must start with 'user', all roles must be 'user' or 'model')
        formatted_history = []
        for msg in request.messages[:-1]:
            role = "user" if msg.role == "user" else "model"
            if not formatted_history and role == "model":
                continue
            formatted_history.append({"role": role, "parts": [msg.content]})

        chat = model.start_chat(history=formatted_history)
        response = chat.send_message(latest_message)

        reply_text = _extract_text(response)
        return ChatResponse(reply=reply_text)

    except HTTPException:
        raise
    except Exception as e:
        err_str = str(e)
        logger.exception(f"Chatbot Exception: {err_str}")

        if "PermissionDenied" in err_str or "403" in err_str or "leaked" in err_str.lower():
            raise HTTPException(
                status_code=500,
                detail="AI service unavailable due to an API key issue. Please contact support."
            )
        if "not found" in err_str.lower() or "404" in err_str:
            raise HTTPException(
                status_code=500,
                detail="AI model unavailable. Please try again later."
            )

        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request. Please try again later."
        )
