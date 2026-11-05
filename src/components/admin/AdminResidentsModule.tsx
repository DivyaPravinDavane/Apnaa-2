'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Member, UserRole } from '@/types';
import {
  Search,
  UserPlus,
  X,
  Building,
  Shield,
  Power,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';

type ResidentDraft = {
  name: string;
  email: string;
  phone: string;
  unit: string;
  wing: string;
  floor: string;
  membershipType: 'Owner' | 'Tenant' | 'Family Member';
  role: UserRole;
  password: string;
};

const emptyDraft: ResidentDraft = {
  name: '',
  email: '',
  phone: '',
  unit: '',
  wing: 'A Wing',
  floor: '1st Floor',
  membershipType: 'Owner',
  role: 'resident',
  password: '',
};

export function AdminResidentsModule() {
  const { members, createResident, updateResident, updateResidentAccess, removeResident, addToast } = useSociety();
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draft, setDraft] = useState<ResidentDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [editingResident, setEditingResident] = useState<Member | null>(null);
  const [editDraft, setEditDraft] = useState({
    name: '',
    unit: '',
    wing: '',
    floor: '',
    membershipType: 'Owner' as 'Owner' | 'Tenant' | 'Family Member',
    isActive: true,
  });

  const filteredResidents = members.filter((m) => {
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

  const activeCount = members.filter((m) => m.isActive !== false).length;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name || !draft.unit || !draft.email || !draft.phone) {
      addToast('Validation Error', 'Name, flat, email, and phone are required.', 'error');
      return;
    }
    if (draft.password && draft.password.length < 12) {
      addToast('Validation Error', 'Password must be at least 12 characters.', 'error');
      return;
    }

    setSaving(true);
    const result = await createResident({
      ...draft,
      password: draft.password || undefined,
    });
    setSaving(false);
    if (!result.success) return;

    setDraft(emptyDraft);
    setIsAddOpen(false);
  };

  const openManage = (resident: Member) => {
    setEditingResident(resident);
    setEditDraft({
      name: resident.name,
      unit: resident.unit,
      wing: resident.wing,
      floor: resident.floor,
      membershipType: resident.membershipType || (resident.role.includes('Owner') ? 'Owner' : 'Tenant'),
      isActive: resident.isActive !== false,
    });
  };

  const handleManageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;
    setSaving(true);
    const result = await updateResident(editingResident.id, {
      name: editDraft.name.trim(),
      unit: editDraft.unit.trim(),
      wing: editDraft.wing.trim(),
      floor: editDraft.floor.trim(),
      membershipType: editDraft.membershipType,
      isActive: editDraft.isActive,
    });
    setSaving(false);
    if (result.success) setEditingResident(null);
  };

  const handleRemove = async () => {
    if (!editingResident) return;
    if (!window.confirm(`Remove ${editingResident.name} from the resident directory?`)) return;
    setSaving(true);
    const result = await removeResident(editingResident.id);
    setSaving(false);
    if (result.success) setEditingResident(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E2628]">
            Residents & Units Management
          </h1>
          <p className="text-xs sm:text-sm text-[#4E6E70] mt-1">
            {activeCount} active portal account{activeCount === 1 ? '' : 's'} • maintain unit allocations and access.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D5C63] text-white font-semibold text-xs hover:bg-[#094449] transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Resident / Unit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5EAEB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, flat (e.g. A-1204)…"
            className="w-full pl-9 pr-4 py-2 bg-[#F4F9F9] border border-[#D5EAEB] rounded-xl text-xs focus:outline-none focus:border-[#0D5C63]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto overflow-x-auto">
          {['All', 'A Wing', 'B Wing', 'C Wing', 'D Wing'].map((w) => (
            <button
              key={w}
              onClick={() => setWingFilter(w)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                wingFilter === w
                  ? 'bg-[#0D5C63] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-3xl border border-[#D5EAEB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F4F9F9] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#D5EAEB]">
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
              {filteredResidents.map((res) => {
                const active = res.isActive !== false;
                return (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden border bg-purple-50 flex-shrink-0">
                          {res.avatar ? (
                            <Image src={res.avatar} alt={res.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#0D5C63] font-bold text-xs">
                              {res.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{res.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {res.roleKey === 'admin' ? 'Committee Secretary' : res.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">Flat {res.unit}</span>
                      <p className="text-[11px] text-slate-400">{res.wing} • {res.floor}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-purple-50 text-[#0D5C63]">
                        {res.membershipType || (res.role.includes('Owner') ? 'Owner' : 'Tenant')}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px]">
                      <p className="text-slate-700">{res.phone}</p>
                      <p className="text-slate-400">{res.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {active ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openManage(res)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filteredResidents.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-500">
                    No residents match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Onboard Resident to Unit</h3>
                <p className="text-xs text-slate-500 mt-1">Creates a real portal account in MySQL.</p>
              </div>
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
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Flat Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.unit}
                    onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                    placeholder="e.g. B-902"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Wing
                  </label>
                  <select
                    value={draft.wing}
                    onChange={(e) => setDraft({ ...draft, wing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63] bg-white"
                  >
                    <option>A Wing</option>
                    <option>B Wing</option>
                    <option>C Wing</option>
                    <option>D Wing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    value={draft.floor}
                    onChange={(e) => setDraft({ ...draft, floor: e.target.value })}
                    placeholder="e.g. 9th Floor"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Membership Type
                  </label>
                  <select
                    value={draft.membershipType}
                    onChange={(e) =>
                      setDraft({ ...draft, membershipType: e.target.value as ResidentDraft['membershipType'] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63] bg-white"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                    <option value="Family Member">Family Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Portal Role
                  </label>
                  <select
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63] bg-white"
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Committee Admin</option>
                    <option value="security">Security Guard</option>
                    <option value="facility">Facility Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  placeholder="Leave blank to auto-generate a secure password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Minimum 12 characters. Generated passwords are shown once after saving.
                </p>
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
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0D5C63] hover:bg-[#094449] disabled:opacity-60 text-white text-xs font-semibold shadow-sm"
                >
                  {saving ? 'Saving…' : 'Save Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Resident Modal */}
      {editingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{editingResident.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Flat {editingResident.unit} • {editingResident.wing}
                </p>
              </div>
              <button
                onClick={() => setEditingResident(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManageSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Resident Name
                </label>
                <input
                  required
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Flat
                  </label>
                  <input
                    required
                    value={editDraft.unit}
                    onChange={(e) => setEditDraft({ ...editDraft, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Wing
                  </label>
                  <input
                    required
                    value={editDraft.wing}
                    onChange={(e) => setEditDraft({ ...editDraft, wing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Floor
                  </label>
                  <input
                    required
                    value={editDraft.floor}
                    onChange={(e) => setEditDraft({ ...editDraft, floor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Membership
                  </label>
                  <select
                    value={editDraft.membershipType}
                    onChange={(e) =>
                      setEditDraft({
                        ...editDraft,
                        membershipType: e.target.value as typeof editDraft.membershipType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0D5C63]"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                    <option value="Family Member">Family Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Portal Access
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditDraft({ ...editDraft, isActive: !editDraft.isActive })}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      editDraft.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {editDraft.isActive ? 'Active' : 'Suspended'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={saving}
                  className="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  title="Remove resident"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0D5C63] hover:bg-[#094449] disabled:opacity-60 text-white text-xs font-semibold shadow-sm"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={async () => {
                const next = editingResident.isActive === false;
                const result = await updateResidentAccess(editingResident.id, next);
                if (result.success) {
                  setEditingResident({ ...editingResident, isActive: next });
                  setEditDraft((prev) => ({ ...prev, isActive: next }));
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800"
            >
              <Shield className="w-3.5 h-3.5" />
              {editingResident.isActive === false ? 'Restore Portal Access' : 'Suspend Portal Access Immediately'}
            </button>

            <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Changes are persisted to MySQL and audit-logged.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
