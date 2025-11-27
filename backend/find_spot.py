import sqlite3

def find_spot():
    conn = sqlite3.connect('parking.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, address, city FROM spots")
    spots = cursor.fetchall()
    conn.close()
    
    print("Listing all spots:")
    for spot in spots:
        print(f"ID: {spot[0]}, Address: {spot[1]}, City: {spot[2]}")

if __name__ == "__main__":
    find_spot()
