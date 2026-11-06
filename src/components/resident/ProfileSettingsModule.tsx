'use client';

import React, { useState, useEffect } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { QrCode, Pencil, PhoneCall, X, LogOut } from 'lucide-react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export function ProfileSettingsModule() {
  const { currentUser, updateUserProfile, logout } = useSociety();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [gender, setGender] = useState(currentUser.gender || 'Male');
  const [dob, setDob] = useState(currentUser.dateOfBirth || 'Not Available');
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [govtId, setGovtId] = useState(currentUser.govtIdNumber || '********435E');
  const [isPhonePublic, setIsPhonePublic] = useState(currentUser.isPhonePublic || false);
  const [isEmailPublic, setIsEmailPublic] = useState(currentUser.isEmailPublic || false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone);
    setBio(currentUser.bio || '');
    setGender(currentUser.gender || 'Not Specified');
    setDob(currentUser.dateOfBirth || 'Not Available');
    setBloodGroup(currentUser.bloodGroup || 'O+');
    setGovtId(currentUser.govtIdNumber || 'NOT_SET');
    setIsPhonePublic(currentUser.isPhonePublic || false);
    setIsEmailPublic(currentUser.isEmailPublic || false);
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile({
      name,
      email,
      phone,
      bio,
      gender,
      dateOfBirth: dob,
      bloodGroup,
      govtIdNumber: govtId,
      isPhonePublic,
      isEmailPublic,
    });
    setSaving(false);
    setEditModalOpen(false);
  };

  return (
    <div className="min-h-full bg-[#F2F2F5] -mx-3.5 -mt-1 pb-8 flex flex-col">
      {/* Top Bar: "My profile" + QR Icon */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between bg-[#E9E8EE]">
        <h1 className="text-base font-bold text-[#0E2628]">My profile</h1>
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="p-1.5 rounded-lg text-[#0E2628] hover:bg-black/5"
          aria-label="Show Profile QR"
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>

      {/* Sub-banner Preview Card behind sheet */}
      <div className="px-4 py-3 bg-[#E9E8EE] flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/60 bg-[#0D5C63] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {currentUser.avatar ? (
            <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
          ) : (
            <span>{currentUser.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-[#0E2628]">{currentUser.name}</p>
          <p className="text-[11px] text-slate-500">
            Flat {currentUser.unit} • {currentUser.wing}
          </p>
        </div>
      </div>

      {/* Main White Rounded Profile Sheet */}
      <div className="flex-1 bg-white rounded-t-[28px] shadow-sm px-5 pt-3 pb-8 space-y-6 -mt-1">
        {/* Top Handle */}
        <div className="w-10 h-1 rounded-full bg-[#073B3E] mx-auto" />

        {/* Centered Avatar + Name + PIN + Role */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-[#E6F3F3] bg-[#0D5C63] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentUser.avatar ? (
              <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
            ) : (
              <span>{currentUser.name.charAt(0)}</span>
            )}
          </div>
          <h2 className="text-sm font-bold text-[#0E2628] pt-1">{currentUser.name}</h2>
          <p className="text-xs font-bold text-[#0E2628]">PIN : {currentUser.pinCode || '107864'}</p>
          <p className="text-[11px] text-slate-400">
            Registered {currentUser.membershipType} • Resident • {currentUser.unit}
          </p>
        </div>

        {/* Section 1: Profile bio */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0E2628]">Profile bio</h3>
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="p-1 text-slate-400 hover:text-[#0D5C63]"
              aria-label="Edit profile bio"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gender:</span>
              <span className="font-semibold text-[#0E2628]">{gender}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Date of birth:</span>
              <span className="font-semibold text-[#0E2628]">{dob}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Blood Group:</span>
              <span className="font-semibold text-[#0E2628]">{bloodGroup}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Govt. ID Number:</span>
              <span className="font-semibold text-[#0E2628] font-mono">{govtId}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Contact details */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0E2628]">Contact details</h3>
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="p-1 text-slate-400 hover:text-[#0D5C63]"
              aria-label="Edit contact details"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Phone Number:</span>
              <span className="font-semibold text-[#0E2628] flex items-center gap-1.5">
                <span>{currentUser.phone}</span>
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email ID:</span>
              <span className="font-semibold text-[#0E2628]">{currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Unit number */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <h3 className="text-sm font-bold text-[#0E2628]">Unit number</h3>
          <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-slate-200/70 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#0E2628]">
                Flat {currentUser.unit} ({currentUser.wing})
              </p>
              <p className="text-[11px] text-slate-500">Westend Heights D... • Apnaa Society</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#E6F3F3] text-[#0D5C63] text-[10px] font-bold">
              {currentUser.membershipType}
            </span>
          </div>
        </div>

        {/* Section 4: Logout Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout & Return to Home Screen</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <form
            onSubmit={handleSaveProfile}
            className="w-full bg-white rounded-t-[28px] p-5 space-y-3.5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0E2628]">Edit Profile &amp; Contact</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender</label>
                  <input
                    type="text"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Govt. ID Number
                  </label>
                  <input
                    type="text"
                    value={govtId}
                    onChange={(e) => setGovtId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="py-2.5 rounded-full border border-[#0D5C63] text-[#0D5C63] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 rounded-full bg-[#0D5C63] hover:bg-[#073B3E] text-white text-xs font-bold disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving to Database...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resident QR Modal */}
      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full bg-white rounded-t-[28px] p-5 text-center space-y-4">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#0E2628]">Resident Digital PIN &amp; QR</h3>
            <div className="p-3 rounded-2xl border-2 border-dashed border-[#0D5C63]/40 inline-block">
              <QRCodeSVG value={`APNAA-RESIDENT-${currentUser.unit}-107864`} size={148} />
            </div>
            <p className="text-xs font-bold text-[#0D5C63]">PIN : 107864</p>
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
