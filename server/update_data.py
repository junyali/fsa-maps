import requests
import pandas as pd
import os
from database import SessionLocal, Business, Metadata, Base, engine
from pathlib import Path
from datetime import datetime, timezone

ONLINE_CSV = "https://safhrsprodstorage.blob.core.windows.net/opendatafileblobstorage/FHRS_All_en-GB.csv"
LOCAL_CSV = "./FHRS_All_en-GB.csv"

def download_csv():
    source = "local"
    try:
        response = requests.get(ONLINE_CSV, timeout=60)
        response.raise_for_status()

        with open(LOCAL_CSV, 'wb') as f:
            f.write(response.content)

        print("Download success!")
        source = "online"
        return LOCAL_CSV, source
    except Exception as e:
        print(f"Download failed! {e}")

        if not Path(LOCAL_CSV).exists():
            raise FileNotFoundError(f"No local copy found at {LOCAL_CSV}")

        print("Using local copy")
        return LOCAL_CSV, source

def get_csv_last_modified(csv_path):
    try:
        timestamp = os.path.getmtime(csv_path)
        return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
    except Exception:
        return None

def normalise_rating(rating_value):
    if not rating_value or pd.isna(rating_value):
        return None
    return str(rating_value).lower().replace(" ", "").replace("_", "")

def safe_get(row, key, default=None):
    value = row.get(key, default)
    if pd.isna(value):
        return default
    else:
        return value if value != "" else default

def update_database():
    start_time = datetime.now(timezone.utc)
    csv_path, source = download_csv()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        df = pd.read_csv(csv_path, encoding='utf-8', low_memory=False)
        total_records = len(df)
        print(f"Loading {len(df)} records from CSV")

        db.query(Metadata).update({"is_current": False})
        db.query(Business).delete()
        db.commit()

        batch = []
        imported = 0
        skipped = 0

        for index, row in df.iterrows():
            if pd.isna(row.get("Latitude")) or pd.isna(row.get("Longitude")):
                skipped += 1
                continue

            try:
                business = Business(
                    id=safe_get(row, "FHRSID"),
                    name=safe_get(row, "BusinessName"),
                    address_1=safe_get(row, "AddressLine1"),
                    address_2=safe_get(row, "AddressLine2"),
                    address_3=safe_get(row, "AddressLine3"),
                    address_4=safe_get(row, "AddressLine4"),
                    postcode=safe_get(row, "PostCode"),
                    latitude=safe_get(row, "Latitude"),
                    longitude=safe_get(row, "Longitude"),
                    local_authority=safe_get(row, "LocalAuthorityName"),
                    pending=safe_get(row, "NewRatingPending"),
                    date=safe_get(row, "RatingDate"),
                    scheme=safe_get(row, "SchemeType"),
                    rating_key=safe_get(row, "RatingKey"),
                    rating_value=normalise_rating(safe_get(row, "RatingValue"))
                )
                batch.append(business)
                imported += 1

                if len(batch) >= 5120:
                    db.bulk_save_objects(batch)
                    db.commit()
                    batch = []
                    print(f"Imported: {imported}, {skipped} skipped")
            except Exception as e:
                print(f"Error importing {row.get("FHRSID")}: {e}")
                skipped += 1
                continue

        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        elapsed = datetime.now(timezone.utc) - start_time
        metadata = Metadata(
            download_date=start_time.isoformat(),
            source=source,
            csv_path=csv_path if source == "local" else ONLINE_CSV,
            total_records=total_records,
            imported_records=imported,
            skipped_records=skipped,
            import_duration=elapsed.total_seconds(),
            csv_last_modified=get_csv_last_modified(csv_path),
            is_current=True
        )
        db.add(metadata)
        db.commit()
        print(f"Database update complete! Imported {imported}, skipped {skipped}, time taken: {elapsed}")
    finally:
        db.close()

if __name__ == "__main__":
    update_database()
