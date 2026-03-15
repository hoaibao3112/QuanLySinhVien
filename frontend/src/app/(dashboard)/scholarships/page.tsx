'use client';

import { useState, useEffect } from 'react';
import {
  Award, Plus, CheckCircle, XCircle, Clock, DollarSign,
  Users, Loader2, X, Search, Filter, ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Scholarship {
  id: string;
  code: string;
  name: string;
  description?: string;
  amount: number;
  type: string;
  requirements?: string;
  isActive: boolean;
}

interface StudentScholarship {
  id: string;
  studentCode: string;
  studentName: string;
  scholarshipName: string;
  academicYear: string;
  semester: number;
  amountReceived: number;
  awardedDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  notes?: string;
  createdAt: string;
}

const STATUS_CFG = {
  pending:   { label: 'Chờ duyệt',  color: 'bg-yellow-100 text-yellow-800' },
  approved:  { label: 'Đã duyệt',   color: 'bg-blue-100 text-blue-800' },
  rejected:  { label: 'Từ chối',    color: 'bg-red-100 text-red-800' },
  disbursed: { label: 'Đã giải ngân', color: 'bg-green-100 text-green-800' },
};

const TYPE_CFG: Record<string, string> = {
  academic:   '🎓 Học bổng học thuật',
  'need-based': '💛 Học bổng hỗ trợ',
  sponsor:    '🏢 Doanh nghiệp tài trợ',
  government: '🏛 Nhà nước',
  other:      '📦 Khác',
};

export default function ScholarshipsPage() {
  const [tab, setTab] = useState<'programs' | 'applications'>('programs');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<StudentScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState({
    code: '', name: '', description: '', amount: 0,
    type: 'academic', requirements: '', isActive: true
  });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [schRes, appRes] = await Promise.all([
        api.get<any>('/scholarships'),
        api.get<any>('/student-scholarships')
      ]);
      setScholarships(Array.isArray(schRes) ? schRes : (schRes?.data ?? []));
      const apps = Array.isArray(appRes) ? appRes : (appRes?.data ?? []);
      setApplications(apps);
    } catch { setError('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingScholarship(null);
    setForm({ code: '', name: '', description: '', amount: 0, type: 'academic', requirements: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (s: Scholarship) => {
    setEditingScholarship(s);
    setForm({ code: s.code, name: s.name, description: s.description || '', amount: s.amount, type: s.type, requirements: s.requirements || '', isActive: s.isActive });
    setShowModal(true);
  };

  const handleSubmitScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true); setError(null);
      if (editingScholarship) {
        await api.put(`/scholarships/${editingScholarship.id}`, form);
        setSuccess('Cập nhật học bổng thành công!');
      } else {
        await api.post('/scholarships', form);
        setSuccess('Tạo học bổng thành công!');
      }
      setShowModal(false);
      setTimeout(() => { loadAll(); setSuccess(null); }, 1500);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/student-scholarships/${id}/approve`);
      setSuccess('Đã phê duyệt học bổng!');
      setTimeout(() => { loadAll(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Từ chối đơn này?')) return;
    try {
      await api.patch(`/student-scholarships/${id}/reject`);
      setSuccess('Đã từ chối!');
      setTimeout(() => { loadAll(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const handleDisburse = async (id: string) => {
    if (!confirm('Xác nhận giải ngân học bổng này?')) return;
    try {
      await api.patch(`/student-scholarships/${id}/disburse`);
      setSuccess('Đã giải ngân thành công!');
      setTimeout(() => { loadAll(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const filteredApps = applications
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .filter(a => search === '' ||
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      a.scholarshipName.toLowerCase().includes(search.toLowerCase()));

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

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
            <Award className="text-blue-600" size={26} /> Quản lý học bổng
          </h1>
          <p className="text-sm text-slate-400 mt-1">Các chương trình học bổng và đơn xét duyệt</p>
        </div>
        {isAdmin && tab === 'programs' && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> Tạo học bổng
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
          { label: 'Chương trình', value: scholarships.filter(s => s.isActive).length, icon: Award, color: '#1d72e8' },
          { label: 'Chờ duyệt', value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: '#d97706' },
          { label: 'Đã giải ngân', value: applications.filter(a => a.status === 'disbursed').length, icon: CheckCircle, color: '#059669' },
          { label: 'Tổng giải ngân', value: fmt(applications.filter(a => a.status === 'disbursed').reduce((s, a) => s + a.amountReceived, 0)), icon: DollarSign, color: '#7c3aed' },
        ].map(c => (
          <div key={c.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}18` }}>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-navy">{c.value}</p>
              <p className="text-xs text-slate-400">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {(['programs', 'applications'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            {t === 'programs' ? '🏆 Chương trình' : '📋 Đơn xét duyệt'}
          </button>
        ))}
      </div>

      {/* Programs Tab */}
      {tab === 'programs' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {scholarships.map(s => (
            <div key={s.id} className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
              s.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.code}</span>
                  <h3 className="font-bold text-navy mt-1.5">{s.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{TYPE_CFG[s.type] || s.type}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {s.isActive ? 'Mở' : 'Đóng'}
                </span>
              </div>
              <div className="text-2xl font-black text-blue-600 mb-3">{fmt(s.amount)}</div>
              {s.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{s.description}</p>}
              {s.requirements && (
                <div className="p-2.5 bg-blue-50 rounded-lg text-xs text-blue-700 mb-3">
                  <span className="font-bold">Yêu cầu:</span> {s.requirements}
                </div>
              )}
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button onClick={() => openEdit(s)}
                    className="btn-secondary flex-1 justify-center py-1.5 text-xs">
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Applications Tab */}
      {tab === 'applications' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm sinh viên, học bổng..." className="input-base pl-8 py-2 text-sm" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="input-base py-2 text-sm">
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Sinh viên', 'Học bổng', 'Kỳ học', 'Số tiền', 'Trạng thái', 'Thao tác'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredApps.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">Không có đơn nào</td></tr>
                  ) : filteredApps.map(a => {
                    const sc = STATUS_CFG[a.status] || STATUS_CFG.pending;
                    return (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-sm text-navy">{a.studentName}</p>
                          <p className="text-xs text-slate-400">{a.studentCode}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{a.scholarshipName}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">HK{a.semester} {a.academicYear}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{fmt(a.amountReceived)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${sc.color}`}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          {isAdmin && (
                            <div className="flex gap-1.5">
                              {a.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApprove(a.id)}
                                    className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-semibold">
                                    Duyệt
                                  </button>
                                  <button onClick={() => handleReject(a.id)}
                                    className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 font-semibold">
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {a.status === 'approved' && (
                                <button onClick={() => handleDisburse(a.id)}
                                  className="px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-semibold">
                                  Giải ngân
                                </button>
                              )}
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
        </div>
      )}

      {/* Create/Edit Scholarship Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-navy">
                {editingScholarship ? 'Chỉnh sửa học bổng' : 'Tạo học bổng mới'}
              </h2>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmitScholarship} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mã *</label>
                  <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder="VD: HB001" className="input-base w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Loại</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="input-base w-full">
                    <option value="academic">Học thuật</option>
                    <option value="need-based">Hỗ trợ</option>
                    <option value="sponsor">Doanh nghiệp</option>
                    <option value="government">Nhà nước</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tên học bổng *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Giá trị (VNĐ) *</label>
                <input type="number" required min="0" value={form.amount}
                  onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                  className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Yêu cầu</label>
                <input value={form.requirements}
                  onChange={e => setForm({ ...form, requirements: e.target.value })}
                  placeholder="VD: GPA ≥ 3.2, không vi phạm kỷ luật" className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mô tả</label>
                <textarea rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-base w-full resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Đang hoạt động</label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Hủy</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
