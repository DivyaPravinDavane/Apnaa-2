'use client';

import React from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Check, X } from 'lucide-react';
import Image from 'next/image';

export function AdminGalleryModeration() {
  const { albums, moderateMedia } = useSociety();

  // Find all items across albums with pending status or sample items
  const allMediaItems = albums.flatMap((a) =>
    a.mediaItems.map((m) => ({ ...m, albumId: a.id, albumTitle: a.title }))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
          Gallery Content Moderation
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
          Review resident-submitted photographs before publishing them to the public society gallery.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EAE2F2] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">Submitted Photos Queue</h3>
          <span className="text-xs font-semibold text-slate-500">
            Total {allMediaItems.length} photos in library
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allMediaItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative h-48 w-full">
                <Image src={item.url} alt={item.title} fill className="object-cover" />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      item.status === 'approved'
                        ? 'bg-emerald-600 text-white'
                        : item.status === 'rejected'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 truncate">{item.title}</h4>
                <p className="text-xs text-slate-500">
                  Album: <strong>{item.albumTitle}</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Uploaded by {item.uploader} on {item.date}
                </p>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => moderateMedia(item.albumId, item.id, 'approved')}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => moderateMedia(item.albumId, item.id, 'rejected')}
                    className="flex-1 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
