'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CreditCard, User, LogOut, Settings, Calendar } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: any;
  label: string;
  isActive?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, isActive }: SidebarItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
    <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Trang chủ',
    },
    {
      href: '/grades',
      icon: BookOpen,
      label: 'Học tập',
    },
    {
      href: '/schedule',
      icon: Calendar,
      label: 'Lịch học',
    },
    {
      href: '/tuition',
      icon: CreditCard,
      label: 'Học phí',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Cá nhân',
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">SV Portal</h1>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Education Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-50 space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Cài đặt</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          onClick={() => {/* handle logout */}}
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
