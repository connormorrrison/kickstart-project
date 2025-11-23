from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from processor import IntervalCalendar, Option
from db import fetch

app = FastAPI()

@app.get("/")
def root():
    return {"message": "backend is running..."}

class OptionOut(BaseModel):
    id: int
    host_id: int
    address: str
    price: float
    lat: float
    lng: float

class SearchRequest(BaseModel):
    start: int
    end: int

class SearchResult(BaseModel):
    option_id: int
    host_id: int
    address: str
    start: int
    end: int
    price: float
    lat: float
    lng: float

class ReserveRequest(BaseModel):
    option_id: int
    start: int
    end: int

class ReserveResult(BaseModel):
    success: bool
    message: str

def posting_to_option(posting: dict) -> Option:
    o = Option()
    o.id = posting["id"]
    o.host_id = posting["host_id"]
    o.address = posting["address"]
    o.price = posting["price"]
    o.lat = posting["lat"]
    o.lng = posting["lng"]

    cal = IntervalCalendar()
    starts = posting.get("start") or []
    ends = posting.get("end") or []

    for s, e in zip(starts, ends):
        cal.addAvailable(s, e)

    o.cal = cal
    return o

@app.get("/options", response_model=List[OptionOut])
def list_options():
    postings = fetch()
    return [
        OptionOut(
            id=p["id"],
            host_id=p["host_id"],
            address=p["address"],
            price=p["price"],
            lat=p["lat"],
            lng=p["lng"],
        )
        for p in postings
    ]

@app.post("/search", response_model=List[SearchResult])
def search(req: SearchRequest):
    postings = fetch()
    results: List[SearchResult] = []
    for p in postings:
        o = posting_to_option(p)
        if o.cal.isAvailable(req.start, req.end):
            results.append(
                SearchResult(
                    option_id=o.id,
                    host_id=o.host_id,
                    address=o.address,
                    start=req.start,
                    end=req.end,
                    price=o.price,
                    lat=o.lat,
                    lng=o.lng,
                )
            )
    return results

@app.post("/reserve", response_model=ReserveResult)
def reserve(req: ReserveRequest):
    postings = fetch()
    posting = next((p for p in postings if p["id"] == req.option_id), None)
    if posting is None:
        raise HTTPException(status_code=404, detail="Option not found")
    o = posting_to_option(posting)
    ok = o.cal.reserve(req.start, req.end)
    if not ok:
        return ReserveResult(success=False, message="Not available for this interval")
    return ReserveResult(success=True, message="Reserved successfully")