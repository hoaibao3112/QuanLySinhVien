'use client';

import { useState, useEffect } from 'react';
import { predictionApi, classesApi, coursesApi } from '@/lib/api';
import {
  Brain, AlertTriangle, ShieldAlert, ShieldCheck, ShieldX,
  TrendingDown, TrendingUp, Users, BookOpen, Filter,
  ChevronDown, ChevronUp, Eye, X, BarChart2
} from 'lucide-react';

/* ── Types ── */
interface RiskFactor {
  factor: string;
  description: string;
  impact: string;
}

interface StudentRisk {
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  classId: string;
  className: string;
  attendanceRate: number;
  midtermScore: number | null;
  assignmentScore: number | null;
  finalScore: number | null;
  predictedFinalScore: number;
  riskScore: number;
  riskLevel: string;
  factors: RiskFactor[];
}

interface RiskSummary {
  totalStudents: number;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  criticalRisk: number;
  topAtRiskStudents: StudentRisk[];
}

/* ── Risk Level Helpers ── */
const riskConfig: Record<string, { label: string; color: string; bg: string; gradient: string; icon: any }> = {
  low:      { label: 'An toàn',         color: '#059669', bg: '#ecfdf5', gradient: 'linear-gradient(135deg, #059669, #10b981)', icon: ShieldCheck },
  medium:   { label: 'Cần theo dõi',    color: '#d97706', bg: '#fffbeb', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: AlertTriangle },
  high:     { label: 'Nguy cơ cao',      color: '#dc2626', bg: '#fef2f2', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)', icon: ShieldAlert },
  critical: { label: 'Rất nguy hiểm',   color: '#7c2d12', bg: '#fef2f2', gradient: 'linear-gradient(135deg, #991b1b, #dc2626)', icon: ShieldX },
};

/* ── Stat Card ── */
function RiskStatCard({ level, count, total }: { level: string; count: number; total: number }) {
  const cfg = riskConfig[level];
  const Icon = cfg.icon;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="rounded-2xl p-5 animate-fade-up" style={{ background: '#fff', border: '1.5px solid #e2eef8', boxShadow: '0 2px 10px rgba(29,114,232,0.05)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: cfg.gradient, boxShadow: `0 4px 14px ${cfg.color}40` }}>
          <Icon size={20} className="text-white" />
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ color: cfg.color, background: cfg.bg }}>
          {pct}%
        </span>
      </div>
      <div className="text-2xl font-bold text-navy mb-0.5">{count}</div>
      <div className="text-sm font-medium text-slate-400">{cfg.label}</div>
    </div>
  );
}

/* ── Risk Badge ── */
function RiskBadge({ level }: { level: string }) {
  const cfg = riskConfig[level] || riskConfig.low;
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

/* ── Risk Score Bar ── */
function RiskScoreBar({ score }: { score: number }) {
  const color = score >= 76 ? '#dc2626' : score >= 56 ? '#ea580c' : score >= 31 ? '#d97706' : '#059669';
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full" style={{ background: '#f1f5f9' }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color, minWidth: 32 }}>{score}</span>
    </div>
  );
}

/* ── Detail Modal ── */
function DetailModal({ student, onClose }: { student: StudentRisk; onClose: () => void }) {
  const cfg = riskConfig[student.riskLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-fade-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 rounded-t-2xl" style={{ background: cfg.gradient }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
              {student.studentName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{student.studentName}</h3>
              <div className="text-white/70 text-sm">{student.studentCode} · {student.className}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Course info */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen size={14} />
            <span className="font-semibold text-navy">{student.courseCode}</span>
            <span>–</span>
            <span>{student.courseName}</span>
          </div>

          {/* Score overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-xs text-slate-400 mb-1">Risk Score</div>
              <div className="text-2xl font-bold" style={{ color: cfg.color }}>{student.riskScore}</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-xs text-slate-400 mb-1">Điểm dự đoán</div>
              <div className="text-2xl font-bold text-navy">{student.predictedFinalScore}</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-xs text-slate-400 mb-1">Điểm danh</div>
              <div className="text-2xl font-bold text-blue-600">{student.attendanceRate}%</div>
            </div>
          </div>

          {/* Scores detail */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Bài tập', score: student.assignmentScore },
              { label: 'Giữa kỳ', score: student.midtermScore },
              { label: 'Cuối kỳ', score: student.finalScore },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <div className="text-xs text-blue-400 mb-1">{s.label}</div>
                <div className="text-lg font-bold text-navy">
                  {s.score !== null && s.score !== undefined ? `${s.score}/10` : '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Risk factors */}
          {student.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Yếu tố rủi ro
              </h4>
              <div className="space-y-2">
                {student.factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: f.impact === 'high' ? '#fef2f2' : '#fffbeb', border: `1px solid ${f.impact === 'high' ? '#fecaca' : '#fde68a'}` }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: f.impact === 'high' ? '#dc2626' : '#d97706' }} />
                    <div>
                      <div className="text-[13px] font-semibold text-navy">{f.description}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Mức ảnh hưởng: {f.impact === 'high' ? 'Cao' : 'Trung bình'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {student.factors.length === 0 && (
            <div className="text-center py-4 text-sm text-slate-400">
              <ShieldCheck size={24} className="mx-auto text-emerald-400 mb-2" />
              Sinh viên không có yếu tố rủi ro đáng lo ngại
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function PredictionsPage() {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [students, setStudents] = useState<StudentRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentRisk | null>(null);

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sortField, setSortField] = useState<'riskScore' | 'attendanceRate' | 'predictedFinalScore'>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Dropdown data
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      predictionApi.getSummary(),
      predictionApi.getStudents(),
      classesApi.getAll().then(r => r.data || r).catch(() => []),
      coursesApi.getAll().then(r => r.data || r).catch(() => []),
    ]).then(([sum, studs, cls, crs]) => {
      setSummary(sum);
      setStudents(Array.isArray(studs) ? studs : []);
      setClasses(Array.isArray(cls) ? cls : []);
      setCourses(Array.isArray(crs) ? crs : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    if (loading) return;
    const params: any = {};
    if (classFilter) params.classId = classFilter;
    if (courseFilter) params.courseId = courseFilter;
    predictionApi.getStudents(params).then(data => {
      setStudents(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, [classFilter, courseFilter]);

  // Filtered + sorted
  const filtered = students
    .filter(s => !levelFilter || s.riskLevel === levelFilter)
    .sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    sortField === field
      ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)
      : <ChevronDown size={12} className="opacity-30" />
  );

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="flex gap-1.5 items-end">
          {[0, 1, 2].map(i => (
            <div key={i} className="wave-bar w-2 rounded-full bg-blue-400" style={{ height: 24, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-[1280px] mx-auto">

      {/* Page title */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-navy" style={{ fontFamily: "'Playfair Display', serif" }}>
              Dự đoán kết quả học tập
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Phân tích rủi ro dựa trên điểm danh, điểm số và kỷ luật
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger">
          <RiskStatCard level="low" count={summary.lowRisk} total={summary.totalStudents} />
          <RiskStatCard level="medium" count={summary.mediumRisk} total={summary.totalStudents} />
          <RiskStatCard level="high" count={summary.highRisk} total={summary.totalStudents} />
          <RiskStatCard level="critical" count={summary.criticalRisk} total={summary.totalStudents} />
        </div>
      )}

      {/* Overview bar */}
      {summary && summary.totalStudents > 0 && (
        <div className="rounded-2xl p-6 animate-fade-up"
          style={{ background: 'linear-gradient(145deg, #0f2444 0%, #1d72e8 100%)', boxShadow: '0 8px 28px rgba(29,114,232,0.35)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-blue-200/80 uppercase tracking-wider">Phân bố rủi ro</h3>
              <div className="text-3xl font-bold text-white mt-1">{summary.totalStudents} <span className="text-lg font-normal text-blue-200/60">sinh viên</span></div>
            </div>
            <BarChart2 size={24} className="text-white/30" />
          </div>
          <div className="flex rounded-full overflow-hidden h-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {[
              { level: 'low', count: summary.lowRisk },
              { level: 'medium', count: summary.mediumRisk },
              { level: 'high', count: summary.highRisk },
              { level: 'critical', count: summary.criticalRisk },
            ].map(item => {
              const pct = (item.count / summary.totalStudents) * 100;
              return pct > 0 ? (
                <div key={item.level} style={{ width: `${pct}%`, background: riskConfig[item.level].color }}
                  className="h-full transition-all duration-700" title={`${riskConfig[item.level].label}: ${item.count}`} />
              ) : null;
            })}
          </div>
          <div className="flex gap-4 mt-3">
            {['low', 'medium', 'high', 'critical'].map(l => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: riskConfig[l].color }} />
                <span className="text-[11px] text-blue-200/60">{riskConfig[l].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 animate-fade-up">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Filter size={14} />
          <span className="font-medium">Bộ lọc:</span>
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border border-blue-100 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Tất cả lớp</option>
          {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border border-blue-100 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Tất cả môn</option>
          {courses.map((c: any) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </select>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border border-blue-100 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Tất cả mức độ</option>
          <option value="low">An toàn</option>
          <option value="medium">Cần theo dõi</option>
          <option value="high">Nguy cơ cao</option>
          <option value="critical">Rất nguy hiểm</option>
        </select>
      </div>

      {/* Students table */}
      <div className="rounded-2xl animate-fade-up overflow-hidden"
        style={{ background: '#fff', border: '1.5px solid #e2eef8', boxShadow: '0 2px 10px rgba(29,114,232,0.05)' }}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-blue-50">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            Danh sách sinh viên ({filtered.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-blue-50">
                <th className="px-6 py-3">Sinh viên</th>
                <th className="px-3 py-3">Môn học</th>
                <th className="px-3 py-3 cursor-pointer select-none hover:text-navy" onClick={() => toggleSort('attendanceRate')}>
                  <span className="flex items-center gap-1">Điểm danh <SortIcon field="attendanceRate" /></span>
                </th>
                <th className="px-3 py-3">Giữa kỳ</th>
                <th className="px-3 py-3 cursor-pointer select-none hover:text-navy" onClick={() => toggleSort('predictedFinalScore')}>
                  <span className="flex items-center gap-1">Dự đoán CK <SortIcon field="predictedFinalScore" /></span>
                </th>
                <th className="px-3 py-3 cursor-pointer select-none hover:text-navy" onClick={() => toggleSort('riskScore')}>
                  <span className="flex items-center gap-1">Risk Score <SortIcon field="riskScore" /></span>
                </th>
                <th className="px-3 py-3">Mức độ</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Brain size={32} className="mx-auto text-slate-300 mb-3" />
                    <div className="font-medium">Không có dữ liệu dự đoán</div>
                    <div className="text-xs mt-1">Cần có dữ liệu điểm số và điểm danh để phân tích</div>
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <tr key={`${s.studentId}-${s.courseId}`}
                  className="border-b border-blue-50/50 hover:bg-ocean-50/30 transition-colors group"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: riskConfig[s.riskLevel].gradient }}>
                        {s.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-navy text-[13px]">{s.studentName}</div>
                        <div className="text-[11px] text-slate-400">{s.studentCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="text-[13px] font-medium text-navy">{s.courseCode}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{s.courseName}</div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`text-[13px] font-bold ${s.attendanceRate >= 80 ? 'text-emerald-600' : s.attendanceRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {s.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="text-[13px] font-semibold text-navy">
                      {s.midtermScore !== null ? s.midtermScore : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`text-[13px] font-bold flex items-center gap-1 ${s.predictedFinalScore >= 5 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {s.predictedFinalScore >= 5 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {s.predictedFinalScore}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <RiskScoreBar score={s.riskScore} />
                  </td>
                  <td className="px-3 py-3.5">
                    <RiskBadge level={s.riskLevel} />
                  </td>
                  <td className="px-3 py-3.5">
                    <button onClick={() => setSelectedStudent(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selectedStudent && (
        <DetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
