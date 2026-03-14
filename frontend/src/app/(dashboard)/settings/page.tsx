'use client';

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Shield, Bell, 
  Save, Key, UserCircle, Globe, Camera,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { studentsApi, authApi } from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      const data = await studentsApi.getMyProfile();
      if (data) {
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await studentsApi.updateMyProfile(profile);
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      await authApi.changePassword({
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      } as any);
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Mật khẩu hiện tại không đúng.' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ];

  if (initialLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cài đặt tài khoản</h1>
        <p className="text-slate-500 text-sm">Quản lý thông tin cá nhân và thiết lập bảo mật của bạn</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMessage(null);
                }}
                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all border-l-4 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-blue-600'
                    : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {message && (
              <div className={`p-4 flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <div className="p-8">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-all overflow-hidden">
                        <User size={32} />
                      </div>
                      <button type="button" className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Ảnh đại diện</h3>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG tối đa 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</label>
                      <input 
                        type="text" 
                        value={profile.fullName}
                        onChange={e => setProfile({...profile, fullName: e.target.value})}
                        className="input-base w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={e => setProfile({...profile, email: e.target.value})}
                        className="input-base w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                      <input 
                        type="tel" 
                        value={profile.phone}
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                        className="input-base w-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày sinh</label>
                      <input 
                        type="date" 
                        value={profile.dateOfBirth}
                        onChange={e => setProfile({...profile, dateOfBirth: e.target.value})}
                        className="input-base w-full"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ</label>
                       <textarea 
                         rows={2}
                         value={profile.address}
                         onChange={e => setProfile({...profile, address: e.target.value})}
                         className="input-base w-full resize-none"
                       />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="password" 
                        value={passwordData.oldPassword}
                        onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        className="input-base w-full pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="input-base w-full"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu</label>
                      <input 
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="input-base w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <span className="font-bold flex items-center gap-1 mb-1"><AlertCircle size={14}/> Lưu ý quan trọng:</span>
                      Mật khẩu nên chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt để đảm bảo an toàn cho tài khoản của bạn.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield size={18} />}
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { title: 'Email thông báo', desc: 'Nhận tin tức và cập nhật qua email', checked: true },
                      { title: 'Thông báo lịch học', desc: 'Nhắc nhở trước khi buổi học bắt đầu 30 phút', checked: true },
                      { title: 'Thông báo kết quả', desc: 'Khi giáo viên công bố điểm môn học mới', checked: false },
                      { title: 'Tin nhắn hệ thống', desc: 'Nhận thông báo từ phòng đào tạo và quản lý lớp', checked: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-all group">
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
