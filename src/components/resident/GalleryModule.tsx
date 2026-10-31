'use client';

import React, { useState, useEffect } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Album, MediaItem } from '@/types';
import {
  Image as ImageIcon,
  Search,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';

export function GalleryModule() {
  const { albums, uploadMedia, currentUser, addToast } = useSociety();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [targetAlbumId, setTargetAlbumId] = useState(albums[0]?.id || '');

  const categories = ['All', 'Festivals', 'Sports', 'Clubhouse', 'Events'];

  const filteredAlbums = albums.filter((alb) => {
    if (selectedCategory !== 'All' && alb.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return alb.title.toLowerCase().includes(q) || alb.category.toLowerCase().includes(q);
    }
    return true;
  });

  const activeMediaList = activeAlbum ? activeAlbum.mediaItems : [];

  // Lightbox keyboard controls
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < activeMediaList.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activeMediaList.length - 1));
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, activeMediaList.length]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      addToast('Upload Error', 'Please enter a title for the photograph', 'error');
      return;
    }

    const finalUrl =
      uploadUrl.trim() ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';

    uploadMedia(targetAlbumId, uploadTitle, finalUrl);
    setIsUploadOpen(false);
    setUploadTitle('');
    setUploadUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
            Community Gallery
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
            Moments, festivals, and sporting memories captured at Green Valley Residency.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B21A8] text-white font-semibold text-xs hover:bg-[#581C87] transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Contribute Photos</span>
        </button>
      </div>

      {/* Album Detail or Album Listing */}
      {activeAlbum ? (
        <div className="space-y-6">
          <button
            onClick={() => setActiveAlbum(null)}
            className="flex items-center gap-2 text-xs font-semibold text-[#6B21A8] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Albums</span>
          </button>

          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2F2]">
            <div>
              <span className="text-[10px] font-bold uppercase bg-purple-50 text-[#6B21A8] px-2.5 py-0.5 rounded-full">
                {activeAlbum.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {activeAlbum.title}
              </h2>
              <p className="text-xs text-slate-500">{activeAlbum.date} • {activeAlbum.count} photos</p>
            </div>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeAlbum.mediaItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-white">
                  <p className="text-xs font-bold leading-tight truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">By {item.uploader}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Albums Grid */
        <div className="space-y-6">
          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c
                      ? 'bg-[#6B21A8] text-white'
                      : 'bg-white border border-[#EAE2F2] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE2F2] rounded-xl text-xs focus:outline-none focus:border-[#6B21A8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((alb) => (
              <div
                key={alb.id}
                onClick={() => setActiveAlbum(alb)}
                className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={alb.coverImage}
                    alt={alb.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 px-2.5 py-1 rounded-full text-slate-800 shadow-sm">
                      {alb.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{alb.count} Photos</span>
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#6B21A8] transition-colors">
                      {alb.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{alb.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#6B21A8] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox */}
      {lightboxIndex !== null && activeAlbum && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div>
              <p className="text-sm font-bold">{activeAlbum.mediaItems[lightboxIndex]?.title}</p>
              <p className="text-xs text-slate-400">
                Photo {lightboxIndex + 1} of {activeAlbum.mediaItems.length} • Contributed by{' '}
                {activeAlbum.mediaItems[lightboxIndex]?.uploader}
              </p>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Image Viewport */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : activeAlbum.mediaItems.length - 1
                )
              }
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-4xl h-full max-h-[75vh]">
              <Image
                src={activeAlbum.mediaItems[lightboxIndex]?.url || ''}
                alt={activeAlbum.mediaItems[lightboxIndex]?.title || ''}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev < activeAlbum.mediaItems.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Caption */}
          <div className="text-center text-xs text-slate-400">
            Press Esc to exit • Use Left and Right arrow keys to navigate
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Contribute Society Photo</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Album
                </label>
                <select
                  value={targetAlbumId}
                  onChange={(e) => setTargetAlbumId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8] bg-white"
                >
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Photo Caption / Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Diya lighting with family"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image URL (or demo sample will be used)
                </label>
                <input
                  type="url"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                />
              </div>

              <div className="p-3 bg-[#F8F6FC] rounded-xl text-[11px] text-slate-600">
                Uploaded pictures are submitted to the management committee for moderation before being visible to everyone.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold shadow-sm"
                >
                  Submit Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
