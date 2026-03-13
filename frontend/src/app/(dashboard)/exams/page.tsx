'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, BookOpen, AlertCircle, 
  Download, Printer, Filter, RefreshCw, FileText 
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { studentsApi } from '@/lib/api';

interface ExamSchedule {
  id: string;
  courseCode: string;
  courseName: string;
  examType: 'midterm' | 'final' | 'retest';
  examDate: string;
  duration: number;
  room?: string;
  notes?: string;
  academicYear: string;
  semester: number;
}

export default function ExamSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'midterm' | 'final' | 'retest'>('all');
  const [academicYear, setAcademicYear] = useState('2023-2024');
  const [semester, setSemester] = useState(1);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadExams();
    }
  }, [academicYear, semester]);

  const loadExams = async () => {
    try {
      setLoading(true);
      // TODO: Load actual exam schedules from API
      // const data = await studentsApi.getExamSchedules(user.id, { academicYear, semester });
      
      // Mock data
      const mockExams: ExamSchedule[] = [
        {
          id: '1',
          courseCode: 'INT201',
          courseName: 'Cấu trúc dữ liệu và giải thuật',
          examType: 'midterm',
          examDate: '2024-04-15T08:00:00',
          duration: 90,
          room: 'B1.01',
          notes: 'Mang theo giấy tờ tùy thân',
          academicYear: '2023-2024',
          semester: 1
        },
        {
          id: '2',
          courseCode: 'INT301',
          courseName: 'Cơ sở dữ liệu',
          examType: 'final',
          examDate: '2024-05-20T13:30:00',
          duration: 120,
          room: 'B2.03',
          notes: 'Thi trên máy tính',
          academicYear: '2023-2024',
          semester: 1
        },
      ];
      
      setExams(mockExams);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeBadge = (type: string) => {
    const config = {
      midterm: { label: 'Giữa kỳ', color: 'bg-blue-100 text-blue-800' },
      final: { label: 'Cuối kỳ', color: 'bg-purple-100 text-purple-800' },
      retest: { label: 'Thi lại', color: 'bg-orange-100 text-orange-800' },
    }[type] || { label: type, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExam = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredExams = exams.filter(exam => 
    selectedType === 'all' || exam.examType === selectedType
  );

  const upcomingExams = filteredExams
    .filter(exam => getDaysUntilExam(exam.examDate) >= 0)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  const pastExams = filteredExams
    .filter(exam => getDaysUntilExam(exam.examDate) < 0)
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

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
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lịch thi</h1>
            <p className="text-purple-100">Theo dõi lịch thi và chuẩn bị cho các kỳ thi</p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
              <Printer size={20} />
              In lịch
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg">
              <Download size={20} />
              Xuất PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2 rounded-xl border-0 text-gray-900 font-semibold focus:ring-2 focus:ring-white"
          >
            <option value="2023-2024">Năm học 2023-2024</option>
            <option value="2024-2025">Năm học 2024-2025</option>
          </select>
          
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border-0 text-gray-900 font-semibold focus:ring-2 focus:ring-white"
          >
            <option value={1}>Học kỳ 1</option>
            <option value={2}>Học kỳ 2</option>
            <option value={3}>Học kỳ hè</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-4 py-2 rounded-xl border-0 text-gray-900 font-semibold focus:ring-2 focus:ring-white"
          >
            <option value="all">Tất cả loại thi</option>
            <option value="midterm">Giữa kỳ</option>
            <option value="final">Cuối kỳ</option>
            <option value="retest">Thi lại</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingExams.length}</p>
          <p className="text-sm text-gray-500 mt-1">Kỳ thi sắp tới</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {upcomingExams.length > 0 ? getDaysUntilExam(upcomingExams[0].examDate) : 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ngày đến kỳ thi gần nhất</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pastExams.length}</p>
          <p className="text-sm text-gray-500 mt-1">Đã hoàn thành</p>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Kỳ thi sắp tới</h2>
          <p className="text-sm text-gray-500 mt-1">Lịch thi trong thời gian tới</p>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-semibold">Không có kỳ thi nào sắp tới</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingExams.map((exam) => {
              const daysUntil = getDaysUntilExam(exam.examDate);
              const isUrgent = daysUntil <= 7 && daysUntil >= 0;
              
              return (
                <div 
                  key={exam.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${isUrgent ? 'bg-orange-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-purple-600">{exam.courseCode}</span>
                        {getExamTypeBadge(exam.examType)}
                        {isUrgent && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                            <AlertCircle size={14} />
                            Còn {daysUntil} ngày
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{exam.courseName}</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Ngày thi</p>
                            <p className="text-sm font-semibold text-gray-900">{formatDate(exam.examDate)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Clock size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Giờ thi</p>
                            <p className="text-sm font-semibold text-gray-900">{formatTime(exam.examDate)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Phòng thi</p>
                            <p className="text-sm font-semibold text-gray-900">{exam.room || 'TBA'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Clock size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Thời gian</p>
                            <p className="text-sm font-semibold text-gray-900">{exam.duration} phút</p>
                          </div>
                        </div>
                      </div>
                      
                      {exam.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Lưu ý:</span> {exam.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Exams */}
      {pastExams.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Kỳ thi đã qua</h2>
            <p className="text-sm text-gray-500 mt-1">Lịch sử các kỳ thi đã hoàn thành</p>
          </div>

          <div className="divide-y divide-gray-100">
            {pastExams.slice(0, 5).map((exam) => (
              <div key={exam.id} className="p-6 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-gray-600">{exam.courseCode}</span>
                      {getExamTypeBadge(exam.examType)}
                    </div>
                    <h3 className="font-bold text-gray-900">{exam.courseName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">{formatDate(exam.examDate)}</p>
                    <p className="text-xs text-gray-500">{exam.room}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
