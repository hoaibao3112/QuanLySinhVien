'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Plus, CheckCircle, XCircle, Clock, Loader2, X,
  Search, Calendar, AlertCircle, User
} from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface LeaveRequest {
  id: string;
  studentCode: string;
  studentName: string;
  requestType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedByName?: string;
  approvedDate?: string;
  documents?: string;
  notes?: string;
  createdAt: string;
}

const TYPE_CFG: Record<string, { label: string; icon: string; color: string }> = {
  sick_leave:      { label: 'Nghỉ bệnh',    icon: '🏥', color: 'bg-red-50 text-red-700' },
  personal_leave:  { label: 'Việc riêng',   icon: '👤', color: 'bg-blue-50 text-blue-700' },
  academic_leave:  { label: 'Bảo lưu',      icon: '📚', color: 'bg-purple-50 text-purple-700' },
  maternity_leave: { label: 'Thai sản',     icon: '👶', color: 'bg-pink-50 text-pink-700' },
};

const STATUS_CFG = {
  pending:   { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved:  { label: 'Đã duyệt',  color: 'bg-green-100 text-green-800',   icon: CheckCircle },
  rejected:  { label: 'Từ chối',   color: 'bg-red-100 text-red-800',       icon: XCircle },
  cancelled: { label: 'Đã hủy',    color: 'bg-gray-100 text-gray-600',     icon: XCircle },
};

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [viewPending, setViewPending] = useState(false);

  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [form, setForm] = useState({
    studentId: user?.role === 'student' ? user.id : '', requestType: 'sick_leave',
    startDate: '', endDate: '', reason: '', documents: '', notes: ''
  });

  useEffect(() => { load(); }, [viewPending]);

  const load = async () => {
    try {
      setLoading(true);
      const endpoint = viewPending ? '/leave-requests/pending' : '/leave-requests';
      const res = await api.get<any>(endpoint);
      setRequests(Array.isArray(res) ? res : (res?.data ?? []));
    } catch { setError('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true); setError(null);
      await api.post('/leave-requests', form);
      setSuccess('Đã gửi đơn xin nghỉ thành công!');
      setShowModal(false);
      setTimeout(() => { load(); setSuccess(null); }, 1500);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/leave-requests/${id}/approve`);
      setSuccess('Đã phê duyệt đơn nghỉ!');
      setTimeout(() => { load(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Từ chối đơn này?')) return;
    try {
      await api.patch(`/leave-requests/${id}/reject`);
      setSuccess('Đã từ chối!');
      setTimeout(() => { load(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const getDuration = (start: string, end: string) => {
    const s = new Date(start); const e = new Date(end);
    const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ngày`;
  };

  const filtered = requests
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => search === '' ||
      r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      r.studentCode?.toLowerCase().includes(search.toLowerCase()));

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
            <FileText className="text-blue-600" size={26} /> Đơn xin nghỉ
          </h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý đơn xin nghỉ học của sinh viên</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => setViewPending(!viewPending)}
              className={`btn-secondary text-sm ${viewPending ? 'bg-orange-50 text-orange-600 border-orange-200' : ''}`}>
              <Clock size={16} />
              {viewPending ? 'Tất cả' : 'Chờ duyệt'}
              {!viewPending && requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-1 w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          )}
          {user?.role === 'student' && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={18} /> Tạo đơn
            </button>
          )}
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CFG).map(([k, v]) => (
          <div key={k} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-navy">{requests.filter(r => r.status === k).length}</p>
              <v.icon size={18} className={k === 'approved' ? 'text-green-500' : k === 'pending' ? 'text-yellow-500' : 'text-gray-400'} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{v.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sinh viên..." className="input-base pl-8 py-2 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base py-2 text-sm">
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">Không có đơn nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const sc = STATUS_CFG[r.status] || STATUS_CFG.pending;
            const tc = TYPE_CFG[r.requestType] || TYPE_CFG.personal_leave;
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                      {r.studentName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${tc.color}`}>
                          {tc.icon} {tc.label}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-navy mb-0.5">{r.studentName}</h3>
                      <p className="text-xs text-slate-400 mb-2">{r.studentCode}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(r.startDate).toLocaleDateString('vi-VN')} → {new Date(r.endDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-blue-600 font-semibold text-xs">
                          ({getDuration(r.startDate, r.endDate)})
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{r.reason}</p>
                      {r.approvedByName && (
                        <p className="text-xs text-slate-400 mt-1">
                          ✓ Xử lý bởi: {r.approvedByName} {r.approvedDate && `(${new Date(r.approvedDate).toLocaleDateString('vi-VN')})`}
                        </p>
                      )}
                    </div>
                  </div>
                  {isAdmin && r.status === 'pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => handleApprove(r.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-semibold">
                        <CheckCircle size={14} /> Duyệt
                      </button>
                      <button onClick={() => handleReject(r.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 font-semibold">
                        <XCircle size={14} /> Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-navy">Tạo đơn xin nghỉ</h2>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {user?.role !== 'student' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ID Sinh viên *</label>
                  <input required value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    placeholder="UUID của sinh viên" className="input-base w-full" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Loại đơn *</label>
                <select required value={form.requestType}
                  onChange={e => setForm({ ...form, requestType: e.target.value })} className="input-base w-full">
                  {Object.entries(TYPE_CFG).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Từ ngày *</label>
                  <input type="date" required value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-base w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Đến ngày *</label>
                  <input type="date" required value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-base w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Lý do *</label>
                <textarea required rows={3} value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Mô tả lý do xin nghỉ..." className="input-base w-full resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tài liệu đính kèm</label>
                <input value={form.documents} onChange={e => setForm({ ...form, documents: e.target.value })}
                  placeholder="URL tài liệu, giấy tờ..." className="input-base w-full" />
                {form.requestType === 'sick_leave' && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ Nghỉ bệnh &gt; 3 ngày cần đính kèm giấy của bác sĩ</p>
                )}
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Hủy</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  Gửi đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
