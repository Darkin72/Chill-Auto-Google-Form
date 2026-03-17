-- ===============================
-- init.sql (minimal, no updated_at)
-- ===============================

-- 0) UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS tsm_system_rows;

-- 1) Enum trạng thái job
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
    CREATE TYPE status_enum AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');
  END IF;
END$$;

-- 2) Bảng forms
CREATE TABLE IF NOT EXISTS forms (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT,
  description TEXT,
  link       TEXT,
  answer    JSONB,
  repeat     JSONB,
  status      status_enum  NOT NULL DEFAULT 'QUEUED',
  process     SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT forms_repeat_shape_chk  CHECK (repeat  IS NULL OR jsonb_typeof(repeat)  = 'object'),
  CONSTRAINT forms_answers_shape_chk CHECK (answer IS NULL OR jsonb_typeof(answer) IN ('object','array'))
);

CREATE TABLE IF NOT EXISTS persona (
  persona_id UUID PRIMARY KEY,

  -- meta
  locale TEXT,
  timezone TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- identity
  name_full TEXT,
  dob DATE,
  gender TEXT,
  nationality TEXT,      

  languages JSONB,
  location_region TEXT,

  appearance JSONB,         

  contacts JSONB,            

  work_education JSONB,     

  personality JSONB,          
  preferences JSONB,         

  timeline JSONB       
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

CREATE INDEX IF NOT EXISTS idx_persona_locale ON persona(locale);
CREATE INDEX IF NOT EXISTS idx_persona_region ON persona(location_region);
CREATE INDEX IF NOT EXISTS idx_persona_languages_gin ON persona USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_persona_timeline_gin ON persona USING GIN(timeline);

-- 5) Trigger auto updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON forms
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON persona
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 6) Persona data is imported separately from JSON files in database/data