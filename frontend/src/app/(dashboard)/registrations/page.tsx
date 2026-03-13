'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, User, Clock, MapPin, Plus, Trash2, 
  Search, Filter, CheckCircle, XCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { studentsApi, coursesApi } from '@/lib/api';

interface CourseRegistration {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  instructorName?: string;
  schedule?: string;
  room?: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  academicYear: string;
  semester: number;
}

export default function CourseRegistrationPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [academicYear, setAcademicYear] = useState('2023-2024');

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Load actual registrations from API
      // const data = await studentsApi.getRegistrations(user.id);
      setRegistrations([]);
      
      // Load available courses
      const coursesData = await coursesApi.getAll();
      setAvailableCourses(Array.isArray(coursesData) ? coursesData : coursesData.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (courseId: string) => {
    try {
      // TODO: Call API to register course
      // await studentsApi.registerCourse(user.id, courseId);
      alert('Đăng ký môn học thành công! Vui lòng chờ phê duyệt.');
      loadData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to register course:', error);
      alert('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const handleCancel = async (registrationId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đăng ký môn học này?')) return;
    
    try {
      // TODO: Call API to cancel registration
      // await studentsApi.cancelRegistration(registrationId);
      alert('Hủy đăng ký thành công!');
      loadData();
    } catch (error) {
      console.error('Failed to cancel registration:', error);
      alert('Hủy đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800', icon: XCircle },
    }[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const filteredCourses = availableCourses.filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Đăng ký môn học</h1>
            <p className="text-blue-100">Đăng ký các môn học cho học kỳ tiếp theo</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Đăng ký mới
          </button>
        </div>

        {/* Semester Selection */}
        <div className="mt-6 flex gap-4">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2 rounded-xl border-0 text-gray-900 font-semibold focus:ring-2 focus:ring-white"
          >
            <option value="2023-2024">Năm học 2023-2024</option>
            <option value="2024-2025">Năm học 2024-2025</option>
          </select>
          
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border-0 text-gray-900 font-semibold focus:ring-2 focus:ring-white"
          >
            <option value={1}>Học kỳ 1</option>
            <option value={2}>Học kỳ 2</option>
            <option value={3}>Học kỳ hè</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{registrations.length}</p>
          <p className="text-sm text-gray-500 mt-1">Môn đã đăng ký</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {registrations.filter(r => r.registrationStatus === 'approved').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Đã phê duyệt</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {registrations.reduce((sum, r) => sum + r.credits, 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tổng tín chỉ</p>
        </div>
      </div>

      {/* Registered Courses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Môn học đã đăng ký</h2>
          <p className="text-sm text-gray-500 mt-1">Danh sách các môn học bạn đã đăng ký cho học kỳ này</p>
        </div>

        {registrations.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-semibold">Bạn chưa đăng ký môn học nào</p>
            <p className="text-sm text-gray-400 mt-2">Nhấn nút "Đăng ký mới" để bắt đầu</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {registrations.map((reg) => (
              <div key={reg.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-blue-600">{reg.courseCode}</span>
                      {getStatusBadge(reg.registrationStatus)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{reg.courseName}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={16} />
                        {reg.credits} tín chỉ
                      </span>
                      {reg.instructorName && (
                        <span className="flex items-center gap-1.5">
                          <User size={16} />
                          {reg.instructorName}
                        </span>
                      )}
                      {reg.schedule && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={16} />
                          {reg.schedule}
                        </span>
                      )}
                      {reg.room && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={16} />
                          {reg.room}
                        </span>
                      )}
                    </div>
                  </div>

                  {reg.registrationStatus === 'pending' && (
                    <button
                      onClick={() => handleCancel(reg.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chọn môn học</h2>
                  <p className="text-sm text-gray-500 mt-1">Danh sách các môn học có thể đăng ký</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-3">
                {filteredCourses.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Không tìm thấy môn học nào</p>
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                      onClick={() => handleRegister(course.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                          {course.code?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-blue-600">{course.code}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {course.credits} TC
                            </span>
                          </div>
                          <p className="font-bold text-gray-900">{course.name}</p>
                          {course.description && (
                            <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                          )}
                        </div>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                        <Plus size={16} />
                        Đăng ký
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
