'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Lock, Bell } from 'lucide-react';
import Image from 'next/image';

export function ProfileSettingsModule() {
  const { currentUser, updateUserProfile } = useSociety();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [isPhonePublic, setIsPhonePublic] = useState(currentUser.isPhonePublic || false);
  const [isEmailPublic, setIsEmailPublic] = useState(currentUser.isEmailPublic || false);

  const [notifVisitor, setNotifVisitor] = useState(true);
  const [notifBookings, setNotifBookings] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      bio,
      isPhonePublic,
      isEmailPublic,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
          Household Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
          Manage your personal details, household preferences, and directory visibility rules.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EAE2F2] p-6 sm:p-8 shadow-sm space-y-8">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-[#EAE2F2]">
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-2 border-purple-300 flex-shrink-0 shadow-sm">
            <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
              <span className="text-xs font-bold uppercase bg-purple-50 text-[#6B21A8] px-2.5 py-0.5 rounded-full">
                {currentUser.membershipType}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#6B21A8] mt-0.5">
              Flat {currentUser.unit} • {currentUser.wing}
            </p>
            <p className="text-xs text-slate-500 mt-1">{currentUser.societyName}</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <h3 className="font-bold text-base text-slate-900">Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#6B21A8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Flat & Unit
              </label>
              <input
                type="text"
                disabled
                value={`Flat ${currentUser.unit} (${currentUser.wing})`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs sm:text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Unit assignment is verified by the society administration.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#6B21A8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registered Mobile
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#6B21A8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Bio / Community Introduction
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#6B21A8]"
            />
          </div>

          {/* Privacy Controls Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#6B21A8]" />
              <span>Directory Privacy Controls</span>
            </h3>
            <p className="text-xs text-slate-500">
              Control what information fellow residents can view in the member directory.
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Make Mobile Phone Public</p>
                  <p className="text-[11px] text-slate-500">
                    If disabled, your phone number will be hidden in the community directory.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPhonePublic}
                  onChange={(e) => setIsPhonePublic(e.target.checked)}
                  className="rounded text-[#6B21A8] focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Make Email Address Public</p>
                  <p className="text-[11px] text-slate-500">
                    If disabled, only administrators can contact you by email.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isEmailPublic}
                  onChange={(e) => setIsEmailPublic(e.target.checked)}
                  className="rounded text-[#6B21A8] focus:ring-0 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6B21A8]" />
              <span>In-App Notification Preferences</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Visitor Gate Arrival Alerts</p>
                  <p className="text-[11px] text-slate-500">
                    Receive instant 1-tap approval alerts when guests arrive at Gate 1.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifVisitor}
                  onChange={(e) => setNotifVisitor(e.target.checked)}
                  className="rounded text-[#6B21A8] focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Amenity Slot Reminders</p>
                  <p className="text-[11px] text-slate-500">
                    Reminders 1 hour before your confirmed swimming or sports session.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifBookings}
                  onChange={(e) => setNotifBookings(e.target.checked)}
                  className="rounded text-[#6B21A8] focus:ring-0 w-4 h-4"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
