import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
from urllib.parse import quote_plus


load_dotenv()
USERNAME = os.getenv("DB_USERNAME")
PASSWORD = quote_plus(os.getenv("PASSWORD"))
DB_NAME = os.getenv("DB_NAME")
HOST = os.getenv("HOST", "localhost")  # Default to localhost if not set
PORT = os.getenv("PORT", "3306")  # Default MySQL port
DATABASE_URL = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}"


engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)
