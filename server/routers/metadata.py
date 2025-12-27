from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import SessionLocal, Metadata
from datetime import datetime

router = APIRouter(prefix="/metadata")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("")
def get_data_metadata(db: Session = Depends(get_db)):
    metadata = db.query(Metadata).filter(
        Metadata.is_current == True
    ).first()

    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No metadata available."
        )

    download_date = datetime.fromisoformat(metadata.download_date)

    return {
        "download_date": metadata.download_date,
        "source": metadata.source,
        "csv_last_modified": metadata.csv_last_modified,
        "total_records": metadata.total_records,
        "imported_records": metadata.imported_records,
        "skipped_records": metadata.skipped_records,
        "import_duration": metadata.import_duration,
        "data_age": (datetime.now() - download_date).days
    }

@router.get("/history")
def get_metadata_history(limit: int = 10, db: Session = Depends(get_db)):
    history = db.query(Metadata).order_by(
        Metadata.id.desc()
    ).limit(limit).all()

    return [
        {
            "download_date": m.download_date,
            "source": m.source,
            "imported_records": m.imported_records,
            "is_current": m.is_current
        }
        for m in history
    ]
