'use client';

import { useState, useEffect } from 'react';
import {
  Bell, Pin, Plus, Edit2, Trash2, X, Loader2,
  CheckCircle, XCircle, Megaphone, Calendar, Users, AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'academic' | 'event' | 'deadline' | 'urgent';
  targetGroup?: string;
  publishedByName?: string;
  publishedAt: string;
  expiresAt?: string;
  isPinned: boolean;
  attachments?: string;
}

const TYPE_CONFIG = {
  general:  { label: 'Chung',     color: 'bg-gray-100 text-gray-700',   icon: '📢' },
  academic: { label: 'Học vụ',   color: 'bg-blue-100 text-blue-700',   icon: '📚' },
  event:    { label: 'Sự kiện',  color: 'bg-purple-100 text-purple-700', icon: '🎉' },
  deadline: { label: 'Hạn chót', color: 'bg-orange-100 text-orange-700', icon: '⏰' },
  urgent:   { label: 'Khẩn cấp', color: 'bg-red-100 text-red-700',     icon: '🚨' },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [form, setForm] = useState({
    title: '', content: '', type: 'general',
    targetGroup: 'all', expiresAt: '', isPinned: false, attachments: ''
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/announcements/active');
      setAnnouncements(Array.isArray(res) ? res : (res?.data ?? []));
    } catch { setError('Không thể tải thông báo'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', type: 'general', targetGroup: 'all', expiresAt: '', isPinned: false, attachments: '' });
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({
      title: a.title, content: a.content, type: a.type,
      targetGroup: a.targetGroup || 'all',
      expiresAt: a.expiresAt ? a.expiresAt.split('T')[0] : '',
      isPinned: a.isPinned, attachments: a.attachments || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true); setError(null);
      const payload = { ...form, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null };
      if (editing) {
        await api.put(`/announcements/${editing.id}`, payload);
        setSuccess('Cập nhật thành công!');
      } else {
        await api.post('/announcements', payload);
        setSuccess('Tạo thông báo thành công!');
      }
      setShowModal(false);
      setTimeout(() => { load(); setSuccess(null); }, 1500);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa thông báo này?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setSuccess('Đã xóa!');
      setTimeout(() => { load(); setSuccess(null); }, 1200);
    } catch (err: any) { setError(err.message); }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await api.patch(`/announcements/${id}/pin`);
      load();
    } catch (err: any) { setError(err.message); }
  };

  const filtered = filterType === 'all'
    ? announcements
    : announcements.filter(a => a.type === filterType);

  const pinned = filtered.filter(a => a.isPinned);
  const regular = filtered.filter(a => !a.isPinned);

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Bell className="text-blue-600" size={26} /> Thông báo
          </h1>
          <p className="text-sm text-slate-400 mt-1">Cập nhật tin tức và thông báo từ nhà trường</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate}
            className="btn-primary">
            <Plus size={18} /> Tạo thông báo
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

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'Tất cả'], ...Object.entries(TYPE_CONFIG).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button key={key} onClick={() => setFilterType(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterType === key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {key === 'all' ? '🗂 ' : (TYPE_CONFIG[key as keyof typeof TYPE_CONFIG]?.icon + ' ')}{label}
          </button>
        ))}
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Pin size={12} /> Đã ghim
          </h2>
          {pinned.map(a => <AnnouncementCard key={a.id} a={a} isAdmin={isAdmin}
            onEdit={openEdit} onDelete={handleDelete} onPin={handleTogglePin} />)}
        </div>
      )}

      {/* Regular */}
      <div className="space-y-3">
        {pinned.length > 0 && (
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Thông báo mới nhất</h2>
        )}
        {regular.length === 0 && pinned.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-semibold">Chưa có thông báo nào</p>
          </div>
        ) : (
          regular.map(a => <AnnouncementCard key={a.id} a={a} isAdmin={isAdmin}
            onEdit={openEdit} onDelete={handleDelete} onPin={handleTogglePin} />)
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-navy">
                {editing ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
              </h2>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tiêu đề *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Nhập tiêu đề thông báo" className="input-base w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Loại</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="input-base w-full">
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Đối tượng</label>
                  <select value={form.targetGroup} onChange={e => setForm({ ...form, targetGroup: e.target.value })}
                    className="input-base w-full">
                    <option value="all">Tất cả</option>
                    <option value="department">Theo khoa</option>
                    <option value="class">Theo lớp</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nội dung *</label>
                <textarea required rows={4} value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Nội dung thông báo..." className="input-base w-full resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Hết hạn</label>
                <input type="date" value={form.expiresAt}
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="input-base w-full" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pin" checked={form.isPinned}
                  onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600" />
                <label htmlFor="pin" className="text-sm font-medium text-gray-700">📌 Ghim thông báo này</label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Hủy</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  {editing ? 'Cập nhật' : 'Đăng thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ a, isAdmin, onEdit, onDelete, onPin }: {
  a: Announcement;
  isAdmin: boolean;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.general;

  return (
    <div className={`bg-white rounded-2xl border transition-all hover:shadow-md ${
      a.isPinned ? 'border-blue-200 shadow-sm shadow-blue-50' : 'border-gray-100'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="text-2xl mt-0.5 flex-shrink-0">{cfg.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
                {a.isPinned && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold">
                    <Pin size={10} /> Đã ghim
                  </span>
                )}
              </div>
              <h3 className="font-bold text-navy text-[15px] mb-1">{a.title}</h3>
              <p className={`text-sm text-slate-500 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
                {a.content}
              </p>
              {a.content.length > 120 && (
                <button onClick={() => setExpanded(!expanded)}
                  className="text-xs font-bold text-blue-600 mt-1 hover:underline">
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
              <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {new Date(a.publishedAt).toLocaleDateString('vi-VN')}
                </span>
                {a.publishedByName && <span>• {a.publishedByName}</span>}
                {a.expiresAt && (
                  <span className="text-orange-500">
                    ⏰ Hết hạn {new Date(a.expiresAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onPin(a.id)} title={a.isPinned ? 'Bỏ ghim' : 'Ghim'}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Pin size={16} className={a.isPinned ? 'fill-blue-600 text-blue-600' : ''} />
              </button>
              <button onClick={() => onEdit(a)}
                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                <Edit2 size={16} />
              </button>
              <button onClick={() => onDelete(a.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
