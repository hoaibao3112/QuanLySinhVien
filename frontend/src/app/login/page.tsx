'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setAuthToken, setUser } from '@/lib/auth';
import { Eye, EyeOff, Waves, ArrowRight, Lock, User, Key, AlertCircle, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuthToken(res.token);
      setUser({
        id: (res as any).id || '',
        username: res.username,
        email: res.email,
        role: res.role,
        fullName: (res as any).fullName,
        studentCode: (res as any).studentCode,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = () => {
    setForm({ username: 'admin', password: 'password123' });
    setTimeout(() => {
      handleSubmit({ preventDefault: () => { } } as any);
    }, 80);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel — ocean illustration */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f2444 0%, #1d72e8 60%, #3b96f3 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #60b6f8 0%, transparent 70%)' }} />

        {/* Wave lines */}
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 600 200" preserveAspectRatio="none">
          <path d="M0,100 C150,160 300,40 450,100 C540,130 570,70 600,80 L600,200 L0,200Z"
            fill="white" />
          <path d="M0,140 C120,100 280,180 450,130 C540,110 570,120 600,110 L600,200 L0,200Z"
            fill="white" opacity="0.5" />
        </svg>

        <div className="relative z-10 px-12 pt-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Waves size={22} className="text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-wide">EduManage</span>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-16">
          <div className="space-y-5">
            <div className="text-white/50 text-sm font-semibold uppercase tracking-widest">
              Hệ thống quản lý sinh viên
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Chào mừng <br />trở lại
            </h1>
            <p className="text-blue-200/80 text-base leading-relaxed max-w-sm">
              Quản lý toàn diện thông tin sinh viên, học phí, điểm danh và kết quả học tập trong một nền tảng.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-10">
            {[['1,240+', 'Sinh viên'], ['85+', 'Giảng viên'], ['120+', 'Môn học']].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold text-white">{n}</div>
                <div className="text-blue-200/60 text-xs font-medium mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b96f3, #1d72e8)' }}>
              <Waves size={20} className="text-white" />
            </div>
            <span className="text-navy text-xl font-bold">EduManage</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Đăng nhập
            </h2>
            <p className="text-slate-500 text-sm">Nhập thông tin để truy cập hệ thống</p>
          </div>

          {/* Hint box */}
          <div className="mb-6 px-4 py-3 rounded-xl flex items-start gap-3"
            style={{ background: '#eff8ff', border: '1px solid #bfe3fd' }}>
            <Key size={18} className="text-blue-500 mt-0.5" />
            <div className="text-xs text-blue-700">
              <span className="font-bold">Tài khoản mặc định: </span>
              username: <code className="font-mono bg-blue-100 px-1 rounded">admin</code>{' '}
              / pass: <code className="font-mono bg-blue-100 px-1 rounded">password123</code>
            </div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-700 animate-fade-in"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  className="input-base pl-9"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-base pl-9 pr-10"
                  required
                />
                <button type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Quên mật khẩu?</a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>Đăng nhập <ArrowRight size={16} /></>
              )}
            </button>

            <button type="button" onClick={quickLogin} disabled={loading}
              className="btn-secondary w-full justify-center">
              <Zap size={16} className="fill-amber-400 text-amber-400" /> Đăng nhập nhanh (Admin)
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            © 2024 EduManage Inc. · Tất cả quyền được bảo lưu
          </p>
        </div>
      </div>
    </div>
  );
}