'use client';

import { getUser, logout } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Bell, Search, LogOut, User as UserIcon, ChevronDown, Settings } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setUser(getUser());
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('#user-menu')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-8 py-3.5 flex items-center gap-5"
      style={{
        background: 'rgba(247,250,253,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(209,227,245,0.7)',
      }}>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400/70 pointer-events-none" />
        <input
          type="text"
          placeholder="Tìm kiếm nhanh..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base pl-9 pr-4 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <button className="relative p-2.5 rounded-xl transition-all hover:bg-ocean-50"
          style={{ border: '1.5px solid #d1e3f5', color: '#4a6d8c' }}>
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"
            style={{ boxShadow: '0 0 0 2px white' }} />
        </button>

        {/* User menu */}
        <div className="relative" id="user-menu">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
            style={{
              background: showDropdown ? '#eff8ff' : '#fff',
              border: '1.5px solid #d1e3f5',
            }}
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #3b96f3, #1d72e8)' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[13px] font-semibold text-navy leading-none">
                {user?.fullName || user?.username || '...'}
              </div>
              <div className="text-[10px] text-blue-400 font-medium mt-0.5 capitalize">
                {user?.role || 'student'}
              </div>
            </div>
            <ChevronDown size={14} className={`text-blue-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 py-1.5 rounded-2xl overflow-hidden animate-fade-in"
              style={{
                background: '#fff',
                border: '1.5px solid #d1e3f5',
                boxShadow: '0 16px 48px rgba(29,114,232,0.14), 0 2px 8px rgba(0,0,0,0.06)',
              }}>
              {/* User info */}
              <div className="px-4 py-3 mb-1" style={{ background: 'linear-gradient(135deg, #eff8ff, #dbeffe)' }}>
                <div className="font-bold text-navy text-[13px]">{user?.fullName || user?.username}</div>
                <div className="text-blue-500 text-[11px] mt-0.5">{user?.email}</div>
              </div>

              <a href="/students/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-ocean-50 hover:text-ocean-700 transition-colors">
                <UserIcon size={14} /> Hồ sơ cá nhân
              </a>
              <a href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-ocean-50 hover:text-ocean-700 transition-colors">
                <Settings size={14} /> Cài đặt
              </a>

              <div className="my-1.5 mx-3 h-px bg-blue-100" />

              <button onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}