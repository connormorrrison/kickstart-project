import urllib.request
import json

API_URL = "http://localhost:8000"
SPOT_ID = "0a0683ce-723f-4194-b334-3612f3ec11d3"
DATE = "2025-11-26"

def test_availability_fix():
    print(f"Testing availability for spot {SPOT_ID} on {DATE}...")
    
    try:
        url = f"{API_URL}/spots/{SPOT_ID}/availability/{DATE}"
        with urllib.request.urlopen(url) as response:
            if response.status != 200:
                print(f"FAILED: Status code {response.status}")
                return

            data = json.loads(response.read().decode())
            print("\nResponse Data:")
            print(json.dumps(data, indent=2))

            if "operating_hours" in data and data["operating_hours"]:
                print("\nSUCCESS: 'operating_hours' field present and populated.")
                print("Operating Hours:", [f"{s['start_time']} - {s['end_time']}" for s in data["operating_hours"]])
            else:
                print("\nFAILED: 'operating_hours' missing or empty.")

    except Exception as e:
        print(f"\nERROR: {e}")

if __name__ == "__main__":
    test_availability_fix()
