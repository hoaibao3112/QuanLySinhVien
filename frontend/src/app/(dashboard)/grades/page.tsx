'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Award, TrendingUp, Calendar, Search, Filter, ArrowUpRight, RefreshCw, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { gradesApi } from '@/lib/api';
import { getUser } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadGrades();
    }
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      // In a real scenario, we'd have a specific endpoint for student's own grades
      // For now, we fetch all and filter or use the general API
      const data = await gradesApi.getAll();
      setGrades(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length > 0) {
        setActiveSemester(`${data[0].semester} ${data[0].academicYear}`);
      }
    } catch (error) {
      console.error('Failed to load grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = (gradeList: any[]) => {
    if (gradeList.length === 0) return 0;
    const sum = gradeList.reduce((acc, g) => acc + (g.finalScore || 0), 0);
    return (sum / gradeList.length / 10 * 4).toFixed(2); // Convert to 4.0 scale
  };

  const semesters = Array.from(new Set(grades.map(g => `${g.semester} ${g.academicYear}`)));
  const currentSemesterGrades = grades.filter(g => `${g.semester} ${g.academicYear}` === activeSemester);
  
  const gpa = calculateGPA(currentSemesterGrades);
  const totalCredits = currentSemesterGrades.length * 3; // Placeholder if credits not in DTO

  const getGradeColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 bg-green-50';
    if (score >= 7.0) return 'text-blue-600 bg-blue-50';
    if (score >= 5.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeText = (score: number) => {
    if (score >= 8.5) return 'A';
    if (score >= 7.0) return 'B';
    if (score >= 5.5) return 'C';
    if (score >= 4.0) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Kết quả học tập</h1>
          <p className="text-gray-500 mt-1">Theo dõi tiến độ và điểm số các học phần</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Calendar size={18} /> Lịch thi
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
             Bảng điểm chính thức
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                 <TrendingUp size={24} />
              </div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">GPA Học kỳ</span>
           </div>
           <p className="text-3xl font-black text-gray-900">{gpa}</p>
           <p className="text-[10px] font-bold text-green-500 mt-1 uppercase tracking-tighter">↑ 0.2 so với kỳ trước</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                 <BookOpen size={24} />
              </div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tín chỉ tích lũy</span>
           </div>
           <p className="text-3xl font-black text-gray-900">{totalCredits}</p>
           <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Mục tiêu: 120 tín chỉ</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                 <Award size={24} />
              </div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Học bổng dự kiến</span>
           </div>
           <p className="text-3xl font-black text-gray-900">Loại Giỏi</p>
           <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-tighter cursor-pointer hover:underline">Chi tiết tiêu chuẩn →</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-200 text-white relative overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 opacity-80">
                 <Award size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Xếp hạng lớp</span>
              </div>
              <p className="text-3xl font-black">05 / 45</p>
              <p className="text-[10px] font-bold mt-1 uppercase tracking-tighter opacity-80">Top 12% sinh viên xuất sắc</p>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-10">
              <Award size={120} />
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Semester Tabs */}
        <div className="flex px-4 pt-2 border-b border-gray-50 bg-gray-50/30 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setActiveSemester(sem)}
              className={cn(
                "px-8 py-5 text-sm font-bold transition-all relative whitespace-nowrap",
                activeSemester === sem
                  ? "text-blue-600" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              Học kỳ {sem}
              {activeSemester === sem && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Grades Table */}
        <div className="p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <TrendingUp size={20} className="text-blue-600" /> Bảng điểm chi tiết
              </h3>
              <div className="flex gap-2">
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Tìm môn học..." 
                      className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                 </div>
                 <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                    <Filter size={18} />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-gray-100">
                       <th className="pb-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Môn học</th>
                       <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Chuyên cần</th>
                       <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Giữa kỳ</th>
                       <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Cuối kỳ</th>
                       <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng kết</th>
                       <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Hệ chữ</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {currentSemesterGrades.map((g, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                          <td className="py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                   {g.courseName?.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-gray-900">{g.courseName}</p>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">3 Tín chỉ</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-5 text-center text-sm font-medium text-gray-500">{g.attendanceScore || '—'}</td>
                          <td className="py-5 text-center text-sm font-medium text-gray-500">{g.midtermScore || '—'}</td>
                          <td className="py-5 text-center text-sm font-medium text-gray-500">{g.finalScore || '—'}</td>
                          <td className="py-5 text-right font-black text-gray-900 tracking-tight">
                             {(g.totalScore || 0).toFixed(1)}
                          </td>
                          <td className="py-5 text-right">
                             <span className={cn(
                               "px-3 py-1 rounded-lg text-[10px] font-black tracking-widest",
                               getGradeColor(g.totalScore || 0)
                             )}>
                                {getGradeText(g.totalScore || 0)}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {currentSemesterGrades.length === 0 && (
              <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                 Chưa có dữ liệu điểm học kỳ này
              </div>
           )}
        </div>
      </div>

      {/* Improvement suggestions */}
      <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100/50 flex flex-col md:flex-row items-center gap-8">
         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
            <TrendingUp size={32} />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-gray-900">Phân tích kết quả học tập</h4>
            <p className="text-sm text-gray-500 mt-1">Điểm số môn <b>Cơ sở dữ liệu</b> của bạn đang thấp hơn trung bình lớp. Hãy tham gia lớp bổ trợ kiến thức vào thứ 7 tuần này.</p>
         </div>
         <button className="px-6 py-3 bg-white text-blue-600 border border-blue-100 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            Đăng ký ngay <ArrowUpRight size={18} />
         </button>
      </div>

      <footer className="py-10 text-center border-t border-gray-100">
         <p className="text-sm font-bold text-gray-300 tracking-widest uppercase">© 2024 Cổng thông tin đào tạo & Kết quả học tập</p>
      </footer>
    </div>
  );
}
