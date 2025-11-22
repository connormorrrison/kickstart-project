from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import typing

# to host locally:
# pip install -r requirements.txt
# fastapi dev app.py 
# http://localhost:8000

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend URL for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======== api ======
@app.get("/ping")
async def ping():
    return {"message": "pong"}

@app.post("/login")
async def login(username: str, passwordHash: str):
    return {"message": f"name: {username}, pwd: {passwordHash}"}

