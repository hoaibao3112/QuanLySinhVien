'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Calendar, User, MapPin, Plus, Trash2,
  Search, CheckCircle, XCircle, AlertCircle, RefreshCw, X, Loader2,
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { registrationApi } from '@/lib/api';

interface Registration {
  id: string;
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
}

interface AvailableCourse {
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

export default function CourseRegistrationPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'registered' | 'available'>('registered');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCredits, setFilterCredits] = useState('all');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AvailableCourse | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [period, setPeriod] = useState<any>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load active registration period
      try {
        const periodData = await registrationApi.getActivePeriod();
        if (periodData?.data) {
          setPeriod(periodData.data);
          setPeriodError(null);
        } else {
          setPeriodError('Không có đợt đăng ký nào đang hoạt động');
        }
      } catch {
        setPeriodError('Không thể tải thông tin đợt đăng ký');
      }

      // Load registered courses
      const regData = await registrationApi.getMyRegistrations();
      setRegistrations(Array.isArray(regData?.data) ? regData.data : []);

      // Load available courses
      const coursesData = await registrationApi.getAvailableClasses();
      setAvailableCourses(Array.isArray(coursesData?.data) ? coursesData.data : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (course: AvailableCourse) => {
    if (!period) {
      setError('Không có đợt đăng ký nào đang hoạt động');
      return;
    }
    setSelectedCourse(course);
    setShowRegisterModal(true);
  };

  const confirmRegister = async () => {
    if (!selectedCourse || !period) return;

    try {
      setIsRegistering(true);
      setError(null);

      await registrationApi.register({
        classCourseId: selectedCourse.id,
        academicYear: period.academicYear,
        semester: period.semester,
        notes: '',
      });

      setSuccess(`Đăng ký môn ${selectedCourse.courseName} thành công!`);
      setShowRegisterModal(false);
      setSelectedCourse(null);

      setTimeout(() => {
        loadData();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to register:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async (registrationId: string, courseName: string) => {
    if (!confirm(`Bạn có chắc muốn hủy đăng ký môn ${courseName}?`)) return;

    try {
      setIsUnregistering(true);
      setError(null);

      await registrationApi.unregister(registrationId);

      setSuccess(`Hủy đăng ký môn ${courseName} thành công!`);

      setTimeout(() => {
        loadData();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to unregister:', err);
      setError(err.message || 'Hủy đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsUnregistering(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchSearch =
      reg.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCredits =
      filterCredits === 'all' || reg.credits === parseInt(filterCredits);
    return matchSearch && matchCredits;
  });

  const filteredAvailable = availableCourses.filter((course) => {
    const alreadyRegistered = registrations.some(
      (r) => r.courseCode === course.courseCode,
    );
    const matchSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCredits =
      filterCredits === 'all' || course.credits === parseInt(filterCredits);
    return matchSearch && matchCredits && !alreadyRegistered;
  });

  const totalCredits = registrations.reduce((sum, r) => sum + r.credits, 0);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Đăng ký môn học
          </h1>
          <p className="text-gray-500 mt-1">Quản lý các môn học của bạn</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {/* Registration Period Info */}
      {period && !periodError && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900">{period.name}</h3>
              <p className="text-sm text-blue-800">
                Từ {new Date(period.startAt).toLocaleDateString('vi-VN')} đến{' '}
                {new Date(period.endAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {periodError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-900">Thông báo</h3>
              <p className="text-sm text-yellow-800">{periodError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="text-red-600 mt-1 flex-shrink-0" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-semibold">Tổng tín chỉ</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalCredits}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-semibold">Số môn học</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{registrations.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-semibold">Môn có sẵn</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {filteredAvailable.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('registered')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'registered'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Đã đăng ký ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Có sẵn ({filteredAvailable.length})
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCredits}
          onChange={(e) => setFilterCredits(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả tín chỉ</option>
          <option value="2">2 tín chỉ</option>
          <option value="3">3 tín chỉ</option>
          <option value="4">4 tín chỉ</option>
        </select>
      </div>

      {/* Tab: Registered Courses */}
      {activeTab === 'registered' && (
        <div>
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Chưa đăng ký môn học nào</p>
              <p className="text-gray-400 text-sm">
                Hãy chuyển sang tab "Có sẵn" để đăng ký
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reg.courseName}
                          </h3>
                          <p className="text-sm text-gray-500">{reg.courseCode}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <BookOpen size={14} />
                          {reg.credits} tín chỉ
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} className="text-gray-400" />
                          <span>{reg.className}</span>
                        </div>
                        {reg.teacherName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={16} className="text-gray-400" />
                            <span>{reg.teacherName}</span>
                          </div>
                        )}
                        {reg.schedule && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{reg.schedule}</span>
                          </div>
                        )}
                        {reg.room && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{reg.room}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnregister(reg.id, reg.courseName)}
                      disabled={isUnregistering || !period}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hủy đăng ký"
                    >
                      {isUnregistering ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Available Courses */}
      {activeTab === 'available' && (
        <div>
          {filteredAvailable.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Không tìm thấy môn học nào</p>
              <p className="text-gray-400 text-sm">
                Tất cả các môn đều đã đăng ký hoặc không có môn nào phù hợp
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAvailable.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {course.courseName}
                          </h3>
                          <p className="text-sm text-gray-500">{course.courseCode}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <BookOpen size={14} />
                          {course.credits} tín chỉ
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {course.teacherName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={16} className="text-gray-400" />
                            <span>{course.teacherName}</span>
                          </div>
                        )}
                        {course.schedule && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{course.schedule}</span>
                          </div>
                        )}
                        {course.room && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{course.room}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegister(course)}
                      disabled={isRegistering || !period}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    >
                      {isRegistering ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                      Đăng ký
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Register Confirmation Modal */}
      {showRegisterModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Xác nhận đăng ký</h2>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Môn học</p>
                <p className="font-semibold text-gray-900">{selectedCourse.courseName}</p>
                <p className="text-sm text-gray-500">{selectedCourse.courseCode}</p>
              </div>
              {selectedCourse.teacherName && (
                <div>
                  <p className="text-sm text-gray-600">Giảng viên</p>
                  <p className="font-semibold text-gray-900">{selectedCourse.teacherName}</p>
                </div>
              )}
              {selectedCourse.schedule && (
                <div>
                  <p className="text-sm text-gray-600">Lịch học</p>
                  <p className="font-semibold text-gray-900">{selectedCourse.schedule}</p>
                </div>
              )}
              {selectedCourse.room && (
                <div>
                  <p className="text-sm text-gray-600">Phòng học</p>
                  <p className="font-semibold text-gray-900">{selectedCourse.room}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Tín chỉ</p>
                <p className="font-semibold text-gray-900">{selectedCourse.credits} tín chỉ</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedCourse(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={confirmRegister}
                disabled={isRegistering}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
                {isRegistering ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}