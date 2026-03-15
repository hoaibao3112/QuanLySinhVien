'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { studentsApi, classesApi, departmentsApi } from '@/lib/api';
import { Student } from '@/types';
import { getUser } from '@/lib/auth';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'male',
    email: '',
    phone: '',
    address: '',
    classId: '',
    departmentId: '',
    enrollmentYear: new Date().getFullYear(),
    status: 'active'
  });

  // Route protection - only admin can access
  useEffect(() => {
    const user = getUser();
    if (user?.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này. Chuyển về Hồ sơ cá nhân.');
      router.push('/students/profile');
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, classesRes, deptsRes] = await Promise.all([
        studentsApi.getAll(),
        classesApi.getAll(),
        departmentsApi.getAll()
      ]);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : (Array.isArray(studentsRes) ? studentsRes : []));
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : (Array.isArray(classesRes) ? classesRes : []));
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : (Array.isArray(deptsRes) ? deptsRes : []));
    } catch (error: any) {
      console.error('Failed to load data:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.message || 'Không thể kết nối tới server'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        studentCode: student.code || '',
        fullName: student.fullName || '',
        dateOfBirth: student.dateOfBirth || '',
        gender: student.gender || 'male',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        classId: student.classId || '',
        departmentId: student.departmentId || '',
        enrollmentYear: student.enrollmentYear || new Date().getFullYear(),
        status: student.status || 'active'
      });
    } else {
      setEditingStudent(null);
      setFormData({
        studentCode: '',
        fullName: '',
        dateOfBirth: '',
        gender: 'male',
        email: '',
        phone: '',
        address: '',
        classId: '',
        departmentId: '',
        enrollmentYear: new Date().getFullYear(),
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        classId: formData.classId || null,
        departmentId: formData.departmentId || null,
        dateOfBirth: formData.dateOfBirth || null,
      };

      if (editingStudent) {
        await studentsApi.update(editingStudent.id, submitData);
      } else {
        await studentsApi.create(submitData);
      }
      
      await loadData();
      handleCloseModal();
      alert(editingStudent ? 'Cập nhật sinh viên thành công!' : 'Thêm sinh viên thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể thực hiện thao tác'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sinh viên "${name}"?`)) return;
    
    try {
      await studentsApi.delete(id);
      await loadData();
      alert('Xóa sinh viên thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể xóa sinh viên'));
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      graduated: 'bg-blue-100 text-blue-800',
    }[status] || 'bg-gray-100 text-gray-800';

    const labels = {
      active: 'Đang học',
      inactive: 'Nghỉ học',
      suspended: 'Ngừng học',
      graduated: 'Tốt nghiệp',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div>
      <PageHeader
        title="Danh sách sinh viên"
        description="Quản lý và theo dõi thông tin sinh viên trong toàn hệ thống"
        action={
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm mới
          </button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã sinh viên hoặc email..."
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang học</option>
                <option value="inactive">Nghỉ học</option>
                <option value="suspended">Ngừng học</option>
                <option value="graduated">Tốt nghiệp</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Hiển thị {filteredStudents.length} / {students.length} sinh viên
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã SV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email / SĐT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lớp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy sinh viên nào
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                            {student.code?.substring(0, 2) || '--'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{student.code || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.fullName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{student.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{student.phone || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{student.className || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(student.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(student)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Sửa"
                          >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => router.push(`/students/profile?id=${student.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Xem hồ sơ"
                          >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id, student.fullName || student.code || 'sinh viên này')}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến{' '}
                <span className="font-medium">{filteredStudents.length}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, '...', 12].map((page, i) => (
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
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStudent ? 'Cập nhật sinh viên' : 'Thêm sinh viên mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã sinh viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    value={formData.studentCode}
                    onChange={(e) => setFormData({...formData, studentCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="VD: SV0001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0123456789"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({...formData, classId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm nhập học</label>
                  <input
                    type="number"
                    value={formData.enrollmentYear}
                    onChange={(e) => setFormData({...formData, enrollmentYear: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="2000"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Đang học</option>
                    <option value="inactive">Nghỉ học</option>
                    <option value="suspended">Ngừng học</option>
                    <option value="graduated">Tốt nghiệp</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Nhập địa chỉ"
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
                  {editingStudent ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
