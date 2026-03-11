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
  enrollmentDate?: string;
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
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  departmentId?: string;
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
