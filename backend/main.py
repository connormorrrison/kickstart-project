from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime

from db import (
    fetch_postings,
    fetch_available_postings,
    search_postings,
    split_and_reserve,
    create_user,
    get_user_id,
    get_user_by_credentials,
    get_user_by_id,
    create_posting,
)
from processor import Option, IntervalCalendar

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "backend is running..."}


# ---------- models ----------

class LoginIn(BaseModel):
    username: str
    password_hash: str


class RegisterIn(BaseModel):
    username: str
    password_hash: str
    email: Optional[str] = None


class PostingIn(BaseModel):
    username: str
    password_hash: str
    address: str
    lat: float
    lng: float
    price: float
    date: datetime.date
    start: int
    end: int


class OptionOut(BaseModel):
    id: int
    host_id: int
    address: str
    price: float
    lat: float
    lng: float
    date: str


class SearchRequest(BaseModel):
    start: int
    end: int


class SearchResult(BaseModel):
    option_id: int
    host_id: int
    address: str
    date: str
    start: int
    end: int
    price: float
    lat: float
    lng: float


class ReserveRequest(BaseModel):
    option_id: int
    start: int
    end: int
    customer_id: int


class ReserveResult(BaseModel):
    success: bool
    message: str


# ---------- user endpoints ----------

@app.post("/login")
def login(body: LoginIn):
    user = get_user_by_credentials(body.username, body.password_hash)
    if not user:
        raise HTTPException(status_code=400, detail="user not found or wrong password")
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user.get("email"),
    }


@app.post("/register")
def register(body: RegisterIn):
    user = create_user(body.username, body.password_hash, body.email)
    if not user:
        raise HTTPException(status_code=400, detail="failed to create user")
    return user


@app.get("/user/get-info")
def user_info(username: str, password_hash: str):
    user_id = get_user_id(username, password_hash)
    if not user_id:
        raise HTTPException(status_code=400, detail="user not found")
    user = get_user_by_id(user_id)
    return user


@app.get("/user/get-id")
def user_id(username: str, password_hash: str):
    uid = get_user_id(username, password_hash)
    if not uid:
        raise HTTPException(status_code=400, detail="user not found")
    return {"id": uid}


# ---------- posting (host) endpoints ----------

@app.get("/postings/all")
def postings_all():
    return {"data": fetch_postings()}


@app.get("/postings")
def postings(date: datetime.date, start_time: int, end_time: int):
    data = search_postings(date.isoformat(), start_time, end_time)
    return {"data": data}


@app.post("/postings/create")
def postings_create(posting: PostingIn):
    user_id = get_user_id(posting.username, posting.password_hash)
    if not user_id:
        raise HTTPException(status_code=400, detail="user not found")
    row = create_posting(
        host_id=user_id,
        address=posting.address,
        lat=posting.lat,
        lng=posting.lng,
        price=posting.price,
        date=posting.date.isoformat(),
        start=posting.start,
        end=posting.end,
    )
    return row


# ---------- search / reserve (customer) endpoints ----------

def posting_to_option(posting: dict) -> Option:
    o = Option()
    o.id = posting["id"]
    o.host_id = posting["host_id"]
    o.address = posting["address"]
    o.price = posting["price"]
    o.lat = posting["lat"]
    o.lng = posting["lng"]
    cal = IntervalCalendar()
    cal.addAvailable(posting["start"], posting["end"])
    o.cal = cal
    return o


@app.get("/options", response_model=List[OptionOut])
def list_options():
    postings = fetch_available_postings()
    return [
        OptionOut(
            id=p["id"],
            host_id=p["host_id"],
            address=p["address"],
            price=p["price"],
            lat=p["lat"],
            lng=p["lng"],
            date=str(p["date"]),
        )
        for p in postings
    ]


@app.post("/postings/search", response_model=List[SearchResult])
def search(req: SearchRequest):
    postings = fetch_available_postings()
    results: List[SearchResult] = []
    for p in postings:
        o = posting_to_option(p)
        if o.cal.isAvailable(req.start, req.end):
            results.append(
                SearchResult(
                    option_id=o.id,
                    host_id=o.host_id,
                    address=o.address,
                    date=str(p["date"]),
                    start=req.start,
                    end=req.end,
                    price=o.price,
                    lat=o.lat,
                    lng=o.lng,
                )
            )
    return results


@app.post("/postings/reserve", response_model=ReserveResult)
def reserve(req: ReserveRequest):
    postings = fetch_postings()
    posting = next((p for p in postings if p["id"] == req.option_id), None)
    if posting is None:
        raise HTTPException(status_code=404, detail="Option not found")
    if posting["customer_id"] is not None:
        return ReserveResult(success=False, message="Already reserved")
    if not (posting["start"] <= req.start < req.end <= posting["end"]):
        return ReserveResult(success=False, message="Not available for this interval")
    try:
        split_and_reserve(req.option_id, req.customer_id, req.start, req.end)
    except RuntimeError as e:
        return ReserveResult(success=False, message=str(e))
    return ReserveResult(success=True, message="Reserved successfully")