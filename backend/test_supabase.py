"""
Test script to verify Supabase connection and check if tables exist
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from db import supabase

def test_connection():
    print("🔍 Testing Supabase connection...")
    print(f"Supabase URL: {os.getenv('SUPABASE_URL')}")
    print()

    # Test tables
    tables_to_check = [
        "users_v2",
        "parking_spots_v2",
        "availability_intervals_v2",
        "bookings_v2"
    ]

    results = {}

    for table_name in tables_to_check:
        try:
            print(f"Checking table: {table_name}")
            response = supabase.table(table_name).select("*").limit(1).execute()
            results[table_name] = {
                "exists": True,
                "count": len(response.data) if response.data else 0,
                "error": None
            }
            print(f"  ✅ Table exists (found {len(response.data)} rows in sample)")
        except Exception as e:
            results[table_name] = {
                "exists": False,
                "count": 0,
                "error": str(e)
            }
            print(f"  ❌ Table not found or error: {str(e)}")
        print()

    # Summary
    print("=" * 50)
    print("SUMMARY:")
    print("=" * 50)

    all_exist = all(r["exists"] for r in results.values())

    if all_exist:
        print("✅ All tables exist and are accessible!")
        print("\nTable Status:")
        for table, info in results.items():
            print(f"  • {table}: {info['count']} rows")
    else:
        print("❌ Some tables are missing or inaccessible:")
        for table, info in results.items():
            if not info["exists"]:
                print(f"  • {table}: {info['error']}")

    return all_exist

if __name__ == "__main__":
    success = test_connection()
    exit(0 if success else 1)
