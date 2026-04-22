from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from core.config import settings
import google.generativeai as genai
from google.generativeai.types import content_types
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

# Strict System Instruction to prevent hallucination
SYSTEM_INSTRUCTION = """
You are an expert AI assistant for Agro-Tech, a premium agricultural equipment and labour marketplace.
Your primary role is to assist users (farmers, equipment owners, labourers, providers, and admins) with using the platform, understanding its features, and answering agriculture-related queries within the context of the platform.

Agro-Tech Platform Details:
- Users can rent agricultural equipment (tractors, harvesters, etc.).
- Users can hire professional agricultural labour.
- The platform handles bookings, payments, and commissions.
- Roles include: User (Farmer), Provider (Equipment Owner), Labour (Agricultural Specialist), and Superadmin.

Rules for Answering:
1. Be helpful, concise, and professional. Use a modern, friendly tone.
2. ONLY answer questions related to agriculture, farming equipment, agricultural labour, and the Agro-Tech platform itself.
3. If a user asks a question completely unrelated to agriculture or the platform (e.g., coding, general history, entertainment, unrelated sports), you MUST politely decline to answer and steer the conversation back to Agro-Tech. Example: "I specialize in assisting with the Agro-Tech platform and agricultural topics. How can I help you with your farming needs today?"
4. Do not make up fake prices or fake users. Tell them to check the marketplace for current listings.
5. If you do not know the answer, say "I don't have that information right now, but you can explore the marketplace or contact support."
"""

def get_platform_stats():
    """Fetches the exact total count of users, equipment, labour services, and bookings currently registered in the database. Use this when a user asks for statistics, numbers, or counts."""
    pass

def get_genai_client():
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not configured.")
        raise HTTPException(status_code=500, detail="AI service is not configured on the server.")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    model = genai.GenerativeModel(
        model_name='gemini-flash-latest',
        tools=[get_platform_stats],
        system_instruction=SYSTEM_INSTRUCTION
    )
    return model

@router.post("/", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    try:
        model = get_genai_client()
        
        # Format history for Gemini
        formatted_history = []
        for msg in request.messages[:-1]: # All except the last one
            role = "user" if msg.role == "user" else "model"
            formatted_history.append({"role": role, "parts": [msg.content]})
        
        # Start chat session with history
        chat = model.start_chat(history=formatted_history)
        
        # Send the latest message
        latest_message = request.messages[-1].content
        response = chat.send_message(latest_message)
        
        # Check if the model decided to call a function
        if response.parts and hasattr(response.parts[0], 'function_call') and response.parts[0].function_call:
            fc = response.parts[0].function_call
            if fc.name == "get_platform_stats":
                async with AsyncSessionLocal() as session:
                    users_count = await session.scalar(select(func.count(User.id)))
                    equip_count = await session.scalar(select(func.count(Equipment.id)))
                    labour_count = await session.scalar(select(func.count(LabourService.id)))
                    booking_count = await session.scalar(select(func.count(Booking.id)))
                
                stats = {
                    "total_users": users_count or 0,
                    "total_equipment_listed": equip_count or 0,
                    "total_labour_services": labour_count or 0,
                    "total_bookings_made": booking_count or 0
                }
                
                # Send the live database results back to Gemini
                response = chat.send_message(
                    {"function_response": {
                        "name": "get_platform_stats",
                        "response": stats
                    }}
                )
        
        return ChatResponse(reply=response.text)
        
    except Exception as e:
        logger.error(f"Chatbot Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat request. Please try again later.")
