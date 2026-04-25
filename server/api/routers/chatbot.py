from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from core.config import settings
import google.generativeai as genai
from google.protobuf.json_format import ParseDict
from google.protobuf.struct_pb2 import Struct
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

# Strict System Instruction to prevent hallucination and keep focus
SYSTEM_INSTRUCTION = """
You are the official Agro-Tech AI Assistant. Your sole purpose is to provide support for the Agro-Tech platform—a marketplace for agricultural equipment and professional labour.

CORE FOCUS AREAS:
1. Platform Help: Registration, booking equipment, hiring labour, payments, and account management.
2. Agricultural Knowledge: Farming techniques, equipment specs (tractors, tillers, etc.), and seasonal crop advice.
3. Platform Stats: Providing real-time statistics about users, equipment, and bookings via your tools.

REJECTION POLICY (CRITICAL):
- If the user asks about ANY topic outside of agriculture or the Agro-Tech platform (e.g., general news, politics, celebrities, movies, non-agricultural technology, unrelated science, gaming, or general history), you MUST NOT answer.
- REJECTION MESSAGE: "I apologize, but I am specifically designed to assist with Agro-Tech platform features and agricultural topics. I cannot provide information on other subjects. How can I help you with your farming or equipment needs today?"
- Never break character. Never attempt to answer "just this once".
- If the user is persistent with unrelated topics, continue to use the REJECTION MESSAGE.

TONE:
Professional, helpful, and premium. Use clean markdown formatting.
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
        model_name='gemini-1.5-flash', # Updated to a more standard model name
        tools=[get_platform_stats],
        system_instruction=SYSTEM_INSTRUCTION
    )
    return model

@router.post("/", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    try:
        model = get_genai_client()
        
        # Format history for Gemini (Crucial: History MUST start with 'user' role)
        formatted_history = []
        for msg in request.messages[:-1]: # All except the last one
            role = "user" if msg.role == "user" else "model"
            # Skip any leading 'model' messages as Gemini requires history to start with 'user'
            if not formatted_history and role == "model":
                continue
            formatted_history.append({"role": role, "parts": [msg.content]})
        
        # Start chat session with history
        chat = model.start_chat(history=formatted_history)
        
        # Send the latest message
        latest_message = request.messages[-1].content
        if not latest_message:
            raise HTTPException(status_code=400, detail="Message content cannot be empty")
            
        try:
            response = chat.send_message(latest_message)
        except Exception as e:
            # Catch errors during send_message (e.g. invalid API key, safety blocks)
            err_str = str(e)
            logger.error(f"Gemini send_message error: {err_str}")
            if "PermissionDenied" in err_str or "leaked" in err_str.lower() or "403" in err_str:
                raise HTTPException(status_code=500, detail="The AI service is currently unavailable due to an API key issue. Please contact support.")
            if "not found" in err_str.lower() or "404" in err_str:
                # Handle potential model name issues
                raise HTTPException(status_code=500, detail="The AI model is currently unavailable. Please try again later.")
            raise e
            
        # Check if the model decided to call a function (Robust iteration)
        # Using a safer way to access parts to avoid ValueError on blocked responses
        try:
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'function_call') and part.function_call:
                        fc = part.function_call
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
                            
                            # Convert stats dict to protobuf Struct (required by FunctionResponse)
                            stats_struct = ParseDict(stats, Struct())
                            
                            # Send the live database results back to Gemini
                            response = chat.send_message(
                                genai.protos.Content(
                                    role='function',
                                    parts=[
                                        genai.protos.Part(
                                            function_response=genai.protos.FunctionResponse(
                                                name="get_platform_stats",
                                                response=stats_struct
                                            )
                                        )
                                    ]
                                )
                            )
                            break # Assuming only one function call for now
        except (ValueError, AttributeError, IndexError) as e:
            logger.warning(f"Safety block or error during function call detection: {e}")
        
        # Safety check for response text (handles blocks or empty responses)
        try:
            reply_text = response.text
        except (ValueError, AttributeError) as e:
            logger.warning(f"Could not extract text from Gemini response: {e}")
            # Check for safety filter blocks
            if response.candidates and response.candidates[0].finish_reason:
                reason = response.candidates[0].finish_reason
                if reason == 3: # SAFETY
                    reply_text = "I'm sorry, I cannot answer that query as it violates my safety guidelines. Please ask something related to agriculture."
                elif reason == 4: # RECITATION
                    reply_text = "I'm sorry, I cannot provide this content as it may be protected by copyright. How else can I help?"
                else:
                    reply_text = "I processed your request but couldn't generate a text response due to policy constraints. Please try rephrasing."
            else:
                reply_text = "I processed your request but couldn't generate a text response. Please try rephrasing."

        return ChatResponse(reply=reply_text)
        
    except HTTPException:
        raise
    except Exception as e:
        # Log the full exception for debugging
        logger.exception(f"Chatbot Exception: {str(e)}")
        
        # Check for specific Permission Denied (Leaked Key)
        if "PermissionDenied" in str(e) or "leaked" in str(e).lower():
            raise HTTPException(status_code=500, detail="The AI service is currently unavailable due to an API key issue. Please contact support.")
            
        raise HTTPException(status_code=500, detail="Failed to process chat request. Please try again later.")
