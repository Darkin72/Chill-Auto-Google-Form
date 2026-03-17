import os
import csv
from time import sleep
from typing import Dict
import uuid
from datetime import datetime
import json

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, bindparam
from sqlalchemy.dialects.postgresql import JSONB
from langchain_google_genai import ChatGoogleGenerativeAI
from AnswerType import PERSON_FILL, DEFAULT_20_SKILLS
from langchain_core.prompts import ChatPromptTemplate
from utils.env_loader import load_shared_env

load_shared_env(__file__, override=True)

DATABASE_URL = f"postgresql+asyncpg://{os.environ.get('POSTGRES_USER', '')}:{os.environ.get('POSTGRES_PASSWORD', '')}@localhost:{os.environ.get('POSTGRES_PORT', '')}/{os.environ.get('POSTGRES_DB', '')}"
FOLDER = "data"
SENSITIVE_FIELDS = {
    "ssn",
    "national_id",
    "cc_number",
    "cc_expiration",
    "cc_code",
    "cc_type",
    "iban",
    "swiftBicNumber",
    "bank_account_number",
    "bank_routing_number",
    "ein",
    "drivers_license_number",
    "bitcoin_address",
    "ethereum_address",
    "ripple_address",
    "monero_address",
    "password",
    "local_ipv4",
    "mac_address",
    "latitude",
    "longitude",
    "city",
    "state",
    "state_code",
    "postal_code",
    "user_agent",
    "ethnicity",
    "hair_color",
}


def to_uuid_from(value, fallback_name):
    if value:
        try:
            return uuid.UUID(str(value))
        except Exception:
            pass
    base = os.path.splitext(fallback_name)[0]
    try:
        return uuid.UUID(base)
    except Exception:
        return uuid.uuid5(uuid.NAMESPACE_URL, base)


def to_date(s):
    if not s:
        return None
    try:
        y, m, d = [int(p) for p in str(s).split("-")]
        return datetime(y, m, d).date()
    except Exception:
        return None


def to_float(s):
    if s is None or s == "":
        return None
    try:
        return float(str(s).strip())
    except Exception:
        return None


def inch_to_cm(inch):
    return None if inch is None else round(inch * 2.54, 1)


def lb_to_kg(lb):
    return None if lb is None else round(lb * 0.45359237, 1)


def ensure_languages_vi(locale, existing=None):
    langs = existing[:] if isinstance(existing, list) else []
    # Nếu CSV có locale vi_* thì ưu tiên native, ngược lại vẫn thêm vi basic
    vi_present = any(isinstance(x, dict) and x.get("code") == "vi" for x in langs)
    if not vi_present:
        if (locale or "").startswith("vi"):
            langs.insert(0, {"code": "vi", "level": "native"})
        else:
            langs.insert(0, {"code": "vi", "level": "basic"})
    return langs


def name_correction(name_full: str):
    part = name_full.split(" ")
    if part[0].endswith("."):
        if len(part) == 3:
            return f"Nguyễn {part[1]} {part[2]}"
        return " ".join(part[1:])
    if len(part) == 2:
        return f"Nguyễn {part[0]} {part[1]}"
    return " ".join(part)


def build_persona_clean(row):
    locale = (row.get("locale") or "vi_VN").strip()
    country = (row.get("country") or "Viet Nam").strip()

    name_full = name_correction((row.get("name") or "").strip())
    dob = row.get("dob")
    gender = row.get("gender") or None
    nationality = country

    # languages: luôn có "vi"
    languages = ensure_languages_vi(locale, existing=None)

    # location mơ hồ
    location_region = (row.get("address_1", "")).strip().replace("\n", " ")

    # appearance: đổi đơn vị
    height_in = to_float(row.get("height"))
    weight_lb = to_float(row.get("weight"))
    appearance = {
        "height_cm": inch_to_cm(height_in),
        "weight_kg": lb_to_kg(weight_lb),
        "hair_color": row.get("eye_color") or None,
        "eye_color": row.get("eye_color") or None,
    }

    contacts = {
        "phone": row.get("phone") or None,
        "email": row.get("email") or None,
        "website": row.get("website") or None,
        "username": row.get("username") or None,
    }

    work_education = {
        "job_title": row.get("job_title") or None,
        "employer": row.get("company_name") or None,
        "education": {
            "level": row.get("education_level") or None,
            "university": row.get("university") or None,
        },
        "skills": DEFAULT_20_SKILLS,  # use the default skills list
        "salary_usd_per_year": to_float(row.get("salary"))
        or 50000.0,  # rename salary field and provide default
    }

    personality = {
        "tone_style": [],
        "values": [],
        "signature_phrases": [],
    }
    preferences = {"music": [], "movies": [], "food": [], "sports": []}

    # timeline để LLM bịa → hiện tại để mảng rỗng
    timeline = []

    return {
        "locale": locale,
        "timezone": "Asia/Ho_Chi_Minh" if locale.startswith("vi") else None,
        "name_full": name_full,
        "dob": dob,
        "gender": gender,
        "nationality": nationality,
        "languages": languages,
        "location_region": location_region,
        "appearance": appearance,
        "contacts": contacts,
        "work_education": work_education,
        "personality": personality,
        "preferences": preferences,
        "timeline": timeline,
    }


async def add_person(person: Dict, engine):
    query = text(
        """INSERT INTO persona (persona_id, locale , timezone, name_full, dob, gender, nationality, languages, location_region, appearance, contacts, work_education, personality, preferences, timeline) 
        VALUES (:persona_id, :locale , :timezone, :name_full, :dob, :gender, :nationality, :languages, :location_region, :appearance, :contacts, :work_education, :personality, :preferences, :timeline)
        RETURNING persona_id"""
    ).bindparams(
        bindparam("languages", type_=JSONB),
        bindparam("appearance", type_=JSONB),
        bindparam("contacts", type_=JSONB),
        bindparam("work_education", type_=JSONB),
        bindparam("personality", type_=JSONB),
        bindparam("preferences", type_=JSONB),
        bindparam("timeline", type_=JSONB),
    )
    async with engine.begin() as bonn:
        result = await bonn.execute(query, person)
        new_id = result.scalar_one()
        print(new_id)


def to_json(person: Dict):
    with open(f"data/{person['persona_id']}.json", "w", encoding="utf-8") as f:
        json.dump(person, f, ensure_ascii=False)
    print(f"{person['persona_id']}.json has been written successfully")


def fill_by_llm(payload: Dict):
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
    structured = llm.with_structured_output(PERSON_FILL)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """Bạn là hệ thống mô phỏng nhân sinh. Bạn sẽ nhận được một đối tượng là thông tin con người mà bạn mô phỏng dưới dạng JSON. Nhiệm vụ của bạn là điền các thông tin còn thiếu theo đúng định dạng PERSON_FILL. Với languages, bạn hãy điền ngẫu nhiên từ 0-2 ngôn ngữ ngoài tiếng Việt.
                Với WorkEducation, hãy đảm bảo tên công việc và tên công ty đều là tiếng Việt, nếu chưa hợp lý, hãy sửa lại cho hợp lý.
                Với Education, hãy đảm bảo tên trường Đại học là tên trường ở Việt Nam.
                Với skills, hãy chọn ngẫu nhiên các skill mà bạn cho là sẽ học được ở trường đại học đó.
                Với các sự kiện diễn ra trong đời, hãy suy nghĩ thật kĩ sao cho phù hợp với nhân vật
                """,
            ),
            ("user", "Đây là thông tin của con người : {info}"),
        ]
    )
    chain = prompt | structured
    person_fill: PERSON_FILL = chain.invoke(
        {"info": json.dumps(payload, ensure_ascii=False)}
    )  # type: ignore
    while person_fill is None:
        person_fill: PERSON_FILL = chain.invoke(
            {"info": json.dumps(payload, ensure_ascii=False)}
        )  # type: ignore
    person = person_fill.model_dump()
    # payload["dob"] = to_date(payload["dob"])
    payload["languages"] = person["languages"]
    payload["work_education"] = person["work_education"]
    payload["personality"] = person["personality"]
    payload["preferences"] = person["preferences"]
    payload["timeline"] = person["timeline"]
    return payload


def fill_file_by_llm():
    idx = 0
    for fname in os.listdir(FOLDER):
        if not fname.lower().endswith(".csv"):
            continue
        idx += 1
        print(f"Processing {fname}, {idx} / 1000")
        path = os.path.join(FOLDER, fname)
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            if not rows:
                continue
            row = rows[0]

        # strip chuỗi
        for k, v in list(row.items()):
            if isinstance(v, str):
                row[k] = v.strip()

        # loại field nhạy cảm/không dùng
        for k in list(row.keys()):
            if k in SENSITIVE_FIELDS:
                row.pop(k, None)

        persona_id = to_uuid_from(row.get("uuid"), fname)
        doc = build_persona_clean(row)

        # upsert
        payload = {
            "persona_id": str(persona_id),
            **{k: (v) for k, v in doc.items()},
        }
        payload = fill_by_llm(payload)
        print(payload)
        to_json(payload)


async def insert_to_database():
    engine = create_async_engine(
        DATABASE_URL,
        pool_size=5,  # số kết nối trong pool
        max_overflow=10,  # kết nối vượt mức cho burst
    )
    try:
        for idx, fname in enumerate(os.listdir(FOLDER)):
            if not fname.endswith(".json"):
                continue
            print(f"Inserting {idx+1}/ 1000")
            fname = os.path.join(FOLDER, fname)
            with open(fname, "r", encoding="utf-8") as f:
                person = json.load(f)
            if person is None:
                continue
            person["dob"] = to_date(person["dob"])
            await add_person(person, engine)
    finally:
        engine.dispose


if __name__ == "__main__":
    # fill_file_by_llm()
    import asyncio

    asyncio.run(insert_to_database())
