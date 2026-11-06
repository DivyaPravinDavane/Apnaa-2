'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { UserRole } from '@/types';
import {
  User,
  Phone,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowRight,
  Building2,
  Shield,
  UserCheck,
  Home,
  QrCode,
  CalendarCheck,
  BellRing,
  Car,
  FileText,
  KeyRound,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import Image from 'next/image';

interface LandingLoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

const REQUIRED_SOCIETY_CODE = '1234';

export function LandingLoginPage({ onLoginSuccess }: LandingLoginPageProps) {
  const {
    enterWithSocietyCode,
    society,
    amenities,
    publicOverview,
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'access' | 'amenities' | 'features'>('access');
  const [residentName, setResidentName] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [residentUnit, setResidentUnit] = useState('');
  const [societyCode, setSocietyCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleEnterWithCode = async (roleToUse: UserRole = selectedRole, codeToUse: string = societyCode) => {
    setError('');
    const trimmed = codeToUse.trim();

    if (roleToUse === 'resident') {
      if (!residentName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!residentPhone.trim() || residentPhone.replace(/\D/g, '').length < 5) {
        setError('Please enter a valid mobile number.');
        return;
      }
      if (!residentUnit.trim()) {
        setError('Please enter your flat or unit number (e.g. A-101, B-404).');
        return;
      }
    }

    if (!trimmed) {
      setError('Please enter the 4-digit society passcode.');
      return;
    }

    if (trimmed !== REQUIRED_SOCIETY_CODE) {
      setError('Incorrect Society Passcode. Please try again.');
      return;
    }

    setBusy(true);
    const result = await enterWithSocietyCode(trimmed, roleToUse, {
      name: residentName.trim(),
      phone: residentPhone.trim(),
      unit: residentUnit.trim(),
    });
    setBusy(false);

    if (!result.success) {
      setError(result.message || 'Access denied.');
      return;
    }

    onLoginSuccess(roleToUse);
  };

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setSocietyCode(cleaned);
    setError('');
    if (cleaned.length === 4) {
      if (cleaned === REQUIRED_SOCIETY_CODE) {
        if (selectedRole !== 'resident' || (residentName.trim() && residentPhone.trim())) {
          void handleEnterWithCode(selectedRole, cleaned);
        }
      } else {
        setError('Incorrect Society Passcode. Please try again.');
      }
    }
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
  };

  return (
    <div className="min-h-full bg-[#F4F9F9] text-[#0E2628] flex flex-col justify-between pb-6">
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
      </header>

      {/* 2. MOBILE SCROLLABLE BODY */}
      <div className="px-4 pt-3 space-y-4 flex-1">
        {/* Hero Campus Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#D5EAEB] bg-[#073B3E] text-white">
          <div className="relative h-40 w-full">
            <Image
              src="/images/smart_society_campus_isometric.jpg"
              alt="Westend Heights Residency Campus"
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

            <div className="absolute bottom-3.5 left-4 right-4">
              <h1 className="font-serif text-xl font-bold leading-snug text-white drop-shadow-sm">
                Apnaa Society
              </h1>
            </div>
          </div>

          {/* Compact 4-Stat Strip */}
          <div className="grid grid-cols-4 divide-x divide-emerald-800/40 bg-[#073B3E] py-2 text-center">
            <div>
              <p className="text-sm font-bold text-white">{society.totalHouseholds}+</p>
              <p className="text-[9px] text-emerald-200 uppercase">Families</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{amenities.length}</p>
              <p className="text-[9px] text-emerald-200 uppercase">Amenities</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{publicOverview?.stats.upcomingEvents ?? 4}</p>
              <p className="text-[9px] text-emerald-200 uppercase">Events</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">24/7</p>
              <p className="text-[9px] text-emerald-200 uppercase">Live Gate</p>
            </div>
          </div>
        </div>

        {/* 3. RESIDENT ENTRY & PROFILE REGISTRATION CARD */}
        <div className="p-4 rounded-3xl bg-white border border-[#0D5C63]/30 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0E2628] uppercase tracking-wider">
                  Resident Access Portal
                </h3>
                <p className="text-[11px] text-[#4E6E70]">Enter details &amp; passcode to enter</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0D5C63] px-2.5 py-1 rounded-full bg-[#E6F3F3] border border-[#0D5C63]/20">
              <Lock className="w-3 h-3" />
              <span>Confidential</span>
            </div>
          </div>

          {/* Resident Details: Name, Phone, Flat */}
          {selectedRole === 'resident' && (
            <div className="space-y-2.5 pt-1">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={residentName}
                    onChange={(e) => {
                      setResidentName(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Mobile Number & Flat Number Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={residentPhone}
                      onChange={(e) => {
                        setResidentPhone(e.target.value);
                        setError('');
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Flat / Unit No.
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={residentUnit}
                      onChange={(e) => {
                        setResidentUnit(e.target.value);
                        setError('');
                      }}
                      placeholder="e.g. A-101"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4-Digit Passcode Label */}
          <div className="pt-1">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              4-Digit Society Passcode
            </label>
            {/* 4-Digit PIN Boxes */}
            <div className="relative">
              <div className="flex justify-center gap-3 my-1">
                {[0, 1, 2, 3].map((idx) => {
                  const char = societyCode[idx] || '';
                  const isCorrect = societyCode === REQUIRED_SOCIETY_CODE;
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-mono border-2 transition-all shadow-2xs ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : char
                          ? 'border-[#0D5C63] bg-[#E6F3F3] text-[#0D5C63]'
                          : error
                          ? 'border-rose-400 bg-rose-50 text-rose-600 animate-pulse'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {char ? (showPin ? char : '●') : '—'}
                    </div>
                  );
                })}
              </div>

              {/* Invisible Real Numeric Input for Seamless Typing */}
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={societyCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder=""
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-[#4E6E70]">
            <span>Confidential society passcode</span>
            {societyCode.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="flex items-center gap-1 text-[#0D5C63] font-semibold hover:underline"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPin ? 'Hide' : 'Show'}</span>
              </button>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Match Banner */}
          {societyCode === REQUIRED_SOCIETY_CODE && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Passcode Verified! Ready to enter.</span>
            </div>
          )}

          {/* Enter Button */}
          <button
            type="button"
            onClick={() => handleEnterWithCode(selectedRole, societyCode)}
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#073B3E] active:scale-[0.99] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            {busy ? (
              <span>Saving Profile &amp; Entering…</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enter Apnaa Society</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* 4. QUICK FEATURE PILLS */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab('features')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Visitor Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('amenities')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Amenities</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Events</span>
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#0E2628] leading-tight">Gate Desk</span>
          </button>
        </div>

        {/* Mobile Segmented Tab Bar */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'access'
                ? 'bg-[#0D5C63] text-white shadow-xs'
                : 'text-[#4E6E70] hover:text-[#0E2628]'
            }`}
          >
            Choose Persona
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

        {/* TAB 1: COMMITTEE & STAFF ROLES */}
        {activeTab === 'access' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-[#0E2628]">Committee &amp; Staff Access</p>
              <span className="text-[10px] font-semibold text-[#0D5C63]">Passcode required</span>
            </div>

            {selectedRole !== 'resident' && (
              <div
                onClick={() => handleQuickRoleSelect('resident')}
                className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-2xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0D5C63] text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0D5C63]">Switch back to Resident Entry</p>
                    <p className="text-[10px] text-emerald-800">Enter your name and mobile to enter</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#0D5C63]" />
              </div>
            )}

            {/* Admin Persona Card */}
            <div
              onClick={() => handleQuickRoleSelect('admin')}
              className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer flex items-center gap-3.5 ${
                selectedRole === 'admin'
                  ? 'border-[#0D5C63] ring-2 ring-[#0D5C63]/20 shadow-md'
                  : 'border-[#D5EAEB] hover:border-[#0D5C63] shadow-2xs'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-[#073B3E] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E2628] truncate">
                    {publicOverview?.personas.admin.name || 'Rajesh Nair'}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E6F3F3] text-[#073B3E]">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#073B3E]">
                  Flat {publicOverview?.personas.admin.unit || 'C-402'} • Society Secretary
                </p>
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Manage residents, notices, moderation &amp; audits
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#073B3E] flex-shrink-0" />
            </div>

            {/* Security Persona Card */}
            <div
              onClick={() => handleQuickRoleSelect('security')}
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
                  {publicOverview?.personas.security.unit || 'Gate 1'} • {publicOverview?.stats.checkedInToday ?? 2} Entries
                </p>
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Scan QR passes, log walk-ins & vehicle entries
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
            </div>

            {/* Facility Persona Card */}
            <div
              onClick={() => handleQuickRoleSelect('facility')}
              className="p-3.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] shadow-2xs active:scale-[0.99] transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#0D5C63] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E2628] truncate">
                    {publicOverview?.personas.facility.name || 'Anand Verma'}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E6F3F3] text-[#0D5C63]">
                    Facility
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#0D5C63]">
                  {publicOverview?.personas.facility.unit || 'Clubhouse'} • {publicOverview?.stats.availableAmenities ?? 8} Open
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
                onClick={() => handleQuickRoleSelect('resident')}
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
    </div>
  );
}
