'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Eye, Calendar, BookOpen, RefreshCw,
  Search, Loader2, X, CheckCircle, XCircle, MapPin, Clock, User, Hash
} from 'lucide-react';
import { registrationApi } from '@/lib/api';
import AddCourseModal from '@/components/AddCourseModal';

interface RegistrationPeriod {
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

interface SemesterCourse {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherName?: string;
  schedule?: string;
  room?: string;
  totalPeriods?: number;
  periodsPerSession?: number;
  isActive: boolean;
}

export default function AdminRegistrationPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [periods, setPeriods] = useState<RegistrationPeriod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'closed'>('all');
  
  // Modal states
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<RegistrationPeriod | null>(null);
  const [periodCourses, setPeriodCourses] = useState<SemesterCourse[]>([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '',
    semester: 1,
    startAt: '',
    endAt: '',
    status: 'draft' as 'draft' | 'active' | 'closed',
    description: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationApi.getPeriods();
      setPeriods(Array.isArray(data?.data) ? data.data : []);
    } catch (err: any) {
      console.error('Failed to load periods:', err);
      setError('Không thể tải danh sách đợt đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = () => {
    setFormData({
      name: '',
      academicYear: new Date().getFullYear().toString(),
      semester: 1,
      startAt: '',
      endAt: '',
      status: 'draft',
      description: '',
    });
    setSelectedPeriod(null);
    setShowPeriodModal(true);
  };

  const handleEditPeriod = (period: RegistrationPeriod) => {
    setFormData({
      name: period.name,
      academicYear: period.academicYear,
      semester: period.semester,
      startAt: period.startAt.split('T')[0],
      endAt: period.endAt.split('T')[0],
      status: period.status,
      description: period.description || '',
    });
    setSelectedPeriod(period);
    setShowPeriodModal(true);
  };

  const handleSavePeriod = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Vui lòng nhập tên đợt đăng ký');
        return;
      }
      if (!formData.startAt || !formData.endAt) {
        setError('Vui lòng chọn ngày bắt đầu và kết thúc');
        return;
      }
      if (new Date(formData.startAt) >= new Date(formData.endAt)) {
        setError('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
      };

      if (selectedPeriod) {
        await registrationApi.updatePeriod(selectedPeriod.id, payload);
        setSuccess('Cập nhật đợt đăng ký thành công!');
      } else {
        await registrationApi.createPeriod(payload);
        setSuccess('Tạo đợt đăng ký mới thành công!');
      }

      setShowPeriodModal(false);
      setTimeout(() => {
        loadPeriods();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCourses = async (period: RegistrationPeriod) => {
    try {
      setError(null);
      setSelectedPeriod(period);
      const data = await registrationApi.getSemesterCourses(period.id);
      setPeriodCourses(Array.isArray(data?.data) ? data.data : []);
      setShowCoursesModal(true);
    } catch (err: any) {
      setError('Không thể tải danh sách khóa học');
    }
  };

  const handleRemoveCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa môn ${courseName} khỏi đợt này?`)) return;

    try {
      setError(null);
      await registrationApi.removeSemesterCourse(courseId);
      setSuccess(`Đã xóa môn ${courseName}`);
      
      if (selectedPeriod) {
        setTimeout(() => {
          handleViewCourses(selectedPeriod);
          setSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xóa khóa học');
    }
  };

  const filteredPeriods = periods.filter((period) => {
    const matchSearch =
      period.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      period.academicYear.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || period.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-800', icon: '📝' },
      active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800', icon: '✅' },
      closed: { label: 'Đóng', color: 'bg-red-100 text-red-800', icon: '🔒' },
    }[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý đợt đăng ký</h1>
          <p className="text-gray-500 mt-1">Tạo và quản lý các đợt đăng ký môn học</p>
        </div>
        <button
          onClick={handleAddPeriod}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus size={20} /> Tạo đợt mới
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="text-red-600 mt-1 flex-shrink-0" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm đợt đăng ký..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="active">Đang hoạt động</option>
          <option value="closed">Đóng</option>
        </select>
      </div>

      {/* Periods List */}
      {filteredPeriods.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Không tìm thấy đợt đăng ký nào</p>
          <p className="text-gray-400 text-sm">Hãy tạo một đợt đăng ký mới</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPeriods.map((period) => (
            <div
              key={period.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{period.name}</h3>
                    {getStatusBadge(period.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Năm học</p>
                      <p className="font-semibold text-gray-900">{period.academicYear}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Kỳ học</p>
                      <p className="font-semibold text-gray-900">Kỳ {period.semester}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bắt đầu</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(period.startAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Kết thúc</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(period.endAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {period.description && (
                    <p className="mt-3 text-sm text-gray-600">{period.description}</p>
                  )}

                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      <BookOpen size={16} className="inline mr-1" />
                      {period.semesterCourseCount} khóa học
                    </span>
                    <span className="text-sm text-gray-600">
                      Tạo lúc: {new Date(period.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleViewCourses(period)}
                    title="Xem khóa học"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleEditPeriod(period)}
                    title="Chỉnh sửa"
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Period Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedPeriod ? 'Chỉnh sửa đợt đăng ký' : 'Tạo đợt đăng ký mới'}
              </h2>
              <button
                onClick={() => setShowPeriodModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSavePeriod(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên đợt đăng ký *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vd: Đợt đăng ký học kỳ II"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Năm học *
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="2024-2025"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kỳ học *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Kỳ 1</option>
                    <option value={2}>Kỳ 2</option>
                    <option value={3}>Kỳ 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kết thúc *
                  </label>
                  <input
                    type="date"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Nháp</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="closed">Đóng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về đợt đăng ký này"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPeriodModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Lưu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Modal */}
      {showCoursesModal && selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Khóa học - {selectedPeriod.name}
                </h2>
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                  <Plus size={14} /> Thêm môn học
                </button>
              </div>
              <button
                onClick={() => setShowCoursesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {periodCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">Không có khóa học nào</p>
                <p className="text-gray-400 text-sm">Hãy thêm khóa học vào đợt này</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periodCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.courseName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <p className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                          {course.courseCode} • {course.credits} tín chỉ
                        </p>
                        {course.teacherName && (
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <User size={12} className="text-gray-400" /> {course.teacherName}
                          </span>
                        )}
                        {course.schedule && (
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" /> {course.schedule}
                          </span>
                        )}
                        {course.room && (
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" /> {course.room}
                          </span>
                        )}
                        {course.totalPeriods && (
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Hash size={12} className="text-gray-400" /> {course.totalPeriods} tiết 
                            {course.periodsPerSession && ` (${course.periodsPerSession} tiết/buổi)`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCourse(course.id, course.courseName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa khóa học"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCoursesModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {selectedPeriod && (
        <AddCourseModal
          isOpen={showAddCourseModal}
          onClose={() => setShowAddCourseModal(false)}
          periodId={selectedPeriod.id}
          onSuccess={() => handleViewCourses(selectedPeriod)}
        />
      )}
    </div>
  );
}
