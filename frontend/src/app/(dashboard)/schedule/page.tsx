'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, RefreshCw, Printer, Download, BookOpen, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { studentsApi, instructorsApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Schedule } from '@/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const COURSE_COLORS = [
  'bg-blue-50 border-l-blue-500 text-blue-700',
  'bg-purple-50 border-l-purple-500 text-purple-700',
  'bg-green-50 border-l-green-500 text-green-700',
  'bg-orange-50 border-l-orange-500 text-orange-700',
  'bg-pink-50 border-l-pink-500 text-pink-700',
  'bg-cyan-50 border-l-cyan-500 text-cyan-700',
  'bg-red-50 border-l-red-500 text-red-700',
];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weekly' | 'list'>('weekly');
  const [user, setUser] = useState<any>(null);
  const [academicYear, setAcademicYear] = useState('2023-2024');
  const [semester, setSemester] = useState(1);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadSchedule(currentUser);
    }
  }, [academicYear, semester]);

  const loadSchedule = async (currentUser: any) => {
    try {
      setLoading(true);
      let data: any = [];
      
      // Phân quyền: admin xem tất cả, giảng viên xem lịch dạy, sinh viên xem lịch học
      if (currentUser.role === 'admin') {
        // Admin có thể xem tất cả hoặc chọn giảng viên/sinh viên cụ thể
        data = [];
      } else if (currentUser.role === 'instructor') {
        data = await instructorsApi.getSchedule(currentUser.id);
      } else if (currentUser.role === 'student') {
        data = await studentsApi.getMySchedule({ academicYear, semester });
      }
      
      setSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load schedule:', error);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const parseSchedule = (scheduleStr: string) => {
    if (!scheduleStr) return null;
    const parts = scheduleStr.split(',');
    if (parts.length < 2) return null;
    
    const day = parts[0].trim();
    const time = parts[1].trim();
    const [start, end] = time.split('-').map(t => t.trim());
    
    return { day, start, end };
  };

  const getPosition = (time: string) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    const startHour = 7;
    return ((hours - startHour) * 60 + minutes) / 12; // 12 hours * 60 minutes = 720 minutes
  };

  const getDurationHeight = (start: string, end: string) => {
    if (!start || !end) return 80;
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const duration = (eH - sH) * 60 + (eM - sM);
    return duration / 12;
  };

  const getCourseColor = (index: number) => {
    return COURSE_COLORS[index % COURSE_COLORS.length];
  };

  // Group schedule by day
  const groupedSchedule: { [key: string]: (Schedule & { colorIndex: number; parsed: any })[] } = {};
  DAYS.forEach(day => {
    groupedSchedule[day] = schedule
      .map((item, idx) => ({ ...item, colorIndex: idx, parsed: parseSchedule(item.schedule || '') }))
      .filter(item => item.parsed?.day === day);
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Thời khóa biểu</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {user?.role === 'student' && 'Lịch học của bạn'}
                {user?.role === 'instructor' && 'Lịch giảng dạy của bạn'}
                {user?.role === 'admin' && 'Quản lý thời khóa biểu'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          {/* Academic Year & Semester Filter */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <option value="2023-2024">Năm học 2023-2024</option>
            <option value="2024-2025">Năm học 2024-2025</option>
          </select>
          
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <option value={1}>Học kỳ 1</option>
            <option value={2}>Học kỳ 2</option>
            <option value={3}>Học kỳ hè</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer size={18} /> In lịch
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Download size={18} /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('weekly')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'weekly' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Theo tuần
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Danh sách
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'weekly' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-4 border-r border-gray-200 flex items-center justify-center">
              <Clock size={18} className="text-gray-400" />
            </div>
            {DAYS.map((day) => (
              <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{day}</span>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-8 relative" style={{ minHeight: '800px' }}>
            {/* Time Column */}
            <div className="border-r border-gray-200 bg-gray-50/50">
              {TIME_SLOTS.map((time, idx) => (
                <div 
                  key={time} 
                  className="h-16 border-b border-gray-100 p-2 text-xs font-semibold text-gray-400 flex items-center justify-center"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="relative border-r border-gray-200 last:border-r-0">
                {/* Background grid lines */}
                {TIME_SLOTS.map((_, idx) => (
                  <div key={idx} className="h-16 border-b border-gray-100"></div>
                ))}

                {/* Schedule Items */}
                <div className="absolute inset-0 p-1">
                  {groupedSchedule[day]?.map((item) => {
                    const top = getPosition(item.parsed.start);
                    const height = getDurationHeight(item.parsed.start, item.parsed.end);
                    const color = getCourseColor(item.colorIndex);
                    
                    return (
                      <div 
                        key={item.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg p-2 border-l-4 shadow-sm",
                          "hover:shadow-md transition-shadow cursor-pointer overflow-hidden",
                          color
                        )}
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          minHeight: '60px'
                        }}
                        title={`${item.courseName}\n${item.instructorName || ''}\n${item.room || ''}`}
                      >
                        <p className="text-xs font-bold truncate mb-1">
                          {item.courseCode}
                        </p>
                        <p className="text-xs font-semibold line-clamp-2 mb-1">
                          {item.courseName}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] opacity-75">
                          <MapPin size={10} />
                          <span className="truncate">{item.room || 'TBA'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-sm font-semibold text-gray-400">Không có lịch học nào được tìm thấy</p>
              <p className="text-xs text-gray-400 mt-1">Vui lòng chọn học kỳ khác</p>
            </div>
          ) : (
            schedule.map((item, idx) => {
              const color = getCourseColor(idx);
              return (
                <div 
                  key={item.id} 
                  className={cn(
                    "bg-white p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow",
                    "flex items-center justify-between gap-4",
                    color
                  )}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {item.courseCode?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-600">{item.courseCode}</span>
                        {item.credits && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-xs text-gray-500">{item.credits} tín chỉ</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 truncate mb-1">{item.courseName}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {item.instructorName || 'Chưa phân công'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {item.room || 'TBA'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {item.schedule || 'Chưa xếp lịch'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <BookOpen size={18} /> Tổng số môn học
          </h4>
          <p className="text-3xl font-bold">{schedule.length}</p>
          <p className="text-xs text-white/70 mt-1">Học kỳ {semester} - {academicYear}</p>
        </div>
        
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-2">Xuất thời khóa biểu</h4>
          <p className="text-xs text-gray-500 mb-3">Tải về dưới dạng PDF hoặc đồng bộ với Google Calendar</p>
          <button className="w-full py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-bold text-blue-600 transition-colors">
            Xuất ngay
          </button>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-2">Thông báo quan trọng</h4>
          <p className="text-xs text-gray-500 mb-3">Có thay đổi về lịch học? Kiểm tra thông báo mới nhất</p>
          <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-600 transition-colors">
            Xem thông báo
          </button>
        </div>
      </div>
    </div>
  );
}
