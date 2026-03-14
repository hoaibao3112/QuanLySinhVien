'use client';

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap, 
  Award, FileText, Download, Edit, CheckCircle, AlertCircle,
  Clock, Building, IdCard
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { studentsApi } from '@/lib/api';
import { StudentProfile, Grade, Schedule } from '@/types';

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'grades' | 'schedule'>('info');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Use the /me/profile endpoint instead of getting by ID
      const profileData = await studentsApi.getMyProfile();
      
      setProfile(profileData);
      
      // Load grades and schedule if profile exists
        try {
          const [gradesData, scheduleData] = await Promise.all([
            studentsApi.getMyGrades(),
            studentsApi.getMySchedule()
          ]);
          setGrades(Array.isArray(gradesData) ? gradesData : []);
          setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
        } catch (err) {
          console.error('Failed to load grades/schedule:', err);
        }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Đang học', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { label: 'Nghỉ học', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      suspended: { label: 'Tạm ngừng', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      graduated: { label: 'Tốt nghiệp', color: 'bg-blue-100 text-blue-800', icon: GraduationCap },
    }[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };

    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon size={16} />
        {config.label}
      </span>
    );
  };

  const calculateGPA = () => {
    if (grades.length === 0) return '0.00';
    const total = grades.reduce((sum, grade) => sum + (grade.totalScore || 0), 0);
    return (total / grades.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={64} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có hồ sơ sinh viên</h2>
          <p className="text-gray-600 mb-4">
            Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên. 
            Vui lòng liên hệ phòng đào tạo để được hỗ trợ.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
            <p className="font-semibold text-blue-900 mb-2">Thông tin liên hệ:</p>
            <p className="text-blue-800">📧 Email: daotao@edu.vn</p>
            <p className="text-blue-800">📞 Hotline: 1900-xxxx</p>
            <p className="text-blue-800">🏢 Địa chỉ: Phòng 101, Nhà A</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <User size={64} className="text-blue-600" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                  <Edit size={18} className="text-blue-600" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                  {getStatusBadge(profile.status)}
                </div>
                <div className="flex items-center gap-2 text-blue-100 mb-4">
                  <IdCard size={18} />
                  <span className="font-semibold">Mã sinh viên: {profile.code}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-blue-300" />
                    <span>{profile.className || 'Chưa có lớp'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-blue-300" />
                    <span>{profile.departmentName || 'Chưa có khoa'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-300" />
                    <span>Khóa: {profile.academicYear || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  <Download size={18} />
                  Tải hồ sơ
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
                  <Edit size={18} />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Award size={24} className="text-blue-600" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">GPA</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{calculateGPA()}</p>
            <p className="text-sm text-gray-500 mt-1">Điểm trung bình</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-green-600" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Môn học</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{schedule.length}</p>
            <p className="text-sm text-gray-500 mt-1">Đang học</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-purple-600" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Tín chỉ</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {schedule.reduce((sum, s) => sum + (s.credits || 0), 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Đã đăng ký</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-orange-600" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Điểm danh</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">95%</p>
            <p className="text-sm text-gray-500 mt-1">Tỷ lệ đi học</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'info'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'grades'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bảng điểm
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'schedule'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Lịch học
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Số điện thoại" value={profile.phone || 'Chưa cập nhật'} />
                <InfoRow icon={Calendar} label="Ngày sinh" value={profile.dateOfBirth || 'Chưa cập nhật'} />
                <InfoRow icon={User} label="Giới tính" value={profile.gender || 'Chưa cập nhật'} />
                <InfoRow icon={MapPin} label="Địa chỉ" value={profile.address || 'Chưa cập nhật'} className="md:col-span-2" />
                <InfoRow icon={Calendar} label="Ngày nhập học" value={profile.enrollmentDate || 'Chưa cập nhật'} />
                <InfoRow icon={Building} label="Mã lớp" value={profile.classCode || 'Chưa cập nhật'} />
              </div>
            )}

            {activeTab === 'grades' && (
              <div>
                {grades.length === 0 ? (
                  <div className="text-center py-12">
                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Chưa có điểm nào được ghi nhận</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Mã MH</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tên môn học</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Giữa kỳ</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Cuối kỳ</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Tổng</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Xếp loại</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {grades.map((grade) => (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-semibold text-blue-600">{grade.courseCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{grade.courseName}</td>
                            <td className="px-4 py-3 text-sm text-center">{grade.midtermScore || '-'}</td>
                            <td className="px-4 py-3 text-sm text-center">{grade.finalScore || '-'}</td>
                            <td className="px-4 py-3 text-sm text-center font-bold">{grade.totalScore || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                {grade.letterGrade || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-3">
                {schedule.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Chưa có lịch học nào</p>
                  </div>
                ) : (
                  schedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                          {item.courseCode?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.courseName}</p>
                          <p className="text-sm text-gray-500">{item.courseCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{item.schedule}</p>
                        <p className="text-xs text-gray-500">{item.room} • {item.instructorName}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: any;
  label: string;
  value: string;
  className?: string;
}

function InfoRow({ icon: Icon, label, value, className = '' }: InfoRowProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
