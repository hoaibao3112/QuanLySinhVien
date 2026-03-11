'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div>
      <PageHeader
        title="Điểm danh"
        description="Quản lý điểm danh sinh viên theo lớp và môn học"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn lớp</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>K64-CNTT1</option>
              <option>K64-CNTT2</option>
              <option>K63-KTPM</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn môn học</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Lập trình Java căn bản</option>
              <option>Cơ sở dữ liệu nâng cao</option>
              <option>Quản trị Marketing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày điểm danh</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách sinh viên</h3>
          
          <div className="space-y-3">
            {[
              { id: '2021001', name: 'Nguyễn Văn An', class: 'K64-CNTT1' },
              { id: '2021045', name: 'Trần Thị Hoa', class: 'K64-CNTT2' },
              { id: '2021002', name: 'Lê Văn Hùng', class: 'K64-CNTT1' },
              { id: '2021034', name: 'Mai Thu Thảo', class: 'K64-CNTT1' },
            ].map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {student.id.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.id} • {student.class}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium">
                    Có mặt
                  </button>
                  <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">
                    Vắng
                  </button>
                  <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium">
                    Muộn
                  </button>
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium">
                    Có phép
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Tổng: 45 sinh viên • Có mặt: 42 • Vắng: 2 • Muộn: 1
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Lưu điểm danh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
