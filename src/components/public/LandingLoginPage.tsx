'use client';

import React, { useState, useEffect } from 'react';
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
  Check,
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
    dbConnected,
    publicOverview,
  } = useSociety();
  const [activeSection, setActiveSection] = useState<'overview' | 'features' | 'amenities' | 'access'>('overview');
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

  const scrollToSection = (sectionId: 'overview' | 'features' | 'amenities' | 'access') => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll listener to highlight the active navbar item based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections: ('overview' | 'features' | 'amenities' | 'access')[] = ['overview', 'features', 'amenities', 'access'];
      const scrollY = window.scrollY + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F6FC] text-[#1C1326] flex flex-col selection:bg-[#6B21A8] selection:text-white scroll-smooth">
      {/* 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#F8F6FC]/90 backdrop-blur-md border-b border-[#EAE2F2]/60">
        <nav className="h-20 px-6 sm:px-10 lg:px-16 flex items-center justify-between max-w-[1400px] w-full mx-auto">
          {/* Brand Logo with Twin Leaves Emblem */}
          <div 
            onClick={() => scrollToSection('overview')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="17" fill="#6B21A8" />
              <path d="M18 7C18 7 10 11.5 10 19C10 23 13.5 26 18 26C22.5 26 26 23 26 19C26 11.5 18 7 18 7Z" fill="#EDE9FE"/>
              <path d="M18 10V25" stroke="#6B21A8" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M18 15.5C15 14 12.5 15.5 12.5 15.5" stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M18 19.5C21 18 23.5 19.5 23.5 19.5" stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <div>
              <span className="font-bold text-[17px] text-[#1C1326] tracking-tight leading-tight block">
                Smart Society
              </span>
              <span className="text-[10px] text-[#6E6280] font-medium tracking-wide block">
                Connected • Secure • Together
              </span>
            </div>
          </div>

          {/* Center Nav Links: Overview, Features, Amenities, Direct Access */}
          <div className="hidden md:flex items-center gap-9 text-[13px] font-semibold">
            <button
              type="button"
              onClick={() => scrollToSection('overview')}
              className={`transition-colors cursor-pointer ${
                activeSection === 'overview'
                  ? 'text-[#6B21A8] underline underline-offset-8 decoration-2 decoration-[#6B21A8]'
                  : 'text-[#6E6280] hover:text-[#6B21A8]'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className={`transition-colors cursor-pointer ${
                activeSection === 'features'
                  ? 'text-[#6B21A8] underline underline-offset-8 decoration-2 decoration-[#6B21A8]'
                  : 'text-[#6E6280] hover:text-[#6B21A8]'
              }`}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('amenities')}
              className={`transition-colors cursor-pointer ${
                activeSection === 'amenities'
                  ? 'text-[#6B21A8] underline underline-offset-8 decoration-2 decoration-[#6B21A8]'
                  : 'text-[#6E6280] hover:text-[#6B21A8]'
              }`}
            >
              Amenities
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('access')}
              className={`transition-colors cursor-pointer ${
                activeSection === 'access'
                  ? 'text-[#6B21A8] underline underline-offset-8 decoration-2 decoration-[#6B21A8]'
                  : 'text-[#6E6280] hover:text-[#6B21A8]'
              }`}
            >
              Direct Access
            </button>
          </div>

          {/* Right CTA Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLoginOpen(true)}
              className="px-4 py-2.5 rounded-full border border-[#6B21A8] text-[#6B21A8] hover:bg-purple-50 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleQuickDemoLogin('resident')}
              className="px-5 py-2.5 rounded-full bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          SECTION 1: OVERVIEW (HERO & 3D CAMPUS SHOWCASE)
         ========================================================================= */}
      <section id="overview" className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-16 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/90 text-xs font-semibold text-[#6B21A8]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Residential Platform</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#1C1326] tracking-tight leading-[1.08]">
              A Smarter<br />
              Way to Live Together
            </h1>

            <p className="text-sm sm:text-base text-[#6E6280] max-w-lg leading-relaxed">
              Modern society management, seamless visitor access, amenity booking and a stronger community — all in one unified, crystal-clear experience.
            </p>

            {/* 4 Feature Badges with Circular Outlines */}
            <div className="grid grid-cols-4 gap-3 max-w-md pt-1">
              <div 
                onClick={() => scrollToSection('features')}
                className="flex flex-col items-center text-center space-y-2 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 flex items-center justify-center text-[#6B21A8] shadow-2xs group-hover:bg-purple-100 group-hover:scale-105 transition-all">
                  <User className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Visitor<br />Passes
                </span>
              </div>

              <div 
                onClick={() => scrollToSection('amenities')}
                className="flex flex-col items-center text-center space-y-2 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 flex items-center justify-center text-[#6B21A8] shadow-2xs group-hover:bg-purple-100 group-hover:scale-105 transition-all">
                  <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Amenity<br />Booking
                </span>
              </div>

              <div 
                onClick={() => scrollToSection('features')}
                className="flex flex-col items-center text-center space-y-2 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 flex items-center justify-center text-[#6B21A8] shadow-2xs group-hover:bg-purple-100 group-hover:scale-105 transition-all">
                  <Calendar className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Events &<br />Notices
                </span>
              </div>

              <div 
                onClick={() => scrollToSection('features')}
                className="flex flex-col items-center text-center space-y-2 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 flex items-center justify-center text-[#6B21A8] shadow-2xs group-hover:bg-purple-100 group-hover:scale-105 transition-all">
                  <Lock className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Gate<br />Security
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleQuickDemoLogin('resident')}
                className="px-8 py-3.5 rounded-2xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-semibold text-sm tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Enter Smart Society Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="px-6 py-3.5 rounded-2xl border border-[#D8C7EE] bg-white hover:bg-purple-50/60 text-[#1C1326] font-semibold text-sm transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Right Column: 100% CLEAR, Crisp 3D Campus Architectural Showcase (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] xl:h-[580px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(46,16,101,0.08)] border border-[#E9DDF5] bg-[#F2F2EA] group">
              <Image
                src="/images/smart_society_campus_isometric.jpg"
                alt="Green Valley Residency 3D Architectural Campus"
                fill
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
              />

              {/* Floating Campus Badge */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#EDE9FE] shadow-sm flex items-center gap-2 text-xs font-semibold text-[#2E1065]">
                <span className={`w-2.5 h-2.5 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{society.name} • {dbConnected ? 'Live MySQL Connected' : '3D Campus View'}</span>
              </div>

              {/* Floating Amenities Highlights Badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 px-4 py-2 rounded-full bg-[#2E1065]/90 backdrop-blur-md text-white text-xs font-medium shadow-md flex items-center gap-2">
                <span>Clubhouse • Swimming Pool • Gate Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="pt-12 max-w-4xl border-t border-[#EAE2F2]/70 mt-12">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B21A8] mb-4 flex items-center gap-2">
            <span>Live Community Highlights</span>
            {dbConnected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 normal-case">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Dynamic MySQL Feed
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-2xs">
              <p className="text-3xl font-bold text-[#1C1326]">{society.totalHouseholds || 248}+</p>
              <p className="text-xs text-[#6E6280] font-medium mt-1">Happy Resident Families</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-2xs">
              <p className="text-3xl font-bold text-[#1C1326]">{amenities.length || publicOverview?.stats.totalAmenities || 9}</p>
              <p className="text-xs text-[#6E6280] font-medium mt-1">World-Class Amenities</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-2xs">
              <p className="text-3xl font-bold text-[#1C1326]">24/7</p>
              <p className="text-xs text-[#6E6280] font-medium mt-1">Guard & Gate Security</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-2xs">
              <p className="text-3xl font-bold text-[#1C1326]">100%</p>
              <p className="text-xs text-[#6E6280] font-medium mt-1">Dynamic & Conflict-Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FEATURES (IN-DEPTH PLATFORM CAPABILITIES)
         ========================================================================= */}
      <section id="features" className="py-20 bg-white border-y border-[#EAE2F2]/80">
        <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16">
          {/* Section Header */}
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-xs font-bold text-[#6B21A8] border border-purple-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Features</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1C1326] tracking-tight">
              Everything Your Community Needs to Run Flawlessly
            </h2>
            <p className="text-sm sm:text-base text-[#6E6280] leading-relaxed">
              Say goodbye to manual paper register books, disorganized WhatsApp groups, and missed announcements.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* 1. Smart Visitor Passes */}
            <div className="p-7 rounded-3xl bg-[#F8F6FC] border border-[#EAE2F2] hover:border-[#6B21A8]/50 hover:shadow-lg transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">Instant QR Visitor Passes</h3>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Pre-approve guests, delivery drivers, and service staff with 1-tap QR passes shared directly via WhatsApp. Guards scan at the terminal in under 3 seconds.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EAE2F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#6B21A8] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 3-Sec Gate Clearance
                </span>
                <span className="text-slate-400">Security Gate 1</span>
              </div>
            </div>

            {/* 2. Automated Amenity Scheduling */}
            <div className="p-7 rounded-3xl bg-[#F8F6FC] border border-[#EAE2F2] hover:border-[#6B21A8]/50 hover:shadow-lg transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">Automated Amenity Booking</h3>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Reserve slots for the Swimming Pool, Badminton Courts, and Banquet Hall in real time. Dynamic conflict detection eliminates double bookings permanently.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EAE2F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#6B21A8] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 0 Double Bookings
                </span>
                <span className="text-slate-400">12 Amenities</span>
              </div>
            </div>

            {/* 3. Priority Circulars & Notices */}
            <div className="p-7 rounded-3xl bg-[#F8F6FC] border border-[#EAE2F2] hover:border-[#6B21A8]/50 hover:shadow-lg transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">Digital Circulars & Notices</h3>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Broadcast urgent updates, AGM notices, and maintenance alerts with priority pinning. Committee members can track live read-receipts and resident acknowledgements.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EAE2F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#6B21A8] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 98% Read Receipt Rate
                </span>
                <span className="text-slate-400">Instant Broadcast</span>
              </div>
            </div>

            {/* 4. Events & Moderated Gallery */}
            <div className="p-7 rounded-3xl bg-[#F8F6FC] border border-[#EAE2F2] hover:border-[#6B21A8]/50 hover:shadow-lg transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">Events & Community Gallery</h3>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    RSVP to festival celebrations, yoga workshops, and sports tournaments. High-resolution community albums keep memories safe with admin photo moderation.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EAE2F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#6B21A8] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 1-Tap RSVP Tracking
                </span>
                <span className="text-slate-400">Social Hub</span>
              </div>
            </div>

            {/* 5. Gate Security Terminal */}
            <div className="p-7 rounded-3xl bg-[#F8F6FC] border border-[#EAE2F2] hover:border-[#6B21A8]/50 hover:shadow-lg transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">Rapid Security Terminal</h3>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Equip guards with a lightning-fast web terminal for license plate entry, walk-in registration, emergency intercom calls, and 1-tap gate lockdown triggers.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EAE2F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#6B21A8] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 24/7 Gate Monitored
                </span>
                <span className="text-slate-400">Security Gate 1</span>
              </div>
            </div>

            {/* 6. Transparent Audit & Finances */}
            <div className="p-7 rounded-3xl bg-[#F8F6FC] border border-[#EAE2F2] hover:border-[#6B21A8]/50 hover:shadow-lg transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">Audit Trails & Governance</h3>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Full transparency for committee audits. Track maintenance collections, generate downloadable financial statements, and log every administrative decision.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EAE2F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#6B21A8] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 100% Auditable Ledger
                </span>
                <span className="text-slate-400">Committee Tools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: AMENITIES (RESORT-STYLE AMENITIES CATALOG)
         ========================================================================= */}
      <section id="amenities" className="py-20 max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-xs font-bold text-[#6B21A8] border border-purple-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resort Living</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1326] tracking-tight">
              Curated World-Class Amenities
            </h2>
            <p className="text-sm text-[#6E6280]">
              Explore the luxurious spaces available to all Green Valley Residency residents. Check timings, capacity, and book in 1-tap.
            </p>
          </div>

          <button
            onClick={() => handleQuickDemoLogin('resident')}
            className="px-6 py-3 rounded-full bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <span>Book Amenity in Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Amenities Dynamic Grid from MySQL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(amenities.length > 0 ? amenities.slice(0, 6) : []).map((amenity) => (
            <div
              key={amenity.id}
              className="rounded-3xl bg-white border border-[#EAE2F2] overflow-hidden shadow-2xs hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <Image
                  src={amenity.coverImage}
                  alt={amenity.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-bold text-[#6B21A8]">
                  {amenity.category} • {amenity.location}
                </div>
                <div
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-[10px] font-bold capitalize ${
                    amenity.status === 'available'
                      ? 'bg-emerald-500'
                      : amenity.status === 'maintenance'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                >
                  {amenity.status}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">{amenity.name}</h3>
                  <p className="text-xs text-[#6E6280] mt-1.5 line-clamp-2">
                    {amenity.description}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-[#6E6280] border-t border-[#EAE2F2] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#6B21A8]" /> {amenity.operatingHours}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#6B21A8]" /> {amenity.capacity} Max Capacity
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickDemoLogin('resident')}
                  className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-[#6B21A8] text-[#6B21A8] hover:text-white font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  {amenity.status === 'available' ? 'Instant Book Slot' : 'View Schedule in Portal'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: DIRECT ACCESS (1-TAP ROLE SIMULATION)
         ========================================================================= */}
      <section id="access" className="py-20 bg-gradient-to-b from-white to-[#F8F6FC] border-t border-[#EAE2F2]">
        <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16">
          {/* Section Header */}
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-xs font-bold text-[#6B21A8] border border-purple-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Tap Test Drive</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1C1326] tracking-tight">
              Test Drive Apnaa From Every Perspective
            </h2>
            <p className="text-sm sm:text-base text-[#6E6280] leading-relaxed">
              No account creation or SMS OTP needed. Click any role below to launch the live platform backed by real-time MySQL data.
            </p>
          </div>

          {/* 4 Role Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Resident */}
            <div className="p-7 rounded-3xl bg-white border border-[#EAE2F2] shadow-2xs hover:shadow-xl hover:border-[#6B21A8] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md">
                    <Home className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-[#6B21A8]">
                    Resident
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">
                    {publicOverview?.personas.resident.name || 'Priya Sharma'}
                  </h3>
                  <p className="text-xs text-[#6B21A8] font-semibold">
                    Flat {publicOverview?.personas.resident.unit || 'A-1204'} • {publicOverview?.personas.resident.membershipType || 'Owner'}
                  </p>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Generate instant visitor QR passes, book badminton & pool slots, and RSVP to society festivals.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-[#F8F6FC] p-3 rounded-xl border border-[#EAE2F2]">
                  <p className="font-semibold text-[#1C1326]">Live MySQL State:</p>
                  <p>• {publicOverview?.stats.confirmedBookings ?? 2} Active Confirmed Bookings</p>
                  <p>• {publicOverview?.stats.expectedVisitors ?? 2} Expected / Approved Guests</p>
                  <p>• {publicOverview?.stats.upcomingEvents ?? 4} Upcoming Community Events</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('resident')}
                  className="w-full py-3 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Launch as Resident</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Admin */}
            <div className="p-7 rounded-3xl bg-white border border-[#EAE2F2] shadow-2xs hover:shadow-xl hover:border-[#6B21A8] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#2E1065] text-white flex items-center justify-center shadow-md">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-[#2E1065]">
                    Committee
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">
                    {publicOverview?.personas.admin.name || 'Rajesh Nair'}
                  </h3>
                  <p className="text-xs text-[#2E1065] font-semibold">
                    Flat {publicOverview?.personas.admin.unit || 'C-402'} • {publicOverview?.personas.admin.membershipType || 'Secretary'}
                  </p>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Manage {society.totalUnits || 180} resident units, broadcast priority circulars, moderate photo albums, and audit collections.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-[#F8F6FC] p-3 rounded-xl border border-[#EAE2F2]">
                  <p className="font-semibold text-[#1C1326]">Live MySQL State:</p>
                  <p>• {society.totalUnits || 180} Flats ({publicOverview?.stats.activeResidents ?? society.activeResidents} Active Accounts)</p>
                  <p>• {publicOverview?.stats.pendingVisitors ?? society.pendingApprovals} Pending Visitor Approvals</p>
                  <p>• {publicOverview?.stats.pendingMedia ?? 2} Pending Photos to Moderate</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="w-full py-3 rounded-xl bg-[#2E1065] hover:bg-[#1E0B45] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Launch as Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Security */}
            <div className="p-7 rounded-3xl bg-white border border-[#EAE2F2] shadow-2xs hover:shadow-xl hover:border-[#6B21A8] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                    Security
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">
                    {publicOverview?.personas.security.name || 'Vikram Singh'}
                  </h3>
                  <p className="text-xs text-slate-800 font-semibold">
                    {publicOverview?.personas.security.unit || 'Gate 1'} • {publicOverview?.personas.security.membershipType || 'Head Guard'}
                  </p>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Scan visitor QR passes, log vehicle license plates, verify walk-in deliveries, and trigger intercoms.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-[#F8F6FC] p-3 rounded-xl border border-[#EAE2F2]">
                  <p className="font-semibold text-[#1C1326]">Live MySQL State:</p>
                  <p>• Gate 1 Terminal Online</p>
                  <p>• {publicOverview?.stats.checkedInToday ?? 3} Visitor Entries Logged</p>
                  <p>• {publicOverview?.stats.pendingVisitors ?? 1} Walk-in Awaiting Resident OK</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('security')}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Launch Gate Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Facility */}
            <div className="p-7 rounded-3xl bg-white border border-[#EAE2F2] shadow-2xs hover:shadow-xl hover:border-[#6B21A8] transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shadow-md">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-[#6B21A8]">
                    Facility
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1C1326]">
                    {publicOverview?.personas.facility.name || 'Anand Verma'}
                  </h3>
                  <p className="text-xs text-[#6B21A8] font-semibold">
                    {publicOverview?.personas.facility.unit || 'Clubhouse'} • {publicOverview?.personas.facility.membershipType || 'Manager'}
                  </p>
                  <p className="text-xs text-[#6E6280] mt-2 leading-relaxed">
                    Oversee amenity hygiene, inspect party hall bookings, track sports equipment, and manage work orders.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-[#F8F6FC] p-3 rounded-xl border border-[#EAE2F2]">
                  <p className="font-semibold text-[#1C1326]">Live MySQL State:</p>
                  <p>• {publicOverview?.stats.availableAmenities ?? 8} Amenities Open for Slots</p>
                  <p>• {publicOverview?.stats.todaysBookings ?? 3} Active Bookings Today</p>
                  <p>• {society.activeClosures} Facility Under Maintenance</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('facility')}
                  className="w-full py-3 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Launch Facility Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign In Modal */}
      {loginOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-[#2E1065] text-white flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-300">Secure Resident Portal</p>
                <h3 className="text-lg font-bold mt-1">Sign in to Apnaa</h3>
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

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('password');
                    setError('');
                  }}
                  className={`py-2 rounded-lg transition-colors ${
                    loginMode === 'password' ? 'bg-white text-[#6B21A8] shadow-sm' : 'text-slate-500'
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
                    loginMode === 'otp' ? 'bg-white text-[#6B21A8] shadow-sm' : 'text-slate-500'
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
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
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
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] disabled:opacity-60 text-white text-xs font-semibold shadow-sm"
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
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
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
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs tracking-[0.4em] focus:outline-none focus:border-[#6B21A8]"
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
                    className="w-full py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] disabled:opacity-60 text-white text-xs font-semibold shadow-sm"
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
                      className="w-full text-[11px] font-semibold text-[#6B21A8] hover:underline"
                    >
                      Use a different number
                    </button>
                  )}
                </form>
              )}

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Protected by HTTP-only session cookies, rate limiting, and role-based access control.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="py-10 px-6 sm:px-10 lg:px-16 max-w-[1400px] w-full mx-auto border-t border-[#EAE2F2] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6E6280] gap-4">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="17" fill="#6B21A8" />
            <path d="M18 7C18 7 10 11.5 10 19C10 23 13.5 26 18 26C22.5 26 26 23 26 19C26 11.5 18 7 18 7Z" fill="#EDE9FE"/>
          </svg>
          <p>© 2026 Smart Society Management Platform • Green Valley Residency</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => scrollToSection('overview')} className="hover:text-[#6B21A8] transition-colors cursor-pointer">Overview</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-[#6B21A8] transition-colors cursor-pointer">Features</button>
          <button onClick={() => scrollToSection('amenities')} className="hover:text-[#6B21A8] transition-colors cursor-pointer">Amenities</button>
          <button onClick={() => scrollToSection('access')} className="hover:text-[#6B21A8] transition-colors cursor-pointer">Direct Access</button>
        </div>
      </footer>
    </div>
  );
}
