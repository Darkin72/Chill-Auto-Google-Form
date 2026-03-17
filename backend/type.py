from email.policy import default
from turtle import st
from pydantic import BaseModel
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
