CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE attendance_status AS ENUM ('Present','Absent');
CREATE TYPE od_status AS ENUM ('Pending','Approved','Rejected');
CREATE TYPE user_type_enum AS ENUM ('Student','Teacher');

CREATE TABLE student (
  student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  reg_no VARCHAR(50) UNIQUE NOT NULL,
  dept VARCHAR(50),
  section VARCHAR(10),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  device_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_device ON Student(device_id);

CREATE TABLE teacher (
  teacher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES Teacher(teacher_id) ON DELETE CASCADE,
  lab_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_session_teacher ON Session(teacher_id);

CREATE TABLE qR_token (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES Student(student_id) ON DELETE CASCADE,
  session_id UUID REFERENCES Session(session_id) ON DELETE CASCADE,
  token VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure ONLY ONE token per student per session
  CONSTRAINT unique_student_session UNIQUE (student_id, session_id)
);

CREATE INDEX idx_qr_token ON QR_Token(token);
CREATE INDEX idx_qr_session ON QR_Token(session_id);

CREATE TABLE attendance (
  attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES Student(student_id) ON DELETE CASCADE,
  session_id UUID REFERENCES Session(session_id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'Present',
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  device_info TEXT,

  -- Prevent duplicate attendance per session
  CONSTRAINT unique_attendance UNIQUE (student_id, session_id)
);

CREATE INDEX idx_attendance_student ON Attendance(student_id);

CREATE TABLE od_request (
  od_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES Student(student_id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,

  days_requested INT GENERATED ALWAYS AS (to_date - from_date + 1) STORED,

  subject VARCHAR(255),
  document_path VARCHAR(255),
  status od_status DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_dates CHECK (to_date >= from_date)
);

CREATE INDEX idx_od_student ON OD_Request(student_id);

CREATE TABLE logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_type user_type_enum,
  action VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_timestamp
BEFORE UPDATE ON student
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_teacher_timestamp
BEFORE UPDATE ON teacher
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();