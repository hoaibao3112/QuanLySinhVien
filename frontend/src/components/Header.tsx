'use client';

import { getUser, logout } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Bell, Search, Settings, LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative max-w-md hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full px-4 py-2.5 pl-11 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">
                  {user?.fullName || user?.username || 'Đang tải...'}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                  {user?.studentCode ? `MSSV: ${user.studentCode}` : (user?.role || 'STUDENT')}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <UserIcon size={20} />
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tài khoản</p>
                </div>
                <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                   <UserIcon size={16} /> Thông tin cá nhân
                </a>
                <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                   <Settings size={16} /> Cài đặt hệ thống
                </a>
                <div className="h-px bg-gray-50 my-1 mx-2" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
