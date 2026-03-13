--
-- PostgreSQL database dump
--

\restrict gbnXviTkzgiw0EMcRJiTLxzdZw1FDDLM85YtOTjoWAEYzKIimz1JlufzuOXUFBK

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-12 11:04:54

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16796)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5383 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 253 (class 1255 OID 16994)
-- Name: fn_update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;


ALTER FUNCTION public.fn_update_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 242 (class 1259 OID 18102)
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 18048)
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    type character varying(30),
    target_group character varying(50),
    target_id uuid,
    published_by uuid,
    published_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    is_pinned boolean DEFAULT false,
    attachments text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT announcements_type_check CHECK (((type)::text = ANY ((ARRAY['general'::character varying, 'academic'::character varying, 'event'::character varying, 'deadline'::character varying, 'urgent'::character varying])::text[])))
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17751)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    class_course_id uuid,
    check_date date DEFAULT CURRENT_DATE NOT NULL,
    status character varying(20) DEFAULT 'present'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT attendance_status_check CHECK (((status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying, 'excused'::character varying])::text[])))
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17672)
-- Name: class_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_courses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    class_id uuid,
    course_id uuid,
    instructor_id uuid,
    schedule character varying(100),
    room character varying(50)
);


ALTER TABLE public.class_courses OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17602)
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    department_id uuid,
    academic_year character varying(20) NOT NULL,
    semester integer,
    max_students integer DEFAULT 40,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT classes_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17967)
-- Name: course_evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_evaluations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    course_id uuid,
    instructor_id uuid,
    class_id uuid,
    academic_year character varying(20) NOT NULL,
    semester integer,
    content_rating integer,
    teaching_rating integer,
    material_rating integer,
    overall_rating integer,
    comments text,
    is_anonymous boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT course_evaluations_content_rating_check CHECK (((content_rating >= 1) AND (content_rating <= 5))),
    CONSTRAINT course_evaluations_material_rating_check CHECK (((material_rating >= 1) AND (material_rating <= 5))),
    CONSTRAINT course_evaluations_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5))),
    CONSTRAINT course_evaluations_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT course_evaluations_teaching_rating_check CHECK (((teaching_rating >= 1) AND (teaching_rating <= 5)))
);


ALTER TABLE public.course_evaluations OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17622)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(150) NOT NULL,
    department_id uuid,
    credits integer DEFAULT 3,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17571)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17891)
-- Name: disciplinary_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplinary_actions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    action_type character varying(50) NOT NULL,
    reason text NOT NULL,
    action_date date NOT NULL,
    end_date date,
    status character varying(20) DEFAULT 'active'::character varying,
    issued_by uuid,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT disciplinary_actions_action_type_check CHECK (((action_type)::text = ANY ((ARRAY['warning'::character varying, 'probation'::character varying, 'suspension'::character varying, 'expulsion'::character varying])::text[]))),
    CONSTRAINT disciplinary_actions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.disciplinary_actions OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17819)
-- Name: exam_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_schedules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    course_id uuid,
    class_id uuid,
    exam_type character varying(20) NOT NULL,
    exam_date timestamp without time zone NOT NULL,
    duration integer NOT NULL,
    room character varying(50),
    academic_year character varying(20) NOT NULL,
    semester integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT exam_schedules_exam_type_check CHECK (((exam_type)::text = ANY ((ARRAY['midterm'::character varying, 'final'::character varying, 'retest'::character varying])::text[]))),
    CONSTRAINT exam_schedules_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE public.exam_schedules OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 18006)
-- Name: facilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facilities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(30),
    building character varying(50),
    floor integer,
    capacity integer,
    equipment text,
    status character varying(20) DEFAULT 'available'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT facilities_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'occupied'::character varying, 'maintenance'::character varying, 'unavailable'::character varying])::text[]))),
    CONSTRAINT facilities_type_check CHECK (((type)::text = ANY ((ARRAY['classroom'::character varying, 'lab'::character varying, 'library'::character varying, 'auditorium'::character varying, 'sports'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.facilities OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 18023)
-- Name: facility_bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facility_bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    facility_id uuid,
    booked_by uuid,
    purpose character varying(200) NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT facility_bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.facility_bookings OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17696)
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    course_id uuid,
    class_id uuid,
    assignment_score numeric(5,2),
    midterm_score numeric(5,2),
    final_score numeric(5,2),
    gpa numeric(5,2) GENERATED ALWAYS AS (round((((COALESCE(assignment_score, (0)::numeric) * 0.2) + (COALESCE(midterm_score, (0)::numeric) * 0.3)) + (COALESCE(final_score, (0)::numeric) * 0.5)), 2)) STORED,
    letter_grade character varying(5),
    semester integer,
    academic_year character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT grades_assignment_score_check CHECK (((assignment_score >= (0)::numeric) AND (assignment_score <= (10)::numeric))),
    CONSTRAINT grades_final_score_check CHECK (((final_score >= (0)::numeric) AND (final_score <= (10)::numeric))),
    CONSTRAINT grades_midterm_score_check CHECK (((midterm_score >= (0)::numeric) AND (midterm_score <= (10)::numeric))),
    CONSTRAINT grades_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17583)
-- Name: instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(20) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100),
    phone character varying(20),
    department_id uuid,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.instructors OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17917)
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    request_type character varying(30) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by uuid,
    approved_date date,
    documents text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT leave_requests_request_type_check CHECK (((request_type)::text = ANY ((ARRAY['sick_leave'::character varying, 'personal_leave'::character varying, 'academic_leave'::character varying, 'maternity_leave'::character varying])::text[]))),
    CONSTRAINT leave_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17777)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    type character varying(20) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['info'::character varying, 'warning'::character varying, 'error'::character varying, 'success'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17847)
-- Name: scholarships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scholarships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    amount numeric(15,2) NOT NULL,
    type character varying(50),
    requirements text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT scholarships_type_check CHECK (((type)::text = ANY ((ARRAY['academic'::character varying, 'need-based'::character varying, 'sponsor'::character varying, 'government'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.scholarships OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17944)
-- Name: student_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    document_type character varying(50) NOT NULL,
    document_name character varying(200) NOT NULL,
    file_url text,
    issued_date date,
    expiry_date date,
    notes text,
    uploaded_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT student_documents_document_type_check CHECK (((document_type)::text = ANY ((ARRAY['transcript'::character varying, 'certificate'::character varying, 'id_card'::character varying, 'diploma'::character varying, 'recommendation'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.student_documents OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17792)
-- Name: student_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_registrations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    class_course_id uuid,
    academic_year character varying(20) NOT NULL,
    semester integer,
    registration_date timestamp without time zone DEFAULT now(),
    status character varying(20) DEFAULT 'registered'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT student_registrations_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT student_registrations_status_check CHECK (((status)::text = ANY ((ARRAY['registered'::character varying, 'approved'::character varying, 'cancelled'::character varying, 'dropped'::character varying])::text[])))
);


ALTER TABLE public.student_registrations OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17864)
-- Name: student_scholarships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_scholarships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    scholarship_id uuid,
    academic_year character varying(20) NOT NULL,
    semester integer,
    amount_received numeric(15,2) NOT NULL,
    awarded_date date,
    status character varying(20) DEFAULT 'approved'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT student_scholarships_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT student_scholarships_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'disbursed'::character varying])::text[])))
);


ALTER TABLE public.student_scholarships OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17642)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_code character varying(20) NOT NULL,
    full_name character varying(100) NOT NULL,
    date_of_birth date,
    gender character varying(10),
    email character varying(100),
    phone character varying(20),
    address text,
    avatar_url text,
    class_id uuid,
    department_id uuid,
    enrollment_year integer,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT students_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying])::text[]))),
    CONSTRAINT students_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'graduated'::character varying, 'suspended'::character varying, 'dropped'::character varying])::text[])))
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17727)
-- Name: tuition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tuition (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid,
    academic_year character varying(20) NOT NULL,
    semester integer,
    amount numeric(15,2) NOT NULL,
    paid_amount numeric(15,2) DEFAULT 0,
    due_date date,
    paid_date date,
    status character varying(20) DEFAULT 'unpaid'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT tuition_semester_check CHECK ((semester = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT tuition_status_check CHECK (((status)::text = ANY ((ARRAY['unpaid'::character varying, 'partial'::character varying, 'paid'::character varying, 'overdue'::character varying])::text[])))
);


ALTER TABLE public.tuition OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17550)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'staff'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'staff'::character varying, 'student'::character varying, 'instructor'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5377 (class 0 OID 18102)
-- Dependencies: 242
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
\.


--
-- TOC entry 5376 (class 0 OID 18048)
-- Dependencies: 241
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, type, target_group, target_id, published_by, published_at, expires_at, is_pinned, attachments, created_at) FROM stdin;
4ca0a956-2a3a-4472-bbfa-51cffa08c402	Thông báo nghỉ Tết Nguyên đán 2024	Nhà trường thông báo lịch nghỉ Tết Nguyên đán 2024 từ ngày 08/02/2024 đến 18/02/2024. Sinh viên quay lại học bình thường từ 19/02/2024.	general	all	\N	a0000000-0000-0000-0000-000000000001	2024-01-15 10:00:00	2024-02-20 00:00:00	t	\N	2026-03-11 13:32:22.226388
a6d2e737-ed37-4aad-964c-6ce44ad74a4a	Lịch thi cuối kỳ HK1 năm học 2023-2024	Lịch thi cuối kỳ đã được công bố. Sinh viên vui lòng kiểm tra lịch thi và chuẩn bị ôn tập. Lịch thi chi tiết xem tại phần Exam Schedules.	deadline	all	\N	a0000000-0000-0000-0000-000000000001	2023-11-20 09:00:00	2023-12-31 23:59:59	t	\N	2026-03-11 13:32:22.226388
a72226ea-59df-4cdc-9d2e-e733ba3a7421	Thông báo đóng học phí HK2 năm học 2023-2024	Sinh viên cần hoàn thành đóng học phí HK2 trước ngày 28/02/2024. Sau thời gian này sẽ bị tính phí trễ hạn.	deadline	all	\N	a0000000-0000-0000-0000-000000000002	2024-02-01 08:00:00	2024-03-01 00:00:00	t	\N	2026-03-11 13:32:22.226388
d7a0d7fe-254c-4f53-85d9-a708c34286e4	Workshop: Xu hướng Công nghệ AI 2024	Khoa CNTT tổ chức workshop về xu hướng AI. Thời gian: 14:00 ngày 20/03/2024 tại Thư viện tầng 3. Đăng ký tham dự qua email.	event	department	d0000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	2024-03-10 10:00:00	2024-03-21 00:00:00	f	\N	2026-03-11 13:32:22.226388
59ee07b8-fdc9-4521-a547-7d7133ecdf6a	Khẩn: Điều chỉnh lịch học tuần 10	Do giảng viên có việc đột xuất, lớp CNTT-K21A môn INT202 chuyển từ thứ 3 sang thứ 5 cùng giờ.	urgent	class	cc000001-0000-0000-0000-000000000000	a0000000-0000-0000-0000-000000000002	2024-03-11 07:00:00	2024-03-14 00:00:00	f	\N	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5364 (class 0 OID 17751)
-- Dependencies: 229
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, student_id, class_course_id, check_date, status, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5361 (class 0 OID 17672)
-- Dependencies: 226
-- Data for Name: class_courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class_courses (id, class_id, course_id, instructor_id, schedule, room) FROM stdin;
057599ec-d3ba-4ca6-9f0c-fec262d5e660	cc000001-0000-0000-0000-000000000000	c0000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	Thứ 2, 7:30-9:30	A101
de02ee1c-51f5-49fd-a595-c9f7cbd081d6	cc000001-0000-0000-0000-000000000000	c0000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000002	Thứ 3, 9:45-11:45	A102
d914179a-2a23-4d29-a35a-39ae5fcda14c	cc000001-0000-0000-0000-000000000000	c0000000-0000-0000-0000-000000000004	10000000-0000-0000-0000-000000000003	Thứ 4, 13:00-15:00	B201
40768653-ac05-4c1f-b861-4328d09b2441	cc000004-0000-0000-0000-000000000000	c0000000-0000-0000-0000-000000000008	10000000-0000-0000-0000-000000000004	Thứ 2, 7:30-9:30	E101
ae382117-03a7-4c12-932d-b258dcda9dce	cc000006-0000-0000-0000-000000000000	c0000000-0000-0000-0000-000000000013	10000000-0000-0000-0000-000000000005	Thứ 4, 13:00-15:00	F202
\.


--
-- TOC entry 5358 (class 0 OID 17602)
-- Dependencies: 223
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (id, code, name, department_id, academic_year, semester, max_students, created_at) FROM stdin;
cc000002-0000-0000-0000-000000000000	CNTT-K21B	CNTT Khóa 21 - Lớp B	d0000000-0000-0000-0000-000000000001	2023-2024	1	40	2026-03-11 13:32:22.226388
cc000003-0000-0000-0000-000000000000	CNTT-K22A	CNTT Khóa 22 - Lớp A	d0000000-0000-0000-0000-000000000001	2023-2024	1	45	2026-03-11 13:32:22.226388
cc000004-0000-0000-0000-000000000000	KT-K21A	Kế toán Khóa 21 - Lớp A	d0000000-0000-0000-0000-000000000002	2023-2024	1	40	2026-03-11 13:32:22.226388
cc000005-0000-0000-0000-000000000000	KT-K22A	Kế toán Khóa 22 - Lớp A	d0000000-0000-0000-0000-000000000002	2023-2024	1	40	2026-03-11 13:32:22.226388
cc000006-0000-0000-0000-000000000000	QTKD-K21A	QTKD Khóa 21 - Lớp A	d0000000-0000-0000-0000-000000000003	2023-2024	1	40	2026-03-11 13:32:22.226388
cc000007-0000-0000-0000-000000000000	NN-K21A	Ngôn ngữ Khóa 21 - Lớp A	d0000000-0000-0000-0000-000000000004	2023-2024	1	35	2026-03-11 13:32:22.226388
cc000001-0000-0000-0000-000000000000	CNTT-K21A	CNTT Khóa 21 - Lớp A	d0000000-0000-0000-0000-000000000001	2023-2024	1	60	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5373 (class 0 OID 17967)
-- Dependencies: 238
-- Data for Name: course_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_evaluations (id, student_id, course_id, instructor_id, class_id, academic_year, semester, content_rating, teaching_rating, material_rating, overall_rating, comments, is_anonymous, created_at) FROM stdin;
a1d8c4c7-f8b6-44d8-ab5c-445a3a710550	50000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	2023-2024	1	5	5	4	5	Giảng viên nhiệt tình, bài giảng dễ hiểu	t	2026-03-11 13:32:22.226388
96e77b21-c3b5-4130-9507-85629e379a2e	50000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	2023-2024	1	4	5	4	4	Rất tốt, cần thêm bài tập thực hành	t	2026-03-11 13:32:22.226388
78ed0662-fc45-45df-b90e-21ab38172945	50000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	2023-2024	1	4	4	3	4	Tốt nhưng tiến độ hơi nhanh	t	2026-03-11 13:32:22.226388
ab90af58-c61a-40fc-a41f-550b8d5dfef6	50000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	2023-2024	1	5	5	5	5	Môn học rất hữu ích, giảng viên xuất sắc	t	2026-03-11 13:32:22.226388
086abe7a-a059-4c6a-8d18-3594c3bca738	50000000-0000-0000-0000-000000000021	c0000000-0000-0000-0000-000000000008	10000000-0000-0000-0000-000000000004	cc000004-0000-0000-0000-000000000000	2023-2024	1	4	4	4	4	Nội dung phù hợp, cần thêm case study thực tế	t	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5359 (class 0 OID 17622)
-- Dependencies: 224
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, code, name, department_id, credits, description, created_at) FROM stdin;
c0000000-0000-0000-0000-000000000001	INT101	Nhập môn lập trình	d0000000-0000-0000-0000-000000000001	3	Cơ bản về lập trình với Python	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000002	INT201	Cấu trúc dữ liệu và giải thuật	d0000000-0000-0000-0000-000000000001	4	Stack, Queue, Tree, Graph và các thuật toán	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000003	INT202	Lập trình hướng đối tượng	d0000000-0000-0000-0000-000000000001	3	OOP với Java	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000004	INT301	Cơ sở dữ liệu	d0000000-0000-0000-0000-000000000001	3	SQL, thiết kế CSDL quan hệ	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000005	INT302	Mạng máy tính	d0000000-0000-0000-0000-000000000001	3	Giao thức TCP/IP, mô hình OSI	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000006	INT401	Lập trình Web	d0000000-0000-0000-0000-000000000001	4	HTML, CSS, JavaScript, React	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000007	INT402	Trí tuệ nhân tạo	d0000000-0000-0000-0000-000000000001	3	Machine Learning cơ bản	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000008	ACC101	Nguyên lý kế toán	d0000000-0000-0000-0000-000000000002	3	Nguyên tắc cơ bản của kế toán	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000009	ACC201	Kế toán tài chính	d0000000-0000-0000-0000-000000000002	4	Báo cáo tài chính, bút toán	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000010	ACC202	Kế toán quản trị	d0000000-0000-0000-0000-000000000002	3	Chi phí, lợi nhuận, ngân sách	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000011	ACC301	Thuế	d0000000-0000-0000-0000-000000000002	3	Luật thuế Việt Nam	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000012	BUS101	Quản trị học	d0000000-0000-0000-0000-000000000003	3	Lý thuyết tổ chức và quản lý	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000013	BUS201	Marketing căn bản	d0000000-0000-0000-0000-000000000003	3	4P, phân tích thị trường	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000014	BUS202	Quản trị nhân sự	d0000000-0000-0000-0000-000000000003	3	Tuyển dụng, đào tạo, đánh giá	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000015	ENG101	Tiếng Anh cơ bản	d0000000-0000-0000-0000-000000000004	3	Kỹ năng nghe, nói, đọc, viết	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000016	ENG201	Tiếng Anh chuyên ngành	d0000000-0000-0000-0000-000000000004	3	Business English	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000017	GEN101	Toán cao cấp A1	\N	4	Giải tích, đại số tuyến tính	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000018	GEN102	Xác suất thống kê	\N	3	Lý thuyết xác suất, thống kê mô tả	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000019	GEN103	Triết học Mác-Lênin	\N	3	Chủ nghĩa duy vật biện chứng	2026-03-11 13:32:22.226388
c0000000-0000-0000-0000-000000000020	GEN104	Giáo dục thể chất	\N	2	Thể thao, sức khỏe	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5356 (class 0 OID 17571)
-- Dependencies: 221
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, code, name, created_at) FROM stdin;
d0000000-0000-0000-0000-000000000001	CNTT	Công nghệ thông tin	2026-03-11 13:32:22.226388
d0000000-0000-0000-0000-000000000002	KT	Kế toán	2026-03-11 13:32:22.226388
d0000000-0000-0000-0000-000000000003	QTKD	Quản trị kinh doanh	2026-03-11 13:32:22.226388
d0000000-0000-0000-0000-000000000004	NN	Ngôn ngữ học	2026-03-11 13:32:22.226388
d0000000-0000-0000-0000-000000000005	DTVT	Điện tử viễn thông	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5370 (class 0 OID 17891)
-- Dependencies: 235
-- Data for Name: disciplinary_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disciplinary_actions (id, student_id, action_type, reason, action_date, end_date, status, issued_by, notes, created_at) FROM stdin;
1b042af0-4aa3-412e-b6de-bea92a90fa05	50000000-0000-0000-0000-000000000007	suspension	Vi phạm kỷ luật: gian lận trong thi cử	2023-11-01	2024-01-31	active	a0000000-0000-0000-0000-000000000001	Đình chỉ học 3 tháng	2026-03-11 13:32:22.226388
50188a68-23b6-46e9-aff2-c3a18c7bf40b	50000000-0000-0000-0000-000000000015	warning	Vắng mặt quá nhiều buổi học không phép	2023-10-15	\N	completed	a0000000-0000-0000-0000-000000000002	Cảnh cáo lần 1	2026-03-11 13:32:22.226388
2a18dcdc-5bef-42a7-8554-1fb920f0d4bb	50000000-0000-0000-0000-000000000003	warning	Nộp bài tập trễ hạn nhiều lần	2023-11-05	\N	active	a0000000-0000-0000-0000-000000000002	Cảnh cáo học vụ	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5367 (class 0 OID 17819)
-- Dependencies: 232
-- Data for Name: exam_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_schedules (id, course_id, class_id, exam_type, exam_date, duration, room, academic_year, semester, notes, created_at) FROM stdin;
19efbfc6-81f6-42fc-98a9-07f1784df7e5	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	midterm	2023-10-20 08:00:00	90	A101	2023-2024	1	Thi giữa kỳ INT101	2026-03-11 13:32:22.226388
e57c5758-eaf0-40c6-a70f-5a376123ed47	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	midterm	2023-10-22 08:00:00	120	A102	2023-2024	1	Thi giữa kỳ INT202	2026-03-11 13:32:22.226388
64ababc4-2aaa-41b5-a62c-488575009476	c0000000-0000-0000-0000-000000000008	cc000004-0000-0000-0000-000000000000	midterm	2023-10-21 13:00:00	90	E101	2023-2024	1	Thi giữa kỳ ACC101	2026-03-11 13:32:22.226388
d84a7f08-7d85-4c97-875c-f810134293f3	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	final	2023-12-15 08:00:00	120	A201	2023-2024	1	Thi cuối kỳ INT101	2026-03-11 13:32:22.226388
2570d7d9-6899-4c1b-bd62-2aff92041e4f	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	final	2023-12-17 08:00:00	150	A202	2023-2024	1	Thi cuối kỳ INT202	2026-03-11 13:32:22.226388
8e6cf2fa-62c1-4d86-b753-d85e4af0c964	c0000000-0000-0000-0000-000000000008	cc000004-0000-0000-0000-000000000000	final	2023-12-16 13:00:00	120	E201	2023-2024	1	Thi cuối kỳ ACC101	2026-03-11 13:32:22.226388
39d3a624-e0ee-434e-ac16-9367e75aa4cf	c0000000-0000-0000-0000-000000000012	cc000006-0000-0000-0000-000000000000	final	2023-12-18 08:00:00	90	F101	2023-2024	1	Thi cuối kỳ BUS101	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5374 (class 0 OID 18006)
-- Dependencies: 239
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facilities (id, code, name, type, building, floor, capacity, equipment, status, notes, created_at) FROM stdin;
fac00000-0000-0000-0000-000000000001	A101	Phòng học A101	classroom	Tòa A	1	40	Projector, Whiteboard, AC	available	\N	2026-03-11 13:32:22.226388
fac00000-0000-0000-0000-000000000002	A102	Phòng học A102	classroom	Tòa A	1	40	Projector, Whiteboard, AC	available	\N	2026-03-11 13:32:22.226388
fac00000-0000-0000-0000-000000000003	B201	Phòng Lab CNTT 1	lab	Tòa B	2	30	30 PCs, Projector, Server	available	\N	2026-03-11 13:32:22.226388
fac00000-0000-0000-0000-000000000004	B202	Phòng Lab CNTT 2	lab	Tòa B	2	35	35 PCs, Projector, Networking equipment	maintenance	\N	2026-03-11 13:32:22.226388
fac00000-0000-0000-0000-000000000005	C301	Thư viện tầng 3	library	Tòa C	3	100	Books, Study desks, WiFi	available	\N	2026-03-11 13:32:22.226388
fac00000-0000-0000-0000-000000000006	D101	Hội trường lớn	auditorium	Tòa D	1	300	Sound system, Projector, Stage	available	\N	2026-03-11 13:32:22.226388
fac00000-0000-0000-0000-000000000007	E101	Phòng kế toán	classroom	Tòa E	1	45	Projector, Whiteboard	available	\N	2026-03-11 13:32:22.226388
fac00000-0000-0000-0000-000000000008	SPORT	Sân thể thao	sports	Ngoài trời	0	200	Basketball court, Football field	available	\N	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5375 (class 0 OID 18023)
-- Dependencies: 240
-- Data for Name: facility_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_bookings (id, facility_id, booked_by, purpose, start_time, end_time, status, notes, created_at) FROM stdin;
0f711c43-d7dd-4baa-91aa-bcab772e153f	fac00000-0000-0000-0000-000000000006	a0000000-0000-0000-0000-000000000001	Lễ khai giảng năm học mới	2024-09-01 08:00:00	2024-09-01 11:00:00	approved	\N	2026-03-11 13:32:22.226388
def3a846-d2c3-4ca0-8ee7-ad39eda858c2	fac00000-0000-0000-0000-000000000003	a0000000-0000-0000-0000-000000000002	Thực hành lập trình Java	2024-03-15 13:00:00	2024-03-15 15:00:00	approved	\N	2026-03-11 13:32:22.226388
262555d0-588b-4404-a997-f344a311feac	fac00000-0000-0000-0000-000000000005	a0000000-0000-0000-0000-000000000002	Workshop về AI	2024-03-20 14:00:00	2024-03-20 17:00:00	pending	Cần kiểm tra thiết bị	2026-03-11 13:32:22.226388
d372ff10-6dad-4d23-a28b-1eac2453d3d1	fac00000-0000-0000-0000-000000000008	a0000000-0000-0000-0000-000000000003	Giải bóng đá khoa CNTT	2024-03-25 15:00:00	2024-03-25 18:00:00	approved	\N	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5362 (class 0 OID 17696)
-- Dependencies: 227
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, student_id, course_id, class_id, assignment_score, midterm_score, final_score, letter_grade, semester, academic_year, created_at, updated_at) FROM stdin;
402a5689-1db3-4938-bd68-9b3236f30272	50000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	9.00	8.50	9.00	A+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
2d561613-0222-4fe0-afa6-1c16ec15dc0b	50000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	8.00	7.50	8.00	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
42153fbb-a831-4cd9-9864-8cd9f1503e94	50000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	7.00	6.50	7.50	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
9ef65593-5289-4783-b6c4-6225b483b110	50000000-0000-0000-0000-000000000004	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	6.00	5.50	6.00	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
d0b5b892-f282-4d4c-b1de-c5b75a0e992e	50000000-0000-0000-0000-000000000005	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	9.50	9.00	9.50	A+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
39295fc5-e805-465e-908b-cf8ae7b21c26	50000000-0000-0000-0000-000000000006	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	5.00	4.50	5.50	C+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
9b98db09-010b-489b-bdf8-0f6432361c46	50000000-0000-0000-0000-000000000007	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	4.00	3.50	4.00	D	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
26806060-9542-4e6f-a61e-772fe0d4b82b	50000000-0000-0000-0000-000000000008	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	8.50	8.00	8.50	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
c7d4485f-5a8e-44c4-bc42-97d4e5cabeda	50000000-0000-0000-0000-000000000009	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	7.50	7.00	7.00	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
4325b20f-24e9-44b4-8b1b-6b2d95ddbad0	50000000-0000-0000-0000-000000000010	c0000000-0000-0000-0000-000000000001	cc000001-0000-0000-0000-000000000000	6.50	6.00	6.50	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
29dfefd8-e8ee-4b17-8be9-bd61260ba395	50000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	8.00	8.00	8.50	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
f44bcc49-1d1d-4805-8c60-6bd30f75cc88	50000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	7.00	6.50	7.00	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
72648a10-89e4-4497-9a24-8b17b2618e0e	50000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	5.00	5.00	5.50	C+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
7b5d7850-ed78-48e2-a364-e1f8adaac2ab	50000000-0000-0000-0000-000000000004	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	6.00	6.00	6.50	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
547c5a4b-0e1b-470d-9cb0-8ab74a61eb33	50000000-0000-0000-0000-000000000005	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	9.00	9.00	9.50	A+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
99754d32-fe7e-4147-91d6-8f2336b49312	50000000-0000-0000-0000-000000000008	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	7.50	7.50	8.00	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
b76484f5-0d95-41b5-813b-17894f6100da	50000000-0000-0000-0000-000000000009	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	8.00	7.00	7.50	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
c7e91f62-ce86-4f65-a05b-3dafd3e33094	50000000-0000-0000-0000-000000000010	c0000000-0000-0000-0000-000000000002	cc000001-0000-0000-0000-000000000000	6.00	5.50	6.00	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
c80f21a4-d5ae-4c28-9dbb-367d57a0d08d	50000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	7.00	7.50	8.00	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
47f6e278-ef73-4d88-bc95-dc59f8432cc8	50000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	6.00	5.50	6.00	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
caaffdc5-d46f-4a27-8065-582727f305c7	50000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	4.00	3.50	4.50	D+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
7ac64be8-d459-4c06-911a-864885b92f6e	50000000-0000-0000-0000-000000000004	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	5.50	5.00	5.50	C+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
100d5872-dd01-43c4-8c1e-86d037975e33	50000000-0000-0000-0000-000000000005	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	8.50	8.50	9.00	A+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
31b30dd7-bcf1-4cf6-b555-abbd4155f8ce	50000000-0000-0000-0000-000000000008	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	7.00	7.00	7.50	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
3092f953-1c7f-4763-9446-9d27223ac616	50000000-0000-0000-0000-000000000009	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	6.50	6.00	6.50	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
814520d4-b0ce-4c7a-86ad-3100c0b41385	50000000-0000-0000-0000-000000000010	c0000000-0000-0000-0000-000000000017	cc000001-0000-0000-0000-000000000000	5.00	4.50	5.00	C	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
d2248f88-a0be-4269-999d-179ed4a87099	50000000-0000-0000-0000-000000000021	c0000000-0000-0000-0000-000000000008	cc000004-0000-0000-0000-000000000000	9.00	8.50	9.00	A+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
3150f7ac-febd-4c89-9dae-12fecf7d0e97	50000000-0000-0000-0000-000000000022	c0000000-0000-0000-0000-000000000008	cc000004-0000-0000-0000-000000000000	7.50	7.00	7.50	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
ce2a3e78-fd17-43a3-9d8a-737d5a5f408f	50000000-0000-0000-0000-000000000023	c0000000-0000-0000-0000-000000000008	cc000004-0000-0000-0000-000000000000	8.00	8.00	8.50	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
46d619ab-a173-4290-a6bb-27d0194fb9f7	50000000-0000-0000-0000-000000000025	c0000000-0000-0000-0000-000000000008	cc000004-0000-0000-0000-000000000000	6.50	6.00	6.50	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
19ddb624-733c-413f-8037-c3d61478282a	50000000-0000-0000-0000-000000000021	c0000000-0000-0000-0000-000000000009	cc000004-0000-0000-0000-000000000000	8.50	8.00	8.50	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
af89364a-1b63-4d7f-8f99-ed08688e28b7	50000000-0000-0000-0000-000000000022	c0000000-0000-0000-0000-000000000009	cc000004-0000-0000-0000-000000000000	7.00	6.50	7.00	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
0f64ae5e-15ac-45dd-bda4-e4c8885d714f	50000000-0000-0000-0000-000000000023	c0000000-0000-0000-0000-000000000009	cc000004-0000-0000-0000-000000000000	7.50	7.50	8.00	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
f5cc9004-951a-47f9-a81e-c1d95be175fb	50000000-0000-0000-0000-000000000025	c0000000-0000-0000-0000-000000000009	cc000004-0000-0000-0000-000000000000	5.50	5.00	5.50	C+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
cc8f31f5-0fb5-43cc-a2ab-a5334dd0ea1d	50000000-0000-0000-0000-000000000026	c0000000-0000-0000-0000-000000000012	cc000006-0000-0000-0000-000000000000	8.00	8.50	9.00	A+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
0e377d52-62de-463b-94b3-d83f97c476b0	50000000-0000-0000-0000-000000000027	c0000000-0000-0000-0000-000000000012	cc000006-0000-0000-0000-000000000000	7.00	6.50	7.00	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
87726662-0a3a-4dde-9838-cdb05c3345c8	50000000-0000-0000-0000-000000000028	c0000000-0000-0000-0000-000000000012	cc000006-0000-0000-0000-000000000000	8.50	8.00	8.50	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
9c366992-2dd8-4905-bd06-ef4bb39a30e0	50000000-0000-0000-0000-000000000011	c0000000-0000-0000-0000-000000000001	cc000002-0000-0000-0000-000000000000	8.00	7.50	8.00	A	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
46e50c22-8d2d-432e-a73b-2851e70f706b	50000000-0000-0000-0000-000000000012	c0000000-0000-0000-0000-000000000001	cc000002-0000-0000-0000-000000000000	6.50	6.00	6.50	B	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
2bcaf40d-e0bf-435b-981e-8b7977c7d2ea	50000000-0000-0000-0000-000000000013	c0000000-0000-0000-0000-000000000001	cc000002-0000-0000-0000-000000000000	9.00	8.50	9.50	A+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
87527e5f-f808-4c36-b79f-9c0d254930bc	50000000-0000-0000-0000-000000000014	c0000000-0000-0000-0000-000000000001	cc000002-0000-0000-0000-000000000000	5.00	4.50	5.00	C	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
13415eba-8dc6-409a-aad8-17c0b8aa71f2	50000000-0000-0000-0000-000000000016	c0000000-0000-0000-0000-000000000001	cc000002-0000-0000-0000-000000000000	7.50	7.00	7.50	B+	1	2023-2024	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5357 (class 0 OID 17583)
-- Dependencies: 222
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructors (id, code, full_name, email, phone, department_id, created_at) FROM stdin;
10000000-0000-0000-0000-000000000001	GV001	TS. Nguyễn Văn An	an.nv@edu.vn	0912000001	d0000000-0000-0000-0000-000000000001	2026-03-11 13:32:22.226388
10000000-0000-0000-0000-000000000002	GV002	TS. Trần Thị Bình	binh.tt@edu.vn	0912000002	d0000000-0000-0000-0000-000000000001	2026-03-11 13:32:22.226388
10000000-0000-0000-0000-000000000003	GV003	ThS. Lê Minh Cường	cuong.lm@edu.vn	0912000003	d0000000-0000-0000-0000-000000000001	2026-03-11 13:32:22.226388
10000000-0000-0000-0000-000000000004	GV004	TS. Đinh Thị Lan	lan.dt@edu.vn	0912000004	d0000000-0000-0000-0000-000000000002	2026-03-11 13:32:22.226388
10000000-0000-0000-0000-000000000005	GV005	ThS. Đỗ Thị Oanh	oanh.dt@edu.vn	0912000005	d0000000-0000-0000-0000-000000000003	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5371 (class 0 OID 17917)
-- Dependencies: 236
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, student_id, request_type, start_date, end_date, reason, status, approved_by, approved_date, documents, notes, created_at) FROM stdin;
8db9ad4a-ffc0-4c47-85f7-7520cb043e97	50000000-0000-0000-0000-000000000004	sick_leave	2023-11-10	2023-11-15	Bị ốm, cần nghỉ dưỡng bệnh	approved	a0000000-0000-0000-0000-000000000001	2023-11-09	Giấy bác sĩ	\N	2026-03-11 13:32:22.226388
98de6199-eb17-4a44-97a7-50b88cb4493c	50000000-0000-0000-0000-000000000012	personal_leave	2023-12-01	2023-12-03	Việc gia đình khẩn cấp	approved	a0000000-0000-0000-0000-000000000002	2023-11-28	\N	\N	2026-03-11 13:32:22.226388
0e19cda6-f190-480d-b28e-a3747a8d4633	50000000-0000-0000-0000-000000000019	academic_leave	2024-01-01	2024-06-30	Xin bảo lưu học tập để đi làm thêm kinh nghiệm	pending	\N	\N	Đơn xin bảo lưu	\N	2026-03-11 13:32:22.226388
98704356-1d53-46f9-96ab-5a44d56a491b	50000000-0000-0000-0000-000000000028	sick_leave	2023-10-25	2023-10-27	Ốm nhẹ	rejected	a0000000-0000-0000-0000-000000000002	2023-10-24	Không đủ lý do	\N	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5365 (class 0 OID 17777)
-- Dependencies: 230
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, title, content, type, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 5368 (class 0 OID 17847)
-- Dependencies: 233
-- Data for Name: scholarships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scholarships (id, code, name, description, amount, type, requirements, is_active, created_at) FROM stdin;
5c400000-0000-0000-0000-000000000001	HB001	Học bổng Khuyến khích học tập	Dành cho sinh viên có GPA >= 3.6	5000000.00	academic	GPA >= 3.6, không vi phạm nội quy	t	2026-03-11 13:32:22.226388
5c400000-0000-0000-0000-000000000002	HB002	Học bổng Xuất sắc	Dành cho sinh viên GPA >= 3.8	10000000.00	academic	GPA >= 3.8, tham gia hoạt động tích cực	t	2026-03-11 13:32:22.226388
5c400000-0000-0000-0000-000000000003	HB003	Học bổng Khó khăn	Hỗ trợ sinh viên hoàn cảnh khó khăn	3000000.00	need-based	Giấy xác nhận hoàn cảnh khó khăn	t	2026-03-11 13:32:22.226388
5c400000-0000-0000-0000-000000000004	HB004	Học bổng Tài năng Công nghệ	Sinh viên CNTT có thành tích cao	8000000.00	sponsor	Dự án cá nhân xuất sắc, GPA >= 3.5	t	2026-03-11 13:32:22.226388
5c400000-0000-0000-0000-000000000005	HB005	Học bổng Chính phủ	Học bổng từ Chính phủ	15000000.00	government	Sinh viên nghèo vượt khó, GPA >= 3.2	t	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5372 (class 0 OID 17944)
-- Dependencies: 237
-- Data for Name: student_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_documents (id, student_id, document_type, document_name, file_url, issued_date, expiry_date, notes, uploaded_by, created_at) FROM stdin;
e5fa6a69-d7e6-4d09-b46d-e5b784aae8ed	50000000-0000-0000-0000-000000000001	transcript	Bảng điểm HK1 2023-2024	/docs/transcript_sv21001_2023_1.pdf	2024-01-15	\N	\N	a0000000-0000-0000-0000-000000000002	2026-03-11 13:32:22.226388
fa86b5f5-92f0-4534-9434-1378615dd8c5	50000000-0000-0000-0000-000000000024	diploma	Bằng tốt nghiệp Kế toán	/docs/diploma_sv21104.pdf	2024-02-01	\N	Đã tốt nghiệp	a0000000-0000-0000-0000-000000000001	2026-03-11 13:32:22.226388
5a2d61e0-b1ea-433a-8e68-41a926e07fe1	50000000-0000-0000-0000-000000000005	certificate	Chứng chỉ TOEIC 850	/docs/toeic_sv21005.pdf	2023-09-10	\N	TOEIC score: 850	a0000000-0000-0000-0000-000000000002	2026-03-11 13:32:22.226388
4413b1c6-b6d4-4c9a-a9cf-a4ba44a4a1b9	50000000-0000-0000-0000-000000000013	certificate	Chứng chỉ AWS Cloud Practitioner	/docs/aws_sv21013.pdf	2023-11-20	\N	\N	a0000000-0000-0000-0000-000000000002	2026-03-11 13:32:22.226388
f5349df1-e962-48a2-bc06-7a0ef146f07e	50000000-0000-0000-0000-000000000021	id_card	CMND/CCCD photo	/docs/id_sv21101.pdf	2023-08-01	\N	\N	a0000000-0000-0000-0000-000000000002	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5366 (class 0 OID 17792)
-- Dependencies: 231
-- Data for Name: student_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_registrations (id, student_id, class_course_id, academic_year, semester, registration_date, status, notes, created_at) FROM stdin;
aff88380-a595-4571-9629-b929fd4d2612	50000000-0000-0000-0000-000000000001	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
c5c88788-f244-45fd-819e-39528567d55e	50000000-0000-0000-0000-000000000001	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
770be945-83ad-4557-8520-1f891dd44b6b	50000000-0000-0000-0000-000000000001	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
2ae48dd1-e287-4e11-93dd-8beeffad1520	50000000-0000-0000-0000-000000000002	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
57ce802e-1a0d-4bf6-bede-9e0c2081941f	50000000-0000-0000-0000-000000000002	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
57cca6e6-df39-4b8b-8645-9b5382df6468	50000000-0000-0000-0000-000000000002	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
379b3f77-301f-4fa8-bd60-f7ba62608fdc	50000000-0000-0000-0000-000000000003	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
d7de41cf-0097-4c5c-9285-34b8399ea523	50000000-0000-0000-0000-000000000003	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
07e1c32d-cd70-43f4-a6f8-9d926c7a2a48	50000000-0000-0000-0000-000000000003	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
f08cd8a6-818c-4942-ab5f-c433ee8101a4	50000000-0000-0000-0000-000000000004	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
c6711426-54be-49fe-99ca-7e3acb24df95	50000000-0000-0000-0000-000000000004	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
6704357c-b62d-4ced-9235-4afcf1109c12	50000000-0000-0000-0000-000000000004	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
11039eaa-fc55-4cc7-b3b3-54c95a95d373	50000000-0000-0000-0000-000000000005	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
91215a6d-298c-4ca8-8e4f-04aa01672807	50000000-0000-0000-0000-000000000005	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
698149cb-4e16-4d61-9dd3-492d4bc4e8a9	50000000-0000-0000-0000-000000000005	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
61a1ce4b-0176-49a6-bdd8-2c4aef4eb575	50000000-0000-0000-0000-000000000006	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
f04d1dec-1b5a-4e09-be5a-7be17d408f63	50000000-0000-0000-0000-000000000006	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
d5066839-f61a-4785-8610-8a102e47dd66	50000000-0000-0000-0000-000000000006	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
3dff78e1-2f01-490a-b54a-456e900ac010	50000000-0000-0000-0000-000000000008	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
727e71b7-f8c5-47ea-a6e9-7318a1e630b2	50000000-0000-0000-0000-000000000008	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
f979269f-4555-4532-ab5f-f9e8f1f5a9be	50000000-0000-0000-0000-000000000008	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
d712d676-6396-4c53-bf1f-0ab22f85c148	50000000-0000-0000-0000-000000000009	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
153f0bf6-0915-4e85-a9ad-0d3e8a066b0a	50000000-0000-0000-0000-000000000009	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
0f7a9dbd-3941-4a92-96af-dcb5c35c8a94	50000000-0000-0000-0000-000000000009	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
fa041910-dc30-4cce-af96-20680357e2a4	50000000-0000-0000-0000-000000000010	057599ec-d3ba-4ca6-9f0c-fec262d5e660	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
d1ac9c24-c487-4760-a306-f75909cfcff8	50000000-0000-0000-0000-000000000010	de02ee1c-51f5-49fd-a595-c9f7cbd081d6	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
d8786deb-a13e-4d55-9fb7-7788732ff532	50000000-0000-0000-0000-000000000010	d914179a-2a23-4d29-a35a-39ae5fcda14c	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
ef12cd91-95a1-473e-b992-9d8a328960cc	50000000-0000-0000-0000-000000000021	40768653-ac05-4c1f-b861-4328d09b2441	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
c352072a-42ad-4bc3-b45b-c40012fdad80	50000000-0000-0000-0000-000000000022	40768653-ac05-4c1f-b861-4328d09b2441	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
0dd0a318-bfcb-4492-a375-1d8975b41352	50000000-0000-0000-0000-000000000023	40768653-ac05-4c1f-b861-4328d09b2441	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
f79ff409-a0af-452e-a7a2-2fa160ea7111	50000000-0000-0000-0000-000000000025	40768653-ac05-4c1f-b861-4328d09b2441	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
fff4dd09-d847-44b5-80b8-06316e2786fc	50000000-0000-0000-0000-000000000026	ae382117-03a7-4c12-932d-b258dcda9dce	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
2abc44d8-092e-44a4-b0ac-1def55b9b5c1	50000000-0000-0000-0000-000000000027	ae382117-03a7-4c12-932d-b258dcda9dce	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
820f300b-5e54-417a-9c23-da0a0626da2d	50000000-0000-0000-0000-000000000028	ae382117-03a7-4c12-932d-b258dcda9dce	2023-2024	1	2023-08-20 10:00:00	approved	\N	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5369 (class 0 OID 17864)
-- Dependencies: 234
-- Data for Name: student_scholarships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_scholarships (id, student_id, scholarship_id, academic_year, semester, amount_received, awarded_date, status, notes, created_at) FROM stdin;
97acd6b2-6a80-4fb2-9509-5abed84fabec	50000000-0000-0000-0000-000000000001	5c400000-0000-0000-0000-000000000001	2023-2024	1	5000000.00	2023-10-15	disbursed	\N	2026-03-11 13:32:22.226388
c9823d07-baa4-4578-9592-8f935938621d	50000000-0000-0000-0000-000000000005	5c400000-0000-0000-0000-000000000002	2023-2024	1	10000000.00	2023-10-15	disbursed	\N	2026-03-11 13:32:22.226388
cfa51de0-32d3-4a6f-bc2b-5ada807820e1	50000000-0000-0000-0000-000000000013	5c400000-0000-0000-0000-000000000004	2023-2024	1	8000000.00	2023-10-20	disbursed	\N	2026-03-11 13:32:22.226388
7a599693-5ac2-4eb4-82e4-4cbb76d17c5a	50000000-0000-0000-0000-000000000006	5c400000-0000-0000-0000-000000000003	2023-2024	1	3000000.00	2023-11-01	approved	\N	2026-03-11 13:32:22.226388
7142b9da-99a5-4624-b6dc-39925500643f	50000000-0000-0000-0000-000000000021	5c400000-0000-0000-0000-000000000005	2023-2024	1	15000000.00	2023-10-10	disbursed	\N	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5360 (class 0 OID 17642)
-- Dependencies: 225
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, student_code, full_name, date_of_birth, gender, email, phone, address, avatar_url, class_id, department_id, enrollment_year, status, created_at, updated_at) FROM stdin;
50000000-0000-0000-0000-000000000001	SV21001	Nguyễn Minh Anh	2003-03-15	Male	minhanhk21@edu.vn	0901111001	12 Lê Lợi, Q1, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000002	SV21002	Trần Thị Bảo Châu	2003-07-22	Female	baochauK21@edu.vn	0901111002	34 Nguyễn Trãi, Q5, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000003	SV21003	Lê Hoàng Duy	2003-01-10	Male	hoangtuyK21@edu.vn	0901111003	78 Trần Hưng Đạo, Q1, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000004	SV21004	Phạm Thị Thu Hà	2003-11-05	Female	thuhaK21@edu.vn	0901111004	56 Đinh Tiên Hoàng, Bình Thạnh	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000005	SV21005	Hoàng Văn Kiên	2003-08-30	Male	kienvhK21@edu.vn	0901111005	90 Cách Mạng Tháng 8, Q3, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000006	SV21006	Vũ Thị Mỹ Linh	2003-04-18	Female	mylinh K21@edu.vn	0901111006	23 Võ Văn Tần, Q3, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000007	SV21007	Đặng Quốc Phong	2003-09-25	Male	quocphongK21@edu.vn	0901111007	45 Lý Thường Kiệt, Q10, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	suspended	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000008	SV21008	Bùi Thị Lan Anh	2003-12-03	Female	lananhK21@edu.vn	0901111008	67 Nguyễn Đình Chiểu, Q3, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000009	SV21009	Ngô Tuấn Nghĩa	2003-06-14	Male	tuannghiaK21@edu.vn	0901111009	11 Hùng Vương, Q5, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000010	SV21010	Lý Thị Phương Thảo	2003-02-28	Female	phuongthaoK21@edu.vn	0901111010	88 Pasteur, Q1, TP.HCM	\N	cc000001-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000011	SV21011	Trịnh Xuân Bách	2003-05-20	Male	xuanbachK21B@edu.vn	0902222001	15 Trường Sa, Bình Thạnh, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000012	SV21012	Đinh Thị Cẩm	2003-10-11	Female	camK21B@edu.vn	0902222002	32 Đinh Bộ Lĩnh, Bình Thạnh	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000013	SV21013	Võ Quang Đức	2003-03-07	Male	quangducK21B@edu.vn	0902222003	54 Bạch Đằng, Bình Thạnh, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000014	SV21014	Phan Thị Hồng	2003-08-16	Female	hongptK21B@edu.vn	0902222004	76 Xô Viết Nghệ Tĩnh, Bình Thạnh	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000015	SV21015	Cao Thành Long	2003-01-29	Male	thanhlongK21B@edu.vn	0902222005	98 Hoàng Văn Thụ, Phú Nhuận	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	dropped	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000016	SV21016	Hồ Thị Minh Nguyệt	2003-07-04	Female	minhngyetK21B@edu.vn	0902222006	21 Trần Văn Ơn, Tân Bình	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000017	SV22001	Nguyễn Duy An	2004-04-12	Male	duyanK22@edu.vn	0903333001	33 Lạc Long Quân, Q11, TP.HCM	\N	cc000003-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2022	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000018	SV22002	Lê Thị Bích	2004-09-23	Female	bichltK22@edu.vn	0903333002	55 Hậu Giang, Q6, TP.HCM	\N	cc000003-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2022	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000019	SV22003	Trương Văn Chí	2004-02-18	Male	vanchitK22@edu.vn	0903333003	77 Phạm Văn Chí, Q6, TP.HCM	\N	cc000003-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2022	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000020	SV22004	Dương Thị Diệu	2004-11-30	Female	dieuK22@edu.vn	0903333004	99 Âu Cơ, Q11, TP.HCM	\N	cc000003-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2022	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000021	SV21101	Đào Thị Thu An	2003-06-08	Female	thuanktK21@edu.vn	0904444001	14 Ngô Quyền, Q10, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000022	SV21102	Trần Văn Bình	2003-12-17	Male	binhtvktK21@edu.vn	0904444002	36 Trần Phú, Q5, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000023	SV21103	Lý Thị Cúc	2003-03-26	Female	cuclytktK21@edu.vn	0904444003	58 Nguyễn Trãi, Q5, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000024	SV21104	Ngô Văn Đại	2003-09-14	Male	daingvktK21@edu.vn	0904444004	80 Bến Chương Dương, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2021	graduated	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000025	SV21105	Phạm Thị Ema	2003-07-01	Female	emaptktK21@edu.vn	0904444005	102 Hàm Nghi, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000026	SV21201	Hoàng Thị Flan	2003-05-09	Female	flanhtK21@edu.vn	0905555001	17 Nguyễn Công Trứ, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000027	SV21202	Vũ Văn Giang	2003-10-21	Male	giangvvK21@edu.vn	0905555002	39 Trương Định, Q3, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000028	SV21203	Bùi Thị Hoa	2003-02-14	Female	hoabtK21@edu.vn	0905555003	61 Lê Văn Sỹ, Q3, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000029	SV21301	Tạ Minh Hiếu	2003-08-07	Male	hieitmK21@edu.vn	0906666001	83 Trần Bình Trọng, Q5, TP.HCM	\N	cc000007-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000004	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50000000-0000-0000-0000-000000000030	SV21302	Nguyễn Thị Kiều	2003-11-19	Female	kieuK21NN@edu.vn	0906666002	105 Võ Thị Sáu, Q3, TP.HCM	\N	cc000007-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000004	2021	active	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
af0dc27c-7c57-4d2b-b00a-89ecb18d99fe	SV2024101	Trần Văn Minh	2003-05-12	Male	tranvanminh@edu.vn	0901234501	123 Lê Lợi, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
99c7e6ab-7e2b-48b0-a79a-19956ea3617a	SV2024102	Nguyễn Thị Hương	2003-08-20	Female	nguyenthihuong@edu.vn	0901234502	456 Nguyễn Huệ, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
35367d9c-0c2c-4107-9185-15325327f131	SV2024103	Lê Hoàng Long	2003-03-15	Male	lehoanglong@edu.vn	0901234503	789 Trần Hưng Đạo, Q5, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
08fdff3f-692c-4990-8e16-30869639cb48	SV2024104	Phạm Thu Trang	2003-11-25	Female	phamthutrang@edu.vn	0901234504	321 Lý Thường Kiệt, Q10, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
b811acae-f4cb-48a5-b1d2-270b2dccaf60	SV2024105	Hoàng Anh Tuấn	2003-07-08	Male	hoanganhTuan@edu.vn	0901234505	654 Cách Mạng Tháng 8, Q3, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
4757b632-2169-488f-89d5-24a733354eea	SV2024201	Võ Thị Mai	2003-02-14	Female	vothimai@edu.vn	0901234506	111 Pasteur, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
6c8c3faa-35ef-4fb2-9dd4-ac1f3934d06d	SV2024202	Đặng Minh Quân	2003-09-30	Male	dangminhquan@edu.vn	0901234507	222 Điện Biên Phủ, Q3, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
534349c3-683a-4d1a-ab16-8adcf3fd0a32	SV2024203	Bùi Lan Anh	2003-06-18	Female	builananh@edu.vn	0901234508	333 Hai Bà Trưng, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
fd77d89c-983e-4d85-bdff-0a5ead279fa2	SV2024204	Ngô Đức Thắng	2003-12-05	Male	ngoducthang@edu.vn	0901234509	444 Võ Văn Tần, Q3, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
fdb1099c-b82c-4751-9a67-544a17200ef3	SV2024205	Trương Thị Nga	2003-04-22	Female	truongthinga@edu.vn	0901234510	555 Nam Kỳ Khởi Nghĩa, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
ced0f84c-584e-4eaa-97ef-a4feede0c803	SV2024301	Lý Thanh Hải	2003-01-10	Male	lythanhhai@edu.vn	0901234511	666 Nguyễn Thị Minh Khai, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
4aeba3f7-c356-4f8e-bf43-c48cd9d055ca	SV2024302	Phan Thị Hồng	2003-10-12	Female	phanthihong@edu.vn	0901234512	777 Lê Văn Sỹ, Q3, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
b185da59-4355-462a-888d-f2e3084275bf	SV2024303	Dương Văn Bình	2003-07-28	Male	duongvanbinh@edu.vn	0901234513	888 Hoàng Văn Thụ, Tân Bình, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
0de84853-3e4b-4516-b345-f8f57297b714	SV2024304	Mai Thị Linh	2003-05-16	Female	maithilinh@edu.vn	0901234514	999 Cộng Hòa, Tân Bình, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
9ad38335-ce40-4f62-bed0-903495192f4e	SV2024305	Trịnh Quốc Huy	2003-11-03	Male	trinhquochuy@edu.vn	0901234515	100 Lạc Long Quân, Q11, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
a5eb2b9e-2d7c-44ec-a10c-dcc1152a8fc7	SV2024401	Huỳnh Văn Đạt	2003-03-08	Male	huynhvandat@edu.vn	0901234516	200 Phan Đăng Lưu, Phú Nhuận, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
1338e7a4-1a53-4570-93b4-ae047a4e9546	SV2024402	Lâm Thị Kim	2003-09-19	Female	lamthikim@edu.vn	0901234517	300 Phan Xích Long, Phú Nhuận, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
b273847e-2fd2-4b44-bda5-dca681b6ee14	SV2024403	Vũ Minh Đức	2003-06-27	Male	vuminhduc@edu.vn	0901234518	400 Đinh Tiên Hoàng, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
823063d3-2962-4483-b5c2-efd822a47181	SV2024404	Đỗ Thị Phương	2003-12-14	Female	dothiphuong@edu.vn	0901234519	500 Trường Chinh, Q12, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
ab312634-2fa0-408f-9852-c31fa87881db	SV2024405	Hồ Quang Vinh	2003-08-05	Male	hoquangvinh@edu.vn	0901234520	600 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
ebd173f8-03c1-4ab1-b7ab-97d59a165451	SV2023001	Cao Thành Công	2002-04-11	Male	caothanhcong@edu.vn	0902345601	11 Võ Thị Sáu, Q3, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2023	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
a74b695a-5b59-4514-8e27-8766475dfbf6	SV2023002	Đinh Thị Vân	2002-07-22	Female	dinhthivan@edu.vn	0902345602	22 Nguyễn Đình Chiểu, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2023	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
e23fee4f-2273-49be-881d-e33523768575	SV2023003	Phan Hữu Nghĩa	2002-10-30	Male	phanhuunghia@edu.vn	0902345603	33 Lê Duẩn, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2023	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
9a763f4b-c6a0-400a-8c45-59604fe7935f	SV2022001	Tô Minh Châu	2001-02-15	Female	tominhchau@edu.vn	0903456701	44 Phan Chu Trinh, Q1, TP.HCM	\N	cc000003-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2022	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
e2fc58b3-85fa-473c-aab3-616de7a92502	SV2022002	Lưu Thanh Tùng	2001-05-08	Male	luuthanhtung@edu.vn	0903456702	55 Tôn Đức Thắng, Q1, TP.HCM	\N	cc000003-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2022	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
05ba6dfc-6c6e-4cdd-a586-c6eabbb2cf87	SV2021001	Lương Thị Hà	2000-09-18	Female	luongthiha@edu.vn	0904567801	66 Bùi Viện, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2021	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
bc2fb9af-06f2-46b8-859a-4b4288688e73	SV2021002	Trần Quốc Khánh	2000-12-25	Male	tranquockhanh@edu.vn	0904567802	77 Đề Thám, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2021	active	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
45b1b85c-f78b-4f82-a8a7-28487d5683e0	SV2020001	Nguyễn Văn Thành	1999-06-10	Male	nguyenvanthanh@edu.vn	0905678901	88 Lê Thánh Tôn, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000004	2020	graduated	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
9d1b2d2e-56e3-436c-bd92-7e863640b41a	SV2020002	Trương Thị Hạnh	1999-08-22	Female	truongthihanh@edu.vn	0905678902	99 Mạc Đĩnh Chi, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000004	2020	graduated	2026-03-12 10:56:51.036471	2026-03-12 10:56:51.036471
1501e41e-5a49-4201-a9cc-fe2c49c63121	SV2024501	Nguyễn Minh Khoa	2003-01-17	Male	nguyenminhkhoa@edu.vn	0911000501	12 Lê Lợi, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
1986f828-f3cd-456f-a033-61cba4a6c0cd	SV2024502	Trần Thị Bích Ngọc	2003-03-22	Female	tranthibichngoc@edu.vn	0911000502	34 Nguyễn Huệ, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
58ea1a6c-eceb-4b70-8f31-d65a35662da0	SV2024503	Lê Văn Tùng	2003-06-05	Male	levantung@edu.vn	0911000503	56 Trần Hưng Đạo, Q5, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
e35dad82-462e-427a-af66-2374b92cafd8	SV2024504	Phạm Ngọc Ánh	2003-09-14	Female	phamngochanh@edu.vn	0911000504	78 Lý Thường Kiệt, Q10, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
5c0967c7-ab60-4432-8aa2-df49e0e48bc4	SV2024505	Hoàng Đức Mạnh	2003-11-30	Male	hoangducmanh@edu.vn	0911000505	90 Cách Mạng Tháng 8, Q3, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
ec2e88ac-bd9d-420d-af10-4c2408c36f4c	SV2024506	Vũ Thị Thanh Hà	2003-02-08	Female	vuthithanhha@edu.vn	0911000506	11 Pasteur, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
1e9d8c95-6759-44c1-9a9e-0eba95e2ec3c	SV2024507	Đỗ Quang Huy	2003-04-19	Male	doquanghuy@edu.vn	0911000507	22 Điện Biên Phủ, Q3, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
7185bb83-be3e-4b49-93dc-580af92d4945	SV2024508	Bùi Thị Hồng Nhung	2003-07-27	Female	buithihongnhung@edu.vn	0911000508	33 Hai Bà Trưng, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
651eb3c2-db6b-41af-8d75-69d186a50f2c	SV2024509	Ngô Thanh Bình	2003-10-03	Male	ngothanhbinh@edu.vn	0911000509	44 Võ Văn Tần, Q3, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
42ab1f5b-6f1e-4128-8b5e-a0caba873372	SV2024510	Trương Thị Lan	2003-12-11	Female	truongthilan@edu.vn	0911000510	55 Nam Kỳ Khởi Nghĩa, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
c359713f-6c1c-42fe-b3d8-7a0f51d88bbb	SV2024511	Đinh Văn Phúc	2003-05-20	Male	dinhvanphuc@edu.vn	0911000511	66 Nguyễn Thị Minh Khai, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
c49d880c-900f-44b2-aa47-54d23d5b7f47	SV2024512	Lý Thị Kiều Oanh	2003-08-16	Female	lythikieuoanh@edu.vn	0911000512	77 Lê Văn Sỹ, Q3, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
32a92ef8-d721-4b12-a08e-2f1b215808a1	SV2024513	Phan Văn Đông	2003-01-29	Male	phanvandong@edu.vn	0911000513	88 Hoàng Văn Thụ, Tân Bình, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
7facaf1e-b453-4f00-9639-17acba56c5c1	SV2024514	Mai Thị Thu Thảo	2003-03-07	Female	maithithuthao@edu.vn	0911000514	99 Cộng Hòa, Tân Bình, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
d196a6f1-be68-4f9b-b5dc-2e5dd721de38	SV2024515	Hồ Văn Lộc	2003-06-23	Male	hovanloc@edu.vn	0911000515	110 Lạc Long Quân, Q11, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
57551008-78d0-4eb4-8a40-b64115d5e74b	SV2024516	Đặng Thị Mỹ Duyên	2003-09-01	Female	dangthiMduyen@edu.vn	0911000516	120 Phan Đăng Lưu, Phú Nhuận, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
cfbfb684-31dc-490b-9419-7359e46c018c	SV2024517	Lâm Quốc Bảo	2003-11-18	Male	lamquocbao@edu.vn	0911000517	130 Phan Xích Long, Phú Nhuận, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
49ea1566-a1ef-4902-85f1-0639aa671c29	SV2024518	Cao Thị Yến Nhi	2003-02-25	Female	caothiyennhi@edu.vn	0911000518	140 Đinh Tiên Hoàng, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
6637e700-4f9b-4b60-a321-937604eb305f	SV2024519	Tô Minh Nhật	2003-04-13	Male	tominhNhat@edu.vn	0911000519	150 Trường Chinh, Q12, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
b4c4b782-8005-495b-a97b-65dd7e0dbb6f	SV2024520	Võ Thị Cẩm Tiên	2003-07-09	Female	vothicamtien@edu.vn	0911000520	160 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
ea51b98a-bec7-40d9-9f92-64aa5f4eea94	SV2024521	Huỳnh Tấn Phát	2003-10-26	Male	huynhtanphat@edu.vn	0911000521	170 Võ Thị Sáu, Q3, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
ebb5916f-e4a1-4def-98ad-9b9dd2a8e1ab	SV2024522	Lưu Thị Bảo Châu	2003-12-04	Female	luuthibaochau@edu.vn	0911000522	180 Nguyễn Đình Chiểu, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
781e9315-480d-4c81-9464-18dda22213f9	SV2024523	Trịnh Văn Hậu	2003-05-31	Male	trinhvanhau@edu.vn	0911000523	190 Lê Duẩn, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
248c9b1f-6da2-4e5e-a3cd-0ff039d9e854	SV2024524	Dương Thị Ngọc Hân	2003-08-12	Female	duongthingochan@edu.vn	0911000524	200 Phan Chu Trinh, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
a1f948f5-0dfb-497b-85f5-87133d2d5afc	SV2024525	Nguyễn Đức Trọng	2003-11-07	Male	nguyenductrong@edu.vn	0911000525	210 Tôn Đức Thắng, Q1, TP.HCM	\N	cc000002-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
1c730180-8175-4106-bdb2-2d3c9aaf2c51	SV2024601	Phạm Thị Diễm My	2003-01-05	Female	phamthidiemmy@edu.vn	0911000601	11 Bùi Viện, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
acc1fa98-3345-47fb-9ce5-b36329809f40	SV2024602	Lê Thanh Tú	2003-03-18	Male	lethanhtU@edu.vn	0911000602	22 Đề Thám, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
76bfaa05-4d1f-4a7a-9715-4bce4ec6605f	SV2024603	Trần Ngọc Linh	2003-06-29	Female	tranngoclinh@edu.vn	0911000603	33 Lê Thánh Tôn, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
26ba8e75-2e2a-4b63-a805-7d4c8763995f	SV2024604	Hoàng Văn Khải	2003-09-10	Male	hoangvanKhai@edu.vn	0911000604	44 Mạc Đĩnh Chi, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
2ca73bbd-fdde-407c-b397-502bf0a19f9a	SV2024605	Ngô Thị Hoa	2003-12-21	Female	ngothihoa@edu.vn	0911000605	55 Võ Thị Sáu, Q3, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
90bf33d2-25c0-45e8-98b5-e464596c71df	SV2024606	Đinh Quang Khải	2003-02-03	Male	dinhquangKhai@edu.vn	0911000606	66 Nguyễn Đình Chiểu, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
28980a8c-53b1-4c93-a322-2ee6ad600ebe	SV2024607	Lý Thị Phương Thảo	2003-04-15	Female	lythiphuongthao@edu.vn	0911000607	77 Lê Duẩn, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
52f3173f-9b45-4cdc-ad58-7530a63bfabb	SV2024608	Phan Minh Tâm	2003-07-28	Male	phanminhtam@edu.vn	0911000608	88 Phan Chu Trinh, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
761069ee-55d7-4113-9c13-14309fce1977	SV2024609	Võ Thị Hồng Hạnh	2003-10-09	Female	vothihonghanh@edu.vn	0911000609	99 Tôn Đức Thắng, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
1ecafaf4-c9de-4436-8976-121b53e4a9bc	SV2024610	Trương Văn Nam	2003-01-22	Male	truongvannam@edu.vn	0911000610	100 Bùi Viện, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
61e81b30-143b-4e6c-94ff-380bfcc0b4d5	SV2024611	Huỳnh Thị Thanh Tâm	2003-03-06	Female	huynhthithanhtam@edu.vn	0911000611	111 Đề Thám, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
137c336d-0e86-4261-a3e9-9e8320c8b59e	SV2024612	Lâm Văn Sơn	2003-05-17	Male	lamvanson@edu.vn	0911000612	122 Lê Thánh Tôn, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
0c905413-8735-4a08-93e9-e2b1aeb57b67	SV2024613	Đặng Thị Quỳnh	2003-08-04	Female	dangthiquYnh@edu.vn	0911000613	133 Mạc Đĩnh Chi, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
211ac107-c1b2-49d9-aa2a-345a2ffc2102	SV2024614	Nguyễn Hoàng Phúc	2003-10-31	Male	nguyenhoangphuc@edu.vn	0911000614	144 Nguyễn Thị Minh Khai, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
7d2b57b2-1a40-4292-aebf-5e996af3c4c7	SV2024615	Bùi Thị Ngọc Trinh	2003-12-19	Female	buithingoctrinh@edu.vn	0911000615	155 Lê Văn Sỹ, Q3, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
e300379f-99fe-4d0e-9a33-101a5457c4cd	SV2024616	Tô Văn Cường	2003-02-14	Male	tovancuong@edu.vn	0911000616	166 Hoàng Văn Thụ, Tân Bình, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
6fb2ddca-1a57-4072-a3cb-ea4f0c85baca	SV2024617	Lưu Ngọc Huyền	2003-04-27	Female	luungochuyen@edu.vn	0911000617	177 Cộng Hòa, Tân Bình, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
a41d43d5-7740-4b11-976f-c05d151f280e	SV2024618	Cao Văn Dũng	2003-07-11	Male	caovandung@edu.vn	0911000618	188 Lạc Long Quân, Q11, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
fde6be4b-8d3f-45ce-96fe-9a7684834dc9	SV2024619	Trần Thị Kim Ngân	2003-09-24	Female	tranthikimngan@edu.vn	0911000619	199 Phan Đăng Lưu, Phú Nhuận, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
42564c67-07eb-4305-a5b4-8e153dd32ccf	SV2024620	Hồ Minh Quang	2003-12-02	Male	hominhquang@edu.vn	0911000620	200 Phan Xích Long, Phú Nhuận, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
e9e0ae93-274c-45e8-951d-d9e7cb746232	SV2024621	Phạm Thị Lan Anh	2003-01-30	Female	phamthilananh@edu.vn	0911000621	211 Đinh Tiên Hoàng, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
63738c50-a95f-4242-865e-5b03d02b4f42	SV2024622	Vũ Đình Toàn	2003-03-14	Male	vudinhToan@edu.vn	0911000622	222 Trường Chinh, Q12, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
31c3d1fc-034d-48e4-b4be-f88cd4dcc994	SV2024623	Đỗ Thị Thanh Loan	2003-05-25	Female	dothithanhloan@edu.vn	0911000623	233 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
3628e08b-9583-4844-93a9-1ce5abcd176f	SV2024624	Lê Quốc Toản	2003-08-08	Male	lequoctoan@edu.vn	0911000624	244 Võ Thị Sáu, Q3, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
663728ad-e304-4096-82c8-51abbed944bc	SV2024625	Nguyễn Thị Bảo Ngọc	2003-11-15	Female	nguyenthibaongoc@edu.vn	0911000625	255 Nguyễn Đình Chiểu, Q1, TP.HCM	\N	cc000004-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000002	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
2a3c1244-58d8-423d-b906-43b5e6903ba4	SV2024701	Trịnh Thị Thanh Hương	2003-01-12	Female	trinhtithanhhuong@edu.vn	0911000701	10 Lê Duẩn, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
e5945fd7-4c83-4994-b020-ad0c52cd5d22	SV2024702	Dương Văn Hùng	2003-03-29	Male	duongvanhung@edu.vn	0911000702	20 Phan Chu Trinh, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
e842dd5e-344d-4265-8e49-5fabfecd7363	SV2024703	Mai Thị Xuân	2003-06-16	Female	maithixuan@edu.vn	0911000703	30 Tôn Đức Thắng, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
3dc23752-c1d4-4691-b863-8cbab88a37cc	SV2024704	Lý Văn Hiếu	2003-09-27	Male	lyvanhieu@edu.vn	0911000704	40 Bùi Viện, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
5d57dcc0-046b-4bee-81dd-081629bc2e80	SV2024705	Phan Ngọc Trâm	2003-12-08	Female	phanngoctram@edu.vn	0911000705	50 Đề Thám, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
9cfca7d9-ac51-4081-80b1-420487e35943	SV2024706	Hoàng Minh Tuấn	2003-02-20	Male	hoangminhTuan@edu.vn	0911000706	60 Lê Thánh Tôn, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
00fd4bdb-9092-42ab-b609-514e6f91f4d5	SV2024707	Ngô Thị Mỹ Linh	2003-04-07	Female	ngothiMylinh@edu.vn	0911000707	70 Mạc Đĩnh Chi, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
74375e09-809d-44c2-8064-4513e20f1777	SV2024708	Lâm Quang Trí	2003-07-19	Male	lamquangtri@edu.vn	0911000708	80 Nguyễn Thị Minh Khai, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
6bee737a-ba9e-46e1-ba08-bf2f900cb3b3	SV2024709	Bùi Thị Cẩm Nhung	2003-10-01	Female	buithicamnhung@edu.vn	0911000709	90 Lê Văn Sỹ, Q3, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
750104bb-6fb9-4bd5-ae2e-cd800fbb66ec	SV2024710	Đặng Quốc Việt	2003-12-13	Male	dangquocviet@edu.vn	0911000710	100 Hoàng Văn Thụ, Tân Bình, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
c29e41fb-4ffc-4a6f-932e-7b3304f68d57	SV2024711	Tô Thị Phương Liên	2003-01-26	Female	tothiphuonglien@edu.vn	0911000711	110 Cộng Hòa, Tân Bình, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
01d6ec49-8dda-4035-bb05-706419a235bf	SV2024712	Vũ Văn Thịnh	2003-03-10	Male	vuvanThiNh@edu.vn	0911000712	120 Lạc Long Quân, Q11, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
5ebc72c4-0b18-4dd3-bc2f-3431d734bc6d	SV2024713	Nguyễn Thị Thanh Thư	2003-05-21	Female	nguyenthithanhthu@edu.vn	0911000713	130 Phan Đăng Lưu, Phú Nhuận, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
de1d6ea5-9cb4-44dd-9754-afc52175534d	SV2024714	Trần Văn Kiên	2003-08-14	Male	tranvankien@edu.vn	0911000714	140 Phan Xích Long, Phú Nhuận, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
4d2f77c4-67c2-4679-b044-0ffa724ba914	SV2024715	Lê Thị Diễm Hương	2003-11-02	Female	lethidiemhuong@edu.vn	0911000715	150 Đinh Tiên Hoàng, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
14ddbf66-4dc6-449a-a028-0f9742064901	SV2024716	Phạm Văn Đại	2003-01-08	Male	phamvandai@edu.vn	0911000716	160 Trường Chinh, Q12, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
a118c949-ea3e-44dc-97d7-fa43d1758db8	SV2024717	Cao Thị Bích Phượng	2003-04-24	Female	caothibichphuong@edu.vn	0911000717	170 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
3aa5fa63-6d47-471c-bc80-841f490fef85	SV2024718	Hồ Văn Tài	2003-07-07	Male	hovantai@edu.vn	0911000718	180 Võ Thị Sáu, Q3, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
9a620af7-1957-4236-b4d4-f63c197196ff	SV2024719	Đinh Thị Hồng Loan	2003-09-18	Female	dinhhihongloan@edu.vn	0911000719	190 Nguyễn Đình Chiểu, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
410f118d-fa60-45f1-9819-e748b347e0a2	SV2024720	Lưu Văn Phong	2003-11-29	Male	luuvanphong@edu.vn	0911000720	200 Lê Duẩn, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
d30ae891-e500-47b3-bd15-ca849a3bbc2b	SV2024721	Trương Thị Mỹ Châu	2003-02-17	Female	truongthiMychau@edu.vn	0911000721	211 Phan Chu Trinh, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
c517b959-5426-4b67-86d6-8a7ff32ec76a	SV2024722	Võ Quang Hưng	2003-05-03	Male	voquanghung@edu.vn	0911000722	222 Tôn Đức Thắng, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
3c747bb0-9ec8-4c75-9f56-982c7c568834	SV2024723	Nguyễn Thị Yến	2003-07-22	Female	nguyenthiyen@edu.vn	0911000723	233 Bùi Viện, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
6b1aace7-f406-4444-9bc2-d49dddb145a2	SV2024724	Phan Văn Lâm	2003-10-16	Male	phanvanlam@edu.vn	0911000724	244 Đề Thám, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
652b01a9-0080-4d3d-83a5-c897953bbd5a	SV2024725	Đỗ Thị Ngọc Mai	2003-12-28	Female	dothingocmai@edu.vn	0911000725	255 Lê Thánh Tôn, Q1, TP.HCM	\N	cc000006-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000003	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
970bcf3b-8f7c-4926-9661-0dba507183cf	SV2024801	Lê Văn Khương	2003-01-04	Male	levanKhuong@edu.vn	0911000801	10 Nguyễn Thị Minh Khai, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
693f9db8-8179-4079-9b92-a88bceeca3f0	SV2024802	Nguyễn Thị Kim Thoa	2003-03-21	Female	nguyenthikimthoa@edu.vn	0911000802	20 Lê Văn Sỹ, Q3, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
abc15cf6-5f36-4344-b74a-f3c1f36f001c	SV2024803	Trần Đình Khoa	2003-06-12	Male	trandinhkhoa@edu.vn	0911000803	30 Hoàng Văn Thụ, Tân Bình, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
22661d9b-6050-4bde-8782-9d99be8c69dd	SV2024804	Phạm Thị Hồng Hà	2003-09-03	Female	phamthihongha@edu.vn	0911000804	40 Cộng Hòa, Tân Bình, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
dac44023-404b-4d32-909a-195bd5908537	SV2024805	Hoàng Quốc Bảo	2003-11-24	Male	hoangquocbao@edu.vn	0911000805	50 Lạc Long Quân, Q11, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
66581aec-ddeb-4298-96e7-0026e47bf931	SV2024806	Vũ Thị Huyền Trang	2003-02-06	Female	vuthihuyentrang@edu.vn	0911000806	60 Phan Đăng Lưu, Phú Nhuận, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
b587e0a0-b304-463e-9fba-41df3311d80e	SV2024807	Đỗ Minh Hiếu	2003-04-23	Male	dominhhieu@edu.vn	0911000807	70 Phan Xích Long, Phú Nhuận, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
ddde84a6-06ac-4bff-983c-73342effebd4	SV2024808	Bùi Ngọc Trâm Anh	2003-07-14	Female	buingoctamanh@edu.vn	0911000808	80 Đinh Tiên Hoàng, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
7854c49c-fcf1-4f59-a7ca-a3fc0548242a	SV2024809	Ngô Văn Phát	2003-10-25	Male	ngoVanPhat@edu.vn	0911000809	90 Trường Chinh, Q12, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
ea75e492-fdf7-46f9-a1cf-b052b1f8634c	SV2024810	Trương Thị Diệu Linh	2003-12-06	Female	truongthidieulinh@edu.vn	0911000810	100 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
61c237bf-4390-4f05-83a0-7dc545cc9865	SV2024811	Đinh Văn Toàn	2003-01-18	Male	dinhvantoan@edu.vn	0911000811	110 Võ Thị Sáu, Q3, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
59ebbe26-959f-4903-abe9-390c499001ce	SV2024812	Lý Thị Thanh Ngân	2003-04-02	Female	lythithanhngan@edu.vn	0911000812	120 Nguyễn Đình Chiểu, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
b928422e-74ba-4be0-a30d-df237700d4f9	SV2024813	Phan Anh Tuấn	2003-06-20	Male	phananhTuan@edu.vn	0911000813	130 Lê Duẩn, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
3795c209-bba1-4f71-8d54-32c3ccdc0c12	SV2024814	Mai Thị Phương Nga	2003-09-11	Female	maithiphuongnga@edu.vn	0911000814	140 Phan Chu Trinh, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
e4a763f6-afc6-41c1-803e-98b9f90488b3	SV2024815	Hồ Văn Định	2003-11-22	Male	hovanDiNh@edu.vn	0911000815	150 Tôn Đức Thắng, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
a34bdc90-699a-487e-9281-194aeab20e12	SV2024816	Đặng Thị Tú Anh	2003-02-09	Female	dangthituanh@edu.vn	0911000816	160 Bùi Viện, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
f596176a-0ce1-4fca-8890-48afa8906c23	SV2024817	Lâm Văn Kiệt	2003-05-28	Male	lamvankiet@edu.vn	0911000817	170 Đề Thám, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
6812a3a9-63b0-4bd6-928c-3b8f69419c8d	SV2024818	Cao Thị Minh Thư	2003-08-17	Female	caothiminhthu@edu.vn	0911000818	180 Lê Thánh Tôn, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
ccbfcb06-6f62-4dfc-aaf8-e30fa9d8f40b	SV2024819	Tô Văn Nghĩa	2003-10-29	Male	tovannghia@edu.vn	0911000819	190 Mạc Đĩnh Chi, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
2bb21376-9477-4f97-9004-c06176d1122d	SV2024820	Lưu Thị Hồng Nhung	2003-12-17	Female	luuthihongnhung@edu.vn	0911000820	200 Nguyễn Thị Minh Khai, Q1, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
ff5b7008-d997-40d1-894a-d36d1c0cb848	SV2024821	Nguyễn Quang Khải	2003-03-05	Male	nguyenquangKhai@edu.vn	0911000821	210 Lê Văn Sỹ, Q3, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
0a2ebc68-cc01-4849-bd9e-1c5365356361	SV2024822	Trần Thị Ngọc Lan	2003-06-08	Female	tranthingoclan@edu.vn	0911000822	220 Hoàng Văn Thụ, Tân Bình, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
d85bae56-88ba-46d7-8181-c94d64a19688	SV2024823	Phạm Văn Sáng	2003-09-20	Male	phamvansang@edu.vn	0911000823	230 Cộng Hòa, Tân Bình, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
c7322c4a-2a79-4964-838b-e3182e5325af	SV2024824	Hoàng Thị Thùy Linh	2003-11-11	Female	hoangthithuylinh@edu.vn	0911000824	240 Lạc Long Quân, Q11, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
3157b519-0237-441f-be52-c1bd6f98b86f	SV2024825	Võ Văn Trường	2003-02-28	Male	vovanTruong@edu.vn	0911000825	250 Phan Đăng Lưu, Phú Nhuận, TP.HCM	\N	cc000005-0000-0000-0000-000000000000	d0000000-0000-0000-0000-000000000001	2024	active	2026-03-12 11:01:11.182014	2026-03-12 11:01:11.182014
\.


--
-- TOC entry 5363 (class 0 OID 17727)
-- Dependencies: 228
-- Data for Name: tuition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tuition (id, student_id, academic_year, semester, amount, paid_amount, due_date, paid_date, status, notes, created_at, updated_at) FROM stdin;
20f5e969-f48c-4dee-ac5c-785a02066a4a	50000000-0000-0000-0000-000000000001	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-15	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
50f1bce5-e699-45f8-8dee-698f6ffc3273	50000000-0000-0000-0000-000000000002	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-20	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
578e7814-c919-4821-aab4-06699aef4aea	50000000-0000-0000-0000-000000000003	2023-2024	1	8500000.00	4250000.00	2023-09-30	\N	partial	Đã đóng 50%, còn nợ 4,250,000đ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
78f4656f-dd37-404d-a8ea-1ad4aca4de4b	50000000-0000-0000-0000-000000000004	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-28	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
856bd077-42e0-42ed-a35e-5d8282bf9c57	50000000-0000-0000-0000-000000000005	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-10	paid	Học bổng hỗ trợ 20%	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
e390ba97-ac5e-4341-b82b-abff5e4445a4	50000000-0000-0000-0000-000000000006	2023-2024	1	8500000.00	0.00	2023-09-30	\N	overdue	Quá hạn, cần liên hệ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
74fe9f7f-d1a7-43ef-b69b-42489204aa4b	50000000-0000-0000-0000-000000000007	2023-2024	1	8500000.00	0.00	2023-09-30	\N	overdue	Sinh viên bị đình chỉ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
abb6a117-81cf-44f2-9640-829a6d0da04e	50000000-0000-0000-0000-000000000008	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-22	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
0f586dfa-010e-42a8-b546-a9e9c56c4153	50000000-0000-0000-0000-000000000009	2023-2024	1	8500000.00	5000000.00	2023-09-30	\N	partial	Đã đóng một phần	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
26589378-c447-45d7-8294-75e4f47e44e3	50000000-0000-0000-0000-000000000010	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-25	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
4f7e3df0-d195-4486-aeb8-1cd25f178d1d	50000000-0000-0000-0000-000000000011	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-18	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
e87ac18d-69ed-4d45-a6d5-c13732aa2a98	50000000-0000-0000-0000-000000000012	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-30	paid	Thanh toán đúng hạn	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
1dbe0528-4547-4ea9-a939-bef7d252a61f	50000000-0000-0000-0000-000000000013	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-12	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
df55bc14-ca94-4472-b358-f6962941085c	50000000-0000-0000-0000-000000000014	2023-2024	1	8500000.00	3000000.00	2023-09-30	\N	partial	Còn thiếu 5,500,000đ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
99dafd81-e853-4e26-bcf3-1117b3853a2a	50000000-0000-0000-0000-000000000015	2023-2024	1	8500000.00	0.00	2023-09-30	\N	overdue	Đã nghỉ học	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
30fd2335-1bed-4cae-97e8-d6bb2a8daf1f	50000000-0000-0000-0000-000000000016	2023-2024	1	8500000.00	8500000.00	2023-09-30	2023-09-27	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
e1f992a2-9d03-45d8-b345-3b0ed621364b	50000000-0000-0000-0000-000000000017	2023-2024	1	9000000.00	9000000.00	2023-09-30	2023-09-14	paid	Học phí khóa 22 điều chỉnh	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
1ca297d3-b243-4ef7-b609-d8843330ec53	50000000-0000-0000-0000-000000000018	2023-2024	1	9000000.00	9000000.00	2023-09-30	2023-09-20	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
cfe1192a-d66d-4110-8acf-78217ef8e595	50000000-0000-0000-0000-000000000019	2023-2024	1	9000000.00	0.00	2023-09-30	\N	unpaid	Chưa đóng học phí	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
e6686fb0-7389-49ea-a5ad-de4ca158c21a	50000000-0000-0000-0000-000000000020	2023-2024	1	9000000.00	4500000.00	2023-09-30	\N	partial	Đóng 50% đợt 1	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
da61277d-a1df-4964-bcce-f2a537ec82bc	50000000-0000-0000-0000-000000000021	2023-2024	1	7500000.00	7500000.00	2023-09-30	2023-09-16	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
ebe3adb4-30cb-4748-b533-1886d855063c	50000000-0000-0000-0000-000000000022	2023-2024	1	7500000.00	7500000.00	2023-09-30	2023-09-19	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
34c54ad6-69f0-43ff-b94c-3523794d936f	50000000-0000-0000-0000-000000000023	2023-2024	1	7500000.00	7500000.00	2023-09-30	2023-09-21	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
8a5e3af7-9e7d-4215-a353-b5250ba88269	50000000-0000-0000-0000-000000000024	2023-2024	1	7500000.00	7500000.00	2023-09-30	2023-08-30	paid	Sinh viên đã tốt nghiệp - đã đóng	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
16313544-14cb-448b-a4bd-1248a94152a3	50000000-0000-0000-0000-000000000025	2023-2024	1	7500000.00	0.00	2023-09-30	\N	overdue	Cần nhắc nhở	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
fde97d69-5427-4529-ac90-2355e077fdf5	50000000-0000-0000-0000-000000000026	2023-2024	1	7800000.00	7800000.00	2023-09-30	2023-09-11	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
6a4177e7-51e2-46c2-9fb4-83bb6e1c77e9	50000000-0000-0000-0000-000000000027	2023-2024	1	7800000.00	7800000.00	2023-09-30	2023-09-23	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
c825c08b-1f9a-483d-9b18-ddae87fe3c6d	50000000-0000-0000-0000-000000000028	2023-2024	1	7800000.00	2000000.00	2023-09-30	\N	partial	Đã đóng một phần	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
18bb87ef-6ff9-4544-be91-b5b7e40ed537	50000000-0000-0000-0000-000000000029	2023-2024	1	7200000.00	7200000.00	2023-09-30	2023-09-13	paid	Đã thanh toán đầy đủ	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
66e4cbc5-b431-40e7-b7da-5d22cf769a75	50000000-0000-0000-0000-000000000030	2023-2024	1	7200000.00	0.00	2023-09-30	\N	unpaid	Chưa liên hệ đóng tiền	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
\.


--
-- TOC entry 5355 (class 0 OID 17550)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role, is_active, created_at, updated_at) FROM stdin;
a0000000-0000-0000-0000-000000000002	staff1	staff1@edu.vn	$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe	staff	t	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
a0000000-0000-0000-0000-000000000003	staff2	staff2@edu.vn	$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe	staff	t	2026-03-11 13:32:22.226388	2026-03-11 13:32:22.226388
a0000000-0000-0000-0000-000000000001	admin	admin@edu.vn	$2a$11$IkGDlAwCl.vqXSodY2c3k.1nucdJv/J96wSszEP0EJ.b24hQeZoYq	admin	t	2026-03-11 13:32:22.226388	2026-03-11 15:22:26.744155
b0000000-0000-0000-0000-000000000001	student1	student1@edu.vn	$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe	student	t	2026-03-12 10:49:12.951553	2026-03-12 10:49:12.95162
\.


--
-- TOC entry 5170 (class 2606 OID 18108)
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- TOC entry 5166 (class 2606 OID 18062)
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- TOC entry 5111 (class 2606 OID 17764)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 5113 (class 2606 OID 17766)
-- Name: attendance attendance_student_id_class_course_id_check_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_class_course_id_check_date_key UNIQUE (student_id, class_course_id, check_date);


--
-- TOC entry 5093 (class 2606 OID 17680)
-- Name: class_courses class_courses_class_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_courses
    ADD CONSTRAINT class_courses_class_id_course_id_key UNIQUE (class_id, course_id);


--
-- TOC entry 5095 (class 2606 OID 17678)
-- Name: class_courses class_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_courses
    ADD CONSTRAINT class_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 5075 (class 2606 OID 17616)
-- Name: classes classes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_code_key UNIQUE (code);


--
-- TOC entry 5077 (class 2606 OID 17614)
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- TOC entry 5151 (class 2606 OID 17983)
-- Name: course_evaluations course_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_evaluations
    ADD CONSTRAINT course_evaluations_pkey PRIMARY KEY (id);


--
-- TOC entry 5153 (class 2606 OID 17985)
-- Name: course_evaluations course_evaluations_student_id_course_id_class_id_academic_y_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_evaluations
    ADD CONSTRAINT course_evaluations_student_id_course_id_class_id_academic_y_key UNIQUE (student_id, course_id, class_id, academic_year, semester);


--
-- TOC entry 5079 (class 2606 OID 17636)
-- Name: courses courses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_key UNIQUE (code);


--
-- TOC entry 5081 (class 2606 OID 17634)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 17582)
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- TOC entry 5067 (class 2606 OID 17580)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 5139 (class 2606 OID 17906)
-- Name: disciplinary_actions disciplinary_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_actions
    ADD CONSTRAINT disciplinary_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 5123 (class 2606 OID 17836)
-- Name: exam_schedules exam_schedules_course_id_class_id_exam_type_academic_year_s_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_course_id_class_id_exam_type_academic_year_s_key UNIQUE (course_id, class_id, exam_type, academic_year, semester);


--
-- TOC entry 5125 (class 2606 OID 17834)
-- Name: exam_schedules exam_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 5157 (class 2606 OID 18022)
-- Name: facilities facilities_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_code_key UNIQUE (code);


--
-- TOC entry 5159 (class 2606 OID 18020)
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- TOC entry 5162 (class 2606 OID 18037)
-- Name: facility_bookings facility_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_bookings
    ADD CONSTRAINT facility_bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 5097 (class 2606 OID 17709)
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 17711)
-- Name: grades grades_student_id_course_id_academic_year_semester_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_course_id_academic_year_semester_key UNIQUE (student_id, course_id, academic_year, semester);


--
-- TOC entry 5069 (class 2606 OID 17594)
-- Name: instructors instructors_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_code_key UNIQUE (code);


--
-- TOC entry 5071 (class 2606 OID 17596)
-- Name: instructors instructors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_email_key UNIQUE (email);


--
-- TOC entry 5073 (class 2606 OID 17592)
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (id);


--
-- TOC entry 5145 (class 2606 OID 17933)
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5115 (class 2606 OID 17791)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5129 (class 2606 OID 17863)
-- Name: scholarships scholarships_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_code_key UNIQUE (code);


--
-- TOC entry 5131 (class 2606 OID 17861)
-- Name: scholarships scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_pkey PRIMARY KEY (id);


--
-- TOC entry 5149 (class 2606 OID 17956)
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 17806)
-- Name: student_registrations student_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_registrations
    ADD CONSTRAINT student_registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5121 (class 2606 OID 17808)
-- Name: student_registrations student_registrations_student_id_class_course_id_academic_y_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_registrations
    ADD CONSTRAINT student_registrations_student_id_class_course_id_academic_y_key UNIQUE (student_id, class_course_id, academic_year, semester);


--
-- TOC entry 5135 (class 2606 OID 17878)
-- Name: student_scholarships student_scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_scholarships
    ADD CONSTRAINT student_scholarships_pkey PRIMARY KEY (id);


--
-- TOC entry 5137 (class 2606 OID 17880)
-- Name: student_scholarships student_scholarships_student_id_scholarship_id_academic_yea_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_scholarships
    ADD CONSTRAINT student_scholarships_student_id_scholarship_id_academic_yea_key UNIQUE (student_id, scholarship_id, academic_year, semester);


--
-- TOC entry 5087 (class 2606 OID 17661)
-- Name: students students_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_email_key UNIQUE (email);


--
-- TOC entry 5089 (class 2606 OID 17657)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- TOC entry 5091 (class 2606 OID 17659)
-- Name: students students_student_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_student_code_key UNIQUE (student_code);


--
-- TOC entry 5107 (class 2606 OID 17743)
-- Name: tuition tuition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuition
    ADD CONSTRAINT tuition_pkey PRIMARY KEY (id);


--
-- TOC entry 5109 (class 2606 OID 17745)
-- Name: tuition tuition_student_id_academic_year_semester_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuition
    ADD CONSTRAINT tuition_student_id_academic_year_semester_key UNIQUE (student_id, academic_year, semester);


--
-- TOC entry 5059 (class 2606 OID 17570)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5061 (class 2606 OID 17566)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5063 (class 2606 OID 17568)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5167 (class 1259 OID 18095)
-- Name: idx_announcements_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_published ON public.announcements USING btree (published_at);


--
-- TOC entry 5168 (class 1259 OID 18096)
-- Name: idx_announcements_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_target ON public.announcements USING btree (target_group, target_id);


--
-- TOC entry 5140 (class 1259 OID 18085)
-- Name: idx_disciplinary_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disciplinary_status ON public.disciplinary_actions USING btree (status);


--
-- TOC entry 5141 (class 1259 OID 18084)
-- Name: idx_disciplinary_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disciplinary_student ON public.disciplinary_actions USING btree (student_id);


--
-- TOC entry 5154 (class 1259 OID 18090)
-- Name: idx_evaluations_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluations_course ON public.course_evaluations USING btree (course_id);


--
-- TOC entry 5155 (class 1259 OID 18091)
-- Name: idx_evaluations_instructor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluations_instructor ON public.course_evaluations USING btree (instructor_id);


--
-- TOC entry 5126 (class 1259 OID 18081)
-- Name: idx_exam_schedules_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exam_schedules_course ON public.exam_schedules USING btree (course_id);


--
-- TOC entry 5127 (class 1259 OID 18080)
-- Name: idx_exam_schedules_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exam_schedules_date ON public.exam_schedules USING btree (exam_date);


--
-- TOC entry 5160 (class 1259 OID 18092)
-- Name: idx_facilities_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facilities_status ON public.facilities USING btree (status);


--
-- TOC entry 5163 (class 1259 OID 18093)
-- Name: idx_facility_bookings_facility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facility_bookings_facility ON public.facility_bookings USING btree (facility_id);


--
-- TOC entry 5164 (class 1259 OID 18094)
-- Name: idx_facility_bookings_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facility_bookings_time ON public.facility_bookings USING btree (start_time, end_time);


--
-- TOC entry 5100 (class 1259 OID 18073)
-- Name: idx_grades_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grades_course ON public.grades USING btree (course_id);


--
-- TOC entry 5101 (class 1259 OID 18072)
-- Name: idx_grades_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grades_student ON public.grades USING btree (student_id);


--
-- TOC entry 5102 (class 1259 OID 18074)
-- Name: idx_grades_year_sem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grades_year_sem ON public.grades USING btree (academic_year, semester);


--
-- TOC entry 5142 (class 1259 OID 18087)
-- Name: idx_leave_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_requests_status ON public.leave_requests USING btree (status);


--
-- TOC entry 5143 (class 1259 OID 18086)
-- Name: idx_leave_requests_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_requests_student ON public.leave_requests USING btree (student_id);


--
-- TOC entry 5116 (class 1259 OID 18079)
-- Name: idx_registrations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registrations_status ON public.student_registrations USING btree (status);


--
-- TOC entry 5117 (class 1259 OID 18078)
-- Name: idx_registrations_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registrations_student ON public.student_registrations USING btree (student_id);


--
-- TOC entry 5146 (class 1259 OID 18088)
-- Name: idx_student_documents_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_documents_student ON public.student_documents USING btree (student_id);


--
-- TOC entry 5147 (class 1259 OID 18089)
-- Name: idx_student_documents_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_documents_type ON public.student_documents USING btree (document_type);


--
-- TOC entry 5132 (class 1259 OID 18083)
-- Name: idx_student_scholarships_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_scholarships_status ON public.student_scholarships USING btree (status);


--
-- TOC entry 5133 (class 1259 OID 18082)
-- Name: idx_student_scholarships_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_scholarships_student ON public.student_scholarships USING btree (student_id);


--
-- TOC entry 5082 (class 1259 OID 18068)
-- Name: idx_students_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_students_class ON public.students USING btree (class_id);


--
-- TOC entry 5083 (class 1259 OID 18071)
-- Name: idx_students_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_students_code ON public.students USING btree (student_code);


--
-- TOC entry 5084 (class 1259 OID 18069)
-- Name: idx_students_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_students_department ON public.students USING btree (department_id);


--
-- TOC entry 5085 (class 1259 OID 18070)
-- Name: idx_students_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_students_status ON public.students USING btree (status);


--
-- TOC entry 5103 (class 1259 OID 18076)
-- Name: idx_tuition_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tuition_status ON public.tuition USING btree (status);


--
-- TOC entry 5104 (class 1259 OID 18075)
-- Name: idx_tuition_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tuition_student ON public.tuition USING btree (student_id);


--
-- TOC entry 5105 (class 1259 OID 18077)
-- Name: idx_tuition_year_sem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tuition_year_sem ON public.tuition USING btree (academic_year, semester);


--
-- TOC entry 5206 (class 2620 OID 18099)
-- Name: grades trg_grades_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_grades_updated BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- TOC entry 5205 (class 2620 OID 18098)
-- Name: students trg_students_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- TOC entry 5207 (class 2620 OID 18100)
-- Name: tuition trg_tuition_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tuition_updated BEFORE UPDATE ON public.tuition FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- TOC entry 5204 (class 2620 OID 18097)
-- Name: users trg_users_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- TOC entry 5203 (class 2606 OID 18063)
-- Name: announcements announcements_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5183 (class 2606 OID 17772)
-- Name: attendance attendance_class_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_class_course_id_fkey FOREIGN KEY (class_course_id) REFERENCES public.class_courses(id) ON DELETE CASCADE;


--
-- TOC entry 5184 (class 2606 OID 17767)
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5176 (class 2606 OID 17681)
-- Name: class_courses class_courses_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_courses
    ADD CONSTRAINT class_courses_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- TOC entry 5177 (class 2606 OID 17686)
-- Name: class_courses class_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_courses
    ADD CONSTRAINT class_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5178 (class 2606 OID 17691)
-- Name: class_courses class_courses_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_courses
    ADD CONSTRAINT class_courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id) ON DELETE SET NULL;


--
-- TOC entry 5172 (class 2606 OID 17617)
-- Name: classes classes_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5197 (class 2606 OID 18001)
-- Name: course_evaluations course_evaluations_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_evaluations
    ADD CONSTRAINT course_evaluations_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- TOC entry 5198 (class 2606 OID 17991)
-- Name: course_evaluations course_evaluations_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_evaluations
    ADD CONSTRAINT course_evaluations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5199 (class 2606 OID 17996)
-- Name: course_evaluations course_evaluations_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_evaluations
    ADD CONSTRAINT course_evaluations_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id) ON DELETE SET NULL;


--
-- TOC entry 5200 (class 2606 OID 17986)
-- Name: course_evaluations course_evaluations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_evaluations
    ADD CONSTRAINT course_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5173 (class 2606 OID 17637)
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5191 (class 2606 OID 17912)
-- Name: disciplinary_actions disciplinary_actions_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_actions
    ADD CONSTRAINT disciplinary_actions_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5192 (class 2606 OID 17907)
-- Name: disciplinary_actions disciplinary_actions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_actions
    ADD CONSTRAINT disciplinary_actions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5187 (class 2606 OID 17842)
-- Name: exam_schedules exam_schedules_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- TOC entry 5188 (class 2606 OID 17837)
-- Name: exam_schedules exam_schedules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5201 (class 2606 OID 18043)
-- Name: facility_bookings facility_bookings_booked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_bookings
    ADD CONSTRAINT facility_bookings_booked_by_fkey FOREIGN KEY (booked_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5202 (class 2606 OID 18038)
-- Name: facility_bookings facility_bookings_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_bookings
    ADD CONSTRAINT facility_bookings_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- TOC entry 5179 (class 2606 OID 17722)
-- Name: grades grades_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- TOC entry 5180 (class 2606 OID 17717)
-- Name: grades grades_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5181 (class 2606 OID 17712)
-- Name: grades grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5171 (class 2606 OID 17597)
-- Name: instructors instructors_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5193 (class 2606 OID 17939)
-- Name: leave_requests leave_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5194 (class 2606 OID 17934)
-- Name: leave_requests leave_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5195 (class 2606 OID 17957)
-- Name: student_documents student_documents_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5196 (class 2606 OID 17962)
-- Name: student_documents student_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5185 (class 2606 OID 17814)
-- Name: student_registrations student_registrations_class_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_registrations
    ADD CONSTRAINT student_registrations_class_course_id_fkey FOREIGN KEY (class_course_id) REFERENCES public.class_courses(id) ON DELETE CASCADE;


--
-- TOC entry 5186 (class 2606 OID 17809)
-- Name: student_registrations student_registrations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_registrations
    ADD CONSTRAINT student_registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5189 (class 2606 OID 17886)
-- Name: student_scholarships student_scholarships_scholarship_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_scholarships
    ADD CONSTRAINT student_scholarships_scholarship_id_fkey FOREIGN KEY (scholarship_id) REFERENCES public.scholarships(id) ON DELETE CASCADE;


--
-- TOC entry 5190 (class 2606 OID 17881)
-- Name: student_scholarships student_scholarships_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_scholarships
    ADD CONSTRAINT student_scholarships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- TOC entry 5174 (class 2606 OID 17662)
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- TOC entry 5175 (class 2606 OID 17667)
-- Name: students students_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5182 (class 2606 OID 17746)
-- Name: tuition tuition_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuition
    ADD CONSTRAINT tuition_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


-- Completed on 2026-03-12 11:04:55

--
-- PostgreSQL database dump complete
--

\unrestrict gbnXviTkzgiw0EMcRJiTLxzdZw1FDDLM85YtOTjoWAEYzKIimz1JlufzuOXUFBK

