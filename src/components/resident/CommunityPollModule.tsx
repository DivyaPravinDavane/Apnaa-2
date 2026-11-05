'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { SocietyApi, type PollRecord } from '@/lib/api';
import {
  ArrowLeft,
  Search,
  Info,
  Clock,
  Users,
  CheckCircle2,
  Plus,
  Filter,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const DEFAULT_CANDIDATES = [
  '01 CANDIDATE A',
  '02 CANDIDATE B',
  '03 CANDIDATE C',
  '04 CANDIDATE D',
  '05 CANDIDATE E',
  '06 CANDIDATE F',
  '07 CANDIDATE G',
  '08 CANDIDATE H',
  '09 CANDIDATE I',
  '10 CANDIDATE J',
  '11 CANDIDATE K',
  '12 CANDIDATE L',
  '13 CANDIDATE M',
  '14 CANDIDATE N',
  '15 CANDIDATE O',
  '16 CANDIDATE P',
  '17 CANDIDATE Q',
  '18 CANDIDATE R',
];

const INITIAL_POLLS: PollRecord[] = [
  {
    id: 'poll_01',
    authorName: 'Executive Committee WHCA...',
    authorInitial: 'E',
    groupName: 'Test Group for Polling',
    timestamp: '07 Dec 2023 | 05:06 PM',
    title: 'TEST POLL',
    subtitle: 'CHOOSE ONLY 15 CANDIDATES',
    expiresOn: '30 Nov 2026, 06:00 PM',
    responsesCount: 1,
    minSelect: 15,
    maxSelect: 15,
    candidates: DEFAULT_CANDIDATES,
  },
];

interface CommunityPollModuleProps {
  onBack: () => void;
}

export function CommunityPollModule({ onBack }: CommunityPollModuleProps) {
  const { addToast, currentUser, refreshData } = useSociety();
  const [polls, setPolls] = useState<PollRecord[]>(INITIAL_POLLS);
  const [activePollId, setActivePollId] = useState<string>('poll_01');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'polls' | 'announcements'>('all');
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollOptions, setNewPollOptions] = useState('Option 1, Option 2, Option 3');
  const [syncingVote, setSyncingVote] = useState(false);

  const loadPollsFromRemoteDb = useCallback(async () => {
    const res = await SocietyApi.polls.list();
    if (res.data && res.data.length > 0) {
      setPolls(res.data);
      const target = res.data.find((p) => p.id === activePollId) || res.data[0];
      setActivePollId(target.id);
      if (Array.isArray(target.votedCandidates)) {
        setSelectedCandidates(target.votedCandidates);
      }
    }
  }, [activePollId]);

  useEffect(() => {
    void loadPollsFromRemoteDb();
  }, [loadPollsFromRemoteDb]);

  const activePoll = polls.find((p) => p.id === activePollId) || polls[0];

  const syncSelectionToDatabase = async (pollId: string, nextCandidates: string[]) => {
    setSyncingVote(true);
    try {
      await SocietyApi.polls.vote(pollId, nextCandidates);
    } finally {
      setSyncingVote(false);
    }
  };

  const toggleCandidate = (candidate: string) => {
    let next: string[];
    if (selectedCandidates.includes(candidate)) {
      next = selectedCandidates.filter((c) => c !== candidate);
    } else {
      if (selectedCandidates.length >= activePoll.maxSelect) {
        addToast(
          'Maximum Limit Reached',
          `You can select at most ${activePoll.maxSelect} candidates.`,
          'warning'
        );
        return;
      }
      next = [...selectedCandidates, candidate];
      if (next.length === activePoll.minSelect) {
        setTimeout(() => setConfirmSubmitOpen(true), 180);
      }
    }

    setSelectedCandidates(next);
    void syncSelectionToDatabase(activePoll.id, next);
  };

  const handleQuickSelect15 = () => {
    const first15 = activePoll.candidates.slice(0, activePoll.minSelect);
    setSelectedCandidates(first15);
    void syncSelectionToDatabase(activePoll.id, first15);
    setConfirmSubmitOpen(true);
  };

  const handleOpenSubmitModal = () => {
    if (selectedCandidates.length === 0) {
      addToast('Select Candidates', 'Please tap at least one candidate to vote.', 'warning');
      return;
    }
    setConfirmSubmitOpen(true);
  };

  const handleConfirmVote = async () => {
    setConfirmSubmitOpen(false);
    const res = await SocietyApi.polls.vote(activePoll.id, selectedCandidates);
    if (res.error) {
      addToast('Vote Failed', res.error.message, 'error');
      return;
    }

    setPolls((prev) =>
      prev.map((p) =>
        p.id === activePoll.id
          ? {
              ...p,
              responsesCount: p.votedCandidates ? p.responsesCount : p.responsesCount + 1,
              votedCandidates: selectedCandidates,
            }
          : p
      )
    );

    addToast(
      'Poll Vote Recorded in MySQL',
      `Your vote for ${selectedCandidates.length} candidate(s) is saved to phpMyAdmin (poll_votes).`,
      'success'
    );
    await loadPollsFromRemoteDb();
    void refreshData();
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitle.trim()) return;
    const opts = newPollOptions
      .split(',')
      .map((s, i) => `${String(i + 1).padStart(2, '0')} ${s.trim().toUpperCase()}`)
      .filter(Boolean);

    const candidates = opts.length > 0 ? opts : DEFAULT_CANDIDATES;
    const res = await SocietyApi.polls.create({
      title: newPollTitle.trim().toUpperCase(),
      subtitle: newPollTitle.trim(),
      candidates,
      minSelect: 1,
      maxSelect: Math.max(1, candidates.length),
    });

    if (res.error || !res.data) {
      addToast('Failed to Create Poll', res.error?.message || 'Database error', 'error');
      return;
    }

    const created = res.data;
    setPolls((prev) => [created, ...prev]);
    setActivePollId(created.id);
    setSelectedCandidates([]);
    setNewPollTitle('');
    setCreatePollOpen(false);
    addToast('Poll Saved to phpMyAdmin', `Poll "${created.title}" stored in community_polls.`, 'success');
    void refreshData();
  };

  const filteredCandidates = activePoll.candidates.filter((c) =>
    searchQuery.trim() ? c.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="min-h-full bg-[#F8F9FA] flex flex-col justify-between pb-16 -mx-3.5 -mt-1">
      {/* 1. TOP BAR WITH BACK ARROW & "Community corner" TITLE */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 pt-3 pb-3 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#0E2628] transition-colors"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[17px] font-bold text-[#0E2628] tracking-tight">
              Community corner
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {syncingVote && (
              <span className="text-[10px] font-semibold text-[#0D5C63] animate-pulse">
                Saving to DB…
              </span>
            )}
            {activePoll.votedCandidates && activePoll.votedCandidates.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved in DB ({selectedCandidates.length})
              </span>
            )}
          </div>
        </div>

        {/* Rounded Search Bar Below */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-4 pr-10 py-2.5 rounded-full bg-[#F5F5F8] border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0D5C63]"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Poll Selector if multiple polls exist in MySQL */}
        {polls.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {polls.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePollId(p.id);
                  setSelectedCandidates(p.votedCandidates || []);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                  p.id === activePoll.id
                    ? 'bg-[#0D5C63] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. ACTIVE POLL CARD */}
      <div className="px-3.5 pt-3.5 pb-6 flex-1">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 space-y-3.5">
          {/* Poll Header: Avatar, Author Name, "Poll" Badge, Timestamp, Info Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#E6F3F3] text-[#0D5C63] font-bold text-sm flex items-center justify-center flex-shrink-0">
                {activePoll.authorInitial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[13px] text-[#0E2628] truncate max-w-[185px]">
                    {activePoll.authorName}
                  </span>
                  <span className="text-[10px] font-bold text-[#0D5C63] bg-[#E6F3F3] px-2 py-0.5 rounded-md">
                    Poll
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {activePoll.groupName} • {activePoll.timestamp}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                addToast(
                  'Poll Instructions',
                  `Select ${activePoll.minSelect} candidates and tap Submit Poll to record your e-Vote in phpMyAdmin.`,
                  'info'
                )
              }
              className="p-1 text-slate-400 hover:text-[#0D5C63] flex-shrink-0"
              aria-label="Poll info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Poll Title & Subtitle + Quick Helper */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0E2628] uppercase tracking-wide">
                {activePoll.title}
              </p>
              <p className="text-xs font-semibold text-slate-700">{activePoll.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#0D5C63] bg-[#E6F3F3] px-2.5 py-1 rounded-full">
                {selectedCandidates.length} / {activePoll.maxSelect} selected
              </span>
              {selectedCandidates.length < activePoll.minSelect && (
                <button
                  type="button"
                  onClick={handleQuickSelect15}
                  className="text-[10px] font-bold text-[#0D5C63] underline hover:text-[#073B3E]"
                >
                  Auto-fill 15
                </button>
              )}
            </div>
          </div>

          {/* Multi-Select Candidate List (Pill-Shaped Option Buttons) */}
          <div className="space-y-2.5 pt-1">
            {filteredCandidates.map((candidate) => {
              const isSelected = selectedCandidates.includes(candidate);
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => toggleCandidate(candidate)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#E6F3F3] border-[1.5px] border-[#0D5C63] text-[#0E2628] font-bold shadow-2xs'
                      : 'bg-white border border-[#C4E4E6] text-slate-800 font-medium hover:border-[#0D5C63]/60'
                  }`}
                >
                  <span>{candidate}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#0D5C63] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Metadata: Expires on, Responses, Answer limit */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0D5C63]" />
                <span>Expires on: {activePoll.expiresOn}</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Users className="w-3.5 h-3.5 text-[#0D5C63]" />
                <span>{activePoll.responsesCount} Responses</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0D5C63]" />
                <span>
                  Answer limit: Min {activePoll.minSelect}, Max {activePoll.maxSelect}
                </span>
              </span>

              <button
                type="button"
                onClick={handleOpenSubmitModal}
                className="px-4 py-1.5 rounded-full bg-[#0D5C63] hover:bg-[#094449] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                Submit Poll ({selectedCandidates.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FLOATING "+" BUTTON */}
      <button
        type="button"
        onClick={() => setCreatePollOpen(true)}
        aria-label="Create poll"
        className="fixed bottom-28 right-5 z-30 w-12 h-12 rounded-full bg-[#0D5C63] hover:bg-[#094449] text-white shadow-[0_6px_20px_rgba(13,92,99,0.45)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 4. BOTTOM "Filter" BAR */}
      <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 py-2.5 px-4 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0D5C63]"
        >
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span>Filter</span>
          {activeFilter !== 'all' && (
            <span className="text-[10px] bg-[#E6F3F3] text-[#0D5C63] px-2 py-0.5 rounded-full font-bold capitalize">
              {activeFilter}
            </span>
          )}
        </button>
      </div>

      {/* 5. CONFIRMATION MODAL: "Submit poll" */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] shadow-2xl pt-3 pb-6 px-5 space-y-4 max-h-[82vh] flex flex-col">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />

            <div className="text-left">
              <h3 className="text-base font-bold text-[#0E2628]">Submit poll</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Are you sure you want to submit your vote for the following {selectedCandidates.length} candidate(s) as {currentUser.name} ({currentUser.unit})?
              </p>
            </div>

            {/* Selected Candidates List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-60 border-y border-slate-100 py-2.5">
              {selectedCandidates.map((cand, idx) => (
                <div
                  key={cand}
                  className="px-3.5 py-2 rounded-xl bg-[#E6F3F3] border border-[#0D5C63]/40 text-xs font-semibold text-[#0E2628] flex items-center justify-between"
                >
                  <span>{cand}</span>
                  <span className="text-[10px] font-bold text-[#0D5C63]">#{idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Side-by-side "Cancel" and "Yes" buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="py-2.5 rounded-full border-[1.5px] border-[#0D5C63] text-[#0D5C63] font-bold text-xs hover:bg-[#E6F3F3]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmVote()}
                className="py-2.5 rounded-full bg-[#0D5C63] hover:bg-[#094449] text-white font-bold text-xs shadow-sm transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bottom Sheet */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full bg-white rounded-t-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0E2628]">Filter Community Corner</h3>
              <button onClick={() => setFilterOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {(['all', 'polls', 'announcements'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setActiveFilter(f);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold capitalize ${
                    activeFilter === f
                      ? 'bg-[#E6F3F3] text-[#0D5C63] border border-[#0D5C63]'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create New Poll Modal */}
      {createPollOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <form
            onSubmit={(e) => void handleCreatePoll(e)}
            className="w-full bg-white rounded-t-3xl p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0E2628]">Create Community Poll</h3>
              <button
                type="button"
                onClick={() => setCreatePollOpen(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Poll Title</label>
              <input
                type="text"
                required
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
                placeholder="e.g. AGM Resolution Poll"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Candidates / Options (comma separated)
              </label>
              <input
                type="text"
                required
                value={newPollOptions}
                onChange={(e) => setNewPollOptions(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCreatePollOpen(false)}
                className="py-2.5 rounded-full border border-[#0D5C63] text-[#0D5C63] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold"
              >
                Publish Poll
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
