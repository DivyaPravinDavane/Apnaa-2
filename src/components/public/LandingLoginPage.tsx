'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { UserRole } from '@/types';
import {
  User,
  ShieldCheck,
  Calendar,
  Lock,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';

interface LandingLoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

export function LandingLoginPage({ onLoginSuccess }: LandingLoginPageProps) {
  const { setRole } = useSociety();
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('8492');

  const handleQuickDemoLogin = (role: UserRole) => {
    setRole(role);
    onLoginSuccess(role);
  };

  const handleContinueAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpStep) {
      setIsOtpStep(true);
    } else {
      handleQuickDemoLogin('resident');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6FC] text-[#1C1326] flex flex-col justify-between selection:bg-[#6B21A8] selection:text-white">
      {/* 1. TOP NAVBAR */}
      <nav className="h-20 px-6 sm:px-10 lg:px-16 flex items-center justify-between bg-transparent max-w-[1400px] w-full mx-auto relative z-20">
        {/* Brand Logo with Twin Leaves Emblem */}
        <div className="flex items-center gap-3">
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

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-9 text-[13px] font-semibold text-[#1C1326]">
          <a
            href="#home"
            className="text-[#6B21A8] underline underline-offset-8 decoration-2 decoration-[#6B21A8]"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-[#6E6280] hover:text-[#6B21A8] transition-colors"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-[#6E6280] hover:text-[#6B21A8] transition-colors"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-[#6E6280] hover:text-[#6B21A8] transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Right Login Pill */}
        <div>
          <button
            onClick={() => handleQuickDemoLogin('resident')}
            className="px-6 py-2 rounded-full bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Login
          </button>
        </div>
      </nav>

      {/* 2. MAIN HERO SECTION */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-4 lg:py-8 relative flex flex-col justify-between">
        <div className="relative min-h-[580px] lg:min-h-[600px] flex flex-col justify-center">
          {/* Background 3D Architectural Isometric Campus - Center Right */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[65%] h-full pointer-events-none select-none overflow-hidden">
            <Image
              src="/images/smart_society_campus_isometric.jpg"
              alt="Smart Society Isometric 3D Architectural Campus"
              fill
              className="object-cover object-center lg:object-[left_center]"
              priority
            />
            {/* Seamless gradient blend on the left edge melting into #F8F6FC */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8F6FC] via-[#F8F6FC]/85 lg:via-[#F8F6FC]/40 to-transparent" />
            {/* Soft blend on the top */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F8F6FC] to-transparent" />
            {/* Soft blend on the bottom */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F8F6FC] to-transparent" />
          </div>

          {/* Grid Layout: Left Content (Hero text, Features, Actions) & Right (Floating Login Card) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 pt-2 lg:pt-0">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[62px] font-bold text-[#1C1326] tracking-tight leading-[1.08]">
                A Smarter<br />
                Way to Live Together
              </h1>

              <p className="text-sm sm:text-base text-[#6E6280] max-w-md leading-relaxed">
                Modern society management, seamless visitor access, amenity booking and a stronger community — all in one place.
              </p>

              {/* 4 Feature Badges with Delicate Circular Outlines */}
              <div className="grid grid-cols-4 gap-3 sm:gap-5 max-w-lg pt-2">
                {/* 1. Visitor Management */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full border border-[#D8C7EE] bg-white/70 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                    Visitor<br />Management
                  </span>
                </div>

                {/* 2. Amenity Booking */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full border border-[#D8C7EE] bg-white/70 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs">
                    <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                    Amenity<br />Booking
                  </span>
                </div>

                {/* 3. Community Events */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full border border-[#D8C7EE] bg-white/70 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs">
                    <Calendar className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                    Community<br />Events
                  </span>
                </div>

                {/* 4. Secure Access */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full border border-[#D8C7EE] bg-white/70 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs">
                    <Lock className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                    Secure<br />Access
                  </span>
                </div>
              </div>

              {/* Action Buttons: Get Started & Learn More */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => handleQuickDemoLogin('resident')}
                  className="px-7 py-3 rounded-full bg-[#6B21A8] hover:bg-[#581C87] text-white font-semibold text-xs tracking-wide shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Get Started
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('resident')}
                  className="px-7 py-3 rounded-full border border-[#D8C7EE] bg-transparent hover:bg-white/80 text-[#1C1326] font-semibold text-xs tracking-wide transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Column: Floating "Welcome Back" Login Card (5 cols) */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-w-[380px] bg-white rounded-[28px] p-7 sm:p-8 shadow-[0_20px_50px_rgba(40,15,60,0.08)] border border-white space-y-5">
                {/* Heading & Subtitle */}
                <div>
                  <h2 className="font-serif text-[26px] font-bold text-[#1C1326] tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-[#6E6280] mt-1">
                    Login to your Smart Society account
                  </p>
                </div>

                {/* Segmented Switcher (Mobile / Email) */}
                <div className="flex p-1 bg-[#F1ECF9] rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('mobile');
                      setIsOtpStep(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      authMethod === 'mobile'
                        ? 'bg-white text-[#6B21A8] shadow-2xs font-semibold'
                        : 'text-[#6E6280] hover:text-[#1C1326]'
                    }`}
                  >
                    Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('email');
                      setIsOtpStep(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      authMethod === 'email'
                        ? 'bg-white text-[#6B21A8] shadow-2xs font-semibold'
                        : 'text-[#6E6280] hover:text-[#1C1326]'
                    }`}
                  >
                    Email
                  </button>
                </div>

                {/* Input Field & Submit */}
                <form onSubmit={handleContinueAuth} className="space-y-4">
                  {!isOtpStep ? (
                    authMethod === 'mobile' ? (
                      <div className="flex items-center border border-[#E4D7F2] rounded-xl overflow-hidden focus-within:border-[#6B21A8] bg-white transition-colors">
                        <button
                          type="button"
                          className="px-3 py-2.5 bg-slate-50/60 border-r border-[#E4D7F2] text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-default"
                        >
                          <span>+91</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="Enter mobile number"
                          className="flex-1 px-3 py-2.5 text-xs focus:outline-none placeholder:text-slate-400 text-slate-800"
                        />
                      </div>
                    ) : (
                      <div className="border border-[#E4D7F2] rounded-xl overflow-hidden focus-within:border-[#6B21A8] bg-white transition-colors">
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="Enter registered email"
                          className="w-full px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-slate-400 text-slate-800"
                        />
                      </div>
                    )
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Enter OTP (Demo: 8492)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#6B21A8] text-center font-mono font-bold text-lg tracking-widest text-[#6B21A8]"
                      />
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-semibold text-xs tracking-wide shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {isOtpStep ? 'Verify & Enter' : 'Continue'}
                  </button>
                </form>

                {/* Subtext */}
                <p className="text-[11px] text-center text-[#6E6280]">
                  Don&apos;t have an account?{' '}
                  <span
                    onClick={() => handleQuickDemoLogin('resident')}
                    className="text-[#6B21A8] font-semibold hover:underline cursor-pointer"
                  >
                    Contact your society admin
                  </span>
                </p>

                {/* 1-Tap Quick Demo Role Access for easy reviewer testing */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      1-Tap Demo Roles
                    </span>
                    <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      Instant Access
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-left">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('resident')}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left cursor-pointer"
                    >
                      <p className="text-[11px] font-bold text-slate-900">Resident</p>
                      <p className="text-[9px] text-slate-500 truncate">Priya (A-1204)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin')}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left cursor-pointer"
                    >
                      <p className="text-[11px] font-bold text-slate-900">Admin</p>
                      <p className="text-[9px] text-slate-500 truncate">Rajesh (C-402)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('security')}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left cursor-pointer"
                    >
                      <p className="text-[11px] font-bold text-slate-900">Security</p>
                      <p className="text-[9px] text-slate-500 truncate">Gate 1 Terminal</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('facility')}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left cursor-pointer"
                    >
                      <p className="text-[11px] font-bold text-slate-900">Facility</p>
                      <p className="text-[9px] text-slate-500 truncate">Clubhouse Desk</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM STATS BAR */}
        <div className="pt-8 lg:pt-10 max-w-xl space-y-3 relative z-10">
          <p className="text-xs text-[#6E6280] font-medium">
            Trusted by Modern Communities
          </p>

          <div className="grid grid-cols-4 gap-6 text-left">
            <div>
              <p className="text-3xl font-bold text-[#1C1326]">500+</p>
              <p className="text-[11px] text-[#6E6280]">Happy Families</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-[#1C1326]">12</p>
              <p className="text-[11px] text-[#6E6280]">Amenities</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-[#1C1326]">24/7</p>
              <p className="text-[11px] text-[#6E6280]">Security</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-[#1C1326]">100%</p>
              <p className="text-[11px] text-[#6E6280]">Community Focus</p>
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="py-6 px-6 sm:px-10 lg:px-16 max-w-[1400px] w-full mx-auto border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
        <p>© 2026 Smart Society Management Platform • Green Valley Residency</p>
        <p>Connected • Secure • Together</p>
      </footer>
    </div>
  );
}
