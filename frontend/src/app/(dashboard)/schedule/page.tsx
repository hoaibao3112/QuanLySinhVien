'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, RefreshCw, Filter, Printer, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { studentsApi } from '@/lib/api';
import { getUser } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function SchedulePage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly'); // weekly or list
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser && currentUser.id) {
      loadSchedule(currentUser.id);
    }
  }, []);

  const loadSchedule = async (studentId: string) => {
    try {
      setLoading(true);
      const data = await studentsApi.getSchedule(studentId);
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseSchedule = (scheduleStr: string) => {
    // Expected format: "Thứ 2, 07:30-09:30" or similar
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
    return ((hours - startHour) * 60 + minutes) * (100 / 600); // 600 minutes total (7am to 5pm)
  };

  const getDurationHeight = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const duration = (eH - sH) * 60 + (eM - sM);
    return duration * (100 / 600);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thời khóa biểu</h1>
          <p className="text-gray-500 mt-1">Lịch học chi tiết theo tuần của sinh viên</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer size={18} /> In lịch
          </button>
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
               onClick={() => setActiveTab('weekly')}
               className={cn(
                 "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                 activeTab === 'weekly' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
               Theo tuần
             </button>
             <button 
               onClick={() => setActiveTab('list')}
               className={cn(
                 "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                 activeTab === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
               Danh sách
             </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {activeTab === 'weekly' ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="grid grid-cols-8 border-b border-gray-50">
             <div className="p-4 bg-gray-50/50 border-r border-gray-50 flex items-center justify-center">
                <Clock size={16} className="text-gray-400" />
             </div>
             {DAYS.map((day) => (
                <div key={day} className="p-4 text-center border-r border-gray-50 last:border-r-0">
                   <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{day}</span>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-8 relative bg-[linear-gradient(to_bottom,transparent_0px,transparent_49px,#f9fafb_50px)] bg-[length:100%_50px]">
             {/* Time column */}
             <div className="flex flex-col">
                {TIME_SLOTS.map((time) => (
                   <div key={time} className="h-[100px] border-r border-gray-50 p-2 text-[10px] font-bold text-gray-300 text-center">
                      {time}
                   </div>
                ))}
             </div>

             {/* Days grid */}
             {DAYS.map((day) => (
                <div key={day} className="relative h-[1100px] border-r border-gray-50 last:border-r-0 group">
                   {registrations
                     .map(reg => ({ ...reg, parsed: parseSchedule(reg.schedule) }))
                     .filter(reg => reg.parsed && reg.parsed.day === day)
                     .map((reg, idx) => {
                        const top = getPosition(reg.parsed.start) * 10; // Scaling for 1100px height
                        const height = getDurationHeight(reg.parsed.start, reg.parsed.end) * 10;
                        
                        return (
                          <div 
                            key={reg.id}
                            className="absolute left-1 right-1 rounded-2xl p-3 shadow-lg shadow-blue-100/20 border-l-4 border-blue-600 bg-blue-50/80 backdrop-blur-sm group-hover:z-10 transition-all hover:scale-[1.02] cursor-pointer"
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                             <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-1 truncate">
                                {reg.courseCode}
                             </p>
                             <p className="text-xs font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                                {reg.courseName}
                             </p>
                             <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                   <MapPin size={10} className="text-blue-400" /> {reg.room || '—'}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                   <User size={10} className="text-blue-400" /> {reg.instructorName || '—'}
                                </span>
                             </div>
                          </div>
                        );
                     })}
                </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
           {registrations.map((reg) => (
              <div key={reg.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
                       {reg.courseName?.charAt(0)}
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{reg.courseCode}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{reg.className}</span>
                       </div>
                       <h3 className="text-lg font-bold text-gray-900">{reg.courseName}</h3>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-12 text-right">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Thời gian</p>
                       <p className="text-sm font-bold text-gray-700">{reg.schedule || '—'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phòng học</p>
                       <p className="text-sm font-bold text-gray-700">{reg.room || 'TBA'}</p>
                    </div>
                    <div className="w-10 h-10 border border-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                       <ChevronRight size={20} />
                    </div>
                 </div>
              </div>
           ))}
           
           {registrations.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                 <CalendarIcon size={48} className="mx-auto text-gray-200 mb-4" />
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Không có lịch học nào được tìm thấy</p>
              </div>
           )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-200">
            <h4 className="font-bold mb-2 flex items-center gap-2">
               <Download size={18} /> Xuất PDF
            </h4>
            <p className="text-xs text-white/70 mb-4">Tải thời khóa biểu học kỳ hiện tại dưới dạng file PDF để xem ngoại tuyến.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20">
               Tải ngay
            </button>
         </div>
         
         <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
               <Filter size={18} className="text-blue-600" /> Đồng bộ lịch
            </h4>
            <p className="text-xs text-gray-400 mb-4">Tự động thêm lịch học vào Google Calendar hoặc Outlook của bạn.</p>
            <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all">
               Thiết lập đồng bộ
            </button>
         </div>

         <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-red-500">
               <Filter size={18} /> Báo vắng mặt
            </h4>
            <p className="text-xs text-gray-400 mb-4">Bạn không thể tham gia buổi học? Hãy báo vắng mặt trực tiếp tại đây.</p>
            <button className="w-full py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 transition-all">
               Tạo đơn nghỉ học
            </button>
         </div>
      </div>

      <footer className="py-10 text-center border-t border-gray-100">
         <p className="text-sm font-bold text-gray-300 tracking-widest uppercase">© 2024 Cổng thông tin đào tạo & Thời khóa biểu</p>
      </footer>
    </div>
  );
}
