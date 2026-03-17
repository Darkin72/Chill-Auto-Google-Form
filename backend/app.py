from Sender import Sender
from database.DatabaseConnector import Form
from Extractor import Extractor
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from type import Link, FinalForm, FeedBack, FormOut
from contextlib import asynccontextmanager
from typing import Optional, List
from Worker import Worker, WorkerSupervisor
from websocket_manager import websocket_manager
from sqlalchemy import text
import os
import re
from utils.env_loader import load_shared_env

from database.DatabaseConnector import DatabaseConnector

# Initialize

load_shared_env(__file__)
FRONT_END_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in re.split(r"[,;&\s]+", os.environ.get("CORS_ORIGINS", ""))
    if origin.strip()
]
CORS_ORIGIN_REGEX = os.environ.get(
    "CORS_ORIGIN_REGEX", r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
)
WORKERS_NUMBER = int(os.environ.get("WORKERS_NUMBER", "1"))

db_connector = DatabaseConnector()


def worker_factory():
    return Worker(db_connector)


supervisor = WorkerSupervisor(worker_factory, pool_size=WORKERS_NUMBER)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 App starting, testing database connection...")
    try:
        # Test connection và warm-up pool
        async with db_connector.engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        await db_connector.close()
        raise e

    # Start pool worker
    print(f"🔄 Starting {WORKERS_NUMBER} workers...")
    supervisor.start()
    print("✅ Workers started!")

    try:
        yield
    finally:
        print("🛑 Shutting down workers...")
        await supervisor.stop()
        await db_connector.close()
        print("🛑 App stopped, engine disposed")


# FastAPI application setup
app = FastAPI(title="Chill backend", lifespan=lifespan)

# Allow CORS for front-end origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONT_END_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.post("/submit-link")
def extract(link: Link):

    # Initialize the Extractor instance
    extractor = Extractor()
    print(f"Received URL: {link.url}")

    # Extract data from the provided URL
    result = extractor.extract(link.url)
    if result is not None:
        # Return the extracted data as a JSON response
        return JSONResponse(content=result, status_code=200)
    return JSONResponse(content={"error": "Failed to extract data"}, status_code=400)


@app.get("/")
def hello():
    return {"message": "Hello, World!"}


@app.post("/submit-answer")
async def submit(form: FinalForm):
    id = await db_connector.add_form(
        Form(
            **form.model_dump(),
            status="QUEUED",
            process=0,
        )
    )

    if id is None:
        return JSONResponse(content="Can not connect to database", status_code=503)
    return JSONResponse(content="Form submitted", status_code=200)


@app.get("/get-forms/", response_model=List[FormOut])
async def list_forms(
    title: Optional[str] = None,
    link: Optional[str] = None,
    status: Optional[str] = None,
    created_at: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
):
    rows = await db_connector.get_form(title, link, status, created_at, limit, offset)
    if rows is None:
        return JSONResponse(content="Can not connect to database", status_code=503)
    return rows


@app.get("/get-count-forms/")
async def total_forms(
    title: Optional[str] = None,
    link: Optional[str] = None,
    status: Optional[str] = None,
    created_at: Optional[str] = None,
):
    result = await db_connector.count_form(title, link, status, created_at)
    if result is None:
        return JSONResponse(content="Can not connect to database", status_code=503)
    return JSONResponse(content=result, status_code=200)


@app.delete("/delete-form/{form_id}")
async def delete_form(form_id: str):
    rows_affected = await db_connector.delete_form_by_id(form_id)

    if rows_affected is None:
        return JSONResponse(content="Can not connect to database", status_code=503)

    if rows_affected == 0:
        return JSONResponse(content={"message": "Form not found"}, status_code=404)

    return JSONResponse(
        content={"message": f"Form {form_id} deleted successfully"}, status_code=200
    )


@app.post("/cancel-form/{form_id}")
async def cancel_form(form_id: str):
    try:
        form = await db_connector.get_form_by_id(form_id)
        if not form:
            return JSONResponse(
                content={"message": f"Form {form_id} not found"}, status_code=404
            )
        success = await supervisor.cancel_job(form_id)
        if success:
            return JSONResponse(
                content={
                    "message": f"Form {form_id} cancellation requested successfully",
                    "form_status": form.status,
                    "current_process": form.process,
                },
                status_code=200,
            )
        else:
            if form.status == "RUNNING":
                return JSONResponse(
                    content={
                        "message": f"Form {form_id} is marked as running but worker is not processing it. It may have been stuck.",
                    },
                    status_code=400,
                )
            elif form.status == "QUEUED":
                success = await db_connector.update_job(
                    form_id, "CANCELED", form.process
                )
                if success:
                    return JSONResponse(
                        content={
                            "message": f"Form {form_id} cancellation requested successfully",
                            "form_status": form.status,
                            "current_process": form.process,
                        },
                        status_code=200,
                    )
            return JSONResponse(
                content={
                    "message": f"Form {form_id} is not currently running (status: {form.status})",
                },
                status_code=400,
            )

    except Exception as e:
        return JSONResponse(
            content={"message": f"Error cancelling form {form_id}: {str(e)}"},
            status_code=500,
        )


@app.post("/submit-feedback")
def receive(feedback: FeedBack):
    print(feedback)
    return JSONResponse(content="Feedback received !", status_code=200)


@app.websocket("/ws/worker-monitor")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Giữ kết nối WebSocket alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)


@app.get("/worker-jobs")
async def get_worker_jobs():
    """API endpoint để lấy thông tin job hiện tại của từng worker"""
    return JSONResponse(
        content={
            "workers": websocket_manager.worker_jobs,
            "last_updated": websocket_manager.last_updated,
        },
        status_code=200,
    )


@app.get("/get-form-queue")
async def get_form_queue():
    rows = await db_connector.get_form_queue()
    if rows is None:
        return JSONResponse(content="Can not connect to database", status_code=503)
    return rows


@app.post("/retry-form/{form_id}")
async def retry_form(form_id: str):
    form = await db_connector.get_form_by_id(form_id)
    if not form:
        return JSONResponse(
            content={"message": f"Form {form_id} not found"}, status_code=404
        )
    if form.status not in ("FAILED", "CANCELED"):
        return JSONResponse(
            content={
                "message": f"Form {form_id} có trạng thái '{form.status}', chỉ retry được FAILED hoặc CANCELED."
            },
            status_code=400,
        )
    success = await db_connector.retry_job(form_id)
    if not success:
        return JSONResponse(content="Can not connect to database", status_code=503)
    return JSONResponse(
        content={
            "message": f"Form {form_id} đã được đặt lại thành QUEUED, worker sẽ xử lý lại."
        },
        status_code=200,
    )
