# ===================================================================
# OLD API ENDPOINTS (COMMENTED OUT - FOR REFERENCE ONLY)
# ===================================================================
# from processor import IntervalCalendar, Option, Renter
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List
# from db import supabase
#
# app = FastAPI()
#
# @app.get("/")
# def root():
#     return {"message": "backend is running"}
#
# @app.get("/options")
# def get_options():
#     res = supabase.table("options").select("*").execute()
#     return res.data
#
# class Interval(BaseModel):
#     start: int
#     end: int
#
# class OptionCreate(BaseModel):
#     renter_name: str
#     renter_phone: str
#     location: str
#     price: float
#     intervals: List[Interval]
#
# class OptionOut(BaseModel):
#     id: int
#     renter_name: str
#     renter_phone: str
#     location: str
#     price: float
#
# class SearchRequest(BaseModel):
#     start: int
#     end: int
#
# class SearchResult(BaseModel):
#     option_id: int
#     renter_name: str
#     renter_phone: str
#     location: str
#     price: float
#     reserved_start: int
#     reserved_end: int
#
# class ReserveRequest(BaseModel):
#     option_id: int
#     start: int
#     end: int
#
# class ReserveResult(BaseModel):
#     success: bool
#     message: str
#
# options: List[Option] = []
# next_option_id = 1
#
# @app.post("/options", response_model=OptionOut)
# def create_option(opt: OptionCreate):
#     global next_option_id
#     o = Option()
#     o.id = next_option_id
#     o.renter = Renter(opt.renter_name, opt.renter_phone)
#     o.location = opt.location
#     o.price = opt.price
#     for itv in opt.intervals:
#         o.cal.addAvailable(itv.start, itv.end)
#     options.append(o)
#     next_option_id += 1
#     return OptionOut(
#         id=o.id,
#         renter_name=o.renter.name,
#         renter_phone=o.renter.phone,
#         location=o.location,
#         price=o.price,
#     )
#
# @app.get("/options", response_model=List[OptionOut])
# def list_options():
#     return [
#         OptionOut(
#             id=o.id,
#             renter_name=o.renter.name,
#             renter_phone=o.renter.phone,
#             location=o.location,
#             price=o.price,
#         )
#         for o in options
#     ]
#
# @app.post("/search", response_model=List[SearchResult])
# def search(req: SearchRequest):
#     results: List[SearchResult] = []
#     for o in options:
#         if o.cal.isAvailable(req.start, req.end):
#             results.append(
#                 SearchResult(
#                     option_id=o.id,
#                     renter_name=o.renter.name,
#                     renter_phone=o.renter.phone,
#                     location=o.location,
#                     price=o.price,
#                     reserved_start=req.start,
#                     reserved_end=req.end,
#                 )
#             )
#     return results
#
# @app.post("/reserve", response_model=ReserveResult)
# def reserve(req: ReserveRequest):
#     target = None
#     for o in options:
#         if o.id == req.option_id:
#             target = o
#             break
#     if target is None:
#         raise HTTPException(status_code=404, detail="Option not found")
#     ok = target.cal.reserve(req.start, req.end)
#     if not ok:
#         return ReserveResult(success=False, message="Not available for this interval")
#     return ReserveResult(success=True, message="Reserved successfully")
# ===================================================================


# ===================================================================
# NEW V2 API - CLEAN START
# ===================================================================
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from db import supabase
import uuid

app = FastAPI(title="Parking Spot API v2", version="2.0")

# Security
security = HTTPBearer()

@app.get("/")
def root():
    return {
        "message": "Parking Spot API v2 is running",
        "version": "2.0",
        "status": "active"
    }

# ===================================================================
# MODELS (Pydantic Schemas)
# ===================================================================

# User Models
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    created_at: str
    is_active: bool

# Parking Spot Models
class AvailabilityInterval(BaseModel):
    day: str
    start_time: str
    end_time: str

class ParkingSpotCreate(BaseModel):
    street: str
    city: str
    province: str
    postal_code: str
    country: str
    lat: float
    lng: float
    price_per_hour: float
    availability_intervals: List[AvailabilityInterval]

class ParkingSpotOut(BaseModel):
    id: str
    host_id: int
    street: str
    city: str
    province: str
    postal_code: str
    country: str
    lat: float
    lng: float
    price_per_hour: float
    created_at: str
    is_active: bool
    availability_intervals: Optional[List[AvailabilityInterval]] = []

# Booking Models
class BookingCreate(BaseModel):
    spot_id: str
    booking_date: str  # YYYY-MM-DD
    start_time: str    # HH:MM
    end_time: str      # HH:MM

class BookingOut(BaseModel):
    id: str
    spot_id: str
    user_id: int
    booking_date: str
    start_time: str
    end_time: str
    total_price: float
    status: str
    created_at: str

# ===================================================================
# HEALTH CHECK ENDPOINT
# ===================================================================
@app.get("/health")
def health_check():
    """Check if API and database are healthy"""
    try:
        # Test database connection
        supabase.table("users_v2").select("id").limit(1).execute()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

