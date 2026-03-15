'use client';

import { useState, useEffect } from 'react';
import {
  Shield, Plus, CheckCircle, XCircle, AlertTriangle, Loader2, X,
  Search, User, Calendar, Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface DisciplinaryAction {
  id: string;
  studentCode: string;
  studentName: string;
  actionType: 'warning' | 'probation' | 'suspension' | 'expulsion';
  reason: string;
  actionDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  issuedByName?: string;
  notes?: string;
  createdAt: string;
}

const ACTION_CFG = {
  warning:    { label: 'Cảnh cáo',   color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
  probation:  { label: 'Thử thách',  color: 'bg-orange-100 text-orange-800', icon: '🔶' },
  suspension: { label: 'Đình chỉ',   color: 'bg-red-100 text-red-800',       icon: '🚫' },
  expulsion:  { label: 'Buộc thôi',  color: 'bg-gray-800 text-white',        icon: '❌' },
};

const STATUS_CFG = {
  active:    { label: 'Đang hiệu lực', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Hoàn thành',    color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',        color: 'bg-gray-100 text-gray-600' },
};

export default function DisciplinaryPage() {
  const [actions, setActions] = useState<DisciplinaryAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [form, setForm] = useState({
    studentId: '', actionType: 'warning', reason: '',
    actionDate: new Date().toISOString().split('T')[0],
    endDate: '', notes: ''
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/disciplinary');
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setActions(data);
    } catch { setError('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true); setError(null);
      const payload = {
        ...form,
        actionDate: form.actionDate,
        endDate: form.endDate || null,
      };
      await api.post('/disciplinary', payload);
      setSuccess('Đã tạo quyết định kỷ luật!');
      setShowModal(false);
      setTimeout(() => { load(); setSuccess(null); }, 1500);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.patch(`/disciplinary/${id}/complete`);
      setSuccess('Đã hoàn thành xử lý kỷ luật!');
      setTimeout(() => { load(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa quyết định kỷ luật này?')) return;
    try {
      await api.delete(`/disciplinary/${id}`);
      setSuccess('Đã xóa!');
      setTimeout(() => { load(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const filtered = actions
    .filter(a => filterType === 'all' || a.actionType === filterType)
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .filter(a => search === '' ||
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.studentCode.toLowerCase().includes(search.toLowerCase()));

  const activeCount = actions.filter(a => a.status === 'active').length;
  const warningCount = actions.filter(a => a.actionType === 'warning' && a.status === 'active').length;

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
            <Shield className="text-red-500" size={26} /> Kỷ luật sinh viên
          </h1>
          <p className="text-sm text-slate-400 mt-1">Theo dõi và quản lý các trường hợp vi phạm kỷ luật</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} /> Tạo quyết định
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng hồ sơ', value: actions.length, color: '#6b7280', icon: Shield },
          { label: 'Đang hiệu lực', value: activeCount, color: '#dc2626', icon: AlertTriangle },
          { label: 'Cảnh cáo', value: warningCount, color: '#d97706', icon: AlertTriangle },
          { label: 'Hoàn thành', value: actions.filter(a => a.status === 'completed').length, color: '#059669', icon: CheckCircle },
        ].map(c => (
          <div key={c.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}18` }}>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-navy">{c.value}</p>
              <p className="text-xs text-slate-400">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sinh viên..." className="input-base pl-8 py-2 text-sm" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-base py-2 text-sm">
          <option value="all">Tất cả loại</option>
          {Object.entries(ACTION_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base py-2 text-sm">
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Sinh viên', 'Loại kỷ luật', 'Lý do', 'Ngày', 'Hết hạn', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Shield size={36} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">Không có dữ liệu kỷ luật</p>
                  </td>
                </tr>
              ) : filtered.map(a => {
                const ac = ACTION_CFG[a.actionType] || ACTION_CFG.warning;
                const sc = STATUS_CFG[a.status] || STATUS_CFG.active;
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-xs">
                          {a.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-navy">{a.studentName}</p>
                          <p className="text-[11px] text-slate-400">{a.studentCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold w-fit ${ac.color}`}>
                        {ac.icon} {ac.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600 max-w-xs truncate">{a.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(a.actionDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.endDate ? (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock size={13} className="text-slate-400" />
                          {new Date(a.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${sc.color}`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-1.5">
                          {a.status === 'active' && (
                            <button onClick={() => handleComplete(a.id)}
                              className="px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-semibold">
                              Hoàn thành
                            </button>
                          )}
                          <button onClick={() => handleDelete(a.id)}
                            className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 font-semibold">
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-navy">Tạo quyết định kỷ luật</h2>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ID Sinh viên *</label>
                <input required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
                  placeholder="Nhập ID sinh viên (UUID)" className="input-base w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Loại kỷ luật *</label>
                  <select required value={form.actionType} onChange={e => setForm({ ...form, actionType: e.target.value })}
                    className="input-base w-full">
                    {Object.entries(ACTION_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ngày ra quyết định *</label>
                  <input type="date" required value={form.actionDate}
                    onChange={e => setForm({ ...form, actionDate: e.target.value })} className="input-base w-full" />
                </div>
              </div>
              {['suspension', 'probation'].includes(form.actionType) && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ngày kết thúc</label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-base w-full" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Lý do *</label>
                <textarea required rows={3} value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Mô tả vi phạm và lý do kỷ luật..." className="input-base w-full resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ghi chú</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="input-base w-full" />
              </div>

              {form.actionType === 'expulsion' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ <strong>Lưu ý:</strong> Buộc thôi học sẽ tự động đổi trạng thái sinh viên thành "Đã nghỉ học".
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Hủy</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  Tạo quyết định
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
