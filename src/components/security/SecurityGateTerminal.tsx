'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Visitor } from '@/types';
import {
  Shield,
  QrCode,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  X,
  LogOut,
  Camera
} from 'lucide-react';

export function SecurityGateTerminal() {
  const {
    visitors,
    securityLogs,
    checkInVisitor,
    checkOutVisitor,
    createVisitor,
    currentUser,
    addToast
  } = useSociety();

  const [activeModal, setActiveModal] = useState<'scan' | 'register' | 'lookup' | null>(null);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    visitor?: Visitor;
    message?: string;
  } | null>(null);

  // Walk-in Registration form
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinUnit, setWalkinUnit] = useState('A-1204');
  const [walkinPurpose, setWalkinPurpose] = useState('Delivery');
  const [walkinVehicle, setWalkinVehicle] = useState('');

  // Scanning simulation
  const [, setIsSimulatingScan] = useState(false);

  // Stats
  const expectedCount = visitors.filter((v) => v.status === 'expected' || v.status === 'approved').length;
  const pendingCount = visitors.filter((v) => v.status === 'pending').length;
  const entriesCount = securityLogs.filter((l) => l.status === 'entry').length;
  const exitsCount = securityLogs.filter((l) => l.status === 'exit').length;

  const handleLookup = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const vis = visitors.find(
      (v) => v.passCode.toUpperCase() === trimmed || v.id === code
    );

    if (vis) {
      setLookupResult({ found: true, visitor: vis });
    } else {
      setLookupResult({
        found: false,
        message: `No active pass found matching "${trimmed}". Verify the code with the visitor.`,
      });
    }
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) {
      addToast('Validation Error', 'Name and Phone are required for gate registration', 'error');
      return;
    }

    const created = createVisitor({
      name: walkinName,
      phone: walkinPhone,
      unit: walkinUnit,
      purpose: walkinPurpose,
      vehicleType: walkinVehicle ? 'Car' : 'None',
      vehicleNumber: walkinVehicle,
      visitorCount: 1,
    });

    setActiveModal(null);
    setWalkinName('');
    setWalkinPhone('');
    setWalkinVehicle('');

    // Open lookup result right away
    setLookupResult({
      found: true,
      visitor: created,
    });
  };

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* High-Contrast Gate Terminal Header */}
      <div className="p-6 rounded-3xl bg-[#240B3B] text-white border border-purple-800/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6B21A8] text-purple-200 flex items-center justify-center font-bold text-xl shadow-md">
            G1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Gate 1 Terminal • Main Entrance
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Officer On Duty: <strong className="text-white">{currentUser.name}</strong> • Green Valley Residency
            </p>
          </div>
        </div>

        <div className="text-right self-end md:self-center">
          <p className="text-2xl font-mono font-bold text-purple-300">{currentTime}</p>
          <p className="text-xs text-purple-300/80">{currentDate}</p>
        </div>
      </div>

      {/* 4 Large High-Impact Touch Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveModal('scan');
            setIsSimulatingScan(true);
          }}
          className="p-5 rounded-3xl bg-[#6B21A8] hover:bg-[#581C87] text-white shadow-md active:scale-95 transition-all text-left flex flex-col justify-between h-36 border border-purple-500/40"
        >
          <div className="p-2.5 rounded-2xl bg-white/10 w-fit">
            <QrCode className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Scan Pass</h3>
            <p className="text-xs text-purple-200/80 mt-0.5">Camera / Optical QR Reader</p>
          </div>
        </button>

        <button
          onClick={() => setActiveModal('register')}
          className="p-5 rounded-3xl bg-[#4C1D95] hover:bg-[#3B1578] text-white shadow-md active:scale-95 transition-all text-left flex flex-col justify-between h-36 border border-purple-600/40"
        >
          <div className="p-2.5 rounded-2xl bg-white/10 w-fit">
            <UserPlus className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Register Visitor</h3>
            <p className="text-xs text-purple-200/80 mt-0.5">Walk-in approval request</p>
          </div>
        </button>

        <button
          onClick={() => setActiveModal('lookup')}
          className="p-5 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95 transition-all text-left flex flex-col justify-between h-36 border border-slate-700"
        >
          <div className="p-2.5 rounded-2xl bg-white/10 w-fit">
            <Search className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Manual Lookup</h3>
            <p className="text-xs text-slate-400 mt-0.5">Search by code e.g. V-9421</p>
          </div>
        </button>

        <button
          onClick={() => {
            const firstCheckedIn = visitors.find((v) => v.status === 'checked_in');
            if (firstCheckedIn) {
              checkOutVisitor(firstCheckedIn.id);
            } else {
              addToast('No Guests Inside', 'There are no active visitors checked in at Gate 1.', 'info');
            }
          }}
          className="p-5 rounded-3xl bg-slate-800 hover:bg-slate-700 text-white shadow-md active:scale-95 transition-all text-left flex flex-col justify-between h-36 border border-slate-700"
        >
          <div className="p-2.5 rounded-2xl bg-white/10 w-fit">
            <LogOut className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Quick Exit</h3>
            <p className="text-xs text-slate-400 mt-0.5">Log visitor exit from campus</p>
          </div>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-3xl border border-[#EAE2F2] shadow-sm text-center">
        <div className="p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{expectedCount}</p>
        </div>
        <div className="p-3 border-l border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="p-3 border-l border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entries Logged</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{entriesCount}</p>
        </div>
        <div className="p-3 border-l border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exits Logged</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{exitsCount}</p>
        </div>
      </div>

      {/* Verification Result Panel if active */}
      {lookupResult && (
        <div className="p-6 rounded-3xl bg-white border-2 border-purple-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#6B21A8]" />
              <h3 className="font-bold text-base text-slate-900">Pass Verification Outcome</h3>
            </div>
            <button
              onClick={() => setLookupResult(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {lookupResult.found && lookupResult.visitor ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-slate-900">{lookupResult.visitor.name}</h4>
                    <span className="font-mono text-xs font-bold bg-[#6B21A8] text-white px-2.5 py-0.5 rounded-full">
                      {lookupResult.visitor.passCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Destination: <strong className="text-slate-900">Flat {lookupResult.visitor.unit}</strong> • Host: {lookupResult.visitor.residentName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Purpose: {lookupResult.visitor.purpose} • {lookupResult.visitor.visitorCount} {lookupResult.visitor.visitorCount === 1 ? 'person' : 'people'}
                  </p>
                </div>

                <div className="self-end sm:self-center">
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      lookupResult.visitor.status === 'checked_in'
                        ? 'bg-sky-100 text-sky-800'
                        : lookupResult.visitor.status === 'denied'
                        ? 'bg-rose-100 text-rose-800'
                        : lookupResult.visitor.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-[#6B21A8]'
                    }`}
                  >
                    STATUS: {lookupResult.visitor.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex flex-wrap gap-3">
                {lookupResult.visitor.status !== 'checked_in' && lookupResult.visitor.status !== 'denied' && (
                  <button
                    onClick={() => {
                      checkInVisitor(lookupResult.visitor!.passCode, 'Gate 1 - Main Entrance');
                      setLookupResult(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Authorize Entry & Log In</span>
                  </button>
                )}

                {lookupResult.visitor.status === 'checked_in' && (
                  <button
                    onClick={() => {
                      checkOutVisitor(lookupResult.visitor!.passCode);
                      setLookupResult(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Record Visitor Exit</span>
                  </button>
                )}

                <button
                  onClick={() => setLookupResult(null)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
              <p className="font-bold flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Verification Failed</span>
              </p>
              <p className="mt-1">{lookupResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Real-time Gate Log Table */}
      <div className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Today&apos;s Gate Log</h3>
            <p className="text-xs text-slate-500">Live feed of visitor entry and exit scans at Gate 1</p>
          </div>
          <span className="text-xs font-semibold bg-purple-50 text-[#6B21A8] px-3 py-1 rounded-full">
            Gate 1
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F8F6FC] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EAE2F2]">
              <tr>
                <th className="px-5 py-3">Visitor Name</th>
                <th className="px-5 py-3">Destination Unit</th>
                <th className="px-5 py-3">Pass Reference</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Gate</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {securityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{log.visitorName}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#6B21A8]">Flat {log.unit}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-600">
                    {log.passCode}
                  </td>
                  <td className="px-5 py-3.5 font-mono">{log.entryTime || log.exitTime || '--'}</td>
                  <td className="px-5 py-3.5">{log.gate}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        log.status === 'entry'
                          ? 'bg-purple-100 text-[#6B21A8]'
                          : log.status === 'exit'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scan Modal Simulation */}
      {activeModal === 'scan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 p-6 space-y-5 text-center">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Optical QR Scanner Active
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div className="relative h-64 bg-slate-800 rounded-2xl overflow-hidden border-2 border-purple-500/80 flex items-center justify-center p-6 shadow-inner">
              <div className="w-44 h-44 border-2 border-dashed border-purple-400/90 rounded-2xl flex items-center justify-center relative">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-purple-400 animate-bounce" />
                <Camera className="w-10 h-10 text-purple-400/60" />
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-purple-200">
                Align visitor digital pass inside the frame
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Demo Test: Click below to simulate scanning a visitor pass from the queue.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveModal(null);
                  handleLookup('V-9421');
                }}
                className="py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-bold"
              >
                Scan Rohan Mehta (V-9421)
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  handleLookup('V-8812');
                }}
                className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Scan Sneha Kapoor (V-8812)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Register Modal */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Register Walk-in Guest</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination Flat
                  </label>
                  <select
                    value={walkinUnit}
                    onChange={(e) => setWalkinUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8] bg-white font-semibold"
                  >
                    <option value="A-1204">Flat A-1204 (Priya Sharma)</option>
                    <option value="B-804">Flat B-804 (Kunal Singhal)</option>
                    <option value="C-402">Flat C-402 (Rajesh Nair)</option>
                    <option value="A-701">Flat A-701 (Dr. Anita Roy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Purpose
                  </label>
                  <select
                    value={walkinPurpose}
                    onChange={(e) => setWalkinPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8] bg-white"
                  >
                    <option>Delivery</option>
                    <option>Maintenance / Plumbing</option>
                    <option>Guest / Family</option>
                    <option>Cab / Ride Pickup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Registration (Optional)
                </label>
                <input
                  type="text"
                  value={walkinVehicle}
                  onChange={(e) => setWalkinVehicle(e.target.value.toUpperCase())}
                  placeholder="e.g. MH 02 CD 5678"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8] font-mono"
                />
              </div>

              <p className="text-[11px] text-purple-800 bg-purple-50 p-2.5 rounded-xl">
                Submitting this triggers an instant approval prompt to the resident of {walkinUnit}.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold shadow-sm"
                >
                  Send Approval Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Lookup Modal */}
      {activeModal === 'lookup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Manual Pass Verification</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter Pass Code (e.g. V-9421 or V-8812)
              </label>
              <input
                type="text"
                autoFocus
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value.toUpperCase())}
                placeholder="V-9421"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-center font-mono font-bold text-lg focus:outline-none focus:border-[#6B21A8]"
              />

              <button
                onClick={() => {
                  setActiveModal(null);
                  handleLookup(lookupQuery);
                }}
                className="w-full py-3 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                Verify Pass Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
