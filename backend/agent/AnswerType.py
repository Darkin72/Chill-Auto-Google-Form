from typing import List, Literal, Optional
from typing_extensions import Annotated
from pydantic import BaseModel, Field, field_validator, model_validator
from pydantic.types import StringConstraints
import math

# ---------- Language ----------
LanguageLevel = Literal["native", "beginner", "intermediate", "advanced"]


class Language(BaseModel):
    code: Annotated[
        str,
        StringConstraints(
            min_length=2, max_length=2, pattern=r"^[a-z]{2}$", strip_whitespace=True
        ),
    ] = Field(..., description="Mã ISO-639-1 viết thường: vi, en, ru, ...")

    level: LanguageLevel = Field(
        ...,
        description="native|beginner|intermediate|advanced. Nếu code=vi, buộc là native.",
    )

    @field_validator("code")
    def code_to_lower(cls, v: str) -> str:
        return v.lower()

    @model_validator(mode="after")
    def ensure_vi_native(self):
        if self.code == "vi" and self.level != "native":
            object.__setattr__(self, "level", "native")
        return self


# ---------- Work & Education ----------
class Education(BaseModel):
    level: str = Field(..., description="Trình độ học vấn (tiếng Việt)")
    university: str = Field(..., description="Tên trường (tiếng Việt)")

    @model_validator(mode="before")
    def translate_education(cls, values):
        # Dịch level
        level_en = (values.get("level") or "").strip()
        level_map = {
            "Bachelor's Degree": "Cử nhân",
            "Master's Degree": "Thạc sĩ",
            "Doctorate": "Tiến sĩ",
            "High School": "Trung học phổ thông",
            "Associate's Degree": "Cao đẳng",
        }
        if level_en in level_map:
            values["level"] = level_map[level_en]
        return values


class WorkEducation(BaseModel):
    job_title: str = Field(..., description="Chức danh (tiếng Việt)")
    employer: str = Field(..., description="Tên công ty (tiếng Việt)")
    education: Education
    # Pool 20 skills để LLM chọn ngẫu nhiên sau này (bạn có thể thêm trường skills_chosen riêng nếu muốn)
    skills: List[str] = Field(
        ..., description="Danh sách 20 kỹ năng để LLM chọn ngẫu nhiên"
    )
    # Input USD/năm để chuẩn hoá sang VND/tháng
    salary_usd_per_year: float = Field(..., ge=0, description="Mức lương gốc USD/năm")
    salary_vnd_per_month: int = Field(
        0, description="Mức lương đã chuẩn hoá sang VND/tháng (tự động tính)"
    )

    # Tham số chuyển đổi có thể điều chỉnh
    usd_to_vnd_rate: int = Field(
        25000, description="Tỷ giá USD→VND dùng cho chuẩn hoá (mặc định 25,000)"
    )

    @model_validator(mode="before")
    def translate_job_title_and_employer(cls, values):
        # job_title: dịch EN->VI theo mapping
        jt_en = (values.get("job_title") or "").strip()
        jt_map = {
            "Elementary and Secondary School Administrators": "Quản trị viên trường Tiểu học và Trung học"
        }
        if jt_en in jt_map:
            values["job_title"] = jt_map[jt_en]
        # employer: yêu cầu là tên công ty tiếng Việt — giả định đầu vào đã là TV hoặc do LLM sinh
        # Nếu bạn muốn auto chuyển "Company"->"Công ty" v.v..., thêm quy tắc đơn giản:
        emp = (values.get("employer") or "").strip()
        if emp:
            values["employer"] = emp.replace("Company", "Công ty").replace(
                "Group", "Tập đoàn"
            )
        return values

    @model_validator(mode="after")
    def normalize_salary(self):
        # salary_vnd_per_month = (USD_year / 16) * rate / 12
        usd_year = float(self.salary_usd_per_year)
        adjusted_usd_year = usd_year / 16.0
        vnd_month = adjusted_usd_year * float(self.usd_to_vnd_rate) / 12.0
        # làm tròn về nghìn đồng
        object.__setattr__(
            self, "salary_vnd_per_month", int(math.floor(vnd_month / 1000.0) * 1000)
        )
        return self


# ---------- PERSONALITY-----------
class Personality(BaseModel):
    tone_style: List[str] = Field(
        default_factory=list,
        description=(
            "Danh sách phong cách giọng điệu, ví dụ: ['hài hước', 'nghiêm túc', 'trang trọng', 'thân thiện']"
        ),
    )
    values: List[str] = Field(
        default_factory=list,
        description=(
            "Danh sách giá trị, niềm tin cốt lõi của nhân vật, ví dụ: ['tự do', 'gia đình', 'sáng tạo', 'kỷ luật']"
        ),
    )
    signature_phrases: List[str] = Field(
        default_factory=list,
        description=(
            "Các câu nói cửa miệng hoặc đặc trưng, ví dụ: ['Bạn hiểu mà!', 'Thật tuyệt vời!', 'Không đời nào!']"
        ),
    )


# ---------- PREFERENCES ----------
class Preferences(BaseModel):
    music: List[str] = Field(
        default_factory=list,
        description=(
            "Danh sách các bài hát mà nhân vật yêu thích vd ['Buông đôi tay nhau ra', 'Yêu 5', 'All Fall Down']"
        ),
    )
    movies: List[str] = Field(
        default_factory=list,
        description=(
            "Danh sách các bộ phim mà nhân vật yêu thích vd ['Mưa đỏ', 'End game', 'One Piece']"
        ),
    )
    food: List[str] = Field(
        default_factory=list,
        description=(
            "Danh sách các món ăn mà nhân vật yêu thích vd ['Phở', 'Bánh mỳ', 'Hamburger']"
        ),
    )
    sports: List[str] = Field(
        default_factory=list,
        description=(
            "Danh sách các môn thể thao mà nhân vật yêu thích vd ['Bóng đá', 'Bóng rổ', 'Cầu lông']"
        ),
    )


# ---------- TIME LINE ----------
class Event(BaseModel):
    time: str = Field(..., description="Thời gian diễn ra sự kiện vd : 2005")
    event_name: str = Field(..., description="Tên sự kiện vd Tốt nghiệp đại học")


# ---------- PERSON FILL ----------
class PERSON_FILL(BaseModel):
    languages: List[Language] = Field(
        ..., description="Tối đa 3 ngôn ngữ; luôn phải có 'vi' (native)."
    )
    work_education: WorkEducation = Field(..., description="Học vấn của nhân vật")
    personality: Personality = Field(..., description="Tính cách của nhân vật")
    preferences: Preferences = Field(..., description="Sở thích của nhân vật")
    timeline: List[Event] = Field(
        ..., description="Danh sách các sự kiện diễn ra trong đời nhân vật"
    )
    thought: str = Field(
        ..., description="Tại sao bạn lại đưa ra kết quả như vậy, giải thích hợp lý"
    )


# ---------- Gợi ý danh sách 20 kỹ năng ----------
DEFAULT_20_SKILLS = [
    "Lập kế hoạch học thuật",
    "Quản lý đội ngũ giáo viên",
    "Đánh giá chất lượng giảng dạy",
    "Thiết kế chương trình đào tạo",
    "Quản trị ngân sách trường",
    "Giao tiếp phụ huynh - nhà trường",
    "Quản lý rủi ro học đường",
    "Xây dựng chính sách nội bộ",
    "Phát triển chuyên môn giáo viên",
    "Phân tích dữ liệu giáo dục",
    "Tư vấn học đường",
    "Quản lý kỷ luật học sinh",
    "An toàn trường học",
    "Đàm phán và hợp tác đối tác",
    "Quản lý sự kiện học đường",
    "Kiểm định & kiểm tra nội bộ",
    "Chuyển đổi số trong giáo dục",
    "Quản trị cơ sở vật chất",
    "Quản lý tuyển sinh",
    "Kỹ năng lãnh đạo",
]


class PARAGRAPH_ANSWER(BaseModel):
    answer: str = Field(
        ...,
        description="Câu trả lời tự nhiên, đúng giọng văn và tính cách của persona. Không sáo rỗng, không dùng câu mẫu.",
    )
    thought: str = Field(
        ...,
        description="Suy nghĩ kĩ xem câu trả lời đã phù hợp với tiêu chí đặt ra chưa",
    )


class MULTIPLE_CHOICE_ANSWER(BaseModel):
    answer: str = Field(
        ...,
        description="Đúng một lựa chọn từ danh sách được cung cấp, giữ nguyên chính tả",
    )
    thought: str = Field(
        ...,
        description="Suy nghĩ kĩ xem câu trả lời đã phù hợp với tiêu chí đặt ra chưa",
    )


class CHECKBOX_ANSWER(BaseModel):
    answers: List[str] = Field(
        default_factory=list,
        description="Danh sách 0 hoặc nhiều lựa chọn từ danh sách được cung cấp, giữ nguyên chính tả",
    )
    thought: str = Field(
        ..., description="Giải thích lý do chọn các mục này dựa trên tính cách persona"
    )


class TIME_ANSWER(BaseModel):
    hour: str = Field(..., description="Giờ theo 24h, định dạng HH (ví dụ: 07, 14, 22)")
    minute: str = Field(..., description="Phút, định dạng MM (ví dụ: 00, 15, 30)")
    second: str = Field("00", description="Giây, định dạng SS, mặc định 00")
    thought: str = Field(..., description="Giải thích lý do chọn thời điểm này")


class DATE_ANSWER(BaseModel):
    month: str = Field(..., description="Tháng, định dạng MM (01-12)")
    day: str = Field(..., description="Ngày, định dạng DD (01-31)")
    year: str = Field(
        "", description="Năm, định dạng YYYY (để trống chuỗi rỗng nếu không yêu cầu)"
    )
    hour: str = Field(
        "", description="Giờ, định dạng HH (để trống chuỗi rỗng nếu không yêu cầu)"
    )
    minute: str = Field(
        "", description="Phút, định dạng MM (để trống chuỗi rỗng nếu không yêu cầu)"
    )
    thought: str = Field(..., description="Giải thích lý do chọn ngày này")
