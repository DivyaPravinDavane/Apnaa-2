'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Member } from '@/types';
import {
  Users,
  Search,
  UserPlus,
  X,
  CheckCircle2,
  AlertTriangle,
  Building,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';
import Image from 'next/image';

export function AdminResidentsModule() {
  const { members, addToast } = useSociety();
  const [residentList, setResidentList] = useState<Member[]>(members);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('All');

  // Add resident modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newResident, setNewResident] = useState({
    name: '',
    unit: '',
    wing: 'A Wing',
    floor: '1st Floor',
    role: 'Resident (Owner)',
    email: '',
    phone: '',
    interests: 'Badminton, Gardening',
  });

  const filteredResidents = residentList.filter((m) => {
    if (wingFilter !== 'All' && m.wing !== wingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.unit.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.name || !newResident.unit) {
      addToast('Validation Error', 'Name and Unit are required', 'error');
      return;
    }

    const created: Member = {
      id: `mem_${Date.now()}`,
      name: newResident.name,
      unit: newResident.unit,
      wing: newResident.wing,
      floor: newResident.floor,
      role: newResident.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: `Resident of Flat ${newResident.unit}`,
      interests: newResident.interests.split(',').map((s) => s.trim()),
      email: newResident.email || 'resident@example.com',
      phone: newResident.phone || '+91 99999 00000',
      isPhonePublic: false,
      isEmailPublic: false,
    };

    setResidentList([created, ...residentList]);
    setIsAddOpen(false);
    addToast('Resident Onboarded', `${created.name} assigned to Flat ${created.unit}.`);
  };

  const handleToggleAccess = (id: string, name: string) => {
    addToast('Access Status Updated', `Access permissions updated for ${name}.`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
            Residents & Units Management
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
            Maintain authorized household memberships, unit allocations, and digital portal privileges.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B21A8] text-white font-semibold text-xs hover:bg-[#581C87] transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Resident / Unit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE2F2] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, flat (e.g. A-1204)..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8F6FC] border border-[#EAE2F2] rounded-xl text-xs focus:outline-none focus:border-[#6B21A8]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          {['All', 'A Wing', 'B Wing', 'C Wing', 'D Wing'].map((w) => (
            <button
              key={w}
              onClick={() => setWingFilter(w)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                wingFilter === w
                  ? 'bg-[#6B21A8] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F8F6FC] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EAE2F2]">
              <tr>
                <th className="px-6 py-4">Resident</th>
                <th className="px-6 py-4">Unit & Wing</th>
                <th className="px-6 py-4">Membership Type</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Portal Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden border">
                        <Image src={res.avatar} alt={res.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{res.name}</p>
                        <p className="text-[11px] text-slate-400">{res.role}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">Flat {res.unit}</span>
                    <p className="text-[11px] text-slate-400">{res.wing} • {res.floor}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-purple-50 text-[#6B21A8]">
                      {res.role.includes('Owner') ? 'Homeowner' : 'Tenant'}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-[11px]">
                    <p className="text-slate-700">{res.phone}</p>
                    <p className="text-slate-400">{res.email}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Active
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleAccess(res.id, res.name)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Onboard Resident to Unit</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Resident Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newResident.name}
                    onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Flat Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newResident.unit}
                    onChange={(e) => setNewResident({ ...newResident, unit: e.target.value })}
                    placeholder="e.g. B-902"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Wing
                  </label>
                  <select
                    value={newResident.wing}
                    onChange={(e) => setNewResident({ ...newResident, wing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8] bg-white"
                  >
                    <option>A Wing</option>
                    <option>B Wing</option>
                    <option>C Wing</option>
                    <option>D Wing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Membership Role
                  </label>
                  <select
                    value={newResident.role}
                    onChange={(e) => setNewResident({ ...newResident, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8] bg-white"
                  >
                    <option>Resident (Owner)</option>
                    <option>Resident (Tenant)</option>
                    <option>Committee Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newResident.phone}
                    onChange={(e) => setNewResident({ ...newResident, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newResident.email}
                    onChange={(e) => setNewResident({ ...newResident, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold shadow-sm"
                >
                  Save Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
