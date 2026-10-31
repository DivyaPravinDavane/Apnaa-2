'use client';

import React from 'react';
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
} from 'lucide-react';
import Image from 'next/image';

interface LandingLoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

export function LandingLoginPage({ onLoginSuccess }: LandingLoginPageProps) {
  const { setRole } = useSociety();

  const handleQuickDemoLogin = (role: UserRole) => {
    setRole(role);
    onLoginSuccess(role);
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
            Overview
          </a>
          <a
            href="#features"
            className="text-[#6E6280] hover:text-[#6B21A8] transition-colors"
          >
            Features
          </a>
          <a
            href="#amenities"
            className="text-[#6E6280] hover:text-[#6B21A8] transition-colors"
          >
            Amenities
          </a>
          <a
            href="#access"
            className="text-[#6E6280] hover:text-[#6B21A8] transition-colors"
          >
            Direct Access
          </a>
        </div>

        {/* Right CTA Button */}
        <div>
          <button
            onClick={() => handleQuickDemoLogin('resident')}
            className="px-6 py-2.5 rounded-full bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enter Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. MAIN HERO SECTION */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-4 lg:py-6 relative flex flex-col justify-center">
        {/* Grid Layout: Left Content & Right Clear Campus Showcase */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content Column (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6 pt-2 lg:pt-0">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/70 border border-purple-200/80 text-xs font-semibold text-[#6B21A8]">
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

            {/* 4 Feature Badges with Delicate Circular Outlines */}
            <div className="grid grid-cols-4 gap-3 max-w-md pt-1">
              {/* 1. Visitor Management */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs hover:scale-105 transition-transform">
                  <User className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Visitor<br />Passes
                </span>
              </div>

              {/* 2. Amenity Booking */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Amenity<br />Booking
                </span>
              </div>

              {/* 3. Community Events */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Events &<br />Notices
                </span>
              </div>

              {/* 4. Secure Access */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-full border border-[#D8C7EE] bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#6B21A8] shadow-2xs hover:scale-105 transition-transform">
                  <Lock className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#1C1326] leading-tight">
                  Gate<br />Security
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={() => handleQuickDemoLogin('resident')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-semibold text-sm tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Enter Smart Society Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Instant Role Access - No Login Required */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6280]">
                  Instant Role Access
                </span>
                <span className="text-[9px] font-bold text-[#6B21A8] bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                  1-Tap Demo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-md">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('resident')}
                  className="p-2.5 rounded-xl border border-purple-200/90 bg-white hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left shadow-2xs flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-[#6B21A8] text-[#6B21A8] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1C1326]">Resident</p>
                    <p className="text-[10px] text-[#6E6280] truncate">Priya (A-1204)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="p-2.5 rounded-xl border border-purple-200/90 bg-white hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left shadow-2xs flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-[#6B21A8] text-[#6B21A8] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1C1326]">Admin</p>
                    <p className="text-[10px] text-[#6E6280] truncate">Rajesh (C-402)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('security')}
                  className="p-2.5 rounded-xl border border-purple-200/90 bg-white hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left shadow-2xs flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-[#6B21A8] text-[#6B21A8] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1C1326]">Security</p>
                    <p className="text-[10px] text-[#6E6280] truncate">Gate 1 Terminal</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('facility')}
                  className="p-2.5 rounded-xl border border-purple-200/90 bg-white hover:border-[#6B21A8] hover:bg-purple-50/50 transition-all text-left shadow-2xs flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-[#6B21A8] text-[#6B21A8] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1C1326]">Facility</p>
                    <p className="text-[10px] text-[#6E6280] truncate">Clubhouse Desk</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 100% CLEAR, Crisp 3D Campus Architectural Showcase (7 cols on lg) */}
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
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Green Valley Residency • 3D Campus View</span>
              </div>

              {/* Floating Amenities Highlights Badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 px-4 py-2 rounded-full bg-[#2E1065]/90 backdrop-blur-md text-white text-xs font-medium shadow-md flex items-center gap-2">
                <span>Clubhouse • Swimming Pool • Gate Security</span>
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
