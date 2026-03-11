'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Wallet, AlertCircle, CheckCircle2, Search, Filter, Printer, Download, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { tuitionApi } from '@/lib/api';
import { getUser } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TuitionPage() {
  const [activeTab, setActiveTab] = useState('');
  const [tuitionData, setTuitionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser && currentUser.id) {
      loadTuition(currentUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadTuition = async (studentId: string) => {
    try {
      setLoading(true);
      const data = await tuitionApi.getByStudent(studentId);
      setTuitionData(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setActiveTab(`${data[0].semester} ${data[0].academicYear}`);
      }
    } catch (error) {
      console.error('Failed to load tuition:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTuition = tuitionData.find(t => `${t.semester} ${t.academicYear}` === activeTab) || tuitionData[0];

  const summary = {
    total: tuitionData.reduce((acc, t) => acc + (t.amount || 0), 0),
    paid: tuitionData.reduce((acc, t) => acc + (t.paidAmount || 0), 0),
    remaining: tuitionData.reduce((acc, t) => acc + ((t.amount || 0) - (t.paidAmount || 0)), 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
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
      {/* Page header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Học phí sinh viên</h1>
          <p className="text-gray-500 mt-1">Thông tin chi tiết các khoản thu và lịch sử thanh toán</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer size={18} /> In biên lai
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
             Thanh toán ngay
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
             <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tổng học phí</span>
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
               <CreditCard size={20} strokeWidth={2.5}/>
             </div>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(summary.total)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
             <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Đã nộp</span>
             <div className="p-2 bg-green-50 text-green-600 rounded-xl">
               <CheckCircle2 size={20} strokeWidth={2.5}/>
             </div>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(summary.paid)}</p>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
             <div 
               className="bg-green-500 h-full rounded-full transition-all duration-1000" 
               style={{ width: summary.total > 0 ? `${(summary.paid/summary.total)*100}%` : '0%' }}
             />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm shadow-blue-50 bg-gradient-to-br from-white to-blue-50/30 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
             <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">Còn nợ</span>
             <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
               <AlertCircle size={20} strokeWidth={2.5}/>
             </div>
          </div>
          <p className="text-3xl font-black text-blue-600 tracking-tight">{formatCurrency(summary.remaining)}</p>
          <p className="text-xs font-bold text-blue-400 mt-2 uppercase tracking-widest">Cập nhật lúc: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex px-2 pt-2 border-b border-gray-50 bg-gray-50/30 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tuitionData.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(`${t.semester} ${t.academicYear}`)}
              className={cn(
                "px-8 py-4 text-sm font-bold transition-all relative",
                activeTab === `${t.semester} ${t.academicYear}`
                  ? "text-blue-600" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              HK{t.semester} {t.academicYear}
              {activeTab === `${t.semester} ${t.academicYear}` && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Fee Details Table */}
        <div className="p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Wallet size={20} className="text-blue-600" /> Chi tiết khoản thu
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Khoản thu</th>
                  <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Hạn chót</th>
                  <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {selectedTuition ? (
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 text-sm font-bold text-gray-700">Học phí HK{selectedTuition.semester} ({selectedTuition.academicYear})</td>
                    <td className="py-5 text-sm font-medium text-center">
                       <span className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                         selectedTuition.status === 'paid' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                       )}>
                         {selectedTuition.status === 'paid' ? 'Đã đóng' : 'Còn nợ'}
                       </span>
                    </td>
                    <td className="py-5 text-sm font-medium text-gray-500 text-right">{selectedTuition.dueDate ? new Date(selectedTuition.dueDate).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="py-5 text-sm font-black text-gray-900 text-right tracking-tight">{formatCurrency(selectedTuition.amount)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      Không có dữ liệu cho học kỳ này
                    </td>
                  </tr>
                )}
              </tbody>
              {selectedTuition && (
                <tfoot>
                  <tr className="bg-blue-50/30">
                    <td colSpan={3} className="py-6 pl-6 text-sm font-bold text-blue-600 uppercase tracking-widest">Còn nợ kỳ này:</td>
                    <td className="py-6 pr-6 text-xl font-black text-blue-600 text-right tracking-tighter">
                      {formatCurrency((selectedTuition.amount || 0) - (selectedTuition.paidAmount || 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      <footer className="py-10 text-center border-t border-gray-100">
         <p className="text-sm font-bold text-gray-300 tracking-widest uppercase">© 2024 Cổng thông tin đào tạo & Học phí</p>
         <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Hướng dẫn nộp học phí</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Quy định tài chính</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Hỗ trợ</a>
         </div>
      </footer>
    </div>
  );
}
