'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Users,
  Heart,
  Plus,
  ArrowLeft,
  X,
  Share2,
  Sparkles,
  Search,
  MessageCircle,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';
import type { CommunityDiscussion } from '@/types';

interface CommunityForumsModuleProps {
  onBack?: () => void;
}

export function CommunityForumsModule({ onBack }: CommunityForumsModuleProps) {
  const { currentUser, addToast } = useSociety();
  const [activeTab, setActiveTab] = useState<'Forum' | 'Interest Group'>('Forum');
  const [posts, setPosts] = useState<CommunityDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [groupName, setGroupName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SocietyApi.discussions.list(activeTab);
      if (res.data) {
        setPosts(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleLike = async (post: CommunityDiscussion) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
              isLiked: !p.isLiked,
            }
          : p
      )
    );
    await SocietyApi.discussions.like(post.id);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const res = await SocietyApi.discussions.create({
      groupType: activeTab,
      groupName:
        groupName.trim() ||
        (activeTab === 'Forum' ? 'Apartment Owners Forum' : 'Green Living & Composting'),
      title: title.trim(),
      content: content.trim(),
    });

    if (res.data) {
      setPosts((prev) => [res.data!, ...prev]);
      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      setGroupName('');
      addToast(
        'Post Published',
        `Your discussion post is now live in ${activeTab === 'Forum' ? 'Owners Forum' : 'Interest Group'}.`,
        'success'
      );
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.groupName.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-base font-bold text-[#0E2628]">Forums &amp; Interest Groups</h1>
            <p className="text-[11px] text-[#4E6E70]">
              Apartment Owners Discussions &amp; Community Circles
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold hover:bg-[#094348] transition-colors flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Topic</span>
        </button>
      </div>

      {/* Tabs Switcher: Owners Forum vs Interest Groups */}
      <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('Forum')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'Forum'
              ? 'bg-[#0D5C63] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Owners Forum (Resolutions)
        </button>
        <button
          onClick={() => setActiveTab('Interest Group')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'Interest Group'
              ? 'bg-[#0D5C63] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Interest Groups &amp; Clubs
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${activeTab === 'Forum' ? 'forum threads' : 'interest group stories'}…`}
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#0D5C63]"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading topics…</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No discussions found. Be the first to start a conversation!
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0D5C63]/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center font-bold text-xs">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{post.authorName}</p>
                    <p className="text-[10px] text-slate-500">
                      Flat {post.authorUnit} • {post.authorRole}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F3F3] text-[#0D5C63]">
                  {post.groupName}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#0E2628]">{post.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Interaction Bar: Likes & Comments */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 font-semibold transition-colors ${
                      post.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 stroke-rose-600' : ''}`}
                    />
                    <span>{post.likesCount}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount} comments</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    addToast('Topic Link Copied', `Shared "${post.title}" link.`, 'info')
                  }
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Discussion Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0E2628]">
                Start {activeTab === 'Forum' ? 'Owners Forum Discussion' : 'Interest Group Post'}
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {activeTab === 'Forum' ? 'Forum Topic Category' : 'Interest Group Name'}
                </label>
                <input
                  type="text"
                  placeholder={
                    activeTab === 'Forum'
                      ? 'e.g. EV Charging Norms / Annual General Meeting'
                      : 'e.g. Pet Parents Powai / Green Composting / Runners Club'
                  }
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="What is this discussion about?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Message / Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details, questions or proposals with your apartment neighbors…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0D5C63] text-white font-bold text-xs hover:bg-[#094348] transition-colors shadow-md mt-2"
              >
                Post to Community
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

