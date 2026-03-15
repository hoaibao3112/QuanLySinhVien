'use client';

import { useState, useEffect } from 'react';
import {
  Star, Plus, CheckCircle, XCircle, Loader2, X,
  BookOpen, BarChart2, MessageSquare, TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Evaluation {
  id: string;
  studentCode: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  instructorName?: string;
  className: string;
  academicYear: string;
  semester: number;
  contentRating?: number;
  teachingRating?: number;
  materialRating?: number;
  overallRating?: number;
  comments?: string;
  isAnonymous: boolean;
  createdAt: string;
}

function StarRating({ value, onChange, label }: {
  value: number; onChange?: (v: number) => void; label: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button"
            onClick={() => onChange?.(i)}
            onMouseEnter={() => onChange && setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110">
            <span style={{ color: i <= (hover || value) ? '#f59e0b' : '#d1d5db' }}>★</span>
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-slate-500 self-center">
          {value > 0 ? `${value}/5` : ''}
        </span>
      </div>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / 5) * 100}%`, background: value >= 4 ? '#059669' : value >= 3 ? '#d97706' : '#dc2626' }} />
      </div>
      <span className="text-sm font-bold text-navy w-8">{value.toFixed(1)}</span>
    </div>
  );
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'list' | 'stats'>('list');
  const [stats, setStats] = useState<any>(null);

  const user = getUser();

  const [form, setForm] = useState({
    studentId: user?.role === 'student' ? user.id : '',
    courseId: '', classId: '',
    instructorId: '', academicYear: '2023-2024', semester: 1,
    contentRating: 0, teachingRating: 0, materialRating: 0, overallRating: 0,
    comments: '', isAnonymous: true
  });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [evRes, stRes] = await Promise.all([
        api.get<any>('/evaluations'),
        api.get<any>('/evaluations/statistics'),
      ]);
      setEvaluations(Array.isArray(evRes) ? evRes : (evRes?.data ?? []));
      setStats(stRes);
    } catch { setError('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.overallRating === 0) { setError('Vui lòng chọn đánh giá tổng thể'); return; }
    try {
      setSubmitting(true); setError(null);
      await api.post('/evaluations', form);
      setSuccess('Đã gửi đánh giá thành công!');
      setShowModal(false);
      setTimeout(() => { loadAll(); setSuccess(null); }, 1500);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      await api.delete(`/evaluations/${id}`);
      setSuccess('Đã xóa!');
      setTimeout(() => { loadAll(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const avgOverall = evaluations.length
    ? evaluations.reduce((s, e) => s + (e.overallRating || 0), 0) / evaluations.length
    : 0;

  const avgContent  = evaluations.length ? evaluations.reduce((s, e) => s + (e.contentRating || 0), 0) / evaluations.length : 0;
  const avgTeaching = evaluations.length ? evaluations.reduce((s, e) => s + (e.teachingRating || 0), 0) / evaluations.length : 0;
  const avgMaterial = evaluations.length ? evaluations.reduce((s, e) => s + (e.materialRating || 0), 0) / evaluations.length : 0;

  const renderStars = (v: number) => (
    <span className="text-amber-400">{'★'.repeat(Math.round(v))}{'☆'.repeat(5 - Math.round(v))}</span>
  );

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Star className="text-amber-500" size={26} /> Đánh giá môn học
          </h1>
          <p className="text-sm text-slate-400 mt-1">Phản hồi và đánh giá chất lượng giảng dạy</p>
        </div>
        {user?.role === 'student' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} /> Đánh giá môn học
          </button>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <XCircle size={16} /> {error}
        </div>
      )}

      {/* Overview card */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm font-semibold mb-1">Điểm đánh giá trung bình</p>
            <div className="text-5xl font-black">{avgOverall.toFixed(1)}</div>
            <div className="text-amber-200 text-xl mt-1">{'★'.repeat(Math.round(avgOverall))}{'☆'.repeat(5 - Math.round(avgOverall))}</div>
            <p className="text-amber-100 text-sm mt-2">{evaluations.length} đánh giá</p>
          </div>
          <div className="space-y-3 flex-1 max-w-xs ml-8">
            {[
              { label: 'Nội dung', value: avgContent },
              { label: 'Giảng dạy', value: avgTeaching },
              { label: 'Tài liệu', value: avgMaterial },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-amber-100 text-sm w-20">{c.label}</span>
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${(c.value / 5) * 100}%` }} />
                </div>
                <span className="text-white text-sm font-bold w-6">{c.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {(['list', 'stats'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            {t === 'list' ? '📋 Danh sách' : '📊 Thống kê'}
          </button>
        ))}
      </div>

      {/* List tab */}
      {tab === 'list' && (
        <div className="space-y-3">
          {evaluations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <Star size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-semibold">Chưa có đánh giá nào</p>
            </div>
          ) : evaluations.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{e.courseCode}</span>
                    {e.isAnonymous && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Ẩn danh</span>
                    )}
                    <span className="text-xs text-slate-400">HK{e.semester} {e.academicYear}</span>
                  </div>
                  <h3 className="font-bold text-navy">{e.courseName}</h3>
                  {e.instructorName && <p className="text-sm text-slate-500">👨‍🏫 {e.instructorName}</p>}
                  {!e.isAnonymous && <p className="text-xs text-slate-400 mt-0.5">🎓 {e.studentName} ({e.studentCode})</p>}

                  <div className="flex gap-4 mt-3 flex-wrap">
                    {[
                      { label: 'Nội dung', v: e.contentRating },
                      { label: 'Giảng dạy', v: e.teachingRating },
                      { label: 'Tài liệu', v: e.materialRating },
                      { label: 'Tổng thể', v: e.overallRating },
                    ].map(r => r.v != null && (
                      <div key={r.label} className="text-center">
                        <div className="text-[10px] text-slate-400 font-bold">{r.label}</div>
                        <div className="text-sm font-black text-amber-500">{renderStars(r.v)}</div>
                      </div>
                    ))}
                  </div>

                  {e.comments && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-slate-600 italic">"{e.comments}"</p>
                    </div>
                  )}
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(e.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
              <BarChart2 size={18} className="text-blue-600" /> Phân bố đánh giá
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(star => {
                const count = evaluations.filter(e => Math.round(e.overallRating || 0) === star).length;
                const pct = evaluations.length ? (count / evaluations.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-amber-400 w-12">{'★'.repeat(star)}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Điểm trung bình
            </h3>
            <div className="space-y-4">
              <RatingBar label="Nội dung" value={avgContent} />
              <RatingBar label="Giảng dạy" value={avgTeaching} />
              <RatingBar label="Tài liệu" value={avgMaterial} />
              <RatingBar label="Tổng thể" value={avgOverall} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:col-span-2">
            <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" /> Nhận xét gần đây
            </h3>
            <div className="space-y-3">
              {evaluations.filter(e => e.comments).slice(0, 5).map(e => (
                <div key={e.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-600">{e.courseName}</span>
                    <span className="text-amber-400 text-sm">{'★'.repeat(e.overallRating || 0)}</span>
                  </div>
                  <p className="text-sm text-slate-600">"{e.comments}"</p>
                  <p className="text-xs text-slate-400 mt-1">{e.isAnonymous ? 'Ẩn danh' : e.studentName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-navy">Đánh giá môn học</h2>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {user?.role !== 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ID Sinh viên *</label>
                    <input required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="input-base w-full" placeholder="UUID" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ID Môn học *</label>
                  <input required value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} className="input-base w-full" placeholder="UUID" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ID Lớp *</label>
                  <input required value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} className="input-base w-full" placeholder="UUID" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kỳ học</label>
                  <select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} className="input-base w-full">
                    <option value={1}>Kỳ 1</option><option value={2}>Kỳ 2</option><option value={3}>Kỳ 3</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <StarRating label="Nội dung môn học" value={form.contentRating} onChange={v => setForm({ ...form, contentRating: v })} />
                <StarRating label="Phương pháp giảng dạy" value={form.teachingRating} onChange={v => setForm({ ...form, teachingRating: v })} />
                <StarRating label="Tài liệu học tập" value={form.materialRating} onChange={v => setForm({ ...form, materialRating: v })} />
                <StarRating label="Đánh giá tổng thể *" value={form.overallRating} onChange={v => setForm({ ...form, overallRating: v })} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nhận xét</label>
                <textarea rows={3} value={form.comments}
                  onChange={e => setForm({ ...form, comments: e.target.value })}
                  placeholder="Chia sẻ ý kiến của bạn về môn học..." className="input-base w-full resize-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="anon" checked={form.isAnonymous}
                  onChange={e => setForm({ ...form, isAnonymous: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600" />
                <label htmlFor="anon" className="text-sm font-medium text-gray-700">🕵️ Ẩn danh (mặc định)</label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Hủy</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Star size={16} />}
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
