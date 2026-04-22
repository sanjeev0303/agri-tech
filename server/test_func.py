import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def get_platform_stats():
    pass

model = genai.GenerativeModel('gemini-flash-latest', tools=[get_platform_stats])
chat = model.start_chat()
response = chat.send_message("What are the stats?")
print(response.parts)
fc = response.parts[0].function_call
print(f"Called {fc.name}")

# Now send response back
try:
    res = chat.send_message(
        {"function_response": {"name": "get_platform_stats", "response": {"users": 10}}}
    )
    print("Dict format success")
except Exception as e:
    print(f"Dict failed: {e}")
    try:
        from google.generativeai.protos import Part, FunctionResponse
        res = chat.send_message(Part(function_response=FunctionResponse(name="get_platform_stats", response={"users": 10})))
        print("Proto format success")
    except Exception as e2:
        print(f"Proto failed: {e2}")
