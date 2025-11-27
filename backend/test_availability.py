import urllib.request
import json

SPOT_ID = "c7f6532c-3583-4e1b-84e0-0659138aa6e9"
DATE = "2025-12-01" # A Monday
URL = f"http://localhost:8000/spots/{SPOT_ID}/availability/{DATE}"

def test_availability():
    try:
        print(f"Fetching availability from: {URL}")
        with urllib.request.urlopen(URL) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
            
            # Check for 9AM-5PM availability
            # 9AM = 09:00, 5PM = 17:00
            has_slot = False
            for slot in data.get("available_slots", []):
                print(f"Slot: {slot['start_time']} - {slot['end_time']}")
                # Simple string check for now, assuming standard formatting
                if "9:00" in slot['start_time'] and "5:00" in slot['end_time']:
                     has_slot = True
            
            if has_slot:
                print("\nSUCCESS: Found 9AM-5PM slot.")
            else:
                print("\nFAILURE: Did NOT find 9AM-5PM slot.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_availability()
