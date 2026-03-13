'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { classesApi, departmentsApi } from '@/lib/api';
import { Class } from '@/types';
import { X } from 'lucide-react';
import { getUser } from '@/lib/auth';

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departmentId: '',
    academicYear: '',
    semester: 1,
    maxStudents: 40
  });

  useEffect(() => {
    const user = getUser();
    if (user?.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này. Chuyển về Trang chủ.');
      router.push('/dashboard');
      return;
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesRes, deptsRes] = await Promise.all([
        classesApi.getAll(),
        departmentsApi.getAll()
      ]);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : (Array.isArray(classesRes) ? classesRes : []));
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : (Array.isArray(deptsRes) ? deptsRes : []));
    } catch (error: any) {
      console.error('Failed to load data:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.message || 'Không thể kết nối tới server'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cls?: Class) => {
    if (cls) {
      setSelectedClass(cls);
      setIsEditing(true);
      setFormData({
        code: cls.code || '',
        name: cls.name || '',
        departmentId: cls.departmentId || '',
        academicYear: cls.academicYear || '',
        semester: cls.semester || 1,
        maxStudents: cls.maxStudents || 40
      });
    } else {
      setSelectedClass(null);
      setIsEditing(false);
      setFormData({
        code: '',
        name: '',
        departmentId: '',
        academicYear: '',
        semester: 1,
        maxStudents: 40
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClass(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        departmentId: formData.departmentId || null,
      };

      if (isEditing && selectedClass) {
        await classesApi.update(selectedClass.id, submitData);
      } else {
        await classesApi.create(submitData);
      }
      
      await loadData();
      handleCloseModal();
      alert(isEditing ? 'Cập nhật lớp học thành công!' : 'Thêm lớp học thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể thực hiện thao tác'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa lớp "${name}"?`)) return;
    
    try {
      await classesApi.delete(id);
      await loadData();
      alert('Xóa lớp học thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể xóa lớp học'));
    }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Quản lý Lớp học"
        description="Danh sách các lớp học chính quy trong toàn hệ thống đào tạo"
        action={
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo lớp học mới
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">TỔNG SỐ LỚP</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">TỔNG SINH VIÊN</p>
            <p className="text-2xl font-bold text-gray-900">6,240</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">SỐ KHÓA</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">LỚP QUÁ TẢI</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã lớp hoặc tên lớp..."
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
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Tất cả khoa</option>
              <option>CNTT & Truyền thông</option>
              <option>Kinh tế & Quản lý</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Niên khóa: 2023-2027</option>
              <option>2022-2026</option>
              <option>2021-2025</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Hiển thị 1-10 của 156 lớp học
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã lớp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên lớp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khoa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niên khóa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sĩ số</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy lớp học
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                          {cls.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{cls.departmentName || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{cls.academicYear || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {cls.currentStudents || 0}/{cls.maxStudents || 50}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal(cls)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Sửa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(cls.id, cls.name || cls.code || 'lớp học này')}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
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

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Hiển thị 1-10</div>
            <div className="flex gap-2">
              {[1, 2, 3, '...', 16].map((page, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    page === 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Cập nhật lớp học' : 'Thêm lớp học mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã lớp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="VD: CNTT01-K17"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên lớp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Công nghệ thông tin 01 - K17"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khoa</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn khoa --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niên khóa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: 2023-2027"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Học kỳ <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Học kỳ 1</option>
                    <option value="2">Học kỳ 2</option>
                    <option value="3">Học kỳ hè</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sĩ số tối đa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                  {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
