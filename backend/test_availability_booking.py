"""
Test script to verify that booking creation updates availability intervals
and booking cancellation restores them.
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

# Test user credentials
TEST_USER = {
    "first_name": "Test",
    "last_name": "User",
    "email": f"test_{datetime.now().timestamp()}@example.com",
    "password": "testpass123"
}

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def register_and_login():
    """Register a new test user and login"""
    print_section("1. REGISTERING TEST USER")

    # Register
    response = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    if response.status_code == 201:
        print(f"✓ User registered: {TEST_USER['email']}")
    else:
        print(f"✗ Registration failed: {response.text}")
        return None

    # Login
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })

    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✓ Login successful, token obtained")
        return token
    else:
        print(f"✗ Login failed: {response.text}")
        return None

def create_parking_spot(token):
    """Create a parking spot with availability"""
    print_section("2. CREATING PARKING SPOT WITH AVAILABILITY")

    # Get next Monday
    today = datetime.now()
    days_ahead = 0 - today.weekday()  # Monday is 0
    if days_ahead <= 0:
        days_ahead += 7
    next_monday = today + timedelta(days=days_ahead)

    spot_data = {
        "street": "123 Test Street",
        "city": "Toronto",
        "province": "ON",
        "postal_code": "M5V 3A8",
        "country": "Canada",
        "lat": 43.6532,
        "lng": -79.3832,
        "price_per_hour": 10.0,
        "availability_intervals": [
            {
                "day": "Monday",
                "start_time": "09:00",
                "end_time": "17:00"
            }
        ]
    }

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/spots", json=spot_data, headers=headers)

    if response.status_code == 201:
        spot = response.json()
        print(f"✓ Parking spot created: {spot['id']}")
        print(f"  Address: {spot['street']}, {spot['city']}")
        print(f"  Availability: Monday 09:00-17:00")
        return spot['id'], next_monday.strftime("%Y-%m-%d")
    else:
        print(f"✗ Failed to create spot: {response.text}")
        return None, None

def check_availability(spot_id):
    """Check current availability intervals for a spot"""
    response = requests.get(f"{BASE_URL}/spots/{spot_id}")

    if response.status_code == 200:
        spot = response.json()
        intervals = spot.get('availability_intervals', [])
        print(f"\n  Current availability intervals ({len(intervals)}):")
        for i, interval in enumerate(intervals, 1):
            print(f"    {i}. {interval['day']}: {interval['start_time']} - {interval['end_time']}")
        return intervals
    else:
        print(f"✗ Failed to get spot: {response.text}")
        return []

def create_booking(token, spot_id, booking_date):
    """Create a booking for Monday 10:00-12:00"""
    print_section("3. CREATING BOOKING (Monday 10:00-12:00)")

    print(f"  Initial availability:")
    initial_intervals = check_availability(spot_id)

    booking_data = {
        "spot_id": spot_id,
        "booking_date": booking_date,
        "start_time": "10:00",
        "end_time": "12:00"
    }

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)

    if response.status_code == 201:
        booking = response.json()
        print(f"\n✓ Booking created: {booking['id']}")
        print(f"  Date: {booking['booking_date']}")
        print(f"  Time: {booking['start_time']} - {booking['end_time']}")
        print(f"  Price: ${booking['total_price']}")

        print(f"\n  Availability AFTER booking:")
        updated_intervals = check_availability(spot_id)

        # Verify the intervals were split correctly
        print(f"\n  VERIFICATION:")
        if len(initial_intervals) == 1 and len(updated_intervals) == 2:
            expected = [
                {"start": "09:00", "end": "10:00"},
                {"start": "12:00", "end": "17:00"}
            ]
            actual_match = (
                updated_intervals[0]['start_time'] == expected[0]['start'] and
                updated_intervals[0]['end_time'] == expected[0]['end'] and
                updated_intervals[1]['start_time'] == expected[1]['start'] and
                updated_intervals[1]['end_time'] == expected[1]['end']
            )
            if actual_match:
                print(f"  ✓ SUCCESS: Interval correctly split into 09:00-10:00 and 12:00-17:00")
            else:
                print(f"  ✗ FAILED: Intervals don't match expected split")
        else:
            print(f"  ✗ FAILED: Expected 2 intervals, got {len(updated_intervals)}")

        return booking['id']
    else:
        print(f"\n✗ Booking failed: {response.text}")
        return None

def cancel_booking(token, booking_id, spot_id):
    """Cancel the booking and check if availability is restored"""
    print_section("4. CANCELLING BOOKING")

    print(f"  Availability BEFORE cancellation:")
    before_intervals = check_availability(spot_id)

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{BASE_URL}/bookings/{booking_id}", headers=headers)

    if response.status_code == 200:
        result = response.json()
        print(f"\n✓ Booking cancelled: {result['message']}")

        print(f"\n  Availability AFTER cancellation:")
        after_intervals = check_availability(spot_id)

        # Verify the intervals were merged back
        print(f"\n  VERIFICATION:")
        if len(after_intervals) == 1:
            if (after_intervals[0]['start_time'] == "09:00" and
                after_intervals[0]['end_time'] == "17:00"):
                print(f"  ✓ SUCCESS: Availability restored and merged to 09:00-17:00")
            else:
                print(f"  ✗ FAILED: Interval times don't match expected 09:00-17:00")
        else:
            print(f"  ✗ FAILED: Expected 1 merged interval, got {len(after_intervals)}")
    else:
        print(f"\n✗ Cancellation failed: {response.text}")

def test_double_booking_prevention(token, spot_id, booking_date):
    """Try to book the same time slot twice"""
    print_section("5. TESTING DOUBLE BOOKING PREVENTION")

    booking_data = {
        "spot_id": spot_id,
        "booking_date": booking_date,
        "start_time": "10:00",
        "end_time": "12:00"
    }

    headers = {"Authorization": f"Bearer {token}"}

    # First booking
    print("  Attempting first booking (10:00-12:00)...")
    response1 = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)

    if response1.status_code == 201:
        print(f"  ✓ First booking successful")
        booking_id = response1.json()['id']

        # Try second booking at same time
        print("\n  Attempting second booking at SAME time (10:00-12:00)...")
        response2 = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)

        if response2.status_code == 400:
            print(f"  ✓ SUCCESS: Second booking correctly rejected")
            print(f"    Error message: {response2.json()['detail']}")
        else:
            print(f"  ✗ FAILED: Second booking should have been rejected but got status {response2.status_code}")

        # Clean up
        requests.delete(f"{BASE_URL}/bookings/{booking_id}", headers=headers)
    else:
        print(f"  ✗ First booking failed: {response1.text}")

def main():
    print("\n" + "█"*60)
    print("  AVAILABILITY UPDATE TEST")
    print("█"*60)

    # Step 1: Register and login
    token = register_and_login()
    if not token:
        return

    # Step 2: Create parking spot
    spot_id, booking_date = create_parking_spot(token)
    if not spot_id:
        return

    # Step 3: Create booking and verify availability updates
    booking_id = create_booking(token, spot_id, booking_date)
    if not booking_id:
        return

    # Step 4: Cancel booking and verify availability restores
    cancel_booking(token, booking_id, spot_id)

    # Step 5: Test double booking prevention
    test_double_booking_prevention(token, spot_id, booking_date)

    print("\n" + "█"*60)
    print("  TEST COMPLETE")
    print("█"*60 + "\n")

if __name__ == "__main__":
    main()
