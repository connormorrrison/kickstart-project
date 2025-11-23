import os
from typing import Optional, List, Dict
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL or SUPABASE_KEY is missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_postings() -> List[Dict]:
    res = supabase.table("postings").select("*").execute()
    return res.data or []


def fetch_available_postings() -> List[Dict]:
    res = (
        supabase.table("postings")
        .select("*")
        .is_("customer_id", None)
        .execute()
    )
    return res.data or []


def search_postings(date: Optional[str], start: int, end: int) -> List[Dict]:
    q = supabase.table("postings").select("*").is_("customer_id", None)
    if date is not None:
        q = q.eq("date", date)
    q = q.lte("start", start).gte("end", end)
    res = q.execute()
    return res.data or []


def create_user(username: str, password_hash: str, email: Optional[str]) -> Optional[Dict]:
    res = (
        supabase.table("users")
        .insert(
            {
                "username": username,
                "password_hash": password_hash,
                "email": email,
            }
        )
        .execute()
    )
    data = res.data or []
    return data[0] if data else None


def get_user_by_credentials(username: str, password_hash: str) -> Optional[Dict]:
    res = (
        supabase.table("users")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password_hash)
        .maybe_single()
        .execute()
    )
    return res.data


def get_user_id(username: str, password_hash: str) -> Optional[int]:
    user = get_user_by_credentials(username, password_hash)
    return int(user["id"]) if user and "id" in user else None


def get_user_by_id(user_id: int) -> Optional[Dict]:
    res = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return res.data


def create_posting(
    host_id: int,
    address: str,
    lat: float,
    lng: float,
    price: float,
    date: str,
    start: int,
    end: int,
) -> Optional[Dict]:
    res = (
        supabase.table("postings")
        .insert(
            {
                "host_id": host_id,
                "address": address,
                "lat": lat,
                "lng": lng,
                "price": price,
                "date": date,
                "start": start,
                "end": end,
            }
        )
        .execute()
    )
    data = res.data or []
    return data[0] if data else None


def split_and_reserve(posting_id: int, customer_id: int, s: int, e: int) -> None:
    res = (
        supabase.table("postings")
        .select("*")
        .eq("id", posting_id)
        .maybe_single()
        .execute()
    )
    p = res.data
    if not p:
        raise RuntimeError("posting not found")
    if p["customer_id"] is not None:
        raise RuntimeError("already reserved")
    start = p["start"]
    end = p["end"]
    if not (start <= s < e <= end):
        raise RuntimeError("invalid interval")
    update_res = (
        supabase.table("postings")
        .update({"start": s, "end": e, "customer_id": customer_id})
        .eq("id", posting_id)
        .is_("customer_id", None)
        .execute()
    )
    if not update_res.data:
        raise RuntimeError("failed to reserve")
    base_fields = {
        "host_id": p["host_id"],
        "address": p["address"],
        "lat": p["lat"],
        "lng": p["lng"],
        "price": p["price"],
        "date": p["date"],
    }
    new_rows = []
    if start < s:
        new_rows.append(
            {
                **base_fields,
                "start": start,
                "end": s,
                "customer_id": None,
            }
        )
    if e < end:
        new_rows.append(
            {
                **base_fields,
                "start": e,
                "end": end,
                "customer_id": None,
            }
        )
    if new_rows:
        supabase.table("postings").insert(new_rows).execute()