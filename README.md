# Auto Google Form

Auto Google Form là ứng dụng full-stack giúp:

- Trích xuất cấu trúc câu hỏi từ Google Form.
- Sinh câu trả lời bằng AI theo persona.
- Gửi hàng loạt với worker pool.
- Theo dõi tiến trình theo thời gian thực.
- Lưu lịch sử gửi form trong PostgreSQL.

Repository này được tối ưu cho local development bằng Docker Compose và có sẵn giao diện web để vận hành.

## Mục Lục

- Tính năng chính
- Kiến trúc hệ thống
- Cấu trúc thư mục
- Yêu cầu môi trường
- Cài đặt nhanh bằng Docker
- Chạy local không Docker (tuỳ chọn)
- Biến môi trường
- API chính
- Quy trình dữ liệu persona
- Troubleshooting
- Bảo mật và lưu ý khi public
- Roadmap
- Đóng góp
- License

## Tính năng chính

- Extract Google Form thành schema nội bộ.
- Sinh câu trả lời AI theo thông tin persona.
- Worker Supervisor quản lý queue job.
- Retry job FAILED/CANCELED qua API và UI.
- Theo dõi worker qua WebSocket.
- Trang lưu trữ có phân trang, xoá, retry đơn lẻ và retry hàng loạt.

## Kiến trúc hệ thống

- Frontend:
	- React + Vite + Ant Design + Tailwind.
	- Gọi REST API và nhận trạng thái worker qua WebSocket.
- Backend:
	- FastAPI + SQLAlchemy async + worker background.
	- Tích hợp LLM qua LangChain để sinh câu trả lời.
- Database:
	- PostgreSQL lưu forms, trạng thái xử lý, persona.

Luồng tổng quát:

1. Frontend gửi link Google Form lên backend.
2. Backend extract câu hỏi và trả schema.
3. Frontend submit cấu hình trả lời + số lần lặp.
4. Worker lấy job từ DB, sinh câu trả lời, validate, gửi Google Form.
5. Trạng thái job được cập nhật liên tục để UI hiển thị.

## Cấu trúc thư mục

- backend: API, worker, logic AI, database connector.
- frontend: giao diện quản lý và theo dõi tiến trình.
- docker: Dockerfiles, docker-compose, biến môi trường dùng chung.
- database:
	- init: SQL schema khởi tạo.
	- data: persona JSON.

## Yêu cầu môi trường

Tối thiểu:

- Docker Desktop (kèm Docker Compose).
- Git.

Nếu chạy local không Docker:

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+

## Cài đặt nhanh bằng Docker

Bước 1: Tạo file env từ template.

Windows PowerShell:

```powershell
Copy-Item .\docker\.env.example .\docker\.env
```

macOS/Linux:

```bash
cp ./docker/.env.example ./docker/.env
```

Bước 2: Mở `docker/.env` và chỉnh các giá trị cần thiết (đặc biệt là `OPENAI_API_KEY`).

Bước 3: Chạy từ thư mục gốc project:

```powershell
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml up -d --build
```

Kiểm tra trạng thái:

```powershell
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml ps
```

Truy cập dịch vụ:

- Frontend: http://localhost:5230
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs

Xem log:

```powershell
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml logs -f backend
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml logs -f frontend
```

Dừng dịch vụ:

```powershell
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml down
```

### Lưu ý đường dẫn khi đứng trong backend

Nếu terminal đang ở thư mục backend thì phải dùng đường dẫn `..\docker`.

```powershell
docker compose --env-file ..\docker\.env -f ..\docker\docker-compose.yml up -d --build
```

## Bật thêm pgAdmin (tuỳ chọn)

Service pgadmin dùng profile tools:

```powershell
docker compose --profile tools --env-file .\docker\.env -f .\docker\docker-compose.yml up -d pgadmin
```

Truy cập: http://localhost:5050

Tắt pgAdmin:

```powershell
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml stop pgadmin
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml rm -f pgadmin
```

## Chạy local không Docker (tuỳ chọn)

### Backend

```powershell
Set-Location .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app:app --host localhost --port 8000 --log-level info
```

### Frontend

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Frontend đã cấu hình lấy env từ thư mục docker, nên vẫn dùng chung biến môi trường.

## Biến môi trường

Nguồn cấu hình chính là docker/.env.

File theo thứ tự sử dụng:

- `docker/.env.example`: template để clone/copy.
- `docker/.env`: file cấu hình thực tế khi chạy local hoặc Docker Compose.
- `backend/.env`: chỉ là fallback tương thích, ưu tiên luôn dùng `docker/.env`.

Các biến quan trọng:

- POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- BACKEND_PORT, PORT
- VITE_API_BASE_URL, VITE_WS_BASE_URL, VITE_WORKERS_NUMBER
- MODEL, MODEL_NAME, OPENAI_API_KEY, WORKERS_NUMBER
- CORS_ORIGINS

Khởi tạo env mới từ template:

```powershell
Copy-Item .\docker\.env.example .\docker\.env
```

Hoặc trên macOS/Linux:

```bash
cp ./docker/.env.example ./docker/.env
```

## API chính

Một số endpoint tiêu biểu:

- POST /submit-link
- POST /submit-answer
- GET /get-forms
- GET /get-count-forms
- DELETE /delete-form/{form_id}
- POST /cancel-form/{form_id}
- POST /retry-form/{form_id}
- GET /get-form-queue
- WS /ws/worker-monitor

## Quy trình dữ liệu persona

Dữ liệu persona chuẩn nằm trong database/data dạng JSON.

Nếu cần reset dữ liệu persona:

```powershell
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml exec postgres psql -U app -d appdb -c "TRUNCATE TABLE persona;"

Set-Location .\backend
.\.venv\Scripts\python.exe import_personas.py
Set-Location ..
```

Kiểm tra nhanh:

```powershell
docker compose --env-file .\docker\.env -f .\docker\docker-compose.yml exec postgres psql -U app -d appdb -c "SELECT COUNT(*) FROM persona;"
```

## Troubleshooting

### 1) Không tìm thấy env file khi chạy compose

Nguyên nhân: chạy từ thư mục backend nhưng dùng đường dẫn .\docker\.

Giải pháp:

```powershell
docker compose --env-file ..\docker\.env -f ..\docker\docker-compose.yml up -d --build
```

### 2) OPTIONS 400 Bad Request

Lỗi CORS preflight. Kiểm tra CORS_ORIGINS trong docker/.env có domain frontend hiện tại chưa.

### 3) Google formResponse trả 400

Thường do dữ liệu không hợp lệ với validation của Google Form (option sai, định dạng sai, rò prompt instruction vào answer).

Backend đã có bước validate trước khi gửi và tự regenerate answer khi phát hiện sai format.

### 4) Failed to canonicalize script path (Windows)

Ưu tiên chạy uvicorn qua module:

```powershell
python -m uvicorn app:app --host localhost --port 8000
```

## Bảo mật và lưu ý khi public

- Không commit file docker/.env chứa secret.
- Sử dụng key riêng cho môi trường test/dev.
- Hạn chế log dữ liệu nhạy cảm (nội dung form, API key).
- Tôn trọng Terms of Service của Google Forms và website đích.
- Chỉ dùng cho mục đích hợp pháp, có sự cho phép của chủ biểu mẫu.

## Roadmap

- Thêm test tự động cho luồng worker và sender.
- Nâng chất lượng validate từng loại question.
- Thêm metrics và dashboard theo dõi throughput.
- Tối ưu chunk frontend để giảm bundle size.

## Đóng góp

Rất hoan nghênh Pull Request.

Quy trình đề xuất:

1. Fork repository.
2. Tạo branch mới theo tính năng hoặc bugfix.
3. Viết code + tự kiểm tra local.
4. Mô tả rõ thay đổi trong PR (mục tiêu, cách test, ảnh chụp nếu có UI).

## License

MIT (xem thư mục frontend có LICENSE hiện tại). Nếu bạn muốn chuẩn hoá cho toàn repo, có thể thêm LICENSE ở thư mục gốc.
