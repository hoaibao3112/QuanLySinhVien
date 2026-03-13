'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, CheckCircle, BookOpen, User, MapPin, Clock, Hash } from 'lucide-react';
import { departmentsApi, coursesApi, registrationApi, instructorsApi } from '@/lib/api';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodId: string;
  onSuccess: () => void;
}

const COMMON_SCHEDULES = [
  "Thứ 2 (1-3)", "Thứ 2 (4-6)", "Thứ 2 (7-9)", "Thứ 2 (10-12)",
  "Thứ 3 (1-3)", "Thứ 3 (4-6)", "Thứ 3 (7-9)", "Thứ 3 (10-12)",
  "Thứ 4 (1-3)", "Thứ 4 (4-6)", "Thứ 4 (7-9)", "Thứ 4 (10-12)",
  "Thứ 5 (1-3)", "Thứ 5 (4-6)", "Thứ 5 (7-9)", "Thứ 5 (10-12)",
  "Thứ 6 (1-3)", "Thứ 6 (4-6)", "Thứ 6 (7-9)", "Thứ 6 (10-12)",
  "Thứ 7 (1-3)", "Thứ 7 (4-6)", "Thứ 7 (7-9)", "Thứ 7 (10-12)",
];

const COMMON_ROOMS = [
  "A1-101", "A1-102", "A1-201", "A1-202", "A2-101", "A2-201",
  "B1-101", "B1-201", "B2-101", "B2-201", "C1-101", "C2-101",
  "Lab-101", "Lab-201", "Hội trường A", "Hội trường B"
];

export default function AddCourseModal({ isOpen, onClose, periodId, onSuccess }: AddCourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    courseId: '',
    teacherName: '',
    schedule: '',
    room: '',
    totalPeriods: 45,
    periodsPerSession: 3,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      loadInstructors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDept) {
      loadCourses(selectedDept);
    } else {
      setCourses([]);
    }
  }, [selectedDept]);

  const loadDepartments = async () => {
    try {
      const resp = await departmentsApi.getAll();
      setDepartments(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const loadInstructors = async () => {
    try {
      const resp = await instructorsApi.getAll({ pageSize: 100 });
      // The backend returns ApiResponse<PagedResult<InstructorDto>>
      // PagedResult has a 'data' property for the items array
      const data = resp.data?.data || resp.data || [];
      setInstructors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load instructors', err);
    }
  };

  const loadCourses = async (deptId: string) => {
    try {
      const resp = await coursesApi.getAll({ departmentId: deptId });
      setCourses(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.courseId) {
        setError('Vui lòng chọn môn học');
        return;
      }

      setLoading(true);
      setError(null);

      await registrationApi.addSemesterCourse(periodId, {
        registrationPeriodId: periodId,
        ...formData,
        totalPeriods: Number(formData.totalPeriods),
        periodsPerSession: Number(formData.periodsPerSession)
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        courseId: '',
        teacherName: '',
        schedule: '',
        room: '',
        totalPeriods: 45,
        periodsPerSession: 3,
      });
      setSelectedDept('');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi thêm môn học');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl border border-gray-100 animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 text-blue-600">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-900">Thêm môn học vào đợt</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm text-red-600 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Khoa / Bộ môn</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                <option value="">-- Chọn khoa --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Môn học *</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!selectedDept}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                />
              </div>
              
              <div className="mt-2 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-100 rounded-lg bg-gray-50/30">
                {selectedDept && filteredCourses.length === 0 && (
                  <p className="text-center text-gray-400 py-4 text-sm whitespace-pre-line italic">Không tìm thấy môn học nào</p>
                )}
                {!selectedDept && (
                  <p className="text-center text-gray-400 py-4 text-sm italic">Vui lòng chọn khoa trước</p>
                )}
                {filteredCourses.map(c => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.courseId === c.id 
                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500' 
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courseId"
                        className="w-4 h-4 text-blue-600"
                        checked={formData.courseId === c.id}
                        onChange={() => setFormData({ ...formData, courseId: c.id })}
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.code} • {c.credits} tín chỉ</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <User size={14} className="text-gray-400" /> Giảng viên
              </label>
              <select
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                <option value="">-- Chọn giảng viên --</option>
                {instructors.map(i => (
                  <option key={i.id} value={i.fullName}>{i.fullName} ({i.code})</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" /> Lịch học
              </label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                <option value="">-- Chọn lịch --</option>
                {COMMON_SCHEDULES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" /> Phòng học
              </label>
              <select
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                <option value="">-- Chọn phòng --</option>
                {COMMON_ROOMS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Hash size={14} className="text-gray-400" /> Tổng số tiết
              </label>
              <input
                type="number"
                value={formData.totalPeriods}
                onChange={(e) => setFormData({ ...formData, totalPeriods: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" /> Tiết / buổi
              </label>
              <input
                type="number"
                value={formData.periodsPerSession}
                onChange={(e) => setFormData({ ...formData, periodsPerSession: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50 rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !formData.courseId}
            className="flex-[1.5] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-200 transition-all font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            Lưu môn học
          </button>
        </div>
      </div>
    </div>
  );
}
