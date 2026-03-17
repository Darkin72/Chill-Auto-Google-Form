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
import dotenv
import random
import uuid

dotenv.load_dotenv(override=True)


def paragraph_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
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
    else:
        return (f"entry.{question['questionId']}", question["content"])


def multiple_choice_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
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
    else:
        select = random.choices(
            list(question["ratios"].keys()),
            weights=list(question["ratios"].values()),
            k=1,
        )[0]
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
    else:
        result = []
        kind = question["kind"][0]
        date = convert_to_vn(question["content"])
        result.append((f"entry.{question['questionId']}_hour", date.strftime("%H")))
        result.append((f"entry.{question['questionId']}_minute", date.strftime("%M")))
        if kind == 1:
            result.append(
                (f"entry.{question['questionId']}_second", date.strftime("%S"))
            )
        return result


def date_answer(question, agent: Agent, session_id, requirement):
    if question["ai_generate"]:
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
    else:
        result = []
        kind = question["kind"]
        date = convert_to_vn(question["content"])
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

    def prepare_answer(self, answer):
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
        print(data_to_send)
        return data_to_send

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
