import requests
import json

API_URL = "http://localhost:8000"
SPOT_ID = "0a0683ce-723f-4194-b334-3612f3ec11d3" # From previous debug step
DATE = "2025-11-26"

def test_availability_fix():
    print(f"Testing availability for spot {SPOT_ID} on {DATE}...")
    
    try:
        response = requests.get(f"{API_URL}/spots/{SPOT_ID}/availability/{DATE}")
        if response.status_code != 200:
            print(f"FAILED: Status code {response.status_code}")
            print(response.text)
            return

        data = response.json()
        print("\nResponse Data:")
        print(json.dumps(data, indent=2))

        # Verification Checks
        if "operating_hours" not in data:
            print("\nFAILED: 'operating_hours' field missing from response.")
            return
        
        operating_hours = data["operating_hours"]
        if not operating_hours:
            print("\nFAILED: 'operating_hours' is empty.")
            return

        print("\nSUCCESS: 'operating_hours' field present and populated.")
        print("Operating Hours:", [f"{s['start_time']} - {s['end_time']}" for s in operating_hours])
        
        # Check if available_slots is still calculated correctly (should be fragmented)
        available_slots = data["available_slots"]
        print("Available Slots (Remaining):", [f"{s['start_time']} - {s['end_time']}" for s in available_slots])

    except Exception as e:
        print(f"\nERROR: {e}")

if __name__ == "__main__":
    test_availability_fix()
