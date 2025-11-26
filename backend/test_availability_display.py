"""
Test script to verify the availability calculation endpoint.
This tests the "Runtime Calculation" approach where:
- availability_intervals_v2 stores recurring weekly patterns
- bookings_v2 stores specific date/time bookings
- The API calculates remaining availability at runtime
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def register_and_login():
    """Register a new test user and login"""
    print_section("1. SETUP: Register and Login")

    test_user = {
        "first_name": "Test",
        "last_name": "User",
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "password": "testpass123"
    }

    # Register
    response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    if response.status_code == 201:
        print(f"✓ User registered: {test_user['email']}")
    else:
        print(f"✗ Registration failed: {response.text}")
        return None

    # Login
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": test_user["email"],
        "password": test_user["password"]
    })

    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✓ Login successful")
        return token
    else:
        print(f"✗ Login failed: {response.text}")
        return None

def create_parking_spot(token):
    """Create a parking spot with availability Monday 9am-5pm"""
    print_section("2. CREATE: Parking Spot with Availability")

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
        print(f"  Base availability: Monday 09:00-17:00 (8 hours)")
        return spot['id']
    else:
        print(f"✗ Failed to create spot: {response.text}")
        return None

def get_next_monday():
    """Get the date of the next Monday"""
    today = datetime.now()
    days_ahead = 0 - today.weekday()  # Monday is 0
    if days_ahead <= 0:
        days_ahead += 7
    next_monday = today + timedelta(days=days_ahead)
    return next_monday.strftime("%Y-%m-%d")

def test_availability_no_bookings(spot_id, date):
    """Test availability calculation with NO bookings"""
    print_section("3. TEST: Availability with NO Bookings")

    response = requests.get(f"{BASE_URL}/spots/{spot_id}/availability/{date}")

    if response.status_code == 200:
        result = response.json()
        print(f"✓ Successfully fetched availability for {result['day']}, {result['date']}")
        print(f"\n  Available slots ({len(result['available_slots'])}):")
        for slot in result['available_slots']:
            print(f"    - {slot['start_time']} to {slot['end_time']}")

        # Verify we got the full 9am-5pm slot
        if len(result['available_slots']) == 1:
            slot = result['available_slots'][0]
            if "9:00 AM" in slot['start_time'] and "5:00 PM" in slot['end_time']:
                print(f"\n  ✓ PASS: Full availability returned (no bookings yet)")
                return True
        print(f"\n  ✗ FAIL: Expected 1 slot from 9am-5pm")
        return False
    else:
        print(f"✗ Failed to fetch availability: {response.text}")
        return False

def create_booking(token, spot_id, date, start, end):
    """Create a booking"""
    booking_data = {
        "spot_id": spot_id,
        "booking_date": date,
        "start_time": start,
        "end_time": end
    }

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)

    if response.status_code == 201:
        booking = response.json()
        print(f"  ✓ Booking created: {start} - {end}")
        return booking['id']
    else:
        print(f"  ✗ Booking failed: {response.json().get('detail', response.text)}")
        return None

def test_availability_with_one_booking(token, spot_id, date):
    """Test availability after making one booking"""
    print_section("4. TEST: Availability with ONE Booking (12pm-2pm)")

    # Create booking for 12pm-2pm
    booking_id = create_booking(token, spot_id, date, "12:00", "14:00")
    if not booking_id:
        return False

    # Fetch availability
    response = requests.get(f"{BASE_URL}/spots/{spot_id}/availability/{date}")

    if response.status_code == 200:
        result = response.json()
        print(f"\n  Available slots after booking ({len(result['available_slots'])}):")
        for slot in result['available_slots']:
            print(f"    - {slot['start_time']} to {slot['end_time']}")

        # Verify we got 2 slots: 9am-12pm and 2pm-5pm
        if len(result['available_slots']) == 2:
            slot1, slot2 = result['available_slots']
            if ("9:00 AM" in slot1['start_time'] and "12:00 PM" in slot1['end_time'] and
                "2:00 PM" in slot2['start_time'] and "5:00 PM" in slot2['end_time']):
                print(f"\n  ✓ PASS: Correctly split into 9am-12pm and 2pm-5pm")
                return booking_id
        print(f"\n  ✗ FAIL: Expected 2 slots (9am-12pm, 2pm-5pm)")
        return None
    else:
        print(f"✗ Failed to fetch availability: {response.text}")
        return None

def test_availability_with_multiple_bookings(token, spot_id, date):
    """Test availability with multiple bookings"""
    print_section("5. TEST: Availability with MULTIPLE Bookings")

    # Create another booking for 10am-11am
    print(f"\n  Creating second booking: 10am-11am")
    booking_id = create_booking(token, spot_id, date, "10:00", "11:00")
    if not booking_id:
        return False

    # Fetch availability
    response = requests.get(f"{BASE_URL}/spots/{spot_id}/availability/{date}")

    if response.status_code == 200:
        result = response.json()
        print(f"\n  Available slots after 2 bookings ({len(result['available_slots'])}):")
        for slot in result['available_slots']:
            print(f"    - {slot['start_time']} to {slot['end_time']}")

        # Expected: 9am-10am, 11am-12pm, 2pm-5pm (3 slots)
        if len(result['available_slots']) == 3:
            print(f"\n  ✓ PASS: Correctly shows 3 remaining slots")
            return True
        else:
            print(f"\n  ✗ FAIL: Expected 3 slots")
            return False
    else:
        print(f"✗ Failed to fetch availability: {response.text}")
        return False

def test_fully_booked(token, spot_id, date):
    """Test availability when fully booked"""
    print_section("6. TEST: Availability When FULLY BOOKED")

    # Book the remaining slots
    print(f"\n  Booking remaining time slots...")
    create_booking(token, spot_id, date, "09:00", "10:00")
    create_booking(token, spot_id, date, "11:00", "12:00")
    create_booking(token, spot_id, date, "14:00", "17:00")

    # Fetch availability
    response = requests.get(f"{BASE_URL}/spots/{spot_id}/availability/{date}")

    if response.status_code == 200:
        result = response.json()
        print(f"\n  Available slots when fully booked: {len(result['available_slots'])}")

        if len(result['available_slots']) == 0:
            print(f"\n  ✓ PASS: Correctly shows NO available slots")
            return True
        else:
            print(f"\n  ✗ FAIL: Expected 0 slots, got {len(result['available_slots'])}")
            print(f"  Remaining slots:")
            for slot in result['available_slots']:
                print(f"    - {slot['start_time']} to {slot['end_time']}")
            return False
    else:
        print(f"✗ Failed to fetch availability: {response.text}")
        return False

def main():
    print("\n" + "█"*60)
    print("  AVAILABILITY CALCULATION TEST")
    print("  (Runtime Subtraction Approach)")
    print("█"*60)

    # Setup
    token = register_and_login()
    if not token:
        return

    spot_id = create_parking_spot(token)
    if not spot_id:
        return

    date = get_next_monday()
    print(f"\n  Testing with date: {date} (Monday)")

    # Run tests
    test_availability_no_bookings(spot_id, date)
    test_availability_with_one_booking(token, spot_id, date)
    test_availability_with_multiple_bookings(token, spot_id, date)
    test_fully_booked(token, spot_id, date)

    print("\n" + "█"*60)
    print("  TEST COMPLETE")
    print("█"*60 + "\n")

if __name__ == "__main__":
    main()
