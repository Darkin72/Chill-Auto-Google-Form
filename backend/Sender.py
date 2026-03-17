from typing import Dict, List, Tuple, Optional
import requests
from agent.agent import Agent
from utils.checkbox_support import checkbox_random_count_by_weights
from agent.AnswerType import (
    PARAGRAPH_ANSWER,
    MULTIPLE_CHOICE_ANSWER,
    CHECKBOX_ANSWER,
    TIME_ANSWER,
    DATE_ANSWER,
)
from utils.utc_convert import convert_to_vn
from utils.env_loader import load_shared_env
import random
import uuid
from datetime import datetime

load_shared_env(__file__, override=True)

PROMPT_LEAK_MARKERS = [
    "đây là một câu hỏi bắt buộc",
    "đây không phải một câu hỏi bắt buộc",
    "you must answer this question",
]


def _safe_convert_to_vn(raw_time: str):
    if isinstance(raw_time, str) and raw_time.strip():
        try:
            return convert_to_vn(raw_time)
        except Exception:
            pass
    return datetime.now()


def _fallback_paragraph_text(question, agent: Agent):
    content = (question.get("content") or "").strip()
    if content:
        return content

    title = (question.get("title") or "").lower()
    person_name = getattr(agent, "person_name", "")
    if "tên" in title or "name" in title:
        return person_name or "Nguyen Van A"

    if question.get("mustAnswer"):
        return "Khong co y kien"

    return ""


def _pick_single_option(question):
    options = list(question["ratios"].keys())
    weights = list(question["ratios"].values())
    try:
        return random.choices(options, weights=weights, k=1)[0]
    except Exception:
        non_empty = [o for o in options if o != ""]
        return non_empty[0] if non_empty else ""


def _contains_prompt_leak(value: object) -> bool:
    if value is None:
        return False
    text = str(value).strip().lower()
    return any(marker in text for marker in PROMPT_LEAK_MARKERS)


def paragraph_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
        try:
            if question["type"] == 0:
                requirement += " Trả lời ngắn gọn, súc tích (1-2 câu), đúng trọng tâm. Không giải thích dài dòng."
            else:
                requirement += (
                    " Trả lời tự nhiên, đầy đủ (2-4 câu) như người thật đang điền form."
                )
            result = agent.get_answer(PARAGRAPH_ANSWER).invoke(
                {
                    "question": question["title"],
                    "requiment": requirement,
                },
                config={"configurable": {"session_id": session_id}},
            )
            return (f"entry.{question['questionId']}", result["structured"].answer)
        except Exception as e:
            print(f"AI paragraph failed, fallback used: {e!r}")
            return (
                f"entry.{question['questionId']}",
                _fallback_paragraph_text(question, agent),
            )
    else:
        return (f"entry.{question['questionId']}", question["content"])


def multiple_choice_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
        try:
            options = [k for k in question["ratios"].keys() if k != ""]
            requirement += (
                f" Chọn đúng 1 trong các lựa chọn sau (giữ nguyên chính tả): {options}."
            )
            result = agent.get_answer(MULTIPLE_CHOICE_ANSWER).invoke(
                {
                    "question": question["title"],
                    "requiment": requirement,
                },
                config={"configurable": {"session_id": session_id}},
            )
            return (f"entry.{question['questionId']}", result["structured"].answer)
        except Exception as e:
            print(f"AI multiple-choice failed, fallback used: {e!r}")
            select = _pick_single_option(question)
            if select == "":
                return (
                    (f"entry.{question['questionId']}", "__other_option__"),
                    (
                        f"entry{question['questionId']}.other_option_response",
                        question.get("otherValue", ""),
                    ),
                )
            return (f"entry.{question['questionId']}", select)
    else:
        select = _pick_single_option(question)
        if select == "":
            return (
                (f"entry.{question['questionId']}", "__other_option__"),
                (
                    f"entry{question['questionId']}.other_option_response",
                    question["otherValue"],
                ),
            )
        return (f"entry.{question['questionId']}", select)


def check_box_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
        try:
            options = [k for k in question["ratios"].keys() if k != ""]
            requirement += (
                f" Chọn 0 hoặc nhiều lựa chọn phù hợp (giữ nguyên chính tả): {options}."
            )
            result = agent.get_answer(CHECKBOX_ANSWER).invoke(
                {"question": question["title"], "requiment": requirement},
                config={"configurable": {"session_id": session_id}},
            )
            selected = result["structured"].answers
            entries = []
            for s in selected:
                if s == "":
                    entries.append((f"entry.{question['questionId']}", "__other_option__"))
                    entries.append(
                        (
                            f"entry{question['questionId']}.other_option_response",
                            question.get("otherValue", ""),
                        )
                    )
                else:
                    entries.append((f"entry.{question['questionId']}", s))
            return entries if entries else None
        except Exception as e:
            print(f"AI checkbox failed, fallback used: {e!r}")
            return []
    else:
        select = checkbox_random_count_by_weights(
            list(question["ratios"].keys()),
            weights=list(question["ratios"].values()),
        )
        result = []
        for s in select:
            if s == "":
                result.append((f"entry.{question['questionId']}", "__other_option__"))
                result.append(
                    (
                        f"entry{question['questionId']}.other_option_response",
                        question["otherValue"],
                    )
                )
            else:
                result.append((f"entry.{question['questionId']}", s))
        return result


def time_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
        try:
            kind = question["kind"][0] if question.get("kind") else 0
            requirement += " Trả lời là một thời điểm hợp lý trong ngày. Định dạng HH (00-23) và MM (00-59)."
            if kind == 1:
                requirement += " Cần cả giây SS (00-59)."
            result = agent.get_answer(TIME_ANSWER).invoke(
                {"question": question["title"], "requiment": requirement},
                config={"configurable": {"session_id": session_id}},
            )
            t = result["structured"]
            entries = [
                (f"entry.{question['questionId']}_hour", t.hour),
                (f"entry.{question['questionId']}_minute", t.minute),
            ]
            if kind == 1:
                entries.append((f"entry.{question['questionId']}_second", t.second))
            return entries
        except Exception as e:
            print(f"AI time failed, fallback used: {e!r}")
            now = datetime.now()
            kind = question.get("kind", [0])[0]
            entries = [
                (f"entry.{question['questionId']}_hour", now.strftime("%H")),
                (f"entry.{question['questionId']}_minute", now.strftime("%M")),
            ]
            if kind == 1:
                entries.append((f"entry.{question['questionId']}_second", now.strftime("%S")))
            return entries
    else:
        result = []
        kind = question["kind"][0]
        date = _safe_convert_to_vn(question.get("content", ""))
        result.append((f"entry.{question['questionId']}_hour", date.strftime("%H")))
        result.append((f"entry.{question['questionId']}_minute", date.strftime("%M")))
        if kind == 1:
            result.append(
                (f"entry.{question['questionId']}_second", date.strftime("%S"))
            )
        return result


def date_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
        try:
            kind = question.get("kind") or [0, 0]
            requirement += " Trả lời là một ngày tháng hợp lý. Định dạng tháng MM (01-12), ngày DD (01-31)."
            if kind[1] == 1:
                requirement += " Cần cả năm YYYY."
            if kind[0] == 1:
                requirement += " Cần cả giờ HH (00-23) và phút MM (00-59)."
            result = agent.get_answer(DATE_ANSWER).invoke(
                {"question": question["title"], "requiment": requirement},
                config={"configurable": {"session_id": session_id}},
            )
            d = result["structured"]
            entries = [
                (f"entry.{question['questionId']}_month", d.month),
                (f"entry.{question['questionId']}_day", d.day),
            ]
            if kind[1] == 1:
                entries.append((f"entry.{question['questionId']}_year", d.year))
            if kind[0] == 1:
                entries.append((f"entry.{question['questionId']}_hour", d.hour))
                entries.append((f"entry.{question['questionId']}_minute", d.minute))
            return entries
        except Exception as e:
            print(f"AI date failed, fallback used: {e!r}")
            now = datetime.now()
            kind = question.get("kind") or [0, 0]
            entries = [
                (f"entry.{question['questionId']}_month", now.strftime("%m")),
                (f"entry.{question['questionId']}_day", now.strftime("%d")),
            ]
            if kind[1] == 1:
                entries.append((f"entry.{question['questionId']}_year", now.strftime("%Y")))
            if kind[0] == 1:
                entries.append((f"entry.{question['questionId']}_hour", now.strftime("%H")))
                entries.append((f"entry.{question['questionId']}_minute", now.strftime("%M")))
            return entries
    else:
        result = []
        kind = question["kind"]
        date = _safe_convert_to_vn(question.get("content", ""))
        result.append((f"entry.{question['questionId']}_month", date.strftime("%m")))
        result.append((f"entry.{question['questionId']}_day", date.strftime("%d")))
        if kind[1] == 1:
            result.append((f"entry.{question['questionId']}_year", date.strftime("%Y")))
        if kind[0] == 1:
            result.append((f"entry.{question['questionId']}_hour", date.strftime("%H")))
            result.append(
                (f"entry.{question['questionId']}_minute", date.strftime("%M"))
            )
        return result


class Sender:
    def __init__(self, person: Dict, title, description):
        print("Sender initialized.")
        self.agent = Agent(person_info=person, title=title, description=description)
        self.session_id = str(uuid.uuid4())

    def _build_answer_once(self, answer):
        page_number = [0]
        data_to_send = []
        for i in range(len(answer)):
            question = answer[str(i)]
            requirement = ""
            if question["mustAnswer"]:
                requirement += (
                    " Đây là một câu hỏi bắt buộc, bạn phải trả lời câu hỏi này. "
                )
            else:
                requirement += " Đây không phải một câu hỏi bắt buộc, bạn có thể trả về 1 câu trả lời rỗng hoặc từ chối trả lời. "
            # 50/50: bỏ qua câu hỏi không bắt buộc có ai_generate
            if (
                not question["mustAnswer"]
                and question["ai_generate"]
                and random.random() < 0.5
            ):
                continue
            print(question)
            # Page count
            if question["type"] == 8:
                page_number.append(page_number[-1] + 1)
                continue

            # For short answer and paragraph
            if question["type"] in [0, 1]:
                # Skip question if no answer
                if (
                    (not question["mustAnswer"])
                    and (question["content"] == "")
                    and (not question["ai_generate"])
                ):
                    continue
                result = paragraph_answer(
                    question, self.agent, self.session_id, requirement=requirement
                )
                if result is not None:
                    data_to_send.append(result)

            # For multiple choice, dropdown, linear scale and rank
            elif question["type"] in [2, 3, 5, 18]:
                # Skip question if no answer
                if (
                    (not question["mustAnswer"])
                    and (sum(question["ratios"].values()) == 0)
                    and (not question["ai_generate"])
                ):
                    continue
                result = multiple_choice_answer(
                    question, self.agent, self.session_id, requirement=requirement
                )
                if result is not None:
                    if isinstance(result[0], tuple):
                        data_to_send.extend(result)
                    else:
                        data_to_send.append(result)

            # For check box
            elif question["type"] == 4:
                # Skip question if no answer
                if (
                    (not question["mustAnswer"])
                    and (sum(question["ratios"].values()) == 0)
                    and (not question["ai_generate"])
                ):
                    continue
                result = check_box_answer(
                    question, self.agent, self.session_id, requirement=requirement
                )
                if result is not None:
                    data_to_send.extend(result)

            # For Date
            elif question["type"] == 9:
                # Skip question if no answer
                if (
                    (not question["mustAnswer"])
                    and (question["content"] == "")
                    and (not question["ai_generate"])
                ):
                    continue
                result = date_answer(
                    question, self.agent, self.session_id, requirement=requirement
                )
                if result is not None:
                    data_to_send.extend(result)

            # For Time
            elif question["type"] == 10:
                # Skip question if no answer
                if (
                    (not question["mustAnswer"])
                    and (question["content"] == "")
                    and (not question["ai_generate"])
                ):
                    continue
                result = time_answer(
                    question, self.agent, self.session_id, requirement=requirement
                )
                if result is not None:
                    data_to_send.extend(result)

        data_to_send.append(("pageHistory", ",".join(map(str, (page_number)))))
        return data_to_send

    def _validate_prepared_answer(self, answer, data_to_send):
        field_values = {}
        for key, value in data_to_send:
            field_values.setdefault(key, []).append(value)

        issues = []

        for i in range(len(answer)):
            question = answer[str(i)]
            q_type = question.get("type")
            qid = question.get("questionId")
            must_answer = bool(question.get("mustAnswer"))
            entry_key = f"entry.{qid}"

            if q_type == 8:
                continue

            if q_type in [0, 1]:
                values = field_values.get(entry_key, [])
                text = str(values[0]).strip() if values else ""
                if must_answer and text == "":
                    issues.append(f"Q{qid}: required paragraph is empty")
                if text and _contains_prompt_leak(text):
                    issues.append(f"Q{qid}: prompt instruction leaked into answer")

            elif q_type in [2, 3, 5, 18]:
                values = field_values.get(entry_key, [])
                selected = str(values[0]).strip() if values else ""
                allowed = set((question.get("ratios") or {}).keys())
                allowed_no_other = {v for v in allowed if v != ""}

                if must_answer and selected == "":
                    issues.append(f"Q{qid}: required single-choice is empty")

                if selected and selected != "__other_option__" and selected not in allowed_no_other:
                    issues.append(f"Q{qid}: single-choice value is not in options")

                if selected == "__other_option__":
                    other_key = f"entry{qid}.other_option_response"
                    other_text = str(field_values.get(other_key, [""])[0]).strip()
                    if other_text == "":
                        issues.append(f"Q{qid}: other option selected but missing text")

            elif q_type == 4:
                values = [str(v).strip() for v in field_values.get(entry_key, [])]
                allowed = set((question.get("ratios") or {}).keys())
                allowed_no_other = {v for v in allowed if v != ""}

                if must_answer and len(values) == 0:
                    issues.append(f"Q{qid}: required checkbox has no selected value")

                for selected in values:
                    if selected == "__other_option__":
                        other_key = f"entry{qid}.other_option_response"
                        other_text = str(field_values.get(other_key, [""])[0]).strip()
                        if other_text == "":
                            issues.append(
                                f"Q{qid}: checkbox other option selected but missing text"
                            )
                    elif selected and selected not in allowed_no_other:
                        issues.append(f"Q{qid}: checkbox value is not in options")

            elif q_type == 9:
                kind = question.get("kind") or [0, 0]
                month = str(field_values.get(f"entry.{qid}_month", [""])[0]).strip()
                day = str(field_values.get(f"entry.{qid}_day", [""])[0]).strip()
                year = str(field_values.get(f"entry.{qid}_year", [""])[0]).strip()
                hour = str(field_values.get(f"entry.{qid}_hour", [""])[0]).strip()
                minute = str(field_values.get(f"entry.{qid}_minute", [""])[0]).strip()

                if must_answer and (month == "" or day == ""):
                    issues.append(f"Q{qid}: required date is incomplete")

                if month and (not month.isdigit() or not (1 <= int(month) <= 12)):
                    issues.append(f"Q{qid}: invalid month")
                if day and (not day.isdigit() or not (1 <= int(day) <= 31)):
                    issues.append(f"Q{qid}: invalid day")
                if kind[1] == 1 and year and (not year.isdigit() or len(year) < 4):
                    issues.append(f"Q{qid}: invalid year")
                if kind[0] == 1:
                    if hour and (not hour.isdigit() or not (0 <= int(hour) <= 23)):
                        issues.append(f"Q{qid}: invalid hour")
                    if minute and (not minute.isdigit() or not (0 <= int(minute) <= 59)):
                        issues.append(f"Q{qid}: invalid minute")

            elif q_type == 10:
                kind = question.get("kind") or [0]
                hour = str(field_values.get(f"entry.{qid}_hour", [""])[0]).strip()
                minute = str(field_values.get(f"entry.{qid}_minute", [""])[0]).strip()
                second = str(field_values.get(f"entry.{qid}_second", [""])[0]).strip()

                if must_answer and (hour == "" or minute == ""):
                    issues.append(f"Q{qid}: required time is incomplete")

                if hour and (not hour.isdigit() or not (0 <= int(hour) <= 23)):
                    issues.append(f"Q{qid}: invalid hour")
                if minute and (not minute.isdigit() or not (0 <= int(minute) <= 59)):
                    issues.append(f"Q{qid}: invalid minute")
                if kind[0] == 1 and second and (not second.isdigit() or not (0 <= int(second) <= 59)):
                    issues.append(f"Q{qid}: invalid second")

        return len(issues) == 0, issues

    def prepare_answer(self, answer, max_regenerate_attempts: int = 3):
        last_candidate = []
        for attempt in range(1, max_regenerate_attempts + 1):
            candidate = self._build_answer_once(answer)
            is_valid, issues = self._validate_prepared_answer(answer, candidate)
            if is_valid:
                print(candidate)
                return candidate

            last_candidate = candidate
            print(
                f"Prepared answer validation failed (attempt {attempt}/{max_regenerate_attempts}): {issues}"
            )

        # Fallback: return the latest candidate to keep flow alive,
        # but it was already logged as invalid above.
        print(last_candidate)
        return last_candidate

    def send(
        self, link: str, answer: List[Tuple[str, str]]
    ) -> Dict[str, Optional[object]]:
        if link.endswith("edit"):
            link = link[:-4] + "formResponse" if len(link) > 4 else ""

        try:
            response = requests.post(url=link, data=answer, timeout=15)
            response.raise_for_status()
            return {
                "success": True,
                "status": response.status_code,
                "error": None,
                "response": response,
            }

        except requests.exceptions.MissingSchema:
            return {
                "success": False,
                "status": None,
                "error": "URL không hợp lệ (MissingSchema)",
                "response": None,
            }

        except requests.exceptions.InvalidURL:
            return {
                "success": False,
                "status": None,
                "error": "URL sai định dạng",
                "response": None,
            }

        except requests.exceptions.ConnectTimeout:
            return {
                "success": False,
                "status": None,
                "error": "Kết nối server bị timeout",
                "response": None,
            }

        except requests.exceptions.ReadTimeout:
            return {
                "success": False,
                "status": None,
                "error": "Server phản hồi quá lâu",
                "response": None,
            }

        except requests.exceptions.ConnectionError:
            return {
                "success": False,
                "status": None,
                "error": "Không thể kết nối tới server",
                "response": None,
            }

        except requests.exceptions.HTTPError as e:
            return {
                "success": False,
                "status": e.response.status_code if e.response else None,
                "error": f"Lỗi HTTP: {e}",
                "response": e.response,
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "status": None,
                "error": f"Lỗi khác: {e}",
                "response": None,
            }
