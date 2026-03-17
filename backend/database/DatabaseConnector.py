from asyncpg import RaiseError
from type import Form, FormOut, Person
from typing import Optional
from dotenv import load_dotenv
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, bindparam
from sqlalchemy.dialects.postgresql import JSONB

load_dotenv()

DATABASE_URL = f"postgresql+asyncpg://{os.environ.get('POSTGRES_USER', '')}:{os.environ.get('POSTGRES_PASSWORD', '')}@localhost:{os.environ.get('POSTGRES_PORT', '')}/{os.environ.get('POSTGRES_DB', '')}"


class DatabaseConnector:
    def __init__(self):
        self.engine = create_async_engine(
            DATABASE_URL,
            pool_size=5,  # số kết nối trong pool
            max_overflow=10,  # kết nối vượt mức cho burst
        )

    async def add_form(self, form: Form):
        query = text(
            """
        INSERT INTO forms (title, description, link, answer, repeat, status, process) 
        VALUES (:title, :description, :link, :answer, :repeat, :status, :process)
        RETURNING id
        """
        ).bindparams(
            bindparam("answer", type_=JSONB),
            bindparam("repeat", type_=JSONB),
        )
        async with self.engine.begin() as bonn:
            result = await bonn.execute(query, form.model_dump())
            new_id = result.scalar()
            return new_id

    async def get_form(
        self,
        title: Optional[str] = None,
        link: Optional[str] = None,
        status: Optional[str] = None,
        created_at: Optional[str] = None,
        limit=10,
        offset=0,
    ):
        query = "SELECT * FROM forms"
        conditions = []
        params = {}

        if title:
            conditions.append("title = :title")
            params["title"] = title

        if link:
            conditions.append("link = :link")
            params["link"] = link

        if status:
            conditions.append("status = :status")
            params["status"] = status

        if created_at:
            conditions.append("created_at = :created_at")
            params["created_at"] = created_at

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY created_at DESC, status ASC LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset

        async with self.engine.connect() as conn:
            result = await conn.execute(text(query), params)
            rows = result.mappings().all()
            return [FormOut(**row) for row in rows]

    async def count_form(
        self,
        title: Optional[str] = None,
        link: Optional[str] = None,
        status: Optional[str] = None,
        created_at: Optional[str] = None,
    ):
        query = "SELECT COUNT(*) FROM forms"
        conditions = []
        params = {}

        if title:
            conditions.append("title = :title")
            params["title"] = title

        if link:
            conditions.append("link = :link")
            params["link"] = link

        if status:
            conditions.append("status = :status")
            params["status"] = status

        if created_at:
            conditions.append("created_at = :created_at")
            params["created_at"] = created_at

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        async with self.engine.connect() as conn:
            result = await conn.execute(text(query), params)
            return result.scalar_one()

    async def delete_form_by_id(self, form_id: str):
        """Xóa form theo ID và trả về số dòng bị ảnh hưởng"""
        query = text("DELETE FROM forms WHERE id = :form_id")
        params = {"form_id": form_id}

        async with self.engine.begin() as bonn:
            result = await bonn.execute(query, params)
            return result.rowcount

    async def find_job(self):
        query = text(
            """
            WITH cte AS (
                SELECT id
                FROM forms
                WHERE status = 'QUEUED'
                OR (status = 'RUNNING' AND updated_at < now() - interval '13 minutes')
                ORDER BY created_at
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            )
            UPDATE forms
            SET status = 'RUNNING', updated_at = now()
            WHERE id IN (SELECT id FROM cte)
            RETURNING *;
            """
        )
        async with self.engine.begin() as bonn:
            result = await bonn.execute(query)
            row = result.mappings().first()
            return FormOut(**row) if row else None

    async def update_job(self, job_id: str, status: str, process: int):
        query = text(
            """
        UPDATE forms
        SET status = :status,
            process = :process
        WHERE id = :id
        RETURNING id
        """
        )
        async with self.engine.begin() as bonn:
            result = await bonn.execute(
                query, {"id": job_id, "status": status, "process": process}
            )
            if result.scalar_one_or_none() is None:
                return False
            return True

    async def get_form_by_id(self, form_id: str):
        """Get a specific form by its ID"""
        query = text("SELECT * FROM forms WHERE id = :form_id")
        params = {"form_id": form_id}

        async with self.engine.connect() as conn:
            result = await conn.execute(query, params)
            row = result.mappings().first()
            return FormOut(**row) if row else None

    async def get_form_queue(self):
        query = text(
            """
        SELECT *
        FROM forms
        WHERE status IN ('QUEUED', 'RUNNING')
        ORDER BY (status = 'RUNNING') DESC, created_at
        """
        )
        async with self.engine.connect() as conn:
            result = await conn.execute(query)
            rows = result.mappings().all()
            return [FormOut(**row) for row in rows]

    async def retry_job(self, job_id: str):
        """Đặt lại job FAILED/CANCELED về QUEUED để worker xử lý lại."""
        query = text(
            """
            UPDATE forms
            SET status = 'QUEUED', updated_at = now()
            WHERE id = :id AND status IN ('FAILED', 'CANCELED')
            RETURNING id, status
            """
        )
        async with self.engine.begin() as conn:
            result = await conn.execute(query, {"id": job_id})
            row = result.mappings().first()
            return row is not None

    async def get_random_person(self, count: int):
        query = text(
            """
                     SELECT * FROM persona TABLESAMPLE SYSTEM_ROWS (:count);
                     """
        )
        params = {"count": count}

        async with self.engine.connect() as conn:
            result = await conn.execute(query, params)
            rows = result.mappings().all()
            return [Person(**row) for row in rows]

    async def close(self):
        """Đóng engine và giải phóng tài nguyên"""
        await self.engine.dispose()


if __name__ == "__main__":
    connector = DatabaseConnector()
