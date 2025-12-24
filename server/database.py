from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pathlib import Path

SQLALCHEMY_DATABASE_URL = f"sqlite:///{Path(__file__).parent / "fsa_data.db"}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address_1 = Column(String)
    address_2 = Column(String)
    address_3 = Column(String)
    address_4 = Column(String)
    postcode = Column(String)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    local_authority = Column(String)
    pending = Column(Boolean)
    date = Column(String)
    scheme = Column(String)
    rating = Column(String)

Base.metadata.create_all(bind=engine)
