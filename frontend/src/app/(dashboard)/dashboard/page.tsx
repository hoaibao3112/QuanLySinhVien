'use client';

import { useState, useEffect } from 'react';
import { dashboardApi, predictionApi } from '@/lib/api';
import {
  Users, GraduationCap, BookOpen, TrendingUp, DollarSign,
  AlertCircle, CheckCircle2, Clock, ArrowUpRight, BarChart2, Award
} from 'lucide-react';

/* ── Stat card ── */
function StatCard({
  label, value, icon: Icon, color, trend, sub
}: {
  label: string; value: string | number; icon: any;
  color: string; trend?: number; sub?: string;
}) {
  return (
    <div className="rounded-2xl p-5 card-hover animate-fade-up"
      style={{ background: '#fff', border: '1.5px solid #e2eef8', boxShadow: '0 2px 10px rgba(29,114,232,0.05)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: color, boxShadow: `0 4px 14px ${color}55` }}>
          <Icon size={20} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
            }`}>
            <TrendingUp size={11} className={trend < 0 ? 'rotate-180' : ''} />
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-navy mb-0.5">{value}</div>
      <div className="text-sm font-medium text-slate-400">{label}</div>
      {sub && <div className="text-[11px] text-slate-300 mt-0.5">{sub}</div>}
    </div>
  );
}

/* ── Announcement item ── */
function Announcement({ emoji, title, body, time }: {
  emoji: string; title: string; body: string; time: string;
}) {
  return (
    <div className="flex gap-4 py-4 border-b last:border-0 border-blue-50 group cursor-pointer hover:bg-ocean-50/30 -mx-4 px-4 rounded-xl transition-colors">
      <div className="text-2xl mt-0.5 flex-shrink-0">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h4 className="text-[13.5px] font-semibold text-navy truncate group-hover:text-blue-600 transition-colors">{title}</h4>
          <span className="text-[11px] text-slate-400 flex-shrink-0 flex items-center gap-1">
            <Clock size={10} /> {time}
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/* ── Weekly bar chart ── */
function AttendanceBar({ day, pct }: { day: string; pct: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div className="text-[11px] font-bold text-navy/60">{Math.round(pct)}%</div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 80, background: '#eff8ff' }}>
        <div className="w-full rounded-full transition-all duration-700"
          style={{
            height: `${pct}%`,
            marginTop: `${100 - pct}%`,
            background: pct >= 90 ? 'linear-gradient(180deg,#3b96f3,#1d72e8)' : 'linear-gradient(180deg,#93d1fb,#60b6f8)',
          }} />
      </div>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{day}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getOverview().catch(() => null),
      predictionApi.getSummary().catch(() => null),
    ]).then(([d, r]) => {
      setData(d);
      setRiskData(r);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Tổng sinh viên', value: (data?.totalStudents ?? 1240).toLocaleString(), icon: Users, color: '#1d72e8', trend: 2.5, sub: 'Đang theo học' },
    { label: 'Giảng viên', value: (data?.totalInstructors ?? 85).toLocaleString(), icon: GraduationCap, color: '#059669', trend: -0.5, sub: 'Đang dạy' },
    { label: 'Số lớp học', value: (data?.totalClasses ?? 42).toLocaleString(), icon: BookOpen, color: '#7c3aed', trend: 0, sub: 'Học kỳ này' },
    { label: 'Môn học', value: (data?.totalCourses ?? 120).toLocaleString(), icon: BarChart2, color: '#ea7c0f', trend: 3.2, sub: 'Đang mở' },
  ];

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="flex gap-1.5 items-end">
          {[0, 1, 2].map(i => (
            <div key={i} className="wave-bar w-2 rounded-full bg-blue-400"
              style={{ height: 24, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // Build at-risk list from real data or fallback
  const atRiskStudents = riskData?.topAtRiskStudents?.length > 0
    ? riskData.topAtRiskStudents.slice(0, 5).map((s: any) => ({
        name: s.studentName,
        issue: s.factors?.[0]?.description || `Risk: ${s.riskScore}`,
        pct: Math.round(s.riskScore),
        amber: s.riskLevel === 'high',
        red: s.riskLevel === 'critical',
      }))
    : [
        { name: 'Chưa có dữ liệu', issue: 'Cần có điểm số để phân tích', pct: 0, amber: true, red: false },
      ];

  const totalAtRisk = (riskData?.highRisk ?? 0) + (riskData?.criticalRisk ?? 0);

  return (
    <div className="space-y-7 max-w-[1280px] mx-auto">

      {/* Page title */}
      <div className="animate-fade-up">
        <h1 className="text-[22px] font-bold text-navy" style={{ fontFamily: "'Playfair Display', serif" }}>
          Tổng quan hệ thống
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Chào mừng trở lại · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Attendance bars */}
        <div className="lg:col-span-3 rounded-2xl p-6 animate-fade-up"
          style={{ background: '#fff', border: '1.5px solid #e2eef8', boxShadow: '0 2px 10px rgba(29,114,232,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-navy">Tỷ lệ điểm danh tuần này</h3>
              <p className="text-xs text-slate-400 mt-0.5">Trung bình: 92.4%</p>
            </div>
            <span className="badge badge-blue">Tuần này</span>
          </div>
          <div className="flex gap-3 items-end" style={{ height: 120 }}>
            {[
              ['T2', 85], ['T3', 92], ['T4', 88], ['T5', 94],
              ['T6', 91], ['T7', 89], ['CN', 95]
            ].map(([d, p]) => <AttendanceBar key={d as string} day={d as string} pct={p as number} />)}
          </div>
        </div>

        {/* Tuition summary */}
        <div className="lg:col-span-2 rounded-2xl p-6 flex flex-col justify-between animate-fade-up"
          style={{ background: 'linear-gradient(145deg, #0f2444 0%, #1d72e8 100%)', boxShadow: '0 8px 28px rgba(29,114,232,0.35)' }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-blue-200/80 uppercase tracking-wider">Học phí tháng này</div>
            <DollarSign size={18} className="text-white/40" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white mt-3">$45,000</div>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-300 text-xs font-semibold">
              <TrendingUp size={12} /> +12.4% so với tháng trước
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-blue-300/70 mb-1.5">
              <span>Đã thu</span><span>72%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="h-2 rounded-full" style={{ width: '72%', background: 'linear-gradient(90deg,#60b6f8,#93d1fb)' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { label: 'Đã thanh toán', val: '864', icon: CheckCircle2, green: true },
              { label: 'Còn nợ', val: '376', icon: AlertCircle, green: false },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <item.icon size={14} className={item.green ? 'text-emerald-300' : 'text-amber-300'} />
                <div className="text-white text-lg font-bold mt-1">{item.val}</div>
                <div className="text-blue-300/60 text-[10px] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Announcements */}
        <div className="lg:col-span-2 rounded-2xl p-6 animate-fade-up"
          style={{ background: '#fff', border: '1.5px solid #e2eef8' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-navy">Thông báo mới nhất</h3>
            <button className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Xem tất cả <ArrowUpRight size={12} />
            </button>
          </div>
          <Announcement emoji="📅" title="Lịch thi cuối kỳ Khối 12"
            body="Lịch thi kỳ mùa xuân đã được công bố. Sinh viên vui lòng kiểm tra trên cổng thông tin."
            time="7 giờ trước" />
          <Announcement emoji="⚽" title="Ngày hội thể thao thường niên 2024"
            body="Đăng ký tham gia các môn thi đấu tại Ngày hội thể thao. Liên hệ trưởng nhóm trước cuối tuần."
            time="Hôm qua" />
          <Announcement emoji="🎓" title="Chào đón giảng viên mới"
            body="Ba giảng viên mới gia nhập khoa Khoa học & Toán học. Chào mừng đến với EduManage!"
            time="3 ngày trước" />
        </div>

        {/* At-risk students - from prediction API */}
        <div className="rounded-2xl p-6 animate-fade-up"
          style={{ background: '#fff', border: '1.5px solid #e2eef8' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy">🤖 Cần chú ý (AI)</h3>
            <Award size={16} className="text-amber-400" />
          </div>
          <div className="space-y-3">
            {atRiskStudents.map((s: any) => (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ocean-50/50 transition-colors cursor-pointer"
                style={{ border: '1px solid #f0f7ff' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: s.red ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-navy truncate">{s.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{s.issue}</div>
                </div>
                <span className={`badge ${s.red ? 'badge-red' : 'badge-amber'}`}>
                  {s.pct > 0 ? `${s.pct}%` : '—'}
                </span>
              </div>
            ))}
          </div>
          <a href="/predictions"
            className="block w-full mt-4 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-ocean-50 transition-colors text-center"
            style={{ border: '1.5px dashed #bfe3fd' }}>
            Xem tất cả ({totalAtRisk > 0 ? totalAtRisk : '?'})
          </a>
        </div>
      </div>
    </div>
  );
}