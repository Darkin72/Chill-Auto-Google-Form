from pydantic import BaseModel, Field
from agent.prompts import PERSON_SIMULATION_PROMPT
from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableWithMessageHistory, RunnableLambda
from langchain_core.chat_history import (
    InMemoryChatMessageHistory,
    BaseChatMessageHistory,
)
from langchain_core.output_parsers import PydanticOutputParser
import asyncio
import json
import re
from datetime import datetime
from zoneinfo import ZoneInfo
import os
from utils.env_loader import load_shared_env

load_shared_env(__file__, override=True)


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


class Agent:
    def __init__(self, person_info: Dict, title, description):
        self.person_name = person_info.get("name_full", "")
        person_info.pop("persona_id")
        person_info.pop("updated_at")
        person_info["dob"] = person_info["dob"].strftime("%Y-%m-%d %H:%M:%S")
        print(person_info)

        # llm instance
        self.llm = ChatOpenAI(
            model=os.getenv("MODEL_NAME", "gpt-oss-20b"),
            temperature=_env_float("LLM_TEMPERATURE", 0.0),
            reasoning_effort="low",
            max_retries=_env_int("LLM_MAX_RETRIES", 2),
            base_url=os.getenv("LLM_BASE_URL", "http://gpt-oss.llm.mobifone.vn/v1/"),
        )

        # history instance
        self.SESSION_STORE: Dict[str, InMemoryChatMessageHistory] = {}

        locale = (person_info.get("locale") or "").lower()
        langs = person_info.get("languages") or []
        lang_codes = {
            (l.get("code") or "").lower() for l in langs if isinstance(l, dict)
        }
        default_lang = "vi" if ("vi" in lang_codes or locale.startswith("vi")) else "en"

        tz = person_info.get("timezone") or "UTC"
        now_tz = datetime.now(ZoneInfo(tz))
        current_date = now_tz.strftime("%Y-%m-%d %H:%M")

        rendered = PERSON_SIMULATION_PROMPT.format(
            person_json=json.dumps(person_info, ensure_ascii=False, indent=2),
            title=title,
            description=description,
            current_date=current_date,
            timezone=tz,
            default_lang=default_lang,
        )

        self.system_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", "{system_prompt}"),
                MessagesPlaceholder("history"),
                ("human", "Câu hỏi : {question}"),
                ("human", "Yêu cầu của câu trả lời : {requiment}"),
            ]
        ).partial(system_prompt=rendered)

    def get_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.SESSION_STORE:
            self.SESSION_STORE[session_id] = InMemoryChatMessageHistory()
        return self.SESSION_STORE[session_id]

    def _pack(self, obj):
        """
        Chuẩn hoá output để:
        - 'answer' (str) => lưu vào history (gọn)
        - 'structured'   => trả về đầy đủ cho FE/BE
        """
        answer_text = getattr(obj, "answer", None)
        if not isinstance(answer_text, str):
            answer_text = json.dumps(
                getattr(obj, "model_dump", lambda: obj)(), ensure_ascii=False
            )[:800]
        return {"answer": answer_text, "structured": obj}

    def get_answer(self, AnswerType):
        parser = PydanticOutputParser(pydantic_object=AnswerType)
        # Escape {} để ChatPromptTemplate không nhầm thành template variable
        escaped_instructions = (
            parser.get_format_instructions().replace("{", "{{").replace("}", "}}")
        )
        schema_hint = ChatPromptTemplate.from_messages(
            [("system", escaped_instructions)]
        )
        prompt = self.system_prompt + schema_hint

        def _parse_robust(msg):
            text = msg.content if hasattr(msg, "content") else str(msg)
            # Unwrap markdown code block nếu có
            m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
            if m:
                text = m.group(1)
            # Tìm JSON object đầu tiên
            s, e = text.find("{"), text.rfind("}")
            if s != -1 and e > s:
                text = text[s : e + 1]
            return AnswerType(**json.loads(text))

        chain = prompt | self.llm | RunnableLambda(_parse_robust) | RunnableLambda(self._pack)

        chain_with_memory = RunnableWithMessageHistory(
            chain,
            lambda session_id: self.get_history(session_id),
            input_messages_key="question",
            history_messages_key="history",
            output_messages_key="answer",
        )
        return chain_with_memory
