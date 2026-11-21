'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowLeft,
  X,
  User,
  Calendar,
  Filter,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';
import type { CommitteeAction } from '@/types';

interface CommitteeActionItemsModuleProps {
  onBack?: () => void;
}

export function CommitteeActionItemsModule({ onBack }: CommitteeActionItemsModuleProps) {
  const { currentUser, currentRole, addToast } = useSociety();
  const [actions, setActions] = useState<CommitteeAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [assignedTo, setAssignedTo] = useState(currentUser.name);
  const [assignedRole, setAssignedRole] = useState('Committee Member');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)
  );
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('high');

  const loadActions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SocietyApi.committee.list();
      if (res.data) {
        setActions(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActions();
  }, [loadActions]);

  const handleUpdateStatus = async (action: CommitteeAction, nextStatus: 'open' | 'in_progress' | 'completed') => {
    setActions((prev) =>
      prev.map((a) => (a.id === action.id ? { ...a, status: nextStatus } : a))
    );
    const res = await SocietyApi.committee.updateStatus(action.id, nextStatus);
    if (res.data) {
      addToast(
        'Action Status Updated',
        `"${action.title}" marked as ${nextStatus.replace('_', ' ').toUpperCase()}.`,
        'success'
      );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await SocietyApi.committee.create({
      title: title.trim(),
      description: description.trim(),
      category,
      assignedTo: assignedTo.trim(),
      assignedRole: assignedRole.trim(),
      dueDate,
      priority,
      status: 'open',
    });

    if (res.data) {
      setActions((prev) => [res.data!, ...prev]);
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
      addToast(
        'Action Item Created',
        `"${res.data.title}" assigned to ${res.data.assignedTo}.`,
        'success'
      );
    }
  };

  const filteredActions = actions.filter((a) =>
    filterStatus === 'all' ? true : a.status === filterStatus
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-[#0E2628]">Managing Committee Action Items</h1>
            <p className="text-[11px] text-[#4E6E70]">
              Society Resolutions, Committee Deliverables &amp; Trackers
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold hover:bg-[#094348] transition-colors flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Action</span>
        </button>
      </div>

      {/* Filter Status Pills */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        {(['all', 'open', 'in_progress', 'completed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
              filterStatus === st
                ? 'bg-[#0D5C63] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading action items…</div>
        ) : filteredActions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No action items found under this status.
          </div>
        ) : (
          filteredActions.map((item) => {
            const isCompleted = item.status === 'completed';
            const isUrgent = item.priority === 'urgent';
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/80 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-[#0D5C63]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[10px] font-bold text-[#0D5C63] uppercase">
                        {item.category}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold text-[#0E2628] ${
                        isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.assignedTo} ({item.assignedRole})
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due by {item.dueDate}
                    </p>
                  </div>

                  {/* Status Cycle Button */}
                  <div className="flex items-center gap-1">
                    {item.status !== 'completed' ? (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            item,
                            item.status === 'open' ? 'in_progress' : 'completed'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#E6F3F3] hover:bg-[#C4E4E6] text-[#0D5C63] font-bold text-[11px] transition-colors"
                      >
                        {item.status === 'open' ? 'Start Work' : 'Mark Done'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(item, 'open')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 text-[11px] font-semibold"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0E2628]">New Committee Action Item</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Title / Task Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCTV repair in Wing C Lift"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Details / Scope of Work
                </label>
                <textarea
                  rows={3}
                  placeholder="Scope of work, vendor details or resolution guidelines…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Assigned Person
                  </label>
                  <input
                    type="text"
                    required
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0D5C63] text-white font-bold text-xs hover:bg-[#094348] transition-colors shadow-md mt-2"
              >
                Save Action Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

