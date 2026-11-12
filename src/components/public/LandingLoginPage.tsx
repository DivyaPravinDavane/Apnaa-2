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
  LogIn,
  LogOut,
  MapPin,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

interface LandingLoginPageProps {
  /** 'login' = Step 1 (First page: Resident & Visitor Login only, no landing)
   *  'landing' = Step 2 (Second page after login: Landing page with clickable Amenities & Events that redirect to the next page)
   */
  mode?: 'login' | 'landing';
  onLoginSuccess: (role: UserRole) => void;
  onNavigateToPage?: (tab: string, role?: UserRole) => void;
  onLogout?: () => void;
}

const REQUIRED_SOCIETY_CODE = '1234';

export function LandingLoginPage({
  mode = 'login',
  onLoginSuccess,
  onNavigateToPage,
  onLogout,
}: LandingLoginPageProps) {
  const {
    enterWithSocietyCode,
    createVisitor,
    currentUser,
    setRole,
    society,
    amenities,
    events,
    publicOverview,
    addToast,
  } = useSociety();

  // =========================================================================
  // STEP 1 STATE: RESIDENT & VISITOR LOGIN ONLY (NO LANDING)
  // =========================================================================
  const [loginActor, setLoginActor] = useState<'resident' | 'visitor'>('resident');
  const [residentAuthMode, setResidentAuthMode] = useState<'new' | 'registered'>('new');

  // Resident Login Fields
  const [residentName, setResidentName] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [residentUnit, setResidentUnit] = useState('');
  const [societyCode, setSocietyCode] = useState('');

  // Registered Resident Quick Passcode Fields
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [registeredCode, setRegisteredCode] = useState('');

  // Visitor Login Fields
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorUnit, setVisitorUnit] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('Personal Guest');
  const [visitorCode, setVisitorCode] = useState('');

  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // =========================================================================
  // STEP 2 STATE: LANDING PAGE FILTER TABS
  // =========================================================================
  const [landingTab, setLandingTab] = useState<'all' | 'amenities' | 'events' | 'features' | 'roles'>('all');

  // Handler 1: New Resident Login
  const handleResidentNewLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    const trimmed = societyCode.trim();
    if (!trimmed) {
      setError('Please manually type the 4-digit society passcode.');
      return;
    }
    if (trimmed !== REQUIRED_SOCIETY_CODE) {
      setError('Incorrect Society Passcode. Please manually enter 1234.');
      return;
    }

    setBusy(true);
    const result = await enterWithSocietyCode(trimmed, 'resident', {
      name: residentName.trim(),
      phone: residentPhone.trim(),
      unit: residentUnit.trim().toUpperCase(),
    });
    setBusy(false);

    if (!result.success) {
      setError(result.message || 'Invalid Society Passcode.');
      return;
    }

    onLoginSuccess('resident');
  };

  // Handler 2: Registered Resident Quick Passcode Login
  const handleRegisteredPasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = registeredPhone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 5) {
      setError('Please enter your registered mobile number.');
      return;
    }

    const trimmedCode = registeredCode.trim();
    if (!trimmedCode) {
      setError('Please manually type the 4-digit society passcode.');
      return;
    }
    if (trimmedCode !== REQUIRED_SOCIETY_CODE) {
      setError('Incorrect Society Passcode. Please enter 1234.');
      return;
    }

    setBusy(true);
    const result = await enterWithSocietyCode(trimmedCode, 'resident', {
      phone: cleanPhone,
    });
    setBusy(false);

    if (!result.success) {
      setError(result.message || 'Could not verify registered member.');
      return;
    }

    onLoginSuccess('resident');
  };

  // Handler 3: Visitor Login
  const handleVisitorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!visitorName.trim()) {
      setError('Please enter visitor full name.');
      return;
    }
    if (!visitorPhone.trim() || visitorPhone.replace(/\D/g, '').length < 5) {
      setError('Please enter a valid visitor mobile number.');
      return;
    }
    if (!visitorUnit.trim()) {
      setError('Please enter the flat/unit number you are visiting (e.g. A-101).');
      return;
    }

    const trimmedCode = visitorCode.trim();
    if (!trimmedCode) {
      setError('Please manually type the 4-digit gate passcode.');
      return;
    }
    if (trimmedCode !== REQUIRED_SOCIETY_CODE) {
      setError('Incorrect Gate Passcode. Please enter 1234.');
      return;
    }

    setBusy(true);
    const result = await enterWithSocietyCode(trimmedCode, 'resident', {
      name: `${visitorName.trim()} (Visitor)`,
      phone: visitorPhone.trim(),
      unit: visitorUnit.trim().toUpperCase(),
    });

    if (result.success) {
      createVisitor({
        name: visitorName.trim(),
        phone: visitorPhone.trim(),
        unit: visitorUnit.trim().toUpperCase(),
        purpose: visitorPurpose,
        visitDate: new Date().toISOString().split('T')[0],
        arrivalTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        visitorCount: 1,
        status: 'approved',
      });
      addToast(
        'Visitor Logged In',
        `Welcome ${visitorName.trim()}! Visiting Flat ${visitorUnit.trim().toUpperCase()}.`,
        'success'
      );
    }
    setBusy(false);

    if (!result.success) {
      setError(result.message || 'Could not verify visitor entry.');
      return;
    }

    onLoginSuccess('resident');
  };

  // Helper to navigate from Step 2 (Landing) -> Step 3 (Next Page)
  const triggerNextPage = (tab: string, roleToSelect?: UserRole) => {
    if (roleToSelect) {
      setRole(roleToSelect);
    }
    if (onNavigateToPage) {
      onNavigateToPage(tab, roleToSelect);
    }
  };

  // =========================================================================
  // RENDER MODE 1: FIRST PAGE — RESIDENT & VISITOR LOGIN ONLY (NO LANDING)
  // =========================================================================
  if (mode === 'login') {
    const activePinValue =
      loginActor === 'visitor'
        ? visitorCode
        : residentAuthMode === 'registered'
        ? registeredCode
        : societyCode;

    const handleActivePinChange = (raw: string) => {
      const val = raw.replace(/\D/g, '').slice(0, 4);
      setError('');
      if (loginActor === 'visitor') {
        setVisitorCode(val);
      } else if (residentAuthMode === 'registered') {
        setRegisteredCode(val);
      } else {
        setSocietyCode(val);
      }
    };

    return (
      <div className="min-h-full bg-[#F4F9F9] text-[#0E2628] flex flex-col justify-between pb-6">
        {/* Clean Top Header */}
        <header className="sticky top-0 z-30 bg-[#073B3E] text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="17" fill="#0D5C63" stroke="#34D399" strokeWidth="1.5" />
              <path d="M18 7C18 7 10 11.5 10 19C10 23 13.5 26 18 26C22.5 26 26 23 26 19C26 11.5 18 7 18 7Z" fill="#E6F3F3"/>
              <path d="M18 10V25" stroke="#0D5C63" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M18 15.5C15 14 12.5 15.5 12.5 15.5" stroke="#0D5C63" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M18 19.5C21 18 23.5 19.5 23.5 19.5" stroke="#0D5C63" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <div>
              <span className="font-bold text-sm text-white tracking-tight leading-tight block">
                Apnaa Society
              </span>
              <span className="text-[10px] text-emerald-200 font-medium block">
                Step 1 of 2 • Resident &amp; Visitor Gate Login
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-200">
            Quick Passcode
          </span>
        </header>

        {/* Centered Login Container (No Landing Content Here) */}
        <div className="px-4 pt-5 space-y-4 flex-1 flex flex-col justify-center">
          {/* Primary Actor Switcher: RESIDENT LOGIN vs VISITOR LOGIN */}
          <div className="p-1.5 rounded-2xl bg-white border border-[#D5EAEB] shadow-2xs grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setLoginActor('resident');
                setError('');
              }}
              className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loginActor === 'resident'
                  ? 'bg-[#0D5C63] text-white shadow-sm'
                  : 'text-[#4E6E70] hover:text-[#0E2628] bg-slate-50/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Resident Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginActor('visitor');
                setError('');
              }}
              className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loginActor === 'visitor'
                  ? 'bg-[#0D5C63] text-white shadow-sm'
                  : 'text-[#4E6E70] hover:text-[#0E2628] bg-slate-50/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Visitor Login</span>
            </button>
          </div>

          {/* LOGIN CARD */}
          <div className="p-5 rounded-3xl bg-white border border-[#0D5C63]/25 shadow-md space-y-4">
            {loginActor === 'resident' ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#0E2628]">
                        Resident Access Login
                      </h2>
                      <p className="text-[11px] text-[#4E6E70]">
                        Login with Quick Passcode to open Society Landing
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-toggle: New Resident Details vs Registered Mobile Only */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setResidentAuthMode('new');
                      setError('');
                    }}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      residentAuthMode === 'new'
                        ? 'bg-white text-[#0D5C63] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Resident Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResidentAuthMode('registered');
                      setError('');
                    }}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      residentAuthMode === 'registered'
                        ? 'bg-white text-[#0D5C63] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Registered Member
                  </button>
                </div>

                <form
                  onSubmit={
                    residentAuthMode === 'registered'
                      ? handleRegisteredPasscodeLogin
                      : handleResidentNewLogin
                  }
                  className="space-y-3.5"
                >
                  {residentAuthMode === 'new' ? (
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Resident Full Name
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
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                          />
                        </div>
                      </div>

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
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
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
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Registered Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          value={registeredPhone}
                          onChange={(e) => {
                            setRegisteredPhone(e.target.value);
                            setError('');
                          }}
                          placeholder="Enter registered mobile (e.g. 9812345678)"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4-Digit Quick Passcode Boxes */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        4-Digit Quick Society Passcode
                      </label>
                      {activePinValue.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowPin((prev) => !prev)}
                          className="flex items-center gap-1 text-[11px] text-[#0D5C63] font-semibold hover:underline cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showPin ? 'Hide' : 'Show'}</span>
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex justify-center gap-3 my-1">
                        {[0, 1, 2, 3].map((idx) => {
                          const char = activePinValue[idx] || '';
                          const isCorrect = activePinValue === REQUIRED_SOCIETY_CODE;
                          const isFilled = Boolean(char);
                          return (
                            <div
                              key={idx}
                              className={`w-13 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-mono border-2 transition-all shadow-2xs ${
                                isCorrect
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : isFilled
                                  ? 'border-[#0D5C63] bg-[#E6F3F3] text-[#0D5C63]'
                                  : error
                                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                                  : 'border-slate-200 bg-slate-50/70 text-transparent'
                              }`}
                            >
                              {char ? (showPin ? char : '●') : ''}
                            </div>
                          );
                        })}
                      </div>

                      <input
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-form-type="other"
                        name="society_passcode_manual"
                        value={activePinValue}
                        onChange={(e) => handleActivePinChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {activePinValue === REQUIRED_SOCIETY_CODE && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Passcode Verified! Click below to proceed to Landing Page.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3.5 rounded-2xl bg-[#0D5C63] hover:bg-[#073B3E] active:scale-[0.99] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {busy ? (
                      <span>Logging In…</span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Login as Resident &amp; Go to Landing</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* VISITOR LOGIN FORM */
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#0E2628]">
                        Visitor Gate Login
                      </h2>
                      <p className="text-[11px] text-[#4E6E70]">
                        Enter visitor details &amp; quick passcode to enter
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVisitorLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Visitor Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={visitorName}
                        onChange={(e) => {
                          setVisitorName(e.target.value);
                          setError('');
                        }}
                        placeholder="e.g. Amit Verma"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Visitor Mobile
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          value={visitorPhone}
                          onChange={(e) => {
                            setVisitorPhone(e.target.value);
                            setError('');
                          }}
                          placeholder="98220 11223"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Visiting Flat No.
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Home className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={visitorUnit}
                          onChange={(e) => {
                            setVisitorUnit(e.target.value);
                            setError('');
                          }}
                          placeholder="e.g. A-101"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Purpose of Visit
                    </label>
                    <select
                      value={visitorPurpose}
                      onChange={(e) => setVisitorPurpose(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:outline-hidden focus:border-[#0D5C63]"
                    >
                      <option>Personal Guest</option>
                      <option>Delivery / Courier</option>
                      <option>Cab / Ride Drop</option>
                      <option>Home Service / Maintenance</option>
                    </select>
                  </div>

                  {/* 4-Digit Quick Passcode Boxes */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        4-Digit Quick Gate Passcode
                      </label>
                      {activePinValue.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowPin((prev) => !prev)}
                          className="flex items-center gap-1 text-[11px] text-[#0D5C63] font-semibold hover:underline cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showPin ? 'Hide' : 'Show'}</span>
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex justify-center gap-3 my-1">
                        {[0, 1, 2, 3].map((idx) => {
                          const char = activePinValue[idx] || '';
                          const isCorrect = activePinValue === REQUIRED_SOCIETY_CODE;
                          const isFilled = Boolean(char);
                          return (
                            <div
                              key={idx}
                              className={`w-13 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-mono border-2 transition-all shadow-2xs ${
                                isCorrect
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : isFilled
                                  ? 'border-[#0D5C63] bg-[#E6F3F3] text-[#0D5C63]'
                                  : error
                                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                                  : 'border-slate-200 bg-slate-50/70 text-transparent'
                              }`}
                            >
                              {char ? (showPin ? char : '●') : ''}
                            </div>
                          );
                        })}
                      </div>

                      <input
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-form-type="other"
                        name="visitor_passcode_manual"
                        value={activePinValue}
                        onChange={(e) => handleActivePinChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {activePinValue === REQUIRED_SOCIETY_CODE && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Passcode Verified! Click below to proceed to Landing Page.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3.5 rounded-2xl bg-[#0D5C63] hover:bg-[#073B3E] active:scale-[0.99] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {busy ? (
                      <span>Verifying Visitor…</span>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Login as Visitor &amp; Go to Landing</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER MODE 2: SECOND PAGE — SOCIETY LANDING PAGE (AFTER LOGIN)
  // Clicking on Amenities, Events, Visitor Pass, or Features redirects to Next Page!
  // =========================================================================
  return (
    <div className="min-h-full bg-[#F4F9F9] text-[#0E2628] flex flex-col justify-between pb-8">
      {/* 1. LANDING PAGE HEADER */}
      <header className="sticky top-0 z-30 bg-[#073B3E] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="17" fill="#0D5C63" stroke="#34D399" strokeWidth="1.5" />
            <path d="M18 7C18 7 10 11.5 10 19C10 23 13.5 26 18 26C22.5 26 26 23 26 19C26 11.5 18 7 18 7Z" fill="#E6F3F3"/>
            <path d="M18 10V25" stroke="#0D5C63" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18 15.5C15 14 12.5 15.5 12.5 15.5" stroke="#0D5C63" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M18 19.5C21 18 23.5 19.5 23.5 19.5" stroke="#0D5C63" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div>
            <span className="font-bold text-sm text-white tracking-tight leading-tight block">
              Apnaa Society Landing
            </span>
            <span className="text-[10px] text-emerald-200 font-medium block">
              Welcome, {currentUser.name} (Flat {currentUser.unit})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => triggerNextPage('resident_home')}
            className="px-2.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span>App Home</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 border border-rose-300/40 text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Logout to Login Page"
            >
              <LogOut className="w-3 h-3 text-rose-200" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. SCROLLABLE LANDING CONTENT */}
      <div className="px-4 pt-3 space-y-4 flex-1">
        {/* Hero Campus Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#D5EAEB] bg-[#073B3E] text-white">
          <div className="relative h-44 w-full">
            <Image
              src="/images/smart_society_campus_isometric.jpg"
              alt="Apnaa Society Campus"
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

            <button
              type="button"
              onClick={() => triggerNextPage('resident_home')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-[11px] font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-emerald-300/80 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Open Full Dashboard</span>
            </button>

            <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between">
              <div>
                <h1 className="font-serif text-xl font-bold leading-snug text-white drop-shadow-sm">
                  Apnaa Society
                </h1>
                <p className="text-[10px] text-emerald-200 font-medium">
                  Click any Amenity or Event below to open its page
                </p>
              </div>
            </div>
          </div>

          {/* Clickable 4-Stat Strip -> Redirects to Next Page */}
          <div className="grid grid-cols-4 divide-x divide-emerald-800/40 bg-[#073B3E] py-2.5 text-center">
            <button
              type="button"
              onClick={() => triggerNextPage('resident_members')}
              className="hover:bg-white/10 transition-colors py-0.5 cursor-pointer"
            >
              <p className="text-sm font-bold text-white">{society.totalHouseholds}+</p>
              <p className="text-[9px] text-emerald-200 uppercase">Families →</p>
            </button>
            <button
              type="button"
              onClick={() => triggerNextPage('resident_amenities')}
              className="hover:bg-white/10 transition-colors py-0.5 cursor-pointer"
            >
              <p className="text-sm font-bold text-emerald-300">{amenities.length}</p>
              <p className="text-[9px] text-emerald-200 uppercase font-bold">Amenities →</p>
            </button>
            <button
              type="button"
              onClick={() => triggerNextPage('resident_events')}
              className="hover:bg-white/10 transition-colors py-0.5 cursor-pointer"
            >
              <p className="text-sm font-bold text-emerald-300">{events.length}</p>
              <p className="text-[9px] text-emerald-200 uppercase font-bold">Events →</p>
            </button>
            <button
              type="button"
              onClick={() => triggerNextPage('resident_visitors')}
              className="hover:bg-white/10 transition-colors py-0.5 cursor-pointer"
            >
              <p className="text-sm font-bold text-emerald-400">24/7</p>
              <p className="text-[9px] text-emerald-200 uppercase">Live Gate →</p>
            </button>
          </div>
        </div>

        {/* 3. CLICKABLE QUICK NAVIGATION PILLS (DIRECT REDIRECT TO NEXT PAGE) */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => triggerNextPage('resident_visitors')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#0E2628] leading-tight">Visitor Pass</span>
          </button>

          <button
            type="button"
            onClick={() => triggerNextPage('resident_amenities')}
            className="p-2.5 rounded-2xl bg-white border border-[#0D5C63]/40 hover:border-[#0D5C63] flex flex-col items-center text-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer ring-1 ring-[#0D5C63]/20"
          >
            <div className="w-9 h-9 rounded-full bg-[#0D5C63] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#0D5C63] leading-tight">Amenities</span>
          </button>

          <button
            type="button"
            onClick={() => triggerNextPage('resident_events')}
            className="p-2.5 rounded-2xl bg-white border border-[#0D5C63]/40 hover:border-[#0D5C63] flex flex-col items-center text-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer ring-1 ring-[#0D5C63]/20"
          >
            <div className="w-9 h-9 rounded-full bg-[#0D5C63] text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#0D5C63] leading-tight">Events</span>
          </button>

          <button
            type="button"
            onClick={() => triggerNextPage('resident_notices')}
            className="p-2.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] flex flex-col items-center text-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#0E2628] leading-tight">Notices</span>
          </button>
        </div>

        {/* 4. FILTER TABS ON LANDING PAGE */}
        <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] font-bold">
          {[
            { id: 'all', label: 'All' },
            { id: 'amenities', label: `Amenities (${amenities.length})` },
            { id: 'events', label: `Events (${events.length})` },
            { id: 'features', label: 'Features' },
            { id: 'roles', label: 'Roles' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setLandingTab(t.id as typeof landingTab)}
              className={`py-2 rounded-xl transition-all cursor-pointer truncate px-1 ${
                landingTab === t.id
                  ? 'bg-[#0D5C63] text-white shadow-xs'
                  : 'text-[#4E6E70] hover:text-[#0E2628]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SECTION A: CLICKABLE AMENITIES (Redirects to Amenities Booking Page) */}
        {(landingTab === 'all' || landingTab === 'amenities') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#073B3E]">
                  Society Amenities ({amenities.length})
                </h2>
                <p className="text-[10px] text-[#4E6E70]">
                  Click any amenity card to open the Amenities Booking Page
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerNextPage('resident_amenities')}
                className="text-[11px] font-bold text-[#0D5C63] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Open All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {(landingTab === 'all' ? amenities.slice(0, 4) : amenities).map((amenity) => (
              <div
                key={amenity.id}
                onClick={() => triggerNextPage('resident_amenities')}
                className="p-3 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] shadow-2xs flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <Image
                    src={amenity.coverImage}
                    alt={amenity.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-bold text-[#0E2628] truncate group-hover:text-[#0D5C63]">
                      {amenity.name}
                    </h3>
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
                  <div className="flex items-center justify-between text-[10px] text-[#4E6E70] mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0D5C63]" /> {amenity.operatingHours}
                    </span>
                    <span className="text-[10px] font-bold text-[#0D5C63] flex items-center gap-0.5">
                      Book Now <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION B: CLICKABLE EVENTS (Redirects to Events & RSVP Page) */}
        {(landingTab === 'all' || landingTab === 'events') && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#073B3E]">
                  Upcoming Society Events ({events.length})
                </h2>
                <p className="text-[10px] text-[#4E6E70]">
                  Click any event card to open the Events &amp; RSVP Page
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerNextPage('resident_events')}
                className="text-[11px] font-bold text-[#0D5C63] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Open All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => triggerNextPage('resident_events')}
                className="p-3 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] shadow-2xs flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <Image
                    src={ev.coverImage}
                    alt={ev.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F3F3] text-[#0D5C63] text-[9px] font-bold">
                      {ev.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {ev.attendeesCount} attending
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#0E2628] truncate mt-1 group-hover:text-[#0D5C63]">
                    {ev.title}
                  </h3>
                  <p className="text-[10px] text-[#4E6E70] truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0D5C63] flex-shrink-0" />
                    <span>
                      {ev.date} • {ev.time} • {ev.venue}
                    </span>
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-[10px] font-bold text-[#0D5C63] flex items-center gap-0.5">
                      Open Event &amp; RSVP <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION C: CLICKABLE FEATURES */}
        {(landingTab === 'all' || landingTab === 'features') && (
          <div className="space-y-2.5 pt-1">
            <div className="px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#073B3E]">
                Smart Community Features
              </h2>
              <p className="text-[10px] text-[#4E6E70]">Click any feature to launch its module</p>
            </div>
            {[
              {
                icon: QrCode,
                title: 'Instant QR Visitor Passes',
                desc: 'Pre-approve guests and deliveries with 3-second gate scanning.',
                targetTab: 'resident_visitors',
              },
              {
                icon: CalendarCheck,
                title: 'Conflict-Free Amenity Slots',
                desc: 'Real-time slot capacity tracking for pool, courts & banquet hall.',
                targetTab: 'resident_amenities',
              },
              {
                icon: BellRing,
                title: 'Priority Circulars & Alerts',
                desc: 'Urgent society broadcasts with live resident acknowledgement tracking.',
                targetTab: 'resident_notices',
              },
              {
                icon: Calendar,
                title: 'Community Events & Celebrations',
                desc: 'RSVP for cultural nights, sports tournaments & workshops.',
                targetTab: 'resident_events',
              },
              {
                icon: FileText,
                title: 'Community Polls & e-Voting',
                desc: 'Participate in managing committee resolutions and resident surveys.',
                targetTab: 'resident_poll',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  onClick={() => triggerNextPage(feat.targetTab)}
                  className="p-3.5 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63] flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0D5C63] text-white flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0E2628]">{feat.title}</h4>
                      <p className="text-[11px] text-[#4E6E70] mt-0.5 leading-snug">{feat.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0D5C63] flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* SECTION D: COMMITTEE & STAFF PERSONA SWITCHER */}
        {(landingTab === 'all' || landingTab === 'roles') && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#073B3E]">
                Portal Dashboards by Role
              </h2>
              <span className="text-[10px] font-semibold text-[#0D5C63]">Click to open</span>
            </div>

            {/* Resident Dashboard Card */}
            <div
              onClick={() => triggerNextPage('resident_home', 'resident')}
              className="p-3.5 rounded-2xl bg-white border border-[#0D5C63] shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#0D5C63] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E2628] truncate">
                    {currentUser.name}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E6F3F3] text-[#0D5C63]">
                    Resident
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#0D5C63]">
                  Flat {currentUser.unit} • ANACITY Smart Dashboard
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D5C63] flex-shrink-0" />
            </div>

            {/* Admin Persona Card */}
            <div
              onClick={() => triggerNextPage('admin_dashboard', 'admin')}
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
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E6F3F3] text-[#073B3E]">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Manage residents, notices, moderation &amp; audits
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#073B3E] flex-shrink-0" />
            </div>

            {/* Security Persona Card */}
            <div
              onClick={() => triggerNextPage('security_gate', 'security')}
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
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Scan QR passes, log walk-ins &amp; vehicle entries
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
            </div>

            {/* Facility Persona Card */}
            <div
              onClick={() => triggerNextPage('facility_dashboard', 'facility')}
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
                <p className="text-[11px] text-[#4E6E70] truncate mt-0.5">
                  Verify slot check-ins &amp; manage closures
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D5C63] flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Bottom Primary CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => triggerNextPage('resident_home')}
            className="w-full py-3.5 rounded-2xl bg-[#0D5C63] hover:bg-[#073B3E] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Continue to Full Resident Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
