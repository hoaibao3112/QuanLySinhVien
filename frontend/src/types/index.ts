// Type definitions
export interface Student {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  classId?: string;
  className?: string;
  departmentId?: string;
  enrollmentDate?: string;
  enrollmentYear?: number;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
}

export interface Instructor {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  studentCount?: number;
  courseCount?: number;
  classCount?: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  departmentId: string;
  departmentName?: string;
  description?: string;
}

export interface Class {
  id: string;
  code: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  academicYear?: string;
  semester?: number;
  maxStudents?: number;
  currentStudents?: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  classCourseId: string;
  checkDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface Tuition {
  id: string;
  studentId: string;
  studentName?: string;
  semester: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  dueDate?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalClasses: number;
  totalCourses: number;
  studentsTrend?: number;
  instructorsTrend?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  midtermScore?: number;
  finalScore?: number;
  practicalScore?: number;
  assignmentScore?: number;
  totalScore?: number;
  letterGrade?: string;
  academicYear: string;
  semester: number;
}

export interface Schedule {
  id: string;
  courseCode: string;
  courseName: string;
  instructorName?: string;
  room?: string;
  schedule?: string; // e.g., "Thứ 2, 07:30-09:30"
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  classCode?: string;
  className?: string;
  credits?: number;
}

export interface StudentProfile {
  id: string;
  code: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  email: string;
  phone?: string;
  address?: string;
  classId?: string;
  className?: string;
  classCode?: string;
  departmentId?: string;
  departmentName?: string;
  enrollmentDate?: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  academicYear?: string;
}

// ── REGISTRATION MODULE ───────────────────────────────────────
export interface RegistrationPeriod {
  id: string;
  name: string;
  academicYear: string;
  semester: number;
  startAt: string;
  endAt: string;
  status: 'draft' | 'active' | 'closed';
  description?: string;
  createdAt: string;
  semesterCourseCount: number;
}

export interface RegistrationPeriodCreateDto {
  name: string;
  academicYear: string;
  semester: number;
  startAt: string;
  endAt: string;
  status: 'draft' | 'active' | 'closed';
  description?: string;
}

export interface SemesterCourse {
  id: string;
  registrationPeriodId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  isActive: boolean;
}

export interface ClassCourse {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherName?: string;
  schedule?: string;
  room?: string;
  registrationPeriodId?: string;
}

export interface StudentRegistration {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  classCode: string;
  className: string;
  teacherName?: string;
  schedule?: string;
  room?: string;
  academicYear: string;
  semester: number;
  status: string;
}

export interface StudentRegistrationCreateDto {
  classCourseId: string;
  academicYear: string;
  semester: number;
  notes?: string;
}
