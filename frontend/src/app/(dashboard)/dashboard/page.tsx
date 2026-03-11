'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { dashboardApi } from '@/lib/api';

interface DashboardData {
  totalStudents: number;
  totalInstructors: number;
  totalClasses: number;
  totalCourses: number;
  studentsTrend?: number;
  instructorsTrend?: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardApi.getOverview();
      setData(response);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back to the EduManage control panel."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 1240}
          trend={2.5}
          trendLabel="this month"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={data?.totalInstructors || 85}
          trend={-0.5}
          trendLabel="this month"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Total Classes"
          value={data?.totalClasses || 42}
          trend={0}
          trendLabel="from last week"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="purple"
        />
        <StatCard
          title="Total Subjects"
          value={data?.totalCourses || 120}
          trend={-6.4}
          trendLabel="new certificates"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Trends</h3>
              <p className="text-sm text-gray-500">Average daily attendance rate: 94%</p>
            </div>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {[85, 92, 88, 94, 91, 89, 95].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                  style={{ height: `${value}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tuition Fees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tuition Fees</h3>
              <p className="text-sm text-gray-500">Collected this month: $45,000</p>
            </div>
            <a href="/tuition" className="text-sm text-blue-600 hover:underline">
              View Report
            </a>
          </div>
          <div className="h-48">
            <svg viewBox="0 0 400 150" className="w-full h-full">
              <path
                d="M 0 100 Q 50 80 100 90 T 200 70 T 300 60 T 400 50"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
              <path
                d="M 0 100 Q 50 80 100 90 T 200 70 T 300 60 T 400 50 L 400 150 L 0 150 Z"
                fill="url(#gradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-gray-500">Week 1</p>
              <p className="text-sm font-semibold">$10,000</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Week 2</p>
              <p className="text-sm font-semibold">$12,500</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Week 3</p>
              <p className="text-sm font-semibold">$22,500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Announcements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Latest Announcements</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Post Announcement
          </button>
        </div>
        <div className="space-y-4">
          <AnnouncementItem
            icon="📅"
            title="Final Exam Schedule for Grade 12"
            description="The final examination schedule for the Spring semester has been finalized. Please check the department notice board or the student portal for individual schedules."
            time="7 hours ago"
          />
          <AnnouncementItem
            icon="⚽"
            title="Annual Sports Day 2024"
            description="Registrations for the Annual Sports Day events are now open. Interested students should contact their house captains before the end of the week."
            time="Yesterday"
          />
          <AnnouncementItem
            icon="ℹ️"
            title="New Teacher Orientation"
            description="We are welcoming 3 new teachers to the Science and Mathematics departments this week. Welcome to the EduManage team!"
            time="3 days ago"
          />
        </div>
        <div className="text-center mt-4">
          <button className="text-sm text-blue-600 hover:underline">
            View All Announcements
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  color,
}: {
  title: string;
  value: number;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">
        <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
          {trend >= 0 ? '+' : ''}
          {trend}%
        </span>{' '}
        {trendLabel}
      </p>
    </div>
  );
}

function AnnouncementItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
