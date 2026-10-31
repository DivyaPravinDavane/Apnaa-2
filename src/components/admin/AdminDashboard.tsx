'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  Users,
  CalendarCheck,
  Shield,
  BellRing,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowUpRight,
  UserPlus,
  Calendar,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export function AdminDashboard({ onNavigateTab }: AdminDashboardProps) {
  const {
    visitors,
    bookings,
    notices,
    events,
    auditLogs,
    resetDemoData,
    addToast
  } = useSociety();

  const [dateRange, setDateRange] = useState('October 2026');

  // Seed chart data
  const bookingActivityData = [
    { day: 'Mon', bookings: 14 },
    { day: 'Tue', bookings: 18 },
    { day: 'Wed', bookings: 12 },
    { day: 'Thu', bookings: 22 },
    { day: 'Fri', bookings: 28 },
    { day: 'Sat', bookings: 42 },
    { day: 'Sun', bookings: 48 },
  ];

  const amenityUsageData = [
    { name: 'Pool', value: 32, color: '#6B21A8' },
    { name: 'Gym', value: 24, color: '#9333EA' },
    { name: 'Clubhouse', value: 18, color: '#240B3B' },
    { name: 'Sports', value: 14, color: '#C084FC' },
    { name: 'Others', value: 12, color: '#7E22CE' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE2F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
              Admin Operations Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Live Overview
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
            Green Valley Residency Co-operative Housing Society • Operations Console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 bg-white border border-[#EAE2F2] px-3 py-1.5 rounded-xl">
            {dateRange}
          </span>
          <button
            onClick={() => addToast('Refreshed', 'Operations metrics re-indexed with live state.', 'info')}
            className="p-2 rounded-xl border border-[#EAE2F2] bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Metrics (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Residents</span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#6B21A8]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">248</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% active households</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Expected Visitors</span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#6B21A8]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            {visitors.filter((v) => v.status === 'expected' || v.status === 'approved').length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all 4 gates today</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-3">
            {visitors.filter((v) => v.status === 'pending').length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Awaiting resident confirmation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today&apos;s Bookings</span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#6B21A8]">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            {bookings.filter((b) => b.status === 'confirmed').length}
          </p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <span>Slots active across 12 facilities</span>
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekly Amenity Bookings Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#EAE2F2] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Amenity Booking Activity</h3>
              <p className="text-xs text-slate-500">Daily reservation counts over the last 7 days</p>
            </div>
            <span className="text-xs font-semibold text-[#6B21A8] bg-purple-50 px-2.5 py-1 rounded-full">
              Peak: Weekends
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F8F6FC' }}
                  contentStyle={{
                    backgroundColor: '#240B3B',
                    color: '#FFF',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="bookings" fill="#6B21A8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Amenity Usage Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#E4EBE7] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Amenity Utilization</h3>
              <p className="text-xs text-slate-500">Distribution by facility category</p>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={amenityUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {amenityUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            {amenityUsageData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Operational Activity & Admin Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity Log (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-[#EAE2F2] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Society Activity</h3>
              <p className="text-xs text-slate-500">Real-time audit log of approvals, bookings, and alerts</p>
            </div>
            <button
              onClick={() => onNavigateTab('admin_audit')}
              className="text-xs font-semibold text-[#6B21A8] hover:underline"
            >
              View Full Audit Trail
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#6B21A8] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{log.action}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      By <strong>{log.actor}</strong> • {log.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operational Shortcuts (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-[#EAE2F2] shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Admin Actions</h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('admin_residents')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-[#6B21A8]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Manage Residents & Units</p>
                  <p className="text-[11px] text-slate-500">Onboard or edit tenant access</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('admin_notices')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Broadcast Notice</p>
                  <p className="text-[11px] text-slate-500">Publish urgent maintenance or circular</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('admin_events')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Create Community Event</p>
                  <p className="text-[11px] text-slate-500">Setup celebration or workshop</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('admin_gallery')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Moderate Media Queue</p>
                  <p className="text-[11px] text-slate-500">Approve resident photo submissions</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
