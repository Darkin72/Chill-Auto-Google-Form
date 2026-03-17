from pydantic import BaseModel, field_validator
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime


class FinalForm(BaseModel):
    answer: Dict[str, Any]
    repeat: Dict[str, Any]
    link: str
    title: str
    description: str


class Form(FinalForm):
    status: str
    process: int


class Link(BaseModel):
    url: str


class FeedBack(BaseModel):
    fullName: str
    email: str
    subject: str
    message: str


class FormOut(Form):
    id: UUID
    created_at: datetime
    updated_at: datetime


class Person(BaseModel):
    persona_id: UUID
    locale: str
    timezone: str
    updated_at: datetime
    name_full: str
    dob: datetime
    gender: str
    languages: List[Dict]
    nationality: str
    location_region: str
    appearance: Dict
    contacts: Dict
    work_education: Dict
    personality: Dict
    preferences: Dict
    timeline: List[Dict]

    @field_validator("languages", mode="before")
    @classmethod
    def normalize_languages(cls, value):
        # Accept legacy formats like ["vi", "en"] and normalize to
        # [{"code": "vi", "level": "unknown"}, ...].
        if value is None:
            return []

        if isinstance(value, str):
            parts = [p.strip() for p in value.split(",") if p.strip()]
            return [{"code": code, "level": "unknown"} for code in parts]

        if isinstance(value, list):
            normalized = []
            for item in value:
                if isinstance(item, dict):
                    normalized.append(item)
                elif isinstance(item, str) and item.strip():
                    normalized.append({"code": item.strip(), "level": "unknown"})
            return normalized

        return value
