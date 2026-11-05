'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Visitor, VisitorStatus } from '@/types';
import {
  Users,
  Search,
  Plus,
  QrCode,
  Clock,
  Car,
  X,
  Copy,
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function VisitorsModule() {
  const { visitors, currentUser, currentRole, approveVisitor, denyVisitor, createVisitor, addToast } = useSociety();
  const [activeTab, setActiveTab] = useState<'expected' | 'pending' | 'completed' | 'denied' | 'all'>('expected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState<Visitor | null>(null);

  // Form State for "Invite Visitor"
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    visitDate: new Date().toISOString().split('T')[0],
    arrivalTime: '10:00 AM',
    purpose: 'Personal Visit',
    visitorCount: 1,
    vehicleType: 'Car' as 'None' | 'Two-Wheeler' | 'Car',
    vehicleNumber: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter visitors (Admin sees all society visitors from MySQL; Resident sees their own unit)
  const myVisitors = currentRole === 'admin' ? visitors : visitors.filter((v) => v.unit === currentUser.unit);

  const filteredVisitors = myVisitors.filter((v) => {
    // Tab filter
    if (activeTab === 'expected' && v.status !== 'expected' && v.status !== 'approved') return false;
    if (activeTab === 'pending' && v.status !== 'pending') return false;
    if (activeTab === 'completed' && v.status !== 'checked_in' && v.status !== 'checked_out') return false;
    if (activeTab === 'denied' && v.status !== 'denied' && v.status !== 'cancelled') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.passCode.toLowerCase().includes(q) ||
        v.purpose.toLowerCase().includes(q) ||
        v.phone.includes(q)
      );
    }
    return true;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Visitor name is required';
    if (!formData.phone.trim()) errors.phone = 'Mobile number is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      const newVis = createVisitor({
        ...formData,
        unit: currentUser.unit,
        residentId: currentUser.id,
        residentName: currentUser.name,
      });

      setIsSubmitting(false);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        visitDate: new Date().toISOString().split('T')[0],
        arrivalTime: '10:00 AM',
        purpose: 'Personal Visit',
        visitorCount: 1,
        vehicleType: 'Car',
        vehicleNumber: '',
        notes: '',
      });

      // Show the newly generated pass immediately
      setSelectedVisitorForPass(newVis);
    }, 400);
  };

  const getStatusBadge = (status: VisitorStatus) => {
    switch (status) {
      case 'expected':
      case 'approved':
        return (
          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            Expected
          </span>
        );
      case 'pending':
        return (
          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
            Pending
          </span>
        );
      case 'checked_in':
        return (
          <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
            Inside Complex
          </span>
        );
      case 'checked_out':
        return (
          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            Completed
          </span>
        );
      case 'denied':
        return (
          <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
            Denied
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E2628]">
          Visitor Management
        </h1>
        <p className="text-xs sm:text-sm text-[#4E6E70] mt-1">
          Manage visitor requests, pre-approvals, and generate digital gate passes for Flat {currentUser.unit}.
        </p>
      </div>

      {/* Main Grid: Left Visitor List, Right Invite Visitor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#D5EAEB] overflow-x-auto text-xs">
            {(['expected', 'pending', 'completed', 'denied', 'all'] as const).map((tab) => {
              const count = myVisitors.filter((v) => {
                if (tab === 'expected') return v.status === 'expected' || v.status === 'approved';
                if (tab === 'pending') return v.status === 'pending';
                if (tab === 'completed') return v.status === 'checked_in' || v.status === 'checked_out';
                if (tab === 'denied') return v.status === 'denied' || v.status === 'cancelled';
                return true;
              }).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-[#0D5C63] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by visitor name, pass code (e.g. V-9421), or purpose..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D5EAEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0D5C63]"
            />
          </div>

          {/* Visitor Cards List */}
          <div className="space-y-3">
            {filteredVisitors.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white border border-[#D5EAEB] text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">No visitors found in this tab</p>
                <p className="text-xs text-slate-400 mt-1">
                  Use the invite form on the right to pre-approve upcoming guests.
                </p>
              </div>
            ) : (
              filteredVisitors.map((vis) => (
                <div
                  key={vis.id}
                  className="p-4 rounded-2xl bg-white border border-[#D5EAEB] hover:border-[#0D5C63]/30 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-[#0D5C63] flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {vis.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#0E2628]">{vis.name}</h4>
                        {getStatusBadge(vis.status)}
                      </div>
                      <p className="text-xs text-[#4E6E70] mt-0.5">
                        Purpose: <span className="font-medium text-slate-800">{vis.purpose}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#0D5C63]" />
                          {vis.visitDate} • {vis.arrivalTime}
                        </span>
                        {vis.vehicleNumber && (
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Car className="w-3 h-3 text-[#0D5C63]" />
                            {vis.vehicleNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {vis.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => denyVisitor(vis.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Deny
                        </button>
                        <button
                          onClick={() => approveVisitor(vis.id)}
                          className="px-4 py-1.5 rounded-lg bg-[#0D5C63] text-white hover:bg-[#094449] text-xs font-semibold shadow-sm"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedVisitorForPass(vis)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#0D5C63] text-xs font-semibold transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pass ({vis.passCode})</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: "Invite Visitor" Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#D5EAEB] shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D5EAEB]">
            <div className="p-2 rounded-xl bg-purple-50 text-[#0D5C63]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0E2628]">Invite Visitor</h3>
              <p className="text-xs text-[#4E6E70]">Generate pre-approved gate pass</p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visitor Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rohan Mehta"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                  formErrors.name
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-[#D5EAEB] focus:border-[#0D5C63]'
                }`}
              />
              {formErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                  formErrors.phone
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-[#D5EAEB] focus:border-[#0D5C63]'
                }`}
              />
              {formErrors.phone && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Visit Date & Arrival Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5EAEB] text-xs focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Arrival Time
                </label>
                <select
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5EAEB] text-xs focus:outline-none focus:border-[#0D5C63] bg-white"
                >
                  <option>8:00 AM</option>
                  <option>10:00 AM</option>
                  <option>12:00 PM</option>
                  <option>2:00 PM</option>
                  <option>4:00 PM</option>
                  <option>6:00 PM</option>
                  <option>8:00 PM</option>
                </select>
              </div>
            </div>

            {/* Purpose & Visitor Count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5EAEB] text-xs focus:outline-none focus:border-[#0D5C63] bg-white"
                >
                  <option>Personal Visit</option>
                  <option>Family & Friends</option>
                  <option>Delivery</option>
                  <option>Maintenance / Service</option>
                  <option>Official / Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Guests Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.visitorCount}
                  onChange={(e) => setFormData({ ...formData, visitorCount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5EAEB] text-xs focus:outline-none focus:border-[#0D5C63]"
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleType: e.target.value as 'None' | 'Two-Wheeler' | 'Car',
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5EAEB] text-xs focus:outline-none focus:border-[#0D5C63] bg-white"
                >
                  <option>Car</option>
                  <option>Two-Wheeler</option>
                  <option>None</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reg. Number
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. MH 02 AB 1234"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5EAEB] text-xs focus:outline-none focus:border-[#0D5C63] uppercase font-mono"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional instructions for gate security..."
                className="w-full px-3 py-2 rounded-xl border border-[#D5EAEB] text-xs focus:outline-none focus:border-[#0D5C63]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#0D5C63] hover:bg-[#094449] text-white font-semibold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Generating Pass...' : 'Submit Request & Generate Pass'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Visitor Digital Pass Modal */}
      {selectedVisitorForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full">
                Digital Gate Pass
              </span>
              <button
                onClick={() => setSelectedVisitorForPass(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">{selectedVisitorForPass.name}</h3>
              <p className="text-xs text-slate-500">
                Authorized entry to Flat {selectedVisitorForPass.unit}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-purple-200 inline-block shadow-inner">
              <QRCodeSVG
                value={`PASS-${selectedVisitorForPass.passCode}-${selectedVisitorForPass.unit}`}
                size={160}
                level="M"
                includeMargin
              />
              <p className="font-mono text-base font-bold text-[#0D5C63] mt-2 tracking-widest">
                {selectedVisitorForPass.passCode}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-left text-xs space-y-1.5 text-slate-600">
              <p className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-semibold text-slate-800">
                  {selectedVisitorForPass.visitDate} ({selectedVisitorForPass.arrivalTime})
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Guests:</span>
                <span className="font-semibold text-slate-800">{selectedVisitorForPass.visitorCount}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {selectedVisitorForPass.vehicleNumber || 'None'}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Host:</span>
                <span className="font-semibold text-slate-800">{selectedVisitorForPass.residentName}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedVisitorForPass.passCode);
                  addToast('Pass Code Copied', `Code ${selectedVisitorForPass.passCode} copied to clipboard!`);
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Code
              </button>
              <button
                onClick={() => setSelectedVisitorForPass(null)}
                className="flex-1 py-2 rounded-xl bg-[#0D5C63] hover:bg-[#094449] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
