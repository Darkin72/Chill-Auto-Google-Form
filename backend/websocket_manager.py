import asyncio
import json
from typing import List, Dict, Any, Optional
from fastapi import WebSocket
import time


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # Thay đổi cấu trúc để theo dõi job của từng worker
        self.worker_jobs: Dict[str, Dict[str, Any]] = {}  # worker_id -> job_info
        self.last_updated = time.time()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Gửi thông tin workers hiện tại cho client mới kết nối
        await self.send_worker_jobs_to_client(websocket)
        print(
            f"WebSocket client connected. Total connections: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(
            f"WebSocket client disconnected. Total connections: {len(self.active_connections)}"
        )

    async def send_worker_jobs_to_client(self, websocket: WebSocket):
        try:
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "worker_jobs",
                        "data": {
                            "workers": self.worker_jobs,
                            "last_updated": self.last_updated,
                        },
                    }
                )
            )
        except:
            # Connection might be closed
            self.disconnect(websocket)

    async def broadcast_worker_jobs(self):
        if not self.active_connections:
            return

        self.last_updated = time.time()
        message = json.dumps(
            {
                "type": "worker_jobs",
                "data": {
                    "workers": self.worker_jobs,
                    "last_updated": self.last_updated,
                },
            }
        )

        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)

        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def update_worker_job(
        self, worker_id: str, job_info: Optional[Dict[str, Any]]
    ):
        """Cập nhật job hiện tại của worker"""
        if job_info is None:
            # Worker đang idle (không có job)
            self.worker_jobs[worker_id] = {
                "status": "idle",
                "job": None,
                "started_at": None,
            }
        else:
            # Worker đang làm job
            self.worker_jobs[worker_id] = {
                "status": "working",
                "job": job_info,
                "started_at": time.time(),
            }

        await self.broadcast_worker_jobs()

    async def remove_worker(self, worker_id: str):
        """Remove worker khi worker dừng"""
        if worker_id in self.worker_jobs:
            del self.worker_jobs[worker_id]
            await self.broadcast_worker_jobs()


# Global instance
websocket_manager = WebSocketManager()
