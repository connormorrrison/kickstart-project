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
# AUTHENTICATION & PASSWORD UTILITIES
# ===================================================================
import bcrypt
import jwt
from datetime import timedelta

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"  # TODO: Move to env variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Get user from database
    try:
        response = supabase.table("users_v2").select("*").eq("id", user_id).execute()
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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

# ===================================================================
# AUTHENTICATION ENDPOINTS
# ===================================================================

@app.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing = supabase.table("users_v2").select("id").eq("email", user_data.email).execute()
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password
        hashed_password = hash_password(user_data.password)

        # Create user
        new_user = {
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "email": user_data.email,
            "password_hash": hashed_password,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }

        response = supabase.table("users_v2").insert(new_user).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create user")

        created_user = response.data[0]
        return UserOut(
            id=created_user["id"],
            first_name=created_user["first_name"],
            last_name=created_user["last_name"],
            email=created_user["email"],
            created_at=created_user["created_at"],
            is_active=created_user["is_active"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@app.post("/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    """Login and get access token"""
    try:
        # Get user by email
        response = supabase.table("users_v2").select("*").eq("email", credentials.email).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = response.data[0]

        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Check if user is active
        if not user["is_active"]:
            raise HTTPException(status_code=403, detail="Account is deactivated")

        # Create access token
        access_token = create_access_token({"user_id": user["id"]})

        return TokenResponse(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user"""
    return UserOut(
        id=current_user["id"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        email=current_user["email"],
        created_at=current_user["created_at"],
        is_active=current_user["is_active"]
    )

# ===================================================================
# PARKING SPOTS ENDPOINTS
# ===================================================================

@app.post("/spots", response_model=ParkingSpotOut, status_code=status.HTTP_201_CREATED)
def create_parking_spot(
    spot_data: ParkingSpotCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new parking spot (requires authentication)"""
    try:
        # Generate UUID for the spot
        spot_id = str(uuid.uuid4())

        # Create parking spot
        new_spot = {
            "id": spot_id,
            "host_id": current_user["id"],
            "street": spot_data.street,
            "city": spot_data.city,
            "province": spot_data.province,
            "postal_code": spot_data.postal_code,
            "country": spot_data.country,
            "lat": spot_data.lat,
            "lng": spot_data.lng,
            "price_per_hour": spot_data.price_per_hour,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }

        response = supabase.table("parking_spots_v2").insert(new_spot).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create parking spot")

        created_spot = response.data[0]

        # Insert availability intervals
        if spot_data.availability_intervals:
            intervals_to_insert = []
            for interval in spot_data.availability_intervals:
                intervals_to_insert.append({
                    "spot_id": spot_id,
                    "day": interval.day,
                    "start_time": interval.start_time,
                    "end_time": interval.end_time
                })

            if intervals_to_insert:
                supabase.table("availability_intervals_v2").insert(intervals_to_insert).execute()

        return ParkingSpotOut(
            id=created_spot["id"],
            host_id=created_spot["host_id"],
            street=created_spot["street"],
            city=created_spot["city"],
            province=created_spot["province"],
            postal_code=created_spot["postal_code"],
            country=created_spot["country"],
            lat=created_spot["lat"],
            lng=created_spot["lng"],
            price_per_hour=created_spot["price_per_hour"],
            created_at=created_spot["created_at"],
            is_active=created_spot["is_active"],
            availability_intervals=[
                AvailabilityInterval(
                    day=i.day,
                    start_time=i.start_time,
                    end_time=i.end_time
                ) for i in spot_data.availability_intervals
            ] if spot_data.availability_intervals else []
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create parking spot: {str(e)}")

@app.get("/spots", response_model=List[ParkingSpotOut])
def list_parking_spots(
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_active: Optional[bool] = True
):
    """List all parking spots with optional filters"""
    try:
        query = supabase.table("parking_spots_v2").select("*")

        if is_active is not None:
            query = query.eq("is_active", is_active)

        if city:
            query = query.ilike("city", f"%{city}%")

        if min_price is not None:
            query = query.gte("price_per_hour", min_price)

        if max_price is not None:
            query = query.lte("price_per_hour", max_price)

        response = query.execute()

        if not response.data:
            return []

        # Get availability intervals for each spot
        result = []
        for spot in response.data:
            intervals_response = supabase.table("availability_intervals_v2")\
                .select("*")\
                .eq("spot_id", spot["id"])\
                .execute()

            availability_intervals = []
            if intervals_response.data:
                availability_intervals = [
                    AvailabilityInterval(
                        day=interval["day"],
                        start_time=interval["start_time"],
                        end_time=interval["end_time"]
                    ) for interval in intervals_response.data
                ]

            result.append(ParkingSpotOut(
                id=spot["id"],
                host_id=spot["host_id"],
                street=spot["street"],
                city=spot["city"],
                province=spot["province"],
                postal_code=spot["postal_code"],
                country=spot["country"],
                lat=spot["lat"],
                lng=spot["lng"],
                price_per_hour=spot["price_per_hour"],
                created_at=spot["created_at"],
                is_active=spot["is_active"],
                availability_intervals=availability_intervals
            ))

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list parking spots: {str(e)}")

@app.get("/spots/{spot_id}", response_model=ParkingSpotOut)
def get_parking_spot(spot_id: str):
    """Get a specific parking spot by ID"""
    try:
        response = supabase.table("parking_spots_v2").select("*").eq("id", spot_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Parking spot not found")

        spot = response.data[0]

        # Get availability intervals
        intervals_response = supabase.table("availability_intervals_v2")\
            .select("*")\
            .eq("spot_id", spot_id)\
            .execute()

        availability_intervals = []
        if intervals_response.data:
            availability_intervals = [
                AvailabilityInterval(
                    day=interval["day"],
                    start_time=interval["start_time"],
                    end_time=interval["end_time"]
                ) for interval in intervals_response.data
            ]

        return ParkingSpotOut(
            id=spot["id"],
            host_id=spot["host_id"],
            street=spot["street"],
            city=spot["city"],
            province=spot["province"],
            postal_code=spot["postal_code"],
            country=spot["country"],
            lat=spot["lat"],
            lng=spot["lng"],
            price_per_hour=spot["price_per_hour"],
            created_at=spot["created_at"],
            is_active=spot["is_active"],
            availability_intervals=availability_intervals
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get parking spot: {str(e)}")

# ===================================================================
# BOOKINGS ENDPOINTS
# ===================================================================

@app.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new booking (requires authentication)"""
    try:
        # Verify the parking spot exists
        spot_response = supabase.table("parking_spots_v2").select("*").eq("id", booking_data.spot_id).execute()
        if not spot_response.data or len(spot_response.data) == 0:
            raise HTTPException(status_code=404, detail="Parking spot not found")

        spot = spot_response.data[0]

        # Check if spot is active
        if not spot["is_active"]:
            raise HTTPException(status_code=400, detail="Parking spot is not available")

        # Parse times to calculate duration and total price
        from datetime import datetime as dt
        try:
            start_dt = dt.strptime(booking_data.start_time, "%H:%M")
            end_dt = dt.strptime(booking_data.end_time, "%H:%M")
            duration_hours = (end_dt - start_dt).total_seconds() / 3600

            if duration_hours <= 0:
                raise HTTPException(status_code=400, detail="End time must be after start time")

            total_price = duration_hours * spot["price_per_hour"]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM")

        # Check for conflicting bookings
        existing_bookings = supabase.table("bookings_v2")\
            .select("*")\
            .eq("spot_id", booking_data.spot_id)\
            .eq("booking_date", booking_data.booking_date)\
            .in_("status", ["confirmed", "pending"])\
            .execute()

        if existing_bookings.data:
            for existing in existing_bookings.data:
                existing_start = dt.strptime(existing["start_time"], "%H:%M")
                existing_end = dt.strptime(existing["end_time"], "%H:%M")

                # Check for time overlap
                if not (end_dt <= existing_start or start_dt >= existing_end):
                    raise HTTPException(
                        status_code=400,
                        detail="This time slot is already booked"
                    )

        # Generate UUID for the booking
        booking_id = str(uuid.uuid4())

        # Create booking
        new_booking = {
            "id": booking_id,
            "spot_id": booking_data.spot_id,
            "user_id": current_user["id"],
            "booking_date": booking_data.booking_date,
            "start_time": booking_data.start_time,
            "end_time": booking_data.end_time,
            "total_price": total_price,
            "status": "confirmed",
            "created_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("bookings_v2").insert(new_booking).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create booking")

        created_booking = response.data[0]

        return BookingOut(
            id=created_booking["id"],
            spot_id=created_booking["spot_id"],
            user_id=created_booking["user_id"],
            booking_date=created_booking["booking_date"],
            start_time=created_booking["start_time"],
            end_time=created_booking["end_time"],
            total_price=created_booking["total_price"],
            status=created_booking["status"],
            created_at=created_booking["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")

@app.get("/bookings", response_model=List[BookingOut])
def list_user_bookings(
    current_user: dict = Depends(get_current_user),
    status_filter: Optional[str] = None
):
    """List all bookings for the current authenticated user"""
    try:
        query = supabase.table("bookings_v2").select("*").eq("user_id", current_user["id"])

        if status_filter:
            query = query.eq("status", status_filter)

        # Order by booking date and start time (most recent first)
        query = query.order("booking_date", desc=True).order("start_time", desc=True)

        response = query.execute()

        if not response.data:
            return []

        return [
            BookingOut(
                id=booking["id"],
                spot_id=booking["spot_id"],
                user_id=booking["user_id"],
                booking_date=booking["booking_date"],
                start_time=booking["start_time"],
                end_time=booking["end_time"],
                total_price=booking["total_price"],
                status=booking["status"],
                created_at=booking["created_at"]
            ) for booking in response.data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list bookings: {str(e)}")

@app.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific booking by ID (must be owned by current user)"""
    try:
        response = supabase.table("bookings_v2").select("*").eq("id", booking_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Booking not found")

        booking = response.data[0]

        # Verify the booking belongs to the current user
        if booking["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="You don't have permission to access this booking")

        return BookingOut(
            id=booking["id"],
            spot_id=booking["spot_id"],
            user_id=booking["user_id"],
            booking_date=booking["booking_date"],
            start_time=booking["start_time"],
            end_time=booking["end_time"],
            total_price=booking["total_price"],
            status=booking["status"],
            created_at=booking["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get booking: {str(e)}")

@app.delete("/bookings/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a booking (must be owned by current user)"""
    try:
        # Get the booking first
        response = supabase.table("bookings_v2").select("*").eq("id", booking_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Booking not found")

        booking = response.data[0]

        # Verify the booking belongs to the current user
        if booking["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="You don't have permission to cancel this booking")

        # Check if booking is already cancelled
        if booking["status"] == "cancelled":
            raise HTTPException(status_code=400, detail="Booking is already cancelled")

        # Update booking status to cancelled
        update_response = supabase.table("bookings_v2")\
            .update({"status": "cancelled"})\
            .eq("id", booking_id)\
            .execute()

        if not update_response.data or len(update_response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to cancel booking")

        return {
            "success": True,
            "message": "Booking cancelled successfully",
            "booking_id": booking_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel booking: {str(e)}")

