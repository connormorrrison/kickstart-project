from db import supabase

SPOT_ID = "c7f6532c-3583-4e1b-84e0-0659138aa6e9"
DATE = "2025-12-01"

def check_bookings():
    try:
        print(f"Checking bookings for spot {SPOT_ID} on {DATE}...")
        response = supabase.table("bookings_v2")\
            .select("*")\
            .eq("spot_id", SPOT_ID)\
            .eq("booking_date", DATE)\
            .execute()
        
        if not response.data:
            print("No bookings found for this date.")
            return

        print(f"Found {len(response.data)} bookings:")
        for booking in response.data:
            print(f"ID: {booking['id']}")
            print(f"Time: {booking['start_time']} - {booking['end_time']}")
            print(f"Status: {booking['status']}")
            print("-" * 20)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_bookings()
