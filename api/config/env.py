import os
import sys

from dotenv import load_dotenv

load_dotenv()
DEBUG = os.environ.get("DEBUG") == "1"
if DEBUG: os.environ.setdefault("DB_URL", "sqlite:///db.sqlite3")
missing = [key for key in ("DB_URL", "JWTKEY") if not os.environ.get(key)]
if os.environ.get("LLM_URL") and not os.environ.get("MODEL"): missing.append("MODEL")
if missing:
    print("please enter these env keys, they are missing and the server won't work:", missing)
    sys.exit(1)
DB_URL = os.environ["DB_URL"]
JWTKEY = os.environ["JWTKEY"]
HOSTS = os.environ.get("HOSTS", ".vercel.app,localhost,127.0.0.1").split(",")
ORIGINS = os.environ.get("ORIGINS", "http://localhost:5173").split(",")
GROQ_KEY = os.environ.get("GROQ_KEY")
LLM_URL = os.environ.get("LLM_URL")
MODEL = os.environ.get("MODEL")
