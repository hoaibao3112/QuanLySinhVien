// API Client Configuration
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5101/api')
  : 'http://localhost:5101/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: any;
}

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      const errorMessage = error.message || error.title || error.error || `HTTP error! status: ${response.status}`;
      console.error('API Error:', errorMessage, error);
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', text);
      return text as any;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post<{ token: string; username: string; email: string; role: string }>('/auth/login', credentials),
  
  getMe: () => api.get<any>('/auth/me'),
  
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Students API
export const studentsApi = {
  getAll: (params?: any) => api.get<any>(`/students${params ? `?${new URLSearchParams(params)}` : ''}`),
  getById: (id: string) => api.get<any>(`/students/${id}`),
  getMyProfile: () => api.get<any>('/students/me/profile'),
  create: (data: any) => api.post<any>('/students', data),
  update: (id: string, data: any) => api.put<any>(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  getSchedule: (id: string, params?: any) => api.get<any>(`/students/${id}/schedule${params ? `?${new URLSearchParams(params)}` : ''}`),
  getGrades: (id: string, params?: any) => api.get<any>(`/students/${id}/grades${params ? `?${new URLSearchParams(params)}` : ''}`),
  getTuitions: (id: string) => api.get<any>(`/students/${id}/tuitions`),
  getProfile: (id: string) => api.get<any>(`/students/${id}`),
};

// Instructors API
export const instructorsApi = {
  getAll: (params?: any) => api.get<any>(`/instructors${params ? `?${new URLSearchParams(params)}` : ''}`),
  getById: (id: string) => api.get<any>(`/instructors/${id}`),
  create: (data: any) => api.post<any>('/instructors', data),
  update: (id: string, data: any) => api.put<any>(`/instructors/${id}`, data),
  delete: (id: string) => api.delete(`/instructors/${id}`),
  getSchedule: (id: string, params?: any) => api.get<any>(`/instructors/${id}/schedule${params ? `?${new URLSearchParams(params)}` : ''}`),
  getClasses: (id: string) => api.get<any>(`/instructors/${id}/classes`),
  getEvaluations: (id: string, params?: any) => api.get<any>(`/instructors/${id}/evaluations${params ? `?${new URLSearchParams(params)}` : ''}`),
};

// Departments API
export const departmentsApi = {
  getAll: () => api.get<any>('/departments'),
  getById: (id: string) => api.get<any>(`/departments/${id}`),
  create: (data: any) => api.post<any>('/departments', data),
  update: (id: string, data: any) => api.put<any>(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

// Courses API
export const coursesApi = {
  getAll: (params?: any) => api.get<any>(`/courses${params ? `?${new URLSearchParams(params)}` : ''}`),
  getById: (id: string) => api.get<any>(`/courses/${id}`),
  create: (data: any) => api.post<any>('/courses', data),
  update: (id: string, data: any) => api.put<any>(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Classes API
export const classesApi = {
  getAll: (params?: any) => api.get<any>(`/classes${params ? `?${new URLSearchParams(params)}` : ''}`),
  getById: (id: string) => api.get<any>(`/classes/${id}`),
  create: (data: any) => api.post<any>('/classes', data),
  update: (id: string, data: any) => api.put<any>(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getCourses: (id: string) => api.get<any>(`/classes/${id}/courses`),
  assignCourse: (id: string, data: any) => api.post<any>(`/classes/${id}/assign-course`, data),
  removeCourse: (id: string, courseId: string) => api.delete(`/classes/${id}/remove-course/${courseId}`),
};

// Attendance API
export const attendanceApi = {
  getAll: (params?: any) => api.get<any>(`/attendance${params ? `?${new URLSearchParams(params)}` : ''}`),
  getById: (id: string) => api.get<any>(`/attendance/${id}`),
  markSingle: (data: any) => api.post<any>('/attendance', data),
  markBulk: (data: any) => api.post<any>('/attendance/bulk', data),
  update: (id: string, data: any) => api.put<any>(`/attendance/${id}`, data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
  getStatistics: (studentId: string) => api.get<any>(`/attendance/statistics/${studentId}`),
  getByClassCourse: (id: string) => api.get<any>(`/attendance/class-course/${id}`),
  getByStudent: (studentId: string) => api.get<any>(`/attendance/student/${studentId}`),
  getAbsenceReport: () => api.get<any>('/attendance/report/absences'),
};

// Grades API
export const gradesApi = {
  getAll: (params?: any) => api.get<any>(`/grades${params ? `?${new URLSearchParams(params)}` : ''}`),
  upsert: (data: any) => api.post<any>('/grades', data),
};

// Tuition API
export const tuitionApi = {
  getAll: (params?: any) => api.get<any>(`/tuition${params ? `?${new URLSearchParams(params)}` : ''}`),
  getById: (id: string) => api.get<any>(`/tuition/${id}`),
  create: (data: any) => api.post<any>('/tuition', data),
  pay: (id: string, data: any) => api.post<any>(`/tuition/${id}/pay`, data),
  getByStudent: (studentId: string) => api.get<any>(`/tuition/student/${studentId}`),
};

// Dashboard API
export const dashboardApi = {
  getOverview: () => api.get<any>('/dashboard'),
};

// Registration API
export const registrationApi = {
  // Student endpoints
  getActivePeriod: () => api.get<any>('/registration/active-period'),
  getAvailableClasses: () => api.get<any>('/registration/available-classes'),
  getMyRegistrations: () => api.get<any>('/registration/my-registrations'),
  register: (data: any) => api.post<any>('/registration/register', data),
  unregister: (registrationId: string) => api.post<any>(`/registration/unregister/${registrationId}`, {}),

  // Admin endpoints
  getPeriods: () => api.get<any>('/registration/periods'),
  createPeriod: (data: any) => api.post<any>('/registration/periods', data),
  updatePeriod: (id: string, data: any) => api.put<any>(`/registration/periods/${id}`, data),
  
  getSemesterCourses: (periodId: string) => api.get<any>(`/registration/periods/${periodId}/courses`),
  addSemesterCourse: (periodId: string, data: any) => api.post<any>(`/registration/periods/${periodId}/courses`, data),
  removeSemesterCourse: (courseId: string) => api.delete<any>(`/registration/courses/${courseId}`),
};
