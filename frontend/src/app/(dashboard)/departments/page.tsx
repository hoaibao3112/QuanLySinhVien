'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { departmentsApi } from '@/lib/api';
import { Department } from '@/types';
import { getUser } from '@/lib/auth';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentsApi.getAll();
      setDepartments(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        code: dept.code,
        name: dept.name,
        description: dept.description || ''
      });
    } else {
      setEditingDept(null);
      setFormData({ code: '', name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDept(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentsApi.update(editingDept.id, formData);
      } else {
        await departmentsApi.create(formData);
      }
      await loadDepartments();
      handleCloseModal();
      alert(editingDept ? 'Cập nhật khoa thành công!' : 'Thêm khoa mới thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể thực hiện thao tác'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa khoa "${name}"? Thao tác này có thể thất bại nếu khoa đang có sinh viên hoặc môn học.`)) return;
    try {
      await departmentsApi.delete(id);
      await loadDepartments();
      alert('Xóa khoa thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể xóa khoa'));
    }
  };

  const isAdmin = getUser()?.role === 'admin';

  return (
    <div>
      <PageHeader
        title="Quản lý Khoa"
        description="Danh sách các khoa và phòng ban trong trường"
        action={isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm khoa mới
          </button>
        )}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã khoa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khoa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-center">Thống kê</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu khoa
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                          {dept.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-md">{dept.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-3">
                            <span className="text-xs text-gray-600" title="Sinh viên">👤 {dept.studentCount}</span>
                            <span className="text-xs text-gray-600" title="Môn học">📚 {dept.courseCount}</span>
                            <span className="text-xs text-gray-600" title="Lớp học">🏫 {dept.classCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal(dept)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={!isAdmin}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(dept.id, dept.name)}
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
                {editingDept ? 'Cập nhật khoa' : 'Thêm khoa mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã khoa <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: CNTT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoa <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Công nghệ thông tin"
                />
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
                  {editingDept ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
