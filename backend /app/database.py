from sqlalchemy import create_engine

DATABASE_URL = "postgresql://aymenberkani@localhost:5432/aymenberkani"

engine = create_engine(DATABASE_URL)
