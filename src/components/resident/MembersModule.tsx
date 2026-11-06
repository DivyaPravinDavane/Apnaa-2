'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Search, Mail, Phone, Lock, X } from 'lucide-react';
import Image from 'next/image';

export function MembersModule() {
  const { members, currentUser, currentRole } = useSociety();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('All');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const wings = ['All', 'A Wing', 'B Wing', 'C Wing', 'D Wing'];

  const activeMembers = members.filter((m) => m.isActive !== false);

  const filteredMembers = activeMembers.filter((m) => {
    if (selectedWing !== 'All' && m.wing !== selectedWing) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.unit.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        m.interests.some((i) => i.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedMember = selectedMemberId
    ? activeMembers.find((m) => m.id === selectedMemberId) || null
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E2628]">
          Member Directory
        </h1>
        <p className="text-xs sm:text-sm text-[#4E6E70] mt-1">
          Connect with {activeMembers.length} active neighbors and committee representatives. Private contact details are protected in compliance with society privacy rules.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5EAEB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {wings.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWing(w)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedWing === w
                  ? 'bg-[#0D5C63] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, flat, or interests..."
            className="w-full pl-9 pr-4 py-2 bg-[#F4F9F9] border border-[#D5EAEB] rounded-xl text-xs focus:outline-none focus:border-[#0D5C63]"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMemberId(member.id)}
            className="p-5 rounded-3xl bg-white border border-[#D5EAEB] hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 bg-purple-100 flex items-center justify-center text-[#0D5C63] font-bold text-lg">
                {member.avatar ? (
                  <Image src={member.avatar} alt={member.name} fill className="object-cover" unoptimized />
                ) : (
                  <span>{member.name.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-slate-900 truncate">{member.name}</h3>
                <p className="text-xs font-semibold text-[#0D5C63]">Flat {member.unit}</p>
                <p className="text-[11px] text-slate-400">{member.wing} • {member.floor}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>

            {/* Interest Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              {(member.interests.length > 0 ? member.interests : ['Community']).map((interest, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-purple-100 text-[#0D5C63] font-medium px-2 py-0.5 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border bg-purple-100 flex items-center justify-center text-[#0D5C63] font-bold text-xl">
                  {selectedMember.avatar ? (
                    <Image src={selectedMember.avatar} alt={selectedMember.name} fill className="object-cover" unoptimized />
                  ) : (
                    <span>{selectedMember.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{selectedMember.name}</h3>
                  <p className="text-xs font-semibold text-[#0D5C63]">Flat {selectedMember.unit} ({selectedMember.wing})</p>
                  <p className="text-[11px] text-slate-500">{selectedMember.role}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMemberId(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-[#F4F9F9] p-3 rounded-2xl">
              &ldquo;{selectedMember.bio}&rdquo;
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-4 h-4 text-[#0D5C63]" />
                  <span>Email Address</span>
                </span>
                {selectedMember.isEmailPublic || currentRole === 'admin' || selectedMember.unit === currentUser.unit ? (
                  <span className="font-semibold text-slate-800">{selectedMember.email}</span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 italic">
                    <Lock className="w-3 h-3" />
                    Hidden for privacy
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-4 h-4 text-[#0D5C63]" />
                  <span>Mobile Phone</span>
                </span>
                {selectedMember.isPhonePublic || currentRole === 'admin' || selectedMember.unit === currentUser.unit ? (
                  <span className="font-semibold text-slate-800">{selectedMember.phone}</span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 italic">
                    <Lock className="w-3 h-3" />
                    Hidden for privacy
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                Community Passions & Hobbies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(selectedMember.interests.length > 0 ? selectedMember.interests : ['Community']).map((int, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-100 text-[#0D5C63] font-semibold px-2.5 py-1 rounded-full"
                  >
                    {int}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedMemberId(null)}
              className="w-full py-2.5 rounded-xl bg-[#0D5C63] text-white text-xs font-semibold hover:bg-[#094449]"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
