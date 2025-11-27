import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env vars manually since we are running a script
# Assuming .env is in the current directory or backend
# But I'll just try to read it or use the one from main.py if possible.
# Actually, I'll just use the code from db.py if I can import it.

import sys
sys.path.append('/Users/connormorrison/Developer/kickstart-project/backend')

from db import supabase

def check_spot():
    # Find the spot
    response = supabase.table("parking_spots_v2").select("*").eq("street", "2805 Yale St").execute()
    if not response.data:
        print("Spot not found")
        return

    spot = response.data[0]
    spot_id = spot['id']
    print(f"Found Spot: {spot_id}")
    print(f"Address: {spot['street']}, {spot['city']}")

    # Check Availability Intervals
    intervals = supabase.table("availability_intervals_v2").select("*").eq("spot_id", spot_id).execute()
    print("\nBase Intervals:")
    for i in intervals.data:
        print(f"- {i['day']}: {i['start_time']} - {i['end_time']}")

    # Check Bookings for 2025-11-26
    date = "2025-11-26"
    bookings = supabase.table("bookings_v2").select("*").eq("spot_id", spot_id).eq("booking_date", date).execute()
    print(f"\nBookings for {date}:")
    for b in bookings.data:
        print(f"- {b['start_time']} - {b['end_time']} (Status: {b['status']})")

if __name__ == "__main__":
    check_spot()
