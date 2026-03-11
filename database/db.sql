-- ============================================================
-- HỆ THỐNG QUẢN LÝ SINH VIÊN - PostgreSQL Full Schema
-- ============================================================
-- 
-- CẤU TRÚC CƠ SỞ DỮ LIỆU (22 bảng):
-- 
-- QUẢN TRỊ HỆ THỐNG:
--   1. users                   - Tài khoản hệ thống (admin, staff)
--   2. notifications           - Thông báo nội bộ hệ thống
--   3. announcements           - Thông báo chung cho sinh viên
-- 
-- TỔ CHỨC - CƠ CẤU:
--   4. departments             - Khoa/Bộ môn
--   5. instructors             - Giảng viên
--   6. courses                 - Môn học
--   7. classes                 - Lớp học
--   8. class_courses           - Phân công môn học cho lớp
-- 
-- SINH VIÊN - HỌC TẬP:
--   9. students                - Thông tin sinh viên
--  10. student_registrations   - Đăng ký môn học
--  11. grades                  - Điểm số
--  12. attendance              - Điểm danh
--  13. exam_schedules          - Lịch thi
--  14. course_evaluations      - Đánh giá môn học/giảng viên
-- 
-- TÀI CHÍNH - HỌC BỔNG:
--  15. tuition                 - Học phí
--  16. scholarships            - Danh mục học bổng
--  17. student_scholarships    - Sinh viên nhận học bổng
-- 
-- HỒ SƠ - QUẢN LÝ:
--  18. student_documents       - Hồ sơ/tài liệu sinh viên
--  19. disciplinary_actions    - Kỷ luật sinh viên
--  20. leave_requests          - Đơn xin nghỉ/bảo lưu
-- 
-- CƠ SỞ VẬT CHẤT:
--  21. facilities              - Phòng học, lab, thư viện...
--  22. facility_bookings       - Đặt phòng/cơ sở vật chất
-- 
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DROP TABLES (Xóa các bảng cũ nếu tồn tại)
-- ============================================================
DROP TABLE IF EXISTS facility_bookings CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS course_evaluations CASCADE;
DROP TABLE IF EXISTS student_documents CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS disciplinary_actions CASCADE;
DROP TABLE IF EXISTS student_scholarships CASCADE;
DROP TABLE IF EXISTS scholarships CASCADE;
DROP TABLE IF EXISTS exam_schedules CASCADE;
DROP TABLE IF EXISTS student_registrations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS tuition CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS class_courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 1. BẢNG USERS (Tài khoản hệ thống)
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20)  DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT NOW(),
    updated_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 2. BẢNG DEPARTMENTS (Khoa / Bộ môn)
-- ============================================================
CREATE TABLE departments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code       VARCHAR(20)  UNIQUE NOT NULL,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 3. BẢNG INSTRUCTORS (Giảng viên)
-- ============================================================
CREATE TABLE instructors (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(20)  UNIQUE NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE,
    phone         VARCHAR(20),
    department_id UUID         REFERENCES departments(id) ON DELETE SET NULL,
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 4. BẢNG CLASSES (Lớp học)
-- ============================================================
CREATE TABLE classes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(20)  UNIQUE NOT NULL,
    name          VARCHAR(100) NOT NULL,
    department_id UUID         REFERENCES departments(id) ON DELETE SET NULL,
    academic_year VARCHAR(20)  NOT NULL,
    semester      INT          CHECK (semester IN (1, 2, 3)),
    max_students  INT          DEFAULT 40,
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 4. BẢNG COURSES (Môn học)
-- ============================================================
CREATE TABLE courses (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(20)  UNIQUE NOT NULL,
    name          VARCHAR(150) NOT NULL,
    department_id UUID         REFERENCES departments(id) ON DELETE SET NULL,
    credits       INT          DEFAULT 3,
    description   TEXT,
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 5. BẢNG STUDENTS (Sinh viên)
-- ============================================================
CREATE TABLE students (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_code    VARCHAR(20)  UNIQUE NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    date_of_birth   DATE,
    gender          VARCHAR(10)  CHECK (gender IN ('Male', 'Female', 'Other')),
    email           VARCHAR(100) UNIQUE,
    phone           VARCHAR(20),
    address         TEXT,
    avatar_url      TEXT,
    class_id        UUID         REFERENCES classes(id) ON DELETE SET NULL,
    department_id   UUID         REFERENCES departments(id) ON DELETE SET NULL,
    enrollment_year INT,
    status          VARCHAR(20)  DEFAULT 'active'
                    CHECK (status IN ('active','graduated','suspended','dropped')),
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 7. BẢNG CLASS_COURSES (Lớp - Môn học - Giảng viên)
-- ============================================================
CREATE TABLE class_courses (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id      UUID REFERENCES classes(id) ON DELETE CASCADE,
    course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    schedule      VARCHAR(100),   -- VD: "Thứ 2, 7:30-9:30"
    room          VARCHAR(50),
    UNIQUE(class_id, course_id)
);

-- ============================================================
-- 7. BẢNG GRADES (Điểm số)
-- ============================================================
CREATE TABLE grades (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id       UUID         REFERENCES students(id) ON DELETE CASCADE,
    course_id        UUID         REFERENCES courses(id) ON DELETE CASCADE,
    class_id         UUID         REFERENCES classes(id) ON DELETE CASCADE,
    assignment_score DECIMAL(5,2) CHECK (assignment_score BETWEEN 0 AND 10),
    midterm_score    DECIMAL(5,2) CHECK (midterm_score    BETWEEN 0 AND 10),
    final_score      DECIMAL(5,2) CHECK (final_score      BETWEEN 0 AND 10),
    gpa DECIMAL(5,2) GENERATED ALWAYS AS (
        ROUND((
            COALESCE(assignment_score,0) * 0.2 +
            COALESCE(midterm_score,0)    * 0.3 +
            COALESCE(final_score,0)      * 0.5
        )::NUMERIC, 2)
    ) STORED,
    letter_grade VARCHAR(5),
    semester     INT       CHECK (semester IN (1, 2, 3)),
    academic_year VARCHAR(20),
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, course_id, academic_year, semester)
);

-- ============================================================
-- 8. BẢNG TUITION (Học phí)
-- ============================================================
CREATE TABLE tuition (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id    UUID          REFERENCES students(id) ON DELETE CASCADE,
    academic_year VARCHAR(20)   NOT NULL,
    semester      INT           CHECK (semester IN (1, 2, 3)),
    amount        DECIMAL(15,2) NOT NULL,
    paid_amount   DECIMAL(15,2) DEFAULT 0,
    due_date      DATE,
    paid_date     DATE,
    status        VARCHAR(20)   DEFAULT 'unpaid'
                  CHECK (status IN ('unpaid','partial','paid','overdue')),
    notes         TEXT,
    created_at    TIMESTAMP     DEFAULT NOW(),
    updated_at    TIMESTAMP     DEFAULT NOW(),
    UNIQUE(student_id, academic_year, semester)
);

-- ============================================================
-- 10. BẢNG ATTENDANCE (Điểm danh)
-- ============================================================
CREATE TABLE attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
    class_course_id UUID REFERENCES class_courses(id) ON DELETE CASCADE,
    check_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20) DEFAULT 'present' 
                    CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, class_course_id, check_date)
);

-- ============================================================
-- 11. BẢNG NOTIFICATIONS (Thông báo hệ thống)
-- ============================================================
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title      VARCHAR(200) NOT NULL,
    content    TEXT NOT NULL,
    type       VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 12. BẢNG STUDENT_REGISTRATIONS (Đăng ký môn học)
-- ============================================================
CREATE TABLE student_registrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
    class_course_id UUID REFERENCES class_courses(id) ON DELETE CASCADE,
    academic_year   VARCHAR(20) NOT NULL,
    semester        INT CHECK (semester IN (1, 2, 3)),
    registration_date TIMESTAMP DEFAULT NOW(),
    status          VARCHAR(20) DEFAULT 'registered' 
                    CHECK (status IN ('registered', 'approved', 'cancelled', 'dropped')),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, class_course_id, academic_year, semester)
);

-- ============================================================
-- 13. BẢNG EXAM_SCHEDULES (Lịch thi)
-- ============================================================
CREATE TABLE exam_schedules (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
    class_id      UUID REFERENCES classes(id) ON DELETE CASCADE,
    exam_type     VARCHAR(20) NOT NULL CHECK (exam_type IN ('midterm', 'final', 'retest')),
    exam_date     TIMESTAMP NOT NULL,
    duration      INT NOT NULL,  -- phút
    room          VARCHAR(50),
    academic_year VARCHAR(20) NOT NULL,
    semester      INT CHECK (semester IN (1, 2, 3)),
    notes         TEXT,
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(course_id, class_id, exam_type, academic_year, semester)
);

-- ============================================================
-- 14. BẢNG SCHOLARSHIPS (Học bổng)
-- ============================================================
CREATE TABLE scholarships (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(20) UNIQUE NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    amount        DECIMAL(15,2) NOT NULL,
    type          VARCHAR(50) CHECK (type IN ('academic', 'need-based', 'sponsor', 'government', 'other')),
    requirements  TEXT,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 15. BẢNG STUDENT_SCHOLARSHIPS (Sinh viên nhận học bổng)
-- ============================================================
CREATE TABLE student_scholarships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
    scholarship_id  UUID REFERENCES scholarships(id) ON DELETE CASCADE,
    academic_year   VARCHAR(20) NOT NULL,
    semester        INT CHECK (semester IN (1, 2, 3)),
    amount_received DECIMAL(15,2) NOT NULL,
    awarded_date    DATE,
    status          VARCHAR(20) DEFAULT 'approved' 
                    CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed')),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, scholarship_id, academic_year, semester)
);

-- ============================================================
-- 16. BẢNG DISCIPLINARY_ACTIONS (Kỷ luật sinh viên)
-- ============================================================
CREATE TABLE disciplinary_actions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('warning', 'probation', 'suspension', 'expulsion')),
    reason      TEXT NOT NULL,
    action_date DATE NOT NULL,
    end_date    DATE,
    status      VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    issued_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 17. BẢNG LEAVE_REQUESTS (Đơn xin nghỉ/bảo lưu)
-- ============================================================
CREATE TABLE leave_requests (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
    request_type VARCHAR(30) NOT NULL CHECK (request_type IN ('sick_leave', 'personal_leave', 'academic_leave', 'maternity_leave')),
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    reason       TEXT NOT NULL,
    status       VARCHAR(20) DEFAULT 'pending' 
                 CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_date DATE,
    documents    TEXT,  -- Link hoặc mô tả tài liệu đính kèm
    notes        TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 18. BẢNG STUDENT_DOCUMENTS (Hồ sơ tài liệu sinh viên)
-- ============================================================
CREATE TABLE student_documents (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL 
                  CHECK (document_type IN ('transcript', 'certificate', 'id_card', 'diploma', 'recommendation', 'other')),
    document_name VARCHAR(200) NOT NULL,
    file_url      TEXT,
    issued_date   DATE,
    expiry_date   DATE,
    notes         TEXT,
    uploaded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 19. BẢNG COURSE_EVALUATIONS (Đánh giá môn học)
-- ============================================================
CREATE TABLE course_evaluations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id   UUID REFERENCES instructors(id) ON DELETE SET NULL,
    class_id        UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year   VARCHAR(20) NOT NULL,
    semester        INT CHECK (semester IN (1, 2, 3)),
    content_rating  INT CHECK (content_rating BETWEEN 1 AND 5),
    teaching_rating INT CHECK (teaching_rating BETWEEN 1 AND 5),
    material_rating INT CHECK (material_rating BETWEEN 1 AND 5),
    overall_rating  INT CHECK (overall_rating BETWEEN 1 AND 5),
    comments        TEXT,
    is_anonymous    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, course_id, class_id, academic_year, semester)
);

-- ============================================================
-- 20. BẢNG FACILITIES (Cơ sở vật chất - Phòng học, phòng lab)
-- ============================================================
CREATE TABLE facilities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(30) CHECK (type IN ('classroom', 'lab', 'library', 'auditorium', 'sports', 'other')),
    building    VARCHAR(50),
    floor       INT,
    capacity    INT,
    equipment   TEXT,
    status      VARCHAR(20) DEFAULT 'available' 
                CHECK (status IN ('available', 'occupied', 'maintenance', 'unavailable')),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 21. BẢNG FACILITY_BOOKINGS (Đặt phòng/cơ sở vật chất)
-- ============================================================
CREATE TABLE facility_bookings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    booked_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    purpose     VARCHAR(200) NOT NULL,
    start_time  TIMESTAMP NOT NULL,
    end_time    TIMESTAMP NOT NULL,
    status      VARCHAR(20) DEFAULT 'pending' 
                CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 22. BẢNG ANNOUNCEMENTS (Thông báo chung - dành cho sinh viên)
-- ============================================================
CREATE TABLE announcements (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         VARCHAR(200) NOT NULL,
    content       TEXT NOT NULL,
    type          VARCHAR(30) CHECK (type IN ('general', 'academic', 'event', 'deadline', 'urgent')),
    target_group  VARCHAR(50),  -- 'all', 'department_id', 'class_id', etc.
    target_id     UUID,         -- ID của nhóm đích (department, class, etc.)
    published_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at  TIMESTAMP DEFAULT NOW(),
    expires_at    TIMESTAMP,
    is_pinned     BOOLEAN DEFAULT FALSE,
    attachments   TEXT,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_students_class       ON students(class_id);
CREATE INDEX idx_students_department  ON students(department_id);
CREATE INDEX idx_students_status      ON students(status);
CREATE INDEX idx_students_code        ON students(student_code);
CREATE INDEX idx_grades_student       ON grades(student_id);
CREATE INDEX idx_grades_course        ON grades(course_id);
CREATE INDEX idx_grades_year_sem      ON grades(academic_year, semester);
CREATE INDEX idx_tuition_student      ON tuition(student_id);
CREATE INDEX idx_tuition_status       ON tuition(status);
CREATE INDEX idx_tuition_year_sem     ON tuition(academic_year, semester);
CREATE INDEX idx_registrations_student ON student_registrations(student_id);
CREATE INDEX idx_registrations_status ON student_registrations(status);
CREATE INDEX idx_exam_schedules_date  ON exam_schedules(exam_date);
CREATE INDEX idx_exam_schedules_course ON exam_schedules(course_id);
CREATE INDEX idx_student_scholarships_student ON student_scholarships(student_id);
CREATE INDEX idx_student_scholarships_status ON student_scholarships(status);
CREATE INDEX idx_disciplinary_student ON disciplinary_actions(student_id);
CREATE INDEX idx_disciplinary_status  ON disciplinary_actions(status);
CREATE INDEX idx_leave_requests_student ON leave_requests(student_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_student_documents_student ON student_documents(student_id);
CREATE INDEX idx_student_documents_type ON student_documents(document_type);
CREATE INDEX idx_evaluations_course   ON course_evaluations(course_id);
CREATE INDEX idx_evaluations_instructor ON course_evaluations(instructor_id);
CREATE INDEX idx_facilities_status    ON facilities(status);
CREATE INDEX idx_facility_bookings_facility ON facility_bookings(facility_id);
CREATE INDEX idx_facility_bookings_time ON facility_bookings(start_time, end_time);
CREATE INDEX idx_announcements_published ON announcements(published_at);
CREATE INDEX idx_announcements_target ON announcements(target_group, target_id);

-- ============================================================
-- TRIGGER: tự động cập nhật updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_grades_updated   BEFORE UPDATE ON grades   FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_tuition_updated  BEFORE UPDATE ON tuition  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- ============================================================
-- ============================================================
--  SEED DATA - DỮ LIỆU MẪU ĐẦY ĐỦ
-- ============================================================
-- ============================================================


-- ============================================================
-- USERS  (password cho tất cả = "password123")
-- Hash BCrypt cost=11 của chuỗi "password123"
-- ============================================================
INSERT INTO users (id, username, email, password_hash, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin',  'admin@edu.vn',  '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe', 'admin'),
('a0000000-0000-0000-0000-000000000002', 'staff1', 'staff1@edu.vn', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe', 'staff'),
('a0000000-0000-0000-0000-000000000003', 'staff2', 'staff2@edu.vn', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe', 'staff');


-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, code, name) VALUES
('d0000000-0000-0000-0000-000000000001', 'CNTT',  'Công nghệ thông tin'),
('d0000000-0000-0000-0000-000000000002', 'KT',    'Kế toán'),
('d0000000-0000-0000-0000-000000000003', 'QTKD',  'Quản trị kinh doanh'),
('d0000000-0000-0000-0000-000000000004', 'NN',    'Ngôn ngữ học'),
('d0000000-0000-0000-0000-000000000005', 'DTVT',  'Điện tử viễn thông');


-- ============================================================
-- INSTRUCTORS (Giảng viên)
-- ============================================================
INSERT INTO instructors (id, code, full_name, email, phone, department_id) VALUES
('10000000-0000-0000-0000-000000000001', 'GV001', 'TS. Nguyễn Văn An',   'an.nv@edu.vn',   '0912000001', 'd0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'GV002', 'TS. Trần Thị Bình',   'binh.tt@edu.vn', '0912000002', 'd0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'GV003', 'ThS. Lê Minh Cường',  'cuong.lm@edu.vn', '0912000003', 'd0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000004', 'GV004', 'TS. Đinh Thị Lan',    'lan.dt@edu.vn',  '0912000004', 'd0000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000005', 'GV005', 'ThS. Đỗ Thị Oanh',   'oanh.dt@edu.vn', '0912000005', 'd0000000-0000-0000-0000-000000000003');


-- ============================================================
-- COURSES (Môn học)
-- ============================================================
INSERT INTO courses (id, code, name, department_id, credits, description) VALUES
-- CNTT
('c0000000-0000-0000-0000-000000000001', 'INT101',  'Nhập môn lập trình',              'd0000000-0000-0000-0000-000000000001', 3, 'Cơ bản về lập trình với Python'),
('c0000000-0000-0000-0000-000000000002', 'INT201',  'Cấu trúc dữ liệu và giải thuật', 'd0000000-0000-0000-0000-000000000001', 4, 'Stack, Queue, Tree, Graph và các thuật toán'),
('c0000000-0000-0000-0000-000000000003', 'INT202',  'Lập trình hướng đối tượng',       'd0000000-0000-0000-0000-000000000001', 3, 'OOP với Java'),
('c0000000-0000-0000-0000-000000000004', 'INT301',  'Cơ sở dữ liệu',                   'd0000000-0000-0000-0000-000000000001', 3, 'SQL, thiết kế CSDL quan hệ'),
('c0000000-0000-0000-0000-000000000005', 'INT302',  'Mạng máy tính',                   'd0000000-0000-0000-0000-000000000001', 3, 'Giao thức TCP/IP, mô hình OSI'),
('c0000000-0000-0000-0000-000000000006', 'INT401',  'Lập trình Web',                   'd0000000-0000-0000-0000-000000000001', 4, 'HTML, CSS, JavaScript, React'),
('c0000000-0000-0000-0000-000000000007', 'INT402',  'Trí tuệ nhân tạo',                'd0000000-0000-0000-0000-000000000001', 3, 'Machine Learning cơ bản'),
-- KẾ TOÁN
('c0000000-0000-0000-0000-000000000008', 'ACC101',  'Nguyên lý kế toán',               'd0000000-0000-0000-0000-000000000002', 3, 'Nguyên tắc cơ bản của kế toán'),
('c0000000-0000-0000-0000-000000000009', 'ACC201',  'Kế toán tài chính',               'd0000000-0000-0000-0000-000000000002', 4, 'Báo cáo tài chính, bút toán'),
('c0000000-0000-0000-0000-000000000010', 'ACC202',  'Kế toán quản trị',                'd0000000-0000-0000-0000-000000000002', 3, 'Chi phí, lợi nhuận, ngân sách'),
('c0000000-0000-0000-0000-000000000011', 'ACC301',  'Thuế',                            'd0000000-0000-0000-0000-000000000002', 3, 'Luật thuế Việt Nam'),
-- QTKD
('c0000000-0000-0000-0000-000000000012', 'BUS101',  'Quản trị học',                    'd0000000-0000-0000-0000-000000000003', 3, 'Lý thuyết tổ chức và quản lý'),
('c0000000-0000-0000-0000-000000000013', 'BUS201',  'Marketing căn bản',               'd0000000-0000-0000-0000-000000000003', 3, '4P, phân tích thị trường'),
('c0000000-0000-0000-0000-000000000014', 'BUS202',  'Quản trị nhân sự',                'd0000000-0000-0000-0000-000000000003', 3, 'Tuyển dụng, đào tạo, đánh giá'),
-- NGÔN NGỮ
('c0000000-0000-0000-0000-000000000015', 'ENG101',  'Tiếng Anh cơ bản',                'd0000000-0000-0000-0000-000000000004', 3, 'Kỹ năng nghe, nói, đọc, viết'),
('c0000000-0000-0000-0000-000000000016', 'ENG201',  'Tiếng Anh chuyên ngành',          'd0000000-0000-0000-0000-000000000004', 3, 'Business English'),
-- CHUNG (đại cương)
('c0000000-0000-0000-0000-000000000017', 'GEN101',  'Toán cao cấp A1',                 NULL, 4, 'Giải tích, đại số tuyến tính'),
('c0000000-0000-0000-0000-000000000018', 'GEN102',  'Xác suất thống kê',               NULL, 3, 'Lý thuyết xác suất, thống kê mô tả'),
('c0000000-0000-0000-0000-000000000019', 'GEN103',  'Triết học Mác-Lênin',             NULL, 3, 'Chủ nghĩa duy vật biện chứng'),
('c0000000-0000-0000-0000-000000000020', 'GEN104',  'Giáo dục thể chất',               NULL, 2, 'Thể thao, sức khỏe');


-- ============================================================
-- CLASSES (Lớp học) - Năm học 2023-2024
-- ============================================================
INSERT INTO classes (id, code, name, department_id, academic_year, semester, max_students) VALUES
-- CNTT
('cc000001-0000-0000-0000-000000000000', 'CNTT-K21A', 'CNTT Khóa 21 - Lớp A', 'd0000000-0000-0000-0000-000000000001', '2023-2024', 1, 40),
('cc000002-0000-0000-0000-000000000000', 'CNTT-K21B', 'CNTT Khóa 21 - Lớp B', 'd0000000-0000-0000-0000-000000000001', '2023-2024', 1, 40),
('cc000003-0000-0000-0000-000000000000', 'CNTT-K22A', 'CNTT Khóa 22 - Lớp A', 'd0000000-0000-0000-0000-000000000001', '2023-2024', 1, 45),
-- KẾ TOÁN
('cc000004-0000-0000-0000-000000000000', 'KT-K21A',   'Kế toán Khóa 21 - Lớp A', 'd0000000-0000-0000-0000-000000000002', '2023-2024', 1, 40),
('cc000005-0000-0000-0000-000000000000', 'KT-K22A',   'Kế toán Khóa 22 - Lớp A', 'd0000000-0000-0000-0000-000000000002', '2023-2024', 1, 40),
-- QTKD
('cc000006-0000-0000-0000-000000000000', 'QTKD-K21A', 'QTKD Khóa 21 - Lớp A',   'd0000000-0000-0000-0000-000000000003', '2023-2024', 1, 40),
-- NGÔN NGỮ
('cc000007-0000-0000-0000-000000000000', 'NN-K21A',   'Ngôn ngữ Khóa 21 - Lớp A','d0000000-0000-0000-0000-000000000004', '2023-2024', 1, 35);


-- ============================================================
-- CLASS_COURSES (Phân công môn học cho lớp)
-- ============================================================
INSERT INTO class_courses (class_id, course_id, instructor_id, schedule, room) VALUES
-- CNTT-K21A
('cc000001-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001', 'Thứ 2, 7:30-9:30',   'A101'),
('cc000001-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002', 'Thứ 3, 9:45-11:45',  'A102'),
('cc000001-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000003', 'Thứ 4, 13:00-15:00', 'B201'),
-- KẾ TOÁN
('cc000004-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000004', 'Thứ 2, 7:30-9:30',   'E101'),
-- QTKD
('cc000006-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000005', 'Thứ 4, 13:00-15:00', 'F202');


-- ============================================================
-- STUDENTS (30 sinh viên mẫu)
-- ============================================================
INSERT INTO students (id, student_code, full_name, date_of_birth, gender, email, phone, address, class_id, department_id, enrollment_year, status) VALUES

-- === CNTT-K21A (10 sinh viên) ===
('50000000-0000-0000-0000-000000000001','SV21001','Nguyễn Minh Anh',    '2003-03-15','Male',  'minhanhk21@edu.vn',  '0901111001','12 Lê Lợi, Q1, TP.HCM',          'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000002','SV21002','Trần Thị Bảo Châu',  '2003-07-22','Female','baochauK21@edu.vn',  '0901111002','34 Nguyễn Trãi, Q5, TP.HCM',      'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000003','SV21003','Lê Hoàng Duy',       '2003-01-10','Male',  'hoangtuyK21@edu.vn', '0901111003','78 Trần Hưng Đạo, Q1, TP.HCM',    'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000004','SV21004','Phạm Thị Thu Hà',    '2003-11-05','Female','thuhaK21@edu.vn',    '0901111004','56 Đinh Tiên Hoàng, Bình Thạnh',   'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000005','SV21005','Hoàng Văn Kiên',     '2003-08-30','Male',  'kienvhK21@edu.vn',   '0901111005','90 Cách Mạng Tháng 8, Q3, TP.HCM','cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000006','SV21006','Vũ Thị Mỹ Linh',    '2003-04-18','Female','mylinh K21@edu.vn',  '0901111006','23 Võ Văn Tần, Q3, TP.HCM',       'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000007','SV21007','Đặng Quốc Phong',    '2003-09-25','Male',  'quocphongK21@edu.vn','0901111007','45 Lý Thường Kiệt, Q10, TP.HCM',  'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'suspended'),
('50000000-0000-0000-0000-000000000008','SV21008','Bùi Thị Lan Anh',   '2003-12-03','Female','lananhK21@edu.vn',   '0901111008','67 Nguyễn Đình Chiểu, Q3, TP.HCM','cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000009','SV21009','Ngô Tuấn Nghĩa',    '2003-06-14','Male',  'tuannghiaK21@edu.vn','0901111009','11 Hùng Vương, Q5, TP.HCM',       'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000010','SV21010','Lý Thị Phương Thảo','2003-02-28','Female','phuongthaoK21@edu.vn','0901111010','88 Pasteur, Q1, TP.HCM',           'cc000001-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),

-- === CNTT-K21B (6 sinh viên) ===
('50000000-0000-0000-0000-000000000011','SV21011','Trịnh Xuân Bách',   '2003-05-20','Male',  'xuanbachK21B@edu.vn','0902222001','15 Trường Sa, Bình Thạnh, TP.HCM', 'cc000002-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000012','SV21012','Đinh Thị Cẩm',      '2003-10-11','Female','camK21B@edu.vn',     '0902222002','32 Đinh Bộ Lĩnh, Bình Thạnh',      'cc000002-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000013','SV21013','Võ Quang Đức',      '2003-03-07','Male',  'quangducK21B@edu.vn','0902222003','54 Bạch Đằng, Bình Thạnh, TP.HCM', 'cc000002-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000014','SV21014','Phan Thị Hồng',     '2003-08-16','Female','hongptK21B@edu.vn',  '0902222004','76 Xô Viết Nghệ Tĩnh, Bình Thạnh', 'cc000002-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),
('50000000-0000-0000-0000-000000000015','SV21015','Cao Thành Long',    '2003-01-29','Male',  'thanhlongK21B@edu.vn','0902222005','98 Hoàng Văn Thụ, Phú Nhuận',     'cc000002-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'dropped'),
('50000000-0000-0000-0000-000000000016','SV21016','Hồ Thị Minh Nguyệt','2003-07-04','Female','minhngyetK21B@edu.vn','0902222006','21 Trần Văn Ơn, Tân Bình',        'cc000002-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2021,'active'),

-- === CNTT-K22A (4 sinh viên) ===
('50000000-0000-0000-0000-000000000017','SV22001','Nguyễn Duy An',     '2004-04-12','Male',  'duyanK22@edu.vn',    '0903333001','33 Lạc Long Quân, Q11, TP.HCM',   'cc000003-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2022,'active'),
('50000000-0000-0000-0000-000000000018','SV22002','Lê Thị Bích',       '2004-09-23','Female','bichltK22@edu.vn',   '0903333002','55 Hậu Giang, Q6, TP.HCM',        'cc000003-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2022,'active'),
('50000000-0000-0000-0000-000000000019','SV22003','Trương Văn Chí',    '2004-02-18','Male',  'vanchitK22@edu.vn',  '0903333003','77 Phạm Văn Chí, Q6, TP.HCM',     'cc000003-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2022,'active'),
('50000000-0000-0000-0000-000000000020','SV22004','Dương Thị Diệu',    '2004-11-30','Female','dieuK22@edu.vn',     '0903333004','99 Âu Cơ, Q11, TP.HCM',           'cc000003-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001',2022,'active'),

-- === KT-K21A (5 sinh viên) ===
('50000000-0000-0000-0000-000000000021','SV21101','Đào Thị Thu An',    '2003-06-08','Female','thuanktK21@edu.vn',  '0904444001','14 Ngô Quyền, Q10, TP.HCM',       'cc000004-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000002',2021,'active'),
('50000000-0000-0000-0000-000000000022','SV21102','Trần Văn Bình',     '2003-12-17','Male',  'binhtvktK21@edu.vn', '0904444002','36 Trần Phú, Q5, TP.HCM',          'cc000004-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000002',2021,'active'),
('50000000-0000-0000-0000-000000000023','SV21103','Lý Thị Cúc',        '2003-03-26','Female','cuclytktK21@edu.vn', '0904444003','58 Nguyễn Trãi, Q5, TP.HCM',      'cc000004-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000002',2021,'active'),
('50000000-0000-0000-0000-000000000024','SV21104','Ngô Văn Đại',       '2003-09-14','Male',  'daingvktK21@edu.vn', '0904444004','80 Bến Chương Dương, Q1, TP.HCM',  'cc000004-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000002',2021,'graduated'),
('50000000-0000-0000-0000-000000000025','SV21105','Phạm Thị Ema',      '2003-07-01','Female','emaptktK21@edu.vn',  '0904444005','102 Hàm Nghi, Q1, TP.HCM',        'cc000004-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000002',2021,'active'),

-- === QTKD-K21A (3 sinh viên) ===
('50000000-0000-0000-0000-000000000026','SV21201','Hoàng Thị Flan',    '2003-05-09','Female','flanhtK21@edu.vn',   '0905555001','17 Nguyễn Công Trứ, Q1, TP.HCM',  'cc000006-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000003',2021,'active'),
('50000000-0000-0000-0000-000000000027','SV21202','Vũ Văn Giang',      '2003-10-21','Male',  'giangvvK21@edu.vn',  '0905555002','39 Trương Định, Q3, TP.HCM',       'cc000006-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000003',2021,'active'),
('50000000-0000-0000-0000-000000000028','SV21203','Bùi Thị Hoa',       '2003-02-14','Female','hoabtK21@edu.vn',    '0905555003','61 Lê Văn Sỹ, Q3, TP.HCM',         'cc000006-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000003',2021,'active'),

-- === NN-K21A (2 sinh viên) ===
('50000000-0000-0000-0000-000000000029','SV21301','Tạ Minh Hiếu',      '2003-08-07','Male',  'hieitmK21@edu.vn',   '0906666001','83 Trần Bình Trọng, Q5, TP.HCM',  'cc000007-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000004',2021,'active'),
('50000000-0000-0000-0000-000000000030','SV21302','Nguyễn Thị Kiều',   '2003-11-19','Female','kieuK21NN@edu.vn',   '0906666002','105 Võ Thị Sáu, Q3, TP.HCM',      'cc000007-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000004',2021,'active');


-- ============================================================
-- GRADES (Điểm số - học kỳ 1/2023-2024)
-- Công thức GPA = BT*0.2 + GK*0.3 + CK*0.5 (tự tính bởi DB)
-- letter_grade cập nhật thủ công theo GPA
-- ============================================================

-- CNTT-K21A: môn INT101 (Nhập môn lập trình)
INSERT INTO grades (student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year) VALUES
('50000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 9.0, 8.5, 9.0, 'A+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 8.0, 7.5, 8.0, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 7.0, 6.5, 7.5, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 6.0, 5.5, 6.0, 'B',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 9.5, 9.0, 9.5, 'A+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 5.0, 4.5, 5.5, 'C+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 4.0, 3.5, 4.0, 'D',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 8.5, 8.0, 8.5, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 7.5, 7.0, 7.0, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000000', 6.5, 6.0, 6.5, 'B',  1, '2023-2024');

-- CNTT-K21A: môn INT202 - Cấu trúc dữ liệu
INSERT INTO grades (student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year) VALUES
('50000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 8.0, 8.0, 8.5, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 7.0, 6.5, 7.0, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 5.0, 5.0, 5.5, 'C+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 6.0, 6.0, 6.5, 'B',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 9.0, 9.0, 9.5, 'A+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 7.5, 7.5, 8.0, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 8.0, 7.0, 7.5, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000000', 6.0, 5.5, 6.0, 'B',  1, '2023-2024');

-- CNTT-K21A: môn Toán GEN101
INSERT INTO grades (student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year) VALUES
('50000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 7.0, 7.5, 8.0, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 6.0, 5.5, 6.0, 'B',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 4.0, 3.5, 4.5, 'D+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 5.5, 5.0, 5.5, 'C+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 8.5, 8.5, 9.0, 'A+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 7.0, 7.0, 7.5, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 6.5, 6.0, 6.5, 'B',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000000', 5.0, 4.5, 5.0, 'C',  1, '2023-2024');

-- KT-K21A: môn ACC101
INSERT INTO grades (student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year) VALUES
('50000000-0000-0000-0000-000000000021','c0000000-0000-0000-0000-000000000008','cc000004-0000-0000-0000-000000000000', 9.0, 8.5, 9.0, 'A+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000022','c0000000-0000-0000-0000-000000000008','cc000004-0000-0000-0000-000000000000', 7.5, 7.0, 7.5, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000023','c0000000-0000-0000-0000-000000000008','cc000004-0000-0000-0000-000000000000', 8.0, 8.0, 8.5, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000025','c0000000-0000-0000-0000-000000000008','cc000004-0000-0000-0000-000000000000', 6.5, 6.0, 6.5, 'B',  1, '2023-2024');

-- KT-K21A: môn ACC201
INSERT INTO grades (student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year) VALUES
('50000000-0000-0000-0000-000000000021','c0000000-0000-0000-0000-000000000009','cc000004-0000-0000-0000-000000000000', 8.5, 8.0, 8.5, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000022','c0000000-0000-0000-0000-000000000009','cc000004-0000-0000-0000-000000000000', 7.0, 6.5, 7.0, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000023','c0000000-0000-0000-0000-000000000009','cc000004-0000-0000-0000-000000000000', 7.5, 7.5, 8.0, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000025','c0000000-0000-0000-0000-000000000009','cc000004-0000-0000-0000-000000000000', 5.5, 5.0, 5.5, 'C+', 1, '2023-2024');

-- QTKD-K21A: môn BUS101
INSERT INTO grades (student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year) VALUES
('50000000-0000-0000-0000-000000000026','c0000000-0000-0000-0000-000000000012','cc000006-0000-0000-0000-000000000000', 8.0, 8.5, 9.0, 'A+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000027','c0000000-0000-0000-0000-000000000012','cc000006-0000-0000-0000-000000000000', 7.0, 6.5, 7.0, 'B+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000028','c0000000-0000-0000-0000-000000000012','cc000006-0000-0000-0000-000000000000', 8.5, 8.0, 8.5, 'A',  1, '2023-2024');

-- CNTT-K21B: môn INT101
INSERT INTO grades (student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year) VALUES
('50000000-0000-0000-0000-000000000011','c0000000-0000-0000-0000-000000000001','cc000002-0000-0000-0000-000000000000', 8.0, 7.5, 8.0, 'A',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000012','c0000000-0000-0000-0000-000000000001','cc000002-0000-0000-0000-000000000000', 6.5, 6.0, 6.5, 'B',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000013','c0000000-0000-0000-0000-000000000001','cc000002-0000-0000-0000-000000000000', 9.0, 8.5, 9.5, 'A+', 1, '2023-2024'),
('50000000-0000-0000-0000-000000000014','c0000000-0000-0000-0000-000000000001','cc000002-0000-0000-0000-000000000000', 5.0, 4.5, 5.0, 'C',  1, '2023-2024'),
('50000000-0000-0000-0000-000000000016','c0000000-0000-0000-0000-000000000001','cc000002-0000-0000-0000-000000000000', 7.5, 7.0, 7.5, 'B+', 1, '2023-2024');


-- ============================================================
-- TUITION (Học phí - HK1/2023-2024)
-- CNTT: 8,500,000đ/kỳ | KT: 7,500,000đ/kỳ | QTKD: 7,800,000đ/kỳ | NN: 7,200,000đ/kỳ
-- ============================================================

-- CNTT-K21A (10 sv)
INSERT INTO tuition (student_id, academic_year, semester, amount, paid_amount, due_date, paid_date, status, notes) VALUES
('50000000-0000-0000-0000-000000000001', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-15', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000002', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-20', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000003', '2023-2024', 1, 8500000, 4250000, '2023-09-30', NULL,         'partial', 'Đã đóng 50%, còn nợ 4,250,000đ'),
('50000000-0000-0000-0000-000000000004', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-28', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000005', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-10', 'paid',    'Học bổng hỗ trợ 20%'),
('50000000-0000-0000-0000-000000000006', '2023-2024', 1, 8500000, 0,       '2023-09-30', NULL,         'overdue', 'Quá hạn, cần liên hệ'),
('50000000-0000-0000-0000-000000000007', '2023-2024', 1, 8500000, 0,       '2023-09-30', NULL,         'overdue', 'Sinh viên bị đình chỉ'),
('50000000-0000-0000-0000-000000000008', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-22', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000009', '2023-2024', 1, 8500000, 5000000, '2023-09-30', NULL,         'partial', 'Đã đóng một phần'),
('50000000-0000-0000-0000-000000000010', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-25', 'paid',    'Đã thanh toán đầy đủ');

-- CNTT-K21B (6 sv)
INSERT INTO tuition (student_id, academic_year, semester, amount, paid_amount, due_date, paid_date, status, notes) VALUES
('50000000-0000-0000-0000-000000000011', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-18', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000012', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-30', 'paid',    'Thanh toán đúng hạn'),
('50000000-0000-0000-0000-000000000013', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-12', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000014', '2023-2024', 1, 8500000, 3000000, '2023-09-30', NULL,         'partial', 'Còn thiếu 5,500,000đ'),
('50000000-0000-0000-0000-000000000015', '2023-2024', 1, 8500000, 0,       '2023-09-30', NULL,         'overdue', 'Đã nghỉ học'),
('50000000-0000-0000-0000-000000000016', '2023-2024', 1, 8500000, 8500000, '2023-09-30', '2023-09-27', 'paid',    'Đã thanh toán đầy đủ');

-- CNTT-K22A (4 sv)
INSERT INTO tuition (student_id, academic_year, semester, amount, paid_amount, due_date, paid_date, status, notes) VALUES
('50000000-0000-0000-0000-000000000017', '2023-2024', 1, 9000000, 9000000, '2023-09-30', '2023-09-14', 'paid',    'Học phí khóa 22 điều chỉnh'),
('50000000-0000-0000-0000-000000000018', '2023-2024', 1, 9000000, 9000000, '2023-09-30', '2023-09-20', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000019', '2023-2024', 1, 9000000, 0,       '2023-09-30', NULL,         'unpaid',  'Chưa đóng học phí'),
('50000000-0000-0000-0000-000000000020', '2023-2024', 1, 9000000, 4500000, '2023-09-30', NULL,         'partial', 'Đóng 50% đợt 1');

-- KT-K21A (5 sv)
INSERT INTO tuition (student_id, academic_year, semester, amount, paid_amount, due_date, paid_date, status, notes) VALUES
('50000000-0000-0000-0000-000000000021', '2023-2024', 1, 7500000, 7500000, '2023-09-30', '2023-09-16', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000022', '2023-2024', 1, 7500000, 7500000, '2023-09-30', '2023-09-19', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000023', '2023-2024', 1, 7500000, 7500000, '2023-09-30', '2023-09-21', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000024', '2023-2024', 1, 7500000, 7500000, '2023-09-30', '2023-08-30', 'paid',    'Sinh viên đã tốt nghiệp - đã đóng'),
('50000000-0000-0000-0000-000000000025', '2023-2024', 1, 7500000, 0,       '2023-09-30', NULL,         'overdue', 'Cần nhắc nhở');

-- QTKD-K21A (3 sv)
INSERT INTO tuition (student_id, academic_year, semester, amount, paid_amount, due_date, paid_date, status, notes) VALUES
('50000000-0000-0000-0000-000000000026', '2023-2024', 1, 7800000, 7800000, '2023-09-30', '2023-09-11', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000027', '2023-2024', 1, 7800000, 7800000, '2023-09-30', '2023-09-23', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000028', '2023-2024', 1, 7800000, 2000000, '2023-09-30', NULL,         'partial', 'Đã đóng một phần');

-- NN-K21A (2 sv)
INSERT INTO tuition (student_id, academic_year, semester, amount, paid_amount, due_date, paid_date, status, notes) VALUES
('50000000-0000-0000-0000-000000000029', '2023-2024', 1, 7200000, 7200000, '2023-09-30', '2023-09-13', 'paid',    'Đã thanh toán đầy đủ'),
('50000000-0000-0000-0000-000000000030', '2023-2024', 1, 7200000, 0,       '2023-09-30', NULL,         'unpaid',  'Chưa liên hệ đóng tiền');


-- ============================================================
-- SCHOLARSHIPS (Học bổng)
-- ============================================================
INSERT INTO scholarships (id, code, name, description, amount, type, requirements, is_active) VALUES
('5c400000-0000-0000-0000-000000000001', 'HB001', 'Học bổng Khuyến khích học tập',    'Dành cho sinh viên có GPA >= 3.6', 5000000, 'academic',     'GPA >= 3.6, không vi phạm nội quy', TRUE),
('5c400000-0000-0000-0000-000000000002', 'HB002', 'Học bổng Xuất sắc',                'Dành cho sinh viên GPA >= 3.8',    10000000, 'academic',    'GPA >= 3.8, tham gia hoạt động tích cực', TRUE),
('5c400000-0000-0000-0000-000000000003', 'HB003', 'Học bổng Khó khăn',                'Hỗ trợ sinh viên hoàn cảnh khó khăn', 3000000, 'need-based', 'Giấy xác nhận hoàn cảnh khó khăn', TRUE),
('5c400000-0000-0000-0000-000000000004', 'HB004', 'Học bổng Tài năng Công nghệ',     'Sinh viên CNTT có thành tích cao', 8000000, 'sponsor',     'Dự án cá nhân xuất sắc, GPA >= 3.5', TRUE),
('5c400000-0000-0000-0000-000000000005', 'HB005', 'Học bổng Chính phủ',               'Học bổng từ Chính phủ',            15000000, 'government', 'Sinh viên nghèo vượt khó, GPA >= 3.2', TRUE);

-- ============================================================
-- STUDENT_SCHOLARSHIPS (Sinh viên nhận học bổng)
-- ============================================================
INSERT INTO student_scholarships (student_id, scholarship_id, academic_year, semester, amount_received, awarded_date, status) VALUES
('50000000-0000-0000-0000-000000000001', '5c400000-0000-0000-0000-000000000001', '2023-2024', 1, 5000000,  '2023-10-15', 'disbursed'),
('50000000-0000-0000-0000-000000000005', '5c400000-0000-0000-0000-000000000002', '2023-2024', 1, 10000000, '2023-10-15', 'disbursed'),
('50000000-0000-0000-0000-000000000013', '5c400000-0000-0000-0000-000000000004', '2023-2024', 1, 8000000,  '2023-10-20', 'disbursed'),
('50000000-0000-0000-0000-000000000006', '5c400000-0000-0000-0000-000000000003', '2023-2024', 1, 3000000,  '2023-11-01', 'approved'),
('50000000-0000-0000-0000-000000000021', '5c400000-0000-0000-0000-000000000005', '2023-2024', 1, 15000000, '2023-10-10', 'disbursed');

-- ============================================================
-- EXAM_SCHEDULES (Lịch thi)
-- ============================================================
INSERT INTO exam_schedules (course_id, class_id, exam_type, exam_date, duration, room, academic_year, semester, notes) VALUES
-- Thi giữa kỳ
('c0000000-0000-0000-0000-000000000001', 'cc000001-0000-0000-0000-000000000000', 'midterm', '2023-10-20 08:00:00', 90,  'A101', '2023-2024', 1, 'Thi giữa kỳ INT101'),
('c0000000-0000-0000-0000-000000000002', 'cc000001-0000-0000-0000-000000000000', 'midterm', '2023-10-22 08:00:00', 120, 'A102', '2023-2024', 1, 'Thi giữa kỳ INT202'),
('c0000000-0000-0000-0000-000000000008', 'cc000004-0000-0000-0000-000000000000', 'midterm', '2023-10-21 13:00:00', 90,  'E101', '2023-2024', 1, 'Thi giữa kỳ ACC101'),
-- Thi cuối kỳ
('c0000000-0000-0000-0000-000000000001', 'cc000001-0000-0000-0000-000000000000', 'final',   '2023-12-15 08:00:00', 120, 'A201', '2023-2024', 1, 'Thi cuối kỳ INT101'),
('c0000000-0000-0000-0000-000000000002', 'cc000001-0000-0000-0000-000000000000', 'final',   '2023-12-17 08:00:00', 150, 'A202', '2023-2024', 1, 'Thi cuối kỳ INT202'),
('c0000000-0000-0000-0000-000000000008', 'cc000004-0000-0000-0000-000000000000', 'final',   '2023-12-16 13:00:00', 120, 'E201', '2023-2024', 1, 'Thi cuối kỳ ACC101'),
('c0000000-0000-0000-0000-000000000012', 'cc000006-0000-0000-0000-000000000000', 'final',   '2023-12-18 08:00:00', 90,  'F101', '2023-2024', 1, 'Thi cuối kỳ BUS101');

-- ============================================================
-- DISCIPLINARY_ACTIONS (Kỷ luật)
-- ============================================================
INSERT INTO disciplinary_actions (student_id, action_type, reason, action_date, end_date, status, issued_by, notes) VALUES
('50000000-0000-0000-0000-000000000007', 'suspension', 'Vi phạm kỷ luật: gian lận trong thi cử',          '2023-11-01', '2024-01-31', 'active',    'a0000000-0000-0000-0000-000000000001', 'Đình chỉ học 3 tháng'),
('50000000-0000-0000-0000-000000000015', 'warning',    'Vắng mặt quá nhiều buổi học không phép',          '2023-10-15', NULL,         'completed', 'a0000000-0000-0000-0000-000000000002', 'Cảnh cáo lần 1'),
('50000000-0000-0000-0000-000000000003', 'warning',    'Nộp bài tập trễ hạn nhiều lần',                   '2023-11-05', NULL,         'active',    'a0000000-0000-0000-0000-000000000002', 'Cảnh cáo học vụ');

-- ============================================================
-- LEAVE_REQUESTS (Đơn xin nghỉ)
-- ============================================================
INSERT INTO leave_requests (student_id, request_type, start_date, end_date, reason, status, approved_by, approved_date, documents) VALUES
('50000000-0000-0000-0000-000000000004', 'sick_leave',     '2023-11-10', '2023-11-15', 'Bị ốm, cần nghỉ dưỡng bệnh',                    'approved',  'a0000000-0000-0000-0000-000000000001', '2023-11-09', 'Giấy bác sĩ'),
('50000000-0000-0000-0000-000000000012', 'personal_leave', '2023-12-01', '2023-12-03', 'Việc gia đình khẩn cấp',                         'approved',  'a0000000-0000-0000-0000-000000000002', '2023-11-28', NULL),
('50000000-0000-0000-0000-000000000019', 'academic_leave', '2024-01-01', '2024-06-30', 'Xin bảo lưu học tập để đi làm thêm kinh nghiệm', 'pending',   NULL,                                    NULL,         'Đơn xin bảo lưu'),
('50000000-0000-0000-0000-000000000028', 'sick_leave',     '2023-10-25', '2023-10-27', 'Ốm nhẹ',                                         'rejected',  'a0000000-0000-0000-0000-000000000002', '2023-10-24', 'Không đủ lý do');

-- ============================================================
-- STUDENT_DOCUMENTS (Hồ sơ sinh viên)
-- ============================================================
INSERT INTO student_documents (student_id, document_type, document_name, file_url, issued_date, notes, uploaded_by) VALUES
('50000000-0000-0000-0000-000000000001', 'transcript',   'Bảng điểm HK1 2023-2024',           '/docs/transcript_sv21001_2023_1.pdf', '2024-01-15', NULL, 'a0000000-0000-0000-0000-000000000002'),
('50000000-0000-0000-0000-000000000024', 'diploma',      'Bằng tốt nghiệp Kế toán',           '/docs/diploma_sv21104.pdf',            '2024-02-01', 'Đã tốt nghiệp', 'a0000000-0000-0000-0000-000000000001'),
('50000000-0000-0000-0000-000000000005', 'certificate',  'Chứng chỉ TOEIC 850',               '/docs/toeic_sv21005.pdf',              '2023-09-10', 'TOEIC score: 850', 'a0000000-0000-0000-0000-000000000002'),
('50000000-0000-0000-0000-000000000013', 'certificate',  'Chứng chỉ AWS Cloud Practitioner',  '/docs/aws_sv21013.pdf',                '2023-11-20', NULL, 'a0000000-0000-0000-0000-000000000002'),
('50000000-0000-0000-0000-000000000021', 'id_card',      'CMND/CCCD photo',                   '/docs/id_sv21101.pdf',                 '2023-08-01', NULL, 'a0000000-0000-0000-0000-000000000002');

-- ============================================================
-- COURSE_EVALUATIONS (Đánh giá môn học)
-- ============================================================
INSERT INTO course_evaluations (student_id, course_id, instructor_id, class_id, academic_year, semester, content_rating, teaching_rating, material_rating, overall_rating, comments, is_anonymous) VALUES
('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'cc000001-0000-0000-0000-000000000000', '2023-2024', 1, 5, 5, 4, 5, 'Giảng viên nhiệt tình, bài giảng dễ hiểu',                TRUE),
('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'cc000001-0000-0000-0000-000000000000', '2023-2024', 1, 4, 5, 4, 4, 'Rất tốt, cần thêm bài tập thực hành',                     TRUE),
('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'cc000001-0000-0000-0000-000000000000', '2023-2024', 1, 4, 4, 3, 4, 'Tốt nhưng tiến độ hơi nhanh',                             TRUE),
('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'cc000001-0000-0000-0000-000000000000', '2023-2024', 1, 5, 5, 5, 5, 'Môn học rất hữu ích, giảng viên xuất sắc',                TRUE),
('50000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'cc000004-0000-0000-0000-000000000000', '2023-2024', 1, 4, 4, 4, 4, 'Nội dung phù hợp, cần thêm case study thực tế',           TRUE);

-- ============================================================
-- FACILITIES (Cơ sở vật chất)
-- ============================================================
INSERT INTO facilities (id, code, name, type, building, floor, capacity, equipment, status) VALUES
('fac00000-0000-0000-0000-000000000001', 'A101',  'Phòng học A101',          'classroom',  'Tòa A', 1, 40,  'Projector, Whiteboard, AC',               'available'),
('fac00000-0000-0000-0000-000000000002', 'A102',  'Phòng học A102',          'classroom',  'Tòa A', 1, 40,  'Projector, Whiteboard, AC',               'available'),
('fac00000-0000-0000-0000-000000000003', 'B201',  'Phòng Lab CNTT 1',        'lab',        'Tòa B', 2, 30,  '30 PCs, Projector, Server',               'available'),
('fac00000-0000-0000-0000-000000000004', 'B202',  'Phòng Lab CNTT 2',        'lab',        'Tòa B', 2, 35,  '35 PCs, Projector, Networking equipment', 'maintenance'),
('fac00000-0000-0000-0000-000000000005', 'C301',  'Thư viện tầng 3',         'library',    'Tòa C', 3, 100, 'Books, Study desks, WiFi',                'available'),
('fac00000-0000-0000-0000-000000000006', 'D101',  'Hội trường lớn',          'auditorium', 'Tòa D', 1, 300, 'Sound system, Projector, Stage',          'available'),
('fac00000-0000-0000-0000-000000000007', 'E101',  'Phòng kế toán',           'classroom',  'Tòa E', 1, 45,  'Projector, Whiteboard',                   'available'),
('fac00000-0000-0000-0000-000000000008', 'SPORT', 'Sân thể thao',            'sports',     'Ngoài trời', 0, 200, 'Basketball court, Football field',    'available');

-- ============================================================
-- FACILITY_BOOKINGS (Đặt phòng)
-- ============================================================
INSERT INTO facility_bookings (facility_id, booked_by, purpose, start_time, end_time, status, notes) VALUES
('fac00000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Lễ khai giảng năm học mới',        '2024-09-01 08:00:00', '2024-09-01 11:00:00', 'approved',  NULL),
('fac00000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Thực hành lập trình Java',         '2024-03-15 13:00:00', '2024-03-15 15:00:00', 'approved',  NULL),
('fac00000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Workshop về AI',                   '2024-03-20 14:00:00', '2024-03-20 17:00:00', 'pending',   'Cần kiểm tra thiết bị'),
('fac00000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'Giải bóng đá khoa CNTT',           '2024-03-25 15:00:00', '2024-03-25 18:00:00', 'approved',  NULL);

-- ============================================================
-- ANNOUNCEMENTS (Thông báo chung)
-- ============================================================
INSERT INTO announcements (title, content, type, target_group, target_id, published_by, published_at, expires_at, is_pinned) VALUES
('Thông báo nghỉ Tết Nguyên đán 2024', 
 'Nhà trường thông báo lịch nghỉ Tết Nguyên đán 2024 từ ngày 08/02/2024 đến 18/02/2024. Sinh viên quay lại học bình thường từ 19/02/2024.',
 'general', 'all', NULL, 'a0000000-0000-0000-0000-000000000001', '2024-01-15 10:00:00', '2024-02-20 00:00:00', TRUE),

('Lịch thi cuối kỳ HK1 năm học 2023-2024',
 'Lịch thi cuối kỳ đã được công bố. Sinh viên vui lòng kiểm tra lịch thi và chuẩn bị ôn tập. Lịch thi chi tiết xem tại phần Exam Schedules.',
 'deadline', 'all', NULL, 'a0000000-0000-0000-0000-000000000001', '2023-11-20 09:00:00', '2023-12-31 23:59:59', TRUE),

('Thông báo đóng học phí HK2 năm học 2023-2024',
 'Sinh viên cần hoàn thành đóng học phí HK2 trước ngày 28/02/2024. Sau thời gian này sẽ bị tính phí trễ hạn.',
 'deadline', 'all', NULL, 'a0000000-0000-0000-0000-000000000002', '2024-02-01 08:00:00', '2024-03-01 00:00:00', TRUE),

('Workshop: Xu hướng Công nghệ AI 2024',
 'Khoa CNTT tổ chức workshop về xu hướng AI. Thời gian: 14:00 ngày 20/03/2024 tại Thư viện tầng 3. Đăng ký tham dự qua email.',
 'event', 'department', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024-03-10 10:00:00', '2024-03-21 00:00:00', FALSE),

('Khẩn: Điều chỉnh lịch học tuần 10',
 'Do giảng viên có việc đột xuất, lớp CNTT-K21A môn INT202 chuyển từ thứ 3 sang thứ 5 cùng giờ.',
 'urgent', 'class', 'cc000001-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2024-03-11 07:00:00', '2024-03-14 00:00:00', FALSE);

-- ============================================================
-- STUDENT_REGISTRATIONS (Đăng ký môn học)
-- ============================================================
INSERT INTO student_registrations (student_id, class_course_id, academic_year, semester, registration_date, status) 
SELECT s.id, cc.id, '2023-2024', 1, '2023-08-20 10:00:00', 'approved'
FROM students s
CROSS JOIN class_courses cc
WHERE s.class_id = cc.class_id
AND s.status = 'active'
LIMIT 50;  -- Tạo một số đăng ký mẫu


-- ============================================================
-- QUICK CHECK: Thống kê nhanh sau khi seed
-- ============================================================
-- SELECT 'users'                  AS tbl, COUNT(*) FROM users
-- UNION ALL SELECT 'departments',        COUNT(*) FROM departments
-- UNION ALL SELECT 'instructors',        COUNT(*) FROM instructors
-- UNION ALL SELECT 'courses',            COUNT(*) FROM courses
-- UNION ALL SELECT 'classes',            COUNT(*) FROM classes
-- UNION ALL SELECT 'students',           COUNT(*) FROM students
-- UNION ALL SELECT 'class_courses',      COUNT(*) FROM class_courses
-- UNION ALL SELECT 'grades',             COUNT(*) FROM grades
-- UNION ALL SELECT 'tuition',            COUNT(*) FROM tuition
-- UNION ALL SELECT 'attendance',         COUNT(*) FROM attendance
-- UNION ALL SELECT 'notifications',      COUNT(*) FROM notifications
-- UNION ALL SELECT 'student_registrations', COUNT(*) FROM student_registrations
-- UNION ALL SELECT 'exam_schedules',     COUNT(*) FROM exam_schedules
-- UNION ALL SELECT 'scholarships',       COUNT(*) FROM scholarships
-- UNION ALL SELECT 'student_scholarships', COUNT(*) FROM student_scholarships
-- UNION ALL SELECT 'disciplinary_actions', COUNT(*) FROM disciplinary_actions
-- UNION ALL SELECT 'leave_requests',     COUNT(*) FROM leave_requests
-- UNION ALL SELECT 'student_documents',  COUNT(*) FROM student_documents
-- UNION ALL SELECT 'course_evaluations', COUNT(*) FROM course_evaluations
-- UNION ALL SELECT 'facilities',         COUNT(*) FROM facilities
-- UNION ALL SELECT 'facility_bookings',  COUNT(*) FROM facility_bookings
-- UNION ALL SELECT 'announcements',      COUNT(*) FROM announcements;