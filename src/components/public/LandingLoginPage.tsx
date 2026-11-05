'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { UserRole } from '@/types';
import {
  User,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  Shield,
  UserCheck,
  Home,
  QrCode,
  CalendarCheck,
  BellRing,
  Car,
  FileText,
  X,
  Smartphone,
  KeyRound,
  Clock,
  Users,
} from 'lucide-react';
import Image from 'next/image';

interface LandingLoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

export function LandingLoginPage({ onLoginSuccess }: LandingLoginPageProps) {
  const {
    loginWithPassword,
    requestOtp,
    verifyOtp,
    addToast,
    society,
    amenities,
    publicOverview,
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'access' | 'amenities' | 'features'>('access');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleQuickDemoLogin = (role: UserRole) => {
    onLoginSuccess(role);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await loginWithPassword(loginValue, password);
    setBusy(false);
    if (!result.success) {
      setError(result.message || 'Unable to sign in.');
      return;
    }
    setLoginOpen(false);
    setPassword('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await requestOtp(mobile);
    setBusy(false);
    if (!result.success) {
      setError(result.message || 'Unable to send the code.');
      return;
    }
    setOtpSent(true);
    setDevOtp(result.devOtp);
    addToast('Code Sent', result.message || 'Enter the 6-digit code to continue.', 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await verifyOtp(mobile, otp);
    setBusy(false);
    if (!result.success) {
      setError(result.message || 'Invalid or expired code.');
      return;
    }
    setLoginOpen(false);
    setOtp('');
    setOtpSent(false);
  };

  return (
    <div className="min-h-full bg-[#F4F9F9] text-[#0E2628] flex flex-col justify-between pb-24">
      {/* 1. MOBILE APP TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#F4F9F9]/95 backdrop-blur-md border-b border-[#D5EAEB] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="17" fill="#0D5C63" />
            <path d="M18 7C18 7 10 11.5 10 19C10 23 13.5 26 18 26C22.5 26 26 23 26 19C26 11.5 18 7 18 7Z" fill="#E6F3F3"/>
            <path d="M18 10V25" stroke="#0D5C63" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18 15.5C15 14 12.5 15.5 12.5 15.5" stroke="#0D5C63" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M18 19.5C21 18 23.5 19.5 23.5 19.5" stroke="#0D5C63" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div>
            <span className="font-bold text-sm text-[#0E2628] tracking-tight leading-tight block">
              Smart Society
            </span>
            <span className="text-[10px] text-[#4E6E70] font-medium block">
              {society.name}
            </span>
          </div>
        </div>

        <button
          onClick={() => setLoginOpen(true)}
          className="px-3.5 py-1.5 rounded-full bg-purple-100 text-[#0D5C63] hover:bg-purple-200 text-xs font-bold transition-all active:scale-95"
        >
          Sign In
        </button>
      </header>

      {/* 2. MOBILE SCROLLABLE BODY */}
      <div className="px-4 pt-3 space-y-4 flex-1">
        {/* Hero Campus Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#D5EAEB] bg-[#073B3E] text-white">
          <div className="relative h-44 w-full">
            <Image
              src="/images/smart_society_campus_isometric.jpg"
              alt="Green Valley Residency 3D Campus"
              fill
              className="object-cover"
              priority
              sizes="430px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#052B2E] via-[#052B2E]/45 to-transparent" />

            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#073B3E] flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{society.name}</span>
            </div>

            <div className="absolute bottom-3 left-3.5 right-3.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/30 backdrop-blur-xs text-[10px] font-semibold text-purple-100 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Smart Residential Super-App</span>
              </div>
              <h1 className="font-serif text-xl font-bold leading-snug text-white">
                A Smarter Way to Live Together
              </h1>
              <p className="text-[11px] text-purple-100/90 mt-0.5 leading-snug">
                Instant gate QR passes, conflict-free amenity slots, and live community updates.
              </p>
            </div>
          </div>

          {/* Compact 4-Stat Strip */}
          <div className="grid grid-cols-4 divide-x divide-purple-800/60 bg-[#073B3E] py-2.5 text-center">
            <div>
              <p className="text-sm font-bold text-white">{society.totalHouseholds}+</p>
              <p className="text-[9px] text-purple-300 uppercase">Families</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{amenities.length}</p>
              <p className="text-[9px] text-purple-300 uppercase">Amenities</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{publicOverview?.stats.upcomingEvents ?? 4}</p>
              <p className="text-[9px] text-purple-300 uppercase">Events</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">24/7</p>
              <p className="text-[9px] text-purple-300 uppercase">Gate Guard</p>
            </div>
          </div>
        </div>

        {/* 4 Quick Feature Pills */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab('features')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 text-[#0D5C63] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Visitor Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('amenities')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 text-[#0D5C63] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Amenities</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 text-[#0D5C63] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Events</span>
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 text-[#0D5C63] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Gate Desk</span>
          </button>
        </div>

        {/* Mobile Segmented Tab Bar */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-purple-100/70 border border-purple-200/70 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'access'
                ? 'bg-[#0D5C63] text-white shadow-xs'
                : 'text-[#4E6E70] hover:text-[#0E2628]'
            }`}
          >
            1-Tap Roles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('amenities')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'amenities'
                ? 'bg-[#0D5C63] text-white shadow-xs'
                : 'text-[#4E6E70] hover:text-[#0E2628]'
            }`}
          >
            Amenities ({amenities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'features'
                ? 'bg-[#0D5C63] text-white shadow-xs'
                : 'text-[#4E6E70] hover:text-[#0E2628]'
            }`}
          >
            Features
          </button>
        </div>

        {/* TAB 1: 1-TAP ROLE ACCESS */}
        {activeTab === 'access' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-[#0E2628]">Tap any persona to launch app</p>
              <span className="text-[10px] font-semibold text-[#0D5C63]">No OTP required</span>
            </div>

            {/* Resident Persona Card */}
            <div
              onClick={() => handleQuickDemoLogin('resident')}
              className="p-3.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] shadow-2xs active:scale-[0.99] transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#0D5C63] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E2628] truncate">
                    {publicOverview?.personas.resident.name || 'Priya Sharma'}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#0D5C63]">
                    Resident
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#0D5C63]">
                  Flat {publicOverview?.personas.resident.unit || 'A-1204'} • {publicOverview?.stats.confirmedBookings ?? 2} Bookings • {publicOverview?.stats.expectedVisitors ?? 2} Guests
                </p>
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Book amenities, invite guests & view notices
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D5C63] flex-shrink-0" />
            </div>

            {/* Admin Persona Card */}
            <div
              onClick={() => handleQuickDemoLogin('admin')}
              className="p-3.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] shadow-2xs active:scale-[0.99] transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#073B3E] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E2628] truncate">
                    {publicOverview?.personas.admin.name || 'Rajesh Nair'}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#073B3E]">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#073B3E]">
                  Flat {publicOverview?.personas.admin.unit || 'C-402'} • {publicOverview?.stats.activeResidents ?? society.activeResidents} Active Units • {publicOverview?.stats.pendingMedia ?? 2} Pending Media
                </p>
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Manage residents, notices, moderation & audits
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#073B3E] flex-shrink-0" />
            </div>

            {/* Security Persona Card */}
            <div
              onClick={() => handleQuickDemoLogin('security')}
              className="p-3.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-slate-800 shadow-2xs active:scale-[0.99] transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E2628] truncate">
                    {publicOverview?.personas.security.name || 'Vikram Singh'}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    Security
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700">
                  {publicOverview?.personas.security.unit || 'Gate 1'} • {publicOverview?.stats.checkedInToday ?? 2} Entries • {publicOverview?.stats.pendingVisitors ?? 1} Waiting
                </p>
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Scan QR passes, log walk-ins & vehicle entries
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
            </div>

            {/* Facility Persona Card */}
            <div
              onClick={() => handleQuickDemoLogin('facility')}
              className="p-3.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] shadow-2xs active:scale-[0.99] transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E2628] truncate">
                    {publicOverview?.personas.facility.name || 'Anand Verma'}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#0D5C63]">
                    Facility
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#0D5C63]">
                  {publicOverview?.personas.facility.unit || 'Clubhouse'} • {publicOverview?.stats.availableAmenities ?? 8} Open • {publicOverview?.stats.todaysBookings ?? 3} Bookings Today
                </p>
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Verify slot check-ins & manage closures
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D5C63] flex-shrink-0" />
            </div>
          </div>
        )}

        {/* TAB 2: AMENITIES LIST */}
        {activeTab === 'amenities' && (
          <div className="space-y-3">
            {amenities.map((amenity) => (
              <div
                key={amenity.id}
                onClick={() => handleQuickDemoLogin('resident')}
                className="p-3 rounded-2xl bg-white border border-[#D5EAEB] shadow-2xs flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <Image
                    src={amenity.coverImage}
                    alt={amenity.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-bold text-[#0E2628] truncate">{amenity.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-white text-[9px] font-bold capitalize flex-shrink-0 ${
                        amenity.status === 'available'
                          ? 'bg-emerald-500'
                          : amenity.status === 'maintenance'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    >
                      {amenity.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#0D5C63] font-semibold mt-0.5">
                    {amenity.category} • {amenity.location}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[#4E6E70] mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0D5C63]" /> {amenity.operatingHours}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#0D5C63]" /> Max {amenity.capacity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: FEATURES */}
        {activeTab === 'features' && (
          <div className="space-y-2.5">
            {[
              {
                icon: QrCode,
                title: 'Instant QR Visitor Passes',
                desc: 'Pre-approve guests and deliveries with 3-second gate scanning.',
              },
              {
                icon: CalendarCheck,
                title: 'Conflict-Free Amenity Slots',
                desc: 'Real-time slot capacity tracking for pool, courts & banquet hall.',
              },
              {
                icon: BellRing,
                title: 'Priority Circulars & Alerts',
                desc: 'Urgent society broadcasts with live resident acknowledgement tracking.',
              },
              {
                icon: Car,
                title: 'Rapid Security Gate Terminal',
                desc: 'Dedicated touch terminal for walk-ins, vehicles & pass verification.',
              },
              {
                icon: FileText,
                title: 'Transparent Audit Trail',
                desc: 'Every administrative action and booking is logged in real time.',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white border border-[#D5EAEB] flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#0D5C63] text-white flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0E2628]">{feat.title}</h4>
                    <p className="text-[11px] text-[#4E6E70] mt-0.5 leading-snug">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. STICKY MOBILE BOTTOM CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#D5EAEB] px-4 pt-2.5 pb-3 shadow-[0_-8px_24px_rgba(28,19,38,0.08)]">
        <div className="flex gap-2.5">
          <button
            onClick={() => setLoginOpen(true)}
            className="px-4 py-3 rounded-2xl border border-[#0D5C63] text-[#0D5C63] font-bold text-xs hover:bg-purple-50 active:scale-95 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => handleQuickDemoLogin('resident')}
            className="flex-1 py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#094449] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span>Enter Resident App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. MOBILE BOTTOM-SHEET SIGN IN MODAL */}
      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 bg-[#073B3E] text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-300">
                  Secure Mobile Access
                </p>
                <h3 className="text-base font-bold mt-0.5">Sign in to Smart Society</h3>
              </div>
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-white/10"
                aria-label="Close sign in"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('password');
                    setError('');
                  }}
                  className={`py-2 rounded-lg transition-colors ${
                    loginMode === 'password' ? 'bg-white text-[#0D5C63] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('otp');
                    setError('');
                  }}
                  className={`py-2 rounded-lg transition-colors ${
                    loginMode === 'otp' ? 'bg-white text-[#0D5C63] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Mobile OTP
                </button>
              </div>

              {error && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {loginMode === 'password' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email or phone
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        value={loginValue}
                        onChange={(e) => setLoginValue(e.target.value)}
                        placeholder="priya.sharma@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 rounded-xl bg-[#0D5C63] hover:bg-[#094449] disabled:opacity-60 text-white text-xs font-bold shadow-sm"
                  >
                    {busy ? 'Signing in…' : 'Sign In Securely'}
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Demo: <span className="font-mono">priya.sharma@example.com</span> / <span className="font-mono">Apnaa@12345</span>
                  </p>
                </form>
              ) : (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Registered mobile
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        6-digit code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs tracking-[0.4em] focus:outline-none focus:border-[#0D5C63]"
                        />
                      </div>
                      {devOtp && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mt-2">
                          Development code: <strong className="font-mono">{devOtp}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 rounded-xl bg-[#0D5C63] hover:bg-[#094449] disabled:opacity-60 text-white text-xs font-bold shadow-sm"
                  >
                    {busy ? 'Please wait…' : otpSent ? 'Verify & Sign In' : 'Send One-Time Code'}
                  </button>
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setDevOtp(undefined);
                      }}
                      className="w-full text-[11px] font-semibold text-[#0D5C63] hover:underline"
                    >
                      Use a different number
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
