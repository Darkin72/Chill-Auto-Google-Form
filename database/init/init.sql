-- ===============================
-- init.sql (minimal, no updated_at)
-- ===============================

-- 0) UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Enum trạng thái job
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
    CREATE TYPE status_enum AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');
  END IF;
END$$;

-- 2) Bảng forms (không có updated_at)
CREATE TABLE IF NOT EXISTS forms (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT,
  link       TEXT,
  answer    JSONB,
  repeat     JSONB,
  status      status_enum  NOT NULL DEFAULT 'QUEUED',
  process     SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT forms_repeat_shape_chk  CHECK (repeat  IS NULL OR jsonb_typeof(repeat)  = 'object'),
  CONSTRAINT forms_answers_shape_chk CHECK (answers IS NULL OR jsonb_typeof(answers) IN ('object','array'))
);

-- 3) Bảng jobs (không có updated_at)
CREATE TABLE IF NOT EXISTS jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  no              INT  NOT NULL,
  status          status_enum NOT NULL DEFAULT 'QUEUED',
  process         SMALLINT,         
  return_message  TEXT,
  response_status SMALLINT,     -- HTTP status (200, 400, ...)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT jobs_response_status_chk CHECK (response_status IS NULL OR response_status BETWEEN 100 AND 599),
  CONSTRAINT jobs_process_chk CHECK (process IS NULL OR process BETWEEN 0 AND 100),
  CONSTRAINT jobs_form_no_uniq UNIQUE (form_id, no)
);

-- 4) Index hữu ích
-- forms
-- Tra cứu nhanh theo link
CREATE INDEX IF NOT EXISTS idx_forms_link ON forms(link);

-- Tra cứu nhanh theo status
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);

-- Nếu hay filter theo created_at (ví dụ lấy form mới nhất)
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at DESC);

-- Index cho JSONB
CREATE INDEX IF NOT EXISTS idx_forms_answer_gin ON forms USING gin(answer);
CREATE INDEX IF NOT EXISTS idx_forms_repeat_gin ON forms USING gin(repeat);

-- jobs
-- Form_id để join với forms
CREATE INDEX IF NOT EXISTS idx_jobs_form_id ON jobs(form_id);

-- Truy vấn theo trạng thái
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Truy vấn lấy job mới nhất
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Kết hợp: hay dùng khi cần biết job theo form + trạng thái
CREATE INDEX IF NOT EXISTS idx_jobs_form_status ON jobs(form_id, status);
