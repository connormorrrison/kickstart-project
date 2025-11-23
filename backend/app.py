from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
import datetime

# to host locally:
# pip install -r requirements.txt
# fastapi dev app.py 
# http://localhost:8000

class PostingIn(BaseModel):
    username: str
    password_hash: str
    address: str
    lat: float
    lng: float
    price: float
    date: datetime.date # "yyyy-mm-dd"
    start: List[int]
    end: List[int]

app = FastAPI()
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

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
async def login(username: str, password_hash: str):
    return {"message": f"username: {username}, password_hash: {password_hash}"}

@app.post("/register")
async def register(username: str, password_hash: str, email=None):
    result = (supabase.table("users")
        .insert({
            "username":username,
            "passwordHash":password_hash,
            "email":email
        })
        .execute()
    )
    return result

@app.get("/postings/all")
async def postingsAll():
    return (supabase.table("postings")
    .select("*")
    .is_("customer_id", "null")
    .execute()
    )

@app.post("/postings/create")
async def postingsCreate(posting: PostingIn):
    userId: int = await _getUserId(posting.username, posting.password_hash)
    if not userId:
        raise HTTPException(
            status_code=400,
            detail="user not found"
        )
    
    return (supabase.table("postings")
    .insert({
        "host_id":userId,
        "address": posting.address,
        "lat": posting.lat,
        "lng": posting.lng,
        "date": posting.date.isoformat(),
        "price": posting.price,
        "start": posting.start,
        "end": posting.end
    })
    .execute())

@app.post("/postings/book")
async def postingsBook(posting_id:int, customer_id:int):
  result = supabase.table("postings")\
  .update({"customer_id":customer_id})\
  .eq("id", posting_id)
  return result

@app.get("/user/get-info")
async def userInfo(username:str, password_hash:str):
    userId: int = await _getUserId(username, password_hash)
    if not userId:
        raise HTTPException(
            status_code=400,
            detail="user not found"
        )
    return (supabase.table("users")
            .select("*")
            .eq("id", userId)
            .maybe_single()
            .execute()
            )



@app.get("/user/get-id")
async def userId(username:str, password_hash: str):
    return {"id":await _getUserId(username, password_hash)}

async def _getUserId(username:str, passwordHash: str) -> int:
    response = (supabase.table("users")
    .select("id")
    .eq("username", username)
    .eq("password_hash", passwordHash)
    .maybe_single()
    .execute()
    )
    return response.data["id"] if response else response