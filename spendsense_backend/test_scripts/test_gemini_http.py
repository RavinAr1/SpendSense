import os
import requests
import json
from dotenv import load_dotenv

load_dotenv("gemini.env")
api_key = os.getenv("GEMINI_API_KEY")

# ✅ Correct model for MakerSuite
url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key={api_key}"

headers = {
    "Content-Type": "application/json"
}

message = "375.00 debited from AC XXXXXXXX on 22 Mar 2025 11:35 at KEELLS SUPER."

prompt = f"""
Extract the following fields from this banking SMS:
Message: "{message}"

Return JSON with:
- amount
- type
- vendor
- date (format: YYYY-MM-DD HH:MM)
- category (Groceries, Entertainment, etc.)
"""

payload = {
    "contents": [
        {"parts": [{"text": prompt}]}
    ]
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

try:
    output = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    print(output)
except Exception as e:
    print("Error:", response.text)
