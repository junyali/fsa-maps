from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from server.database import SessionLocal, Business, engine

router = APIRouter(prefix="/businesses")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BusinessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    address_1: Optional[str] = None
    address_2: Optional[str] = None
    address_3: Optional[str] = None
    address_4: Optional[str] = None
    postcode: Optional[str] = None
    latitude: float
    longitude: float
    local_authority: Optional[str] = None
    pending: Optional[bool] = None
    date: Optional[str] = None
    scheme: Optional[str] = None
    rating_key: Optional[str] = None
    rating_value: Optional[str] = None

@router.get("", response_model=List[BusinessResponse])
def get_businesses(
        min_lat: float = Query(...),
        max_lat: float = Query(...),
        min_lng: float = Query(...),
        max_lng: float = Query(...),
        db: Session = Depends(get_db)
):
    businesses = db.query(Business).filter(
        Business.latitude >= min_lat,
        Business.latitude <= max_lat,
        Business.longitude >= min_lng,
        Business.longitude <= max_lng
    ).all()

    return businesses
