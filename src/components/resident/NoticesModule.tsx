'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Notice, NoticePriority } from '@/types';
import {
  BellRing,
  Search,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  X,
  Filter,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';

export function NoticesModule() {
  const { notices, markNoticeRead, acknowledgeNotice } = useSociety();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [activeNoticeDetail, setActiveNoticeDetail] = useState<Notice | null>(null);

  const categories = ['All', 'Water Shutdown', 'AGM Notification', 'General Rules', 'Events'];
  const priorities = ['All', 'urgent', 'high', 'normal'];

  const filteredNotices = notices.filter((n) => {
    if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && n.priority !== selectedPriority) return false;
    if (unreadOnly && n.isRead) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const urgentNotice = notices.find((n) => n.priority === 'urgent' && !n.isAcknowledged);

  const getPriorityBadge = (priority: NoticePriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="text-[10px] font-bold uppercase bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-bold uppercase bg-amber-500 text-white px-2.5 py-0.5 rounded-full">
            Important
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            General
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
          Notices & Circulars
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
          Stay updated with official committee broadcasts, maintenance schedules, and AGM circulars.
        </p>
      </div>

      {/* Urgent Notice Banner if any */}
      {urgentNotice && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 mt-0.5 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase bg-rose-600 text-white px-2 py-0.5 rounded">
                  CRITICAL BROADCAST
                </span>
                <span className="text-xs text-rose-800 font-semibold">{urgentNotice.category}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">{urgentNotice.title}</h3>
              <p className="text-xs text-slate-700 mt-1 max-w-3xl leading-relaxed">
                {urgentNotice.body}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => {
                setActiveNoticeDetail(urgentNotice);
                markNoticeRead(urgentNotice.id);
              }}
              className="px-3 py-2 rounded-xl border border-rose-300 text-rose-800 hover:bg-rose-100/70 text-xs font-semibold"
            >
              Read Full Notice
            </button>
            <button
              onClick={() => acknowledgeNotice(urgentNotice.id)}
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Acknowledge Receipt
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE2F2] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices by keyword or topic..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8F6FC] border border-[#EAE2F2] rounded-xl text-xs focus:outline-none focus:border-[#6B21A8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#EAE2F2] bg-white text-slate-700 focus:outline-none focus:border-[#6B21A8]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#EAE2F2] bg-white text-slate-700 focus:outline-none focus:border-[#6B21A8]"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p.toUpperCase()}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EAE2F2] cursor-pointer hover:bg-slate-50 text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded text-[#6B21A8] focus:ring-0"
            />
            <span>Unread Only</span>
          </label>
        </div>
      </div>

      {/* Notices Feed Cards */}
      <div className="space-y-3">
        {filteredNotices.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#EAE2F2] text-slate-400">
            <BellRing className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No notices match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing some of your search parameters.</p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => {
                setActiveNoticeDetail(notice);
                markNoticeRead(notice.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                !notice.isRead
                  ? 'bg-[#F8F6FC] border-[#6B21A8]/30 border-l-4 border-l-[#6B21A8]'
                  : 'bg-white border-[#EAE2F2]'
              }`}
            >
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(notice.priority)}
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {notice.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {notice.publishDate}
                  </span>
                  {!notice.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#9333EA]" title="Unread" />
                  )}
                </div>

                <h3 className="font-bold text-base text-[#1C1326] leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-[#6E6280] line-clamp-2 leading-relaxed">
                  {notice.body}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Issued by: <strong>{notice.author}</strong></span>
                  {notice.attachmentName && (
                    <span className="flex items-center gap-1 text-[#6B21A8] font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      {notice.attachmentName}
                    </span>
                  )}
                  {notice.isAcknowledged && (
                    <span className="flex items-center gap-1 text-purple-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <span className="text-xs font-semibold text-[#6B21A8] flex items-center gap-1">
                  <span>Read Notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notice Detail Modal */}
      {activeNoticeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {getPriorityBadge(activeNoticeDetail.priority)}
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {activeNoticeDetail.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {activeNoticeDetail.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Published {activeNoticeDetail.publishDate} by {activeNoticeDetail.author}
                </p>
              </div>

              <button
                onClick={() => setActiveNoticeDetail(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
              <p>{activeNoticeDetail.body}</p>

              {/* Attachment if present */}
              {activeNoticeDetail.attachmentName && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100 text-[#6B21A8]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {activeNoticeDetail.attachmentName}
                      </p>
                      <p className="text-[11px] text-slate-500">{activeNoticeDetail.attachmentSize}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${activeNoticeDetail.attachmentName}...`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {/* Acknowledge Footer */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {activeNoticeDetail.requiresAcknowledgement && (
                  <span>
                    <strong>{activeNoticeDetail.acknowledgedCount || 0}</strong> of{' '}
                    {activeNoticeDetail.totalResidentsCount || 248} households acknowledged
                  </span>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {activeNoticeDetail.requiresAcknowledgement && !activeNoticeDetail.isAcknowledged && (
                  <button
                    onClick={() => {
                      acknowledgeNotice(activeNoticeDetail.id);
                      setActiveNoticeDetail({ ...activeNoticeDetail, isAcknowledged: true });
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold shadow-sm"
                  >
                    Acknowledge Receipt
                  </button>
                )}
                <button
                  onClick={() => setActiveNoticeDetail(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
