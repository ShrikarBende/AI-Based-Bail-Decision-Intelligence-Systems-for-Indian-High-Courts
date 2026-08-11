try:
    import sqlite3
    from passlib.context import CryptContext
    from jose import jwt
    print("Imports OK")
except Exception as e:
    print(f"Error: {e}")
