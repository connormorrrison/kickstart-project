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

# @app.post("/postings/book")
# async def postingsBook(posting_id:int, customer_id:int):
#   result = supabase.table("postings")\
#   .select
#   result = None
#   return result

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

class Spot(BaseModel):
    id: str
    title: str
    description: str
    address: str
    lat: float
    lng: float
    pricePerHour: float
    hostId: str
    availableStart: str
    availableEnd: str
    availableDateStart: str
    availableDateEnd: str
    images: List[str]

@app.get("/spots")
async def get_spots():
    response = supabase.table("postings").select("*").execute()
    spots = []
    for p in response.data:
        # Map DB fields to frontend Spot model
        # Handle missing fields with defaults
        start_hour = p.get("start", 0)
        end_hour = p.get("end", 23)
        
        spot = Spot(
            id=str(p["id"]),
            title=f"Parking at {p['address']}", # Default title
            description="Available for booking.", # Default description
            address=p["address"],
            lat=p["lat"],
            lng=p["lng"],
            pricePerHour=p["price"],
            hostId=str(p["host_id"]),
            availableStart=f"{start_hour:02d}:00",
            availableEnd=f"{end_hour:02d}:00",
            availableDateStart=p["date"],
            availableDateEnd=p["date"], # DB only has single date
            images=["https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"] # Default image
        )
        spots.append(spot)
    return spots

@app.post("/spots")
async def create_spot(spot: Spot):
    # Map frontend Spot model to DB fields
    # Parse times to integers (hours)
    try:
        start = int(spot.availableStart.split(':')[0])
    except:
        start = 0
        
    try:
        end = int(spot.availableEnd.split(':')[0])
    except:
        end = 23
        
    # Handle host_id
    try:
        host_id = int(spot.hostId)
    except:
        host_id = 1 # Fallback to existing user 1 if invalid
        
    data = {
        "host_id": host_id,
        "address": spot.address,
        "lat": spot.lat,
        "lng": spot.lng,
        "date": spot.availableDateStart, # Use start date
        "price": spot.pricePerHour,
        "start": start,
        "end": end
    }
    
    result = supabase.table("postings").insert(data).execute()
    return result