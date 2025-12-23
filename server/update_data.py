import requests
import pandas as pd
from database import SessionLocal, Business, Base, engine
from pathlib import Path

ONLINE_CSV = "https://safhrsprodstorage.blob.core.windows.net/opendatafileblobstorage/FHRS_All_en-GB.csv"
LOCAL_CSV = "../FHRS_All_en-GB.csv"

def download_csv():
    try:
        response = requests.get(ONLINE_CSV, timeout=60)
        response.raise_for_status()

        with open(LOCAL_CSV, 'wb') as f:
            f.write(response.content)

        print("Download success!")
        return LOCAL_CSV
    except Exception as e:
        print(f"Download failed! {e}")

        if not Path(LOCAL_CSV).exists():
            raise FileNotFoundError(f"No local copy found at {LOCAL_CSV}")

        print("Using local copy")
        return LOCAL_CSV

def update_database():
    csv_path = download_csv()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        df = pd.read_csv(csv_path, encoding='utf-8', low_memory=False)
        print(f"Loading {len(df)} records from CSV")

        db.query(Business).delete()
        db.commit()

        batch = []
        imported = 0

        for index, row in df.iterrows():
            if pd.isna(row.get("Latitude")) or pd.isna(row.get("Longitude")):
                continue

            business = Business(
                id=row["FHRSID"],
                name=row["BusinessName"],
                address_1=row.get("AddressLine1", ""),
                address_2=row.get("AddressLine2", ""),
                address_3=row.get("AddressLine3", ""),
                address_4=row.get("AddressLine4", ""),
                postcode=row.get("PostCode", ""),
                latitude=row["Latitude"],
                longitude=row["Longitude"],
                local_authority=row.get("LocalAuthorityName", ""),
                pending=row.get("NewRatingPending", ""),
                date=row.get("RatingDate", ""),
                scheme=row.get("SchemeType", ""),
                rating=row.get("RatingValue", "")
            )
            batch.append(business)
            imported += 1

            if len(batch) >= 5120:
                db.bulk_save_objects(batch)
                db.commit()
                batch = []

        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        print(f"Database update complete! Imported {imported} businesses")

    finally:
        db.close()

if __name__ == "__main__":
    update_database()
