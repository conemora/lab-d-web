import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

print("Ruta:", BASE_DIR / ".env")
print("Existe:", (BASE_DIR / ".env").exists())

load_dotenv(BASE_DIR / ".env")

print("Clave cargada:", bool(os.getenv("DJANGO_SECRET_KEY")))