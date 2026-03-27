'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, BookOpen, CreditCard, LogOut, Settings, Calendar,
  Users, GraduationCap, Building2, Library, ClipboardList,
  FileSpreadsheet, DollarSign, UserCheck, ChevronRight, Waves,
  Bell, Award, ShieldAlert, FileText, Star, Brain
} from 'lucide-react';
import { getUser, logout } from '@/lib/auth';

interface NavItem {
  href: string;
  icon: any;
  label: string;
  badge?: string | number;
}

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-ocean-100 text-ocean-700'
          }`}>
          {item.badge}
        </span>
      )}
      {isActive && <ChevronRight size={14} className="opacity-70" />}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const user = getUser();
    setUserRole(user?.role || 'student');
    setUserName(user?.fullName || user?.username || 'User');
    setUserEmail(user?.email || '');
  }, []);

  const adminMenuItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/students', icon: Users, label: 'Sinh viên' },
    { href: '/instructors', icon: GraduationCap, label: 'Giảng viên' },
    { href: '/classes', icon: Building2, label: 'Lớp học' },
    { href: '/courses', icon: Library, label: 'Môn học' },
    { href: '/departments', icon: Building2, label: 'Khoa / Bộ môn' },
    { href: '/admin/registrations', icon: ClipboardList, label: 'Đợt đăng ký' },
    { href: '/attendance', icon: UserCheck, label: 'Điểm danh' },
    { href: '/grades', icon: FileSpreadsheet, label: 'Bảng điểm' },
    { href: '/tuition', icon: DollarSign, label: 'Học phí' },
    { href: '/announcements', icon: Bell, label: 'Thông báo' },
    { href: '/scholarships', icon: Award, label: 'Học bổng' },
    { href: '/disciplinary', icon: ShieldAlert, label: 'Kỷ luật' },
    { href: '/leave-requests', icon: FileText, label: 'Đơn xin nghỉ' },
    { href: '/evaluations', icon: Star, label: 'Đánh giá MH' },
    { href: '/predictions', icon: Brain, label: 'Dự đoán học tập' },
  ];

  const studentMenuItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Trang chủ' },
    { href: '/students/profile', icon: Users, label: 'Hồ sơ cá nhân' },
    { href: '/grades', icon: BookOpen, label: 'Kết quả học tập' },
    { href: '/schedule', icon: Calendar, label: 'Thời khóa biểu' },
    { href: '/registrations', icon: ClipboardList, label: 'Đăng ký môn học' },
    { href: '/exams', icon: FileSpreadsheet, label: 'Lịch thi' },
    { href: '/tuition', icon: CreditCard, label: 'Học phí' },
    { href: '/announcements', icon: Bell, label: 'Thông báo' },
    { href: '/scholarships', icon: Award, label: 'Học bổng' },
    { href: '/leave-requests', icon: FileText, label: 'Đơn xin nghỉ' },
    { href: '/evaluations', icon: Star, label: 'Đánh giá MH' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : studentMenuItems;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const roleLabel = userRole === 'admin' ? 'Quản trị viên' : 'Sinh viên';

  return (
    <aside className="w-[268px] flex-shrink-0 h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0f2444 0%, #1a3a60 55%, #0f2444 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b96f3, #1d72e8)', boxShadow: '0 4px 14px rgba(59,150,243,0.45)' }}>
            <Waves size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-[15px] leading-none tracking-wide">
              EduManage
            </div>
            <div className="text-[10px] text-blue-300/70 font-medium mt-1 uppercase tracking-[0.12em]">
              Portal
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <div className="text-[9px] font-black text-blue-400/50 uppercase tracking-[0.18em] px-3 mb-3">
          {userRole === 'admin' ? 'Quản lý' : 'Học tập'}
        </div>
        {menuItems.map(item => (
          <SidebarLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10 space-y-1">
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-300/70 hover:text-white hover:bg-white/08 transition-all text-[13px] font-medium"
        >
          <Settings size={16} />
          Cài đặt
        </Link>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b96f3, #1d72e8)' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[13px] font-semibold truncate">{userName}</div>
            <div className="text-blue-300/60 text-[10px] font-medium">{roleLabel}</div>
          </div>
          <button onClick={logout}
            className="p-1.5 rounded-lg text-blue-300/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Đăng xuất">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}