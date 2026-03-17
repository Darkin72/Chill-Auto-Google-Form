from __future__ import annotations

import asyncio
import contextlib
import random
from typing import Callable, Dict, List
from Sender import Sender
from database.DatabaseConnector import DatabaseConnector
from type import FormOut

# Import websocket_manager để gửi thông tin realtime
try:
    from websocket_manager import websocket_manager
except ImportError:
    websocket_manager = None


class Worker:
    def __init__(self, connector: DatabaseConnector):
        self.connector = connector
        self.worker_id = f"worker_{id(self)}"  # Unique ID cho worker
        print(f"Worker initialized with ID: {self.worker_id}")

    async def send_form(self, form: FormOut):
        persons = await self.connector.get_random_person(1)
        if not persons:
            raise RuntimeError("Không có persona nào trong database")
        random_person = persons[0]
        sender = Sender(
            person=random_person.model_dump(),
            title=form.title,
            description=form.description,
        )
        prepared_answer = sender.prepare_answer(form.answer)
        response = sender.send(form.link, prepared_answer)
        return response

    async def run_once(
        self,
        stop_event: asyncio.Event,
        supervisor: "WorkerSupervisor",
    ) -> None:
        job = await self.connector.find_job()
        if not job:
            # Worker đang idle
            if websocket_manager:
                await websocket_manager.update_worker_job(self.worker_id, None)

            try:
                await asyncio.wait_for(stop_event.wait(), timeout=2.0)
            except asyncio.TimeoutError:
                pass
            return

        job_id = str(job.id)
        cancel_event = await supervisor.register_running_job(job_id)

        try:
            status = job.status
            loop = job.repeat["times"] - job.process
            for _ in range(loop):
                if stop_event.is_set() or cancel_event.is_set():
                    raise asyncio.CancelledError()

                if job.repeat["randomize"]:
                    count_time = random.randint(0, 720)
                else:
                    count_time = (
                        job.repeat["repeat"]["minutes"] * 60
                        + job.repeat["repeat"]["seconds"]
                    )
                # Đếm ngược với khả năng cancel
                for i in range(count_time):
                    if stop_event.is_set() or cancel_event.is_set():
                        raise asyncio.CancelledError()

                    remaining_time = count_time - i
                    if websocket_manager:
                        job_info = {
                            "id": job_id,
                            "title": job.title,
                            "link": job.link,
                            "status": status,
                            "process": job.process,
                            "total_repeat": job.repeat["times"],
                            "remaining_time": remaining_time,  # Chỉ gửi thời gian còn lại
                        }
                        await websocket_manager.update_worker_job(
                            self.worker_id, job_info
                        )

                    await asyncio.sleep(1)
                response = await self.send_form(job)
                if response["success"]:
                    job.process += 1
                    if job.process == job.repeat["times"]:
                        status = "SUCCEEDED"

                    ok = await self.connector.update_job(job_id, status, job.process)
                    if not ok:
                        raise RuntimeError("Không thể kết nối tới Database")

                    # Cập nhật progress của job
                    if websocket_manager:
                        job_info = {
                            "id": job_id,
                            "title": job.title,
                            "link": job.link,
                            "status": status,
                            "process": job.process,
                            "total_repeat": job.repeat["times"],
                        }
                        await websocket_manager.update_worker_job(
                            self.worker_id, job_info
                        )
                else:
                    print("Gửi form thất bại: ", response["error"])
                    ok = await self.connector.update_job(job_id, "FAILED", job.process)
                    if not ok:
                        raise RuntimeError("Không thể kết nối tới Database")

            # Job hoàn thành, worker về trạng thái idle
            if websocket_manager:
                await websocket_manager.update_worker_job(self.worker_id, None)

        except asyncio.CancelledError:
            try:
                await self.connector.update_job(job_id, "CANCELED", job.process)
                # Worker về trạng thái idle khi job bị cancel
                if websocket_manager:
                    await websocket_manager.update_worker_job(self.worker_id, None)
            finally:
                raise
        except Exception as e:
            # Xử lý tất cả các lỗi khác (worker crash, network error, database error, etc.)
            error_type = type(e).__name__
            print(
                f"Worker {self.worker_id} gặp lỗi {error_type} khi xử lý job {job_id}: {e!r}"
            )
            try:
                await self.connector.update_job(job_id, "FAILED", job.process)
                print(
                    f"Đã cập nhật trạng thái job {job_id} thành FAILED do lỗi {error_type}"
                )
            except Exception as update_error:
                print(f"Không thể cập nhật trạng thái job {job_id}: {update_error!r}")

            # Worker về trạng thái idle khi có lỗi
            if websocket_manager:
                try:
                    await websocket_manager.update_worker_job(self.worker_id, None)
                except Exception as ws_error:
                    print(
                        f"Không thể cập nhật trạng thái worker qua websocket: {ws_error!r}"
                    )
        finally:
            await supervisor.deregister_job(job_id)

    async def find_job(
        self,
        stop_event: asyncio.Event,
        supervisor: "WorkerSupervisor",
    ) -> None:
        while not stop_event.is_set():
            await self.run_once(stop_event, supervisor)


class WorkerSupervisor:
    def __init__(self, worker_factory: Callable[[], "Worker"], pool_size: int = 1):
        """
        worker_factory: hàm tạo ra 1 Worker mới (mỗi task sẽ gọi factory để có instance riêng)
        pool_size: số worker chạy song song trong cùng process
        """
        self.worker_factory = worker_factory
        self.pool_size = pool_size
        self.stop_event = asyncio.Event()
        self.tasks: list[asyncio.Task] = []
        self.workers: list[Worker] = []  # Track workers để có thể xóa khỏi WebSocket

        self._job_cancel_events: Dict[str, asyncio.Event] = {}
        self._job_lock = asyncio.Lock()

    def start(self):
        if self.tasks:
            return
        for i in range(self.pool_size):
            w = self.worker_factory()
            self.workers.append(w)
            self.tasks.append(asyncio.create_task(self._run_worker(w)))

        print(f"Started {self.pool_size} workers")

    async def stop(self):
        self.stop_event.set()

        # Xóa tất cả workers khỏi tracking
        if websocket_manager:
            for worker in self.workers:
                await websocket_manager.remove_worker(worker.worker_id)

        for t in self.tasks:
            t.cancel()
        for t in self.tasks:
            with contextlib.suppress(Exception):
                await t
        self.tasks.clear()
        self.workers.clear()

    async def cancel_job(self, job_id: str) -> bool:
        async with self._job_lock:
            ev = self._job_cancel_events.get(job_id)
            if ev:
                ev.set()
                return True
            return False

    async def register_running_job(self, job_id: str) -> asyncio.Event:
        ev = asyncio.Event()
        async with self._job_lock:
            self._job_cancel_events[job_id] = ev
        return ev

    async def deregister_job(self, job_id: str):
        async with self._job_lock:
            self._job_cancel_events.pop(job_id, None)

    def get_running_jobs(self) -> List[str]:
        """Lấy danh sách job đang chạy"""
        return list(self._job_cancel_events.keys())

    # Vòng đời của MỘT worker (chạy trong một Task)
    async def _run_worker(self, worker: "Worker"):
        backoff = 1.0  # thời gian chờ khi worker CRASH
        while not self.stop_event.is_set():
            try:
                await worker.find_job(self.stop_event, supervisor=self)

                backoff = 1.0
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[Supervisor] worker crashed: {e!r}. restart in {backoff:.1f}s")
                try:
                    await asyncio.wait_for(self.stop_event.wait(), timeout=backoff)
                except asyncio.TimeoutError:
                    pass
                backoff = min(backoff * 2, 30.0)
