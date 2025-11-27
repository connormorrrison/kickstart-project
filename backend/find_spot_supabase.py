from db import supabase

def find_spot():
    try:
        response = supabase.table("parking_spots_v2").select("*").ilike("street", "%Chestnut%").execute()
        
        if not response.data:
            print("No spots found matching 'Chestnut'")
            return

        print(f"Found {len(response.data)} spots:")
        for spot in response.data:
            print(f"ID: {spot['id']}")
            print(f"Address: {spot['street']}, {spot['city']}")
            print("-" * 20)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_spot()
