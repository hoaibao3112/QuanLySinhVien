'use client';

import { useState, useEffect } from 'react';
import { gradesApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Award, BookOpen, TrendingUp, Star, Search, ChevronDown, ChevronUp } from 'lucide-react';

const GRADE_COLOR = (gpa: number) => {
   if (gpa >= 8.5) return { text: '#059669', bg: '#ecfdf5', label: 'Xuất sắc', badge: 'A+' };
   if (gpa >= 7.0) return { text: '#1d72e8', bg: '#eff8ff', label: 'Giỏi', badge: 'A' };
   if (gpa >= 5.5) return { text: '#d97706', bg: '#fffbeb', label: 'Khá', badge: 'B' };
   if (gpa >= 4.0) return { text: '#6b7280', bg: '#f9fafb', label: 'TB', badge: 'C' };
   return { text: '#dc2626', bg: '#fef2f2', label: 'Yếu', badge: 'F' };
};

function GradeRow({ g, idx }: { g: any; idx: number }) {
   const score = g.gpa ?? g.finalScore ?? 0;
   const cfg = GRADE_COLOR(score);

   return (
      <tr className="table-row-hover border-t border-blue-50 transition-colors"
         style={{ animationDelay: `${idx * 0.03}s` }}>
         <td className="px-5 py-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#3b96f3,#1d72e8)' }}>
                  {g.courseName?.charAt(0) || '?'}
               </div>
               <div>
                  <div className="text-[13.5px] font-semibold text-navy">{g.courseName || g.courseCode || '—'}</div>
                  <div className="text-[11px] text-slate-400">{g.courseCode || ''}</div>
               </div>
            </div>
         </td>
         <td className="px-5 py-4 text-center text-[13px] font-medium text-slate-600">
            {g.assignmentScore != null ? g.assignmentScore : '—'}
         </td>
         <td className="px-5 py-4 text-center text-[13px] font-medium text-slate-600">
            {g.midtermScore != null ? g.midtermScore : '—'}
         </td>
         <td className="px-5 py-4 text-center text-[13px] font-medium text-slate-600">
            {g.finalScore != null ? g.finalScore : '—'}
         </td>
         <td className="px-5 py-4 text-center">
            <span className="text-[15px] font-bold" style={{ color: cfg.text }}>
               {score.toFixed(1)}
            </span>
         </td>
         <td className="px-5 py-4 text-center">
            <span className="badge text-xs font-black px-3 py-1"
               style={{ background: cfg.bg, color: cfg.text }}>
               {g.letterGrade || cfg.badge}
            </span>
         </td>
      </tr>
   );
}

export default function GradesPage() {
   const [grades, setGrades] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState('');
   const [activeSem, setActiveSem] = useState('');
   const [sortField, setSortField] = useState<'gpa' | 'courseName' | null>(null);
   const [sortAsc, setSortAsc] = useState(true);

   useEffect(() => {
      gradesApi.getAll().then((d: any) => {
         const arr = Array.isArray(d) ? d : (d?.data ?? []);
         setGrades(arr);
         if (arr.length) setActiveSem(`${arr[0].semester}-${arr[0].academicYear}`);
      }).catch(console.error).finally(() => setLoading(false));
   }, []);

   const semesters = [...new Set(grades.map(g => `${g.semester}-${g.academicYear}`))];

   let filtered = grades.filter(g => `${g.semester}-${g.academicYear}` === activeSem);
   if (search) filtered = filtered.filter(g =>
      g.courseName?.toLowerCase().includes(search.toLowerCase()) ||
      g.courseCode?.toLowerCase().includes(search.toLowerCase())
   );
   if (sortField) {
      filtered = [...filtered].sort((a, b) => {
         const va = a[sortField] ?? 0; const vb = b[sortField] ?? 0;
         return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
   }

   const avg = filtered.length ? filtered.reduce((s, g) => s + (g.gpa ?? 0), 0) / filtered.length : 0;
   const pass = filtered.filter(g => (g.gpa ?? 0) >= 4).length;

   const sort = (f: 'gpa' | 'courseName') => {
      if (sortField === f) setSortAsc(v => !v); else { setSortField(f); setSortAsc(true); }
   };

   const SortIcon = ({ f }: { f: string }) => sortField === f
      ? (sortAsc ? <ChevronUp size={11} className="inline ml-0.5" /> : <ChevronDown size={11} className="inline ml-0.5" />)
      : null;

   if (loading) return (
      <div className="flex h-60 items-center justify-center">
         <div className="flex gap-1.5 items-end">
            {[0, 1, 2].map(i => <div key={i} className="wave-bar w-2 rounded-full bg-blue-400" style={{ height: 22, animationDelay: `${i * 0.15}s` }} />)}
         </div>
      </div>
   );

   return (
      <div className="space-y-6 max-w-[1000px] mx-auto">

         {/* Header */}
         <div className="animate-fade-up">
            <h1 className="text-[22px] font-bold text-navy" style={{ fontFamily: "'Playfair Display', serif" }}>
               Kết quả học tập
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Theo dõi điểm số các môn học từng học kỳ</p>
         </div>

         {/* Summary row */}
         <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 stagger">
            {[
               { label: 'Điểm TB học kỳ', value: avg.toFixed(2), icon: TrendingUp, color: '#1d72e8' },
               { label: 'Số môn', value: filtered.length, icon: BookOpen, color: '#7c3aed' },
               { label: 'Qua môn', value: `${pass}/${filtered.length}`, icon: Award, color: '#059669' },
               { label: 'Xếp loại', value: avg >= 8.5 ? 'XS' : avg >= 7 ? 'Giỏi' : avg >= 5.5 ? 'Khá' : 'TB', icon: Star, color: '#ea7c0f' },
            ].map(c => (
               <div key={c.label} className="flex items-center gap-4 p-4 rounded-2xl card-hover animate-fade-up"
                  style={{ background: '#fff', border: '1.5px solid #e2eef8' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${c.color}18` }}>
                     <c.icon size={18} style={{ color: c.color }} />
                  </div>
                  <div>
                     <div className="text-xl font-bold text-navy">{c.value}</div>
                     <div className="text-xs text-slate-400 font-medium">{c.label}</div>
                  </div>
               </div>
            ))}
         </div>

         {/* Semester tabs */}
         <div className="flex gap-2 flex-wrap animate-fade-up">
            {semesters.map(sem => {
               const [s, y] = sem.split('-');
               return (
                  <button key={sem} onClick={() => setActiveSem(sem)}
                     className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                     style={activeSem === sem
                        ? { background: 'linear-gradient(135deg,#3b96f3,#1d72e8)', color: '#fff', boxShadow: '0 4px 14px rgba(29,114,232,0.35)' }
                        : { background: '#fff', border: '1.5px solid #d1e3f5', color: '#4a6d8c' }}>
                     HK{s} — {y}
                  </button>
               );
            })}
         </div>

         {/* Table */}
         <div className="rounded-2xl overflow-hidden animate-fade-up"
            style={{ background: '#fff', border: '1.5px solid #e2eef8', boxShadow: '0 2px 12px rgba(29,114,232,0.06)' }}>

            <div className="flex items-center gap-3 px-5 py-4 border-b border-blue-50">
               <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Tìm môn học..."
                     className="input-base pl-8 py-2 text-sm" />
               </div>
               <span className="text-xs text-slate-400 font-medium ml-auto">{filtered.length} môn</span>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr style={{ background: '#f7fbff' }}>
                        <th className="px-5 py-3.5 text-left text-[10px] font-black text-blue-400/80 uppercase tracking-wider cursor-pointer" onClick={() => sort('courseName')}>
                           Môn học <SortIcon f="courseName" />
                        </th>
                        {['Chuyên cần', 'Giữa kỳ', 'Cuối kỳ'].map(h => (
                           <th key={h} className="px-5 py-3.5 text-center text-[10px] font-black text-blue-400/80 uppercase tracking-wider">{h}</th>
                        ))}
                        <th className="px-5 py-3.5 text-center text-[10px] font-black text-blue-400/80 uppercase tracking-wider cursor-pointer" onClick={() => sort('gpa')}>
                           GPA <SortIcon f="gpa" />
                        </th>
                        <th className="px-5 py-3.5 text-center text-[10px] font-black text-blue-400/80 uppercase tracking-wider">Xếp loại</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                              Chưa có dữ liệu điểm
                           </td>
                        </tr>
                     ) : filtered.map((g, i) => <GradeRow key={g.id} g={g} idx={i} />)}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}