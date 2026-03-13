-- ==========================================
-- MODULE ĐĂNG KÝ MÔN HỌC (COURSE REGISTRATION)
-- ==========================================

-- 1. Bảng quản lý các đợt đăng ký môn học
-- Giúp Admin mở/đóng cổng đăng ký cho sinh viên theo thời gian quy định.
CREATE TABLE IF NOT EXISTS public.registration_periods (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(200) NOT NULL, -- Ví dụ: "Đăng ký môn học Học kỳ 1 Năm học 2024-2025"
    academic_year character varying(20) NOT NULL,
    semester integer NOT NULL,
    start_at timestamp without time zone NOT NULL,
    end_at timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'upcoming'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT registration_periods_pkey PRIMARY KEY (id),
    CONSTRAINT registration_periods_status_check CHECK (((status)::text = ANY ((ARRAY['upcoming'::character varying, 'open'::character varying, 'closed'::character varying])::text[]))),
    CONSTRAINT registration_periods_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3])))
);

-- 2. Bảng danh sách các môn học được phép đăng ký trong kỳ (Course Offerings)
-- Trước khi tạo các lớp học phần (sections), Admin sẽ chọn các môn từ danh mục Courses để mở cho kỳ này.
CREATE TABLE IF NOT EXISTS public.semester_courses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    registration_period_id uuid NOT NULL,
    course_id uuid NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT semester_courses_pkey PRIMARY KEY (id),
    CONSTRAINT semester_courses_course_period_unique UNIQUE (registration_period_id, course_id),
    CONSTRAINT fk_semester_courses_period FOREIGN KEY (registration_period_id) REFERENCES public.registration_periods(id) ON DELETE CASCADE,
    CONSTRAINT fk_semester_courses_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- 3. Bổ sung liên kết từ lớp học phần (class_courses) tới đợt đăng ký
-- Điều này giúp lọc danh sách lớp học phần khi sinh viên vào trang đăng ký của kỳ đó.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_courses' AND column_name='registration_period_id') THEN
        ALTER TABLE public.class_courses ADD COLUMN registration_period_id uuid;
        ALTER TABLE public.class_courses ADD CONSTRAINT fk_class_courses_registration_period 
            FOREIGN KEY (registration_period_id) REFERENCES public.registration_periods(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Đánh index để tăng tốc truy vấn khi sinh viên tìm kiếm môn học
CREATE INDEX IF NOT EXISTS idx_registration_periods_dates ON public.registration_periods (start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_semester_courses_period ON public.semester_courses (registration_period_id);
