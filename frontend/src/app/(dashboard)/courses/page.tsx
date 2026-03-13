'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { coursesApi, departmentsApi } from '@/lib/api';
import { Course, Department } from '@/types';
import { getUser } from '@/lib/auth';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    departmentId: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, deptsRes] = await Promise.all([
        coursesApi.getAll(),
        departmentsApi.getAll()
      ]);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : (Array.isArray(coursesRes) ? coursesRes : []));
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : (Array.isArray(deptsRes) ? deptsRes : []));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        code: course.code,
        name: course.name,
        credits: course.credits,
        departmentId: course.departmentId,
        description: course.description || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        code: '',
        name: '',
        credits: 3,
        departmentId: departments.length > 0 ? departments[0].id : '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await coursesApi.update(editingCourse.id, formData);
      } else {
        await coursesApi.create(formData);
      }
      await loadData();
      handleCloseModal();
      alert(editingCourse ? 'Cập nhật môn học thành công!' : 'Thêm môn học thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể thực hiện thao tác'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa môn học "${name}"?`)) return;
    try {
      await coursesApi.delete(id);
      await loadData();
      alert('Xóa môn học thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể xóa môn học'));
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || course.departmentId === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const isAdmin = getUser()?.role === 'admin';

  return (
    <div>
      <PageHeader
        title="Danh sách môn học"
        description="Quản lý thông tin và chương trình đào tạo các học phần"
        action={isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm môn học mới
          </button>
        )}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả các khoa</option>
              {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Hiển thị {filteredCourses.length} / {courses.length} môn học
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã môn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên môn học</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tín chỉ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khoa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy môn học
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                          {course.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{course.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{course.credits}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {course.departmentName || 'Chưa có'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal(course)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={!isAdmin}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(course.id, course.name)}
                            className="text-red-600 hover:text-red-900"
                            disabled={!isAdmin}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCourse ? 'Cập nhật môn học' : 'Thêm môn học mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã môn học <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: CS101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Lập trình cơ bản"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tín chỉ</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khoa <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingCourse ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
