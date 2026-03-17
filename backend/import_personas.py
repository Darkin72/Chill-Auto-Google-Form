"""
Script nhập toàn bộ file JSON trong thư mục data/ vào bảng persona.
Chạy: python import_personas.py
"""

import asyncio
import json
import os
from pathlib import Path
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import bindparam
from utils.env_loader import load_shared_env

load_shared_env(__file__)

DATABASE_URL = (
    f"postgresql+asyncpg://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}"
    f"@{os.environ.get('POSTGRES_HOST', 'localhost')}:{os.environ['POSTGRES_PORT']}/{os.environ['POSTGRES_DB']}"
)

DATA_DIR = Path(__file__).resolve().parent.parent / "database" / "data"

INSERT_SQL = text(
    """
    INSERT INTO persona (
        persona_id, locale, timezone, name_full, dob, gender,
        nationality, languages, location_region,
        appearance, contacts, work_education,
        personality, preferences, timeline, updated_at
    ) VALUES (
        :persona_id, :locale, :timezone, :name_full, :dob, :gender,
        :nationality, :languages, :location_region,
        :appearance, :contacts, :work_education,
        :personality, :preferences, :timeline, :updated_at
    )
    ON CONFLICT (persona_id) DO NOTHING
    """
).bindparams(
    bindparam("languages", type_=JSONB),
    bindparam("appearance", type_=JSONB),
    bindparam("contacts", type_=JSONB),
    bindparam("work_education", type_=JSONB),
    bindparam("personality", type_=JSONB),
    bindparam("preferences", type_=JSONB),
    bindparam("timeline", type_=JSONB),
)

BATCH_SIZE = 100


def parse_record(data: dict) -> dict:
    dob_raw = data.get("dob", "")
    try:
        dob = datetime.strptime(dob_raw, "%Y-%m-%d")
    except ValueError:
        # fallback cho format "1945-7-31" (tháng/ngày không leading zero)
        parts = dob_raw.split("-")
        dob = datetime(int(parts[0]), int(parts[1]), int(parts[2]))

    return {
        "persona_id": data["persona_id"],
        "locale": data.get("locale", ""),
        "timezone": data.get("timezone", "UTC"),
        "name_full": data.get("name_full", ""),
        "dob": dob,
        "gender": data.get("gender", ""),
        "nationality": data.get("nationality", ""),
        "languages": data.get("languages", []),
        "location_region": data.get("location_region", ""),
        "appearance": data.get("appearance", {}),
        "contacts": data.get("contacts", {}),
        "work_education": data.get("work_education", {}),
        "personality": data.get("personality", {}),
        "preferences": data.get("preferences", {}),
        "timeline": data.get("timeline", []),
        "updated_at": datetime.now(timezone.utc),
    }


async def main():
    files = list(DATA_DIR.glob("*.json"))
    print(f"Tìm thấy {len(files)} file JSON trong {DATA_DIR}")

    records = []
    errors = []
    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            records.append(parse_record(data))
        except Exception as e:
            errors.append((f.name, str(e)))

    if errors:
        print(f"⚠ Không thể parse {len(errors)} file:")
        for name, err in errors:
            print(f"  {name}: {err}")

    engine = create_async_engine(DATABASE_URL, pool_size=5)

    inserted = 0
    skipped = 0
    try:
        for i in range(0, len(records), BATCH_SIZE):
            batch = records[i : i + BATCH_SIZE]
            async with engine.begin() as conn:
                result = await conn.execute(INSERT_SQL, batch)
                inserted += result.rowcount
                skipped += len(batch) - result.rowcount
            print(f"  Đã xử lý {min(i + BATCH_SIZE, len(records))}/{len(records)}...")
    finally:
        await engine.dispose()

    print(f"\nHoàn tất: {inserted} bản ghi được thêm, {skipped} đã tồn tại (bỏ qua).")


if __name__ == "__main__":
    asyncio.run(main())
