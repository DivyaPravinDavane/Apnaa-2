'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Droplets,
  Shirt,
  Sparkles,
  Wrench,
  Clock,
  Star,
  CheckCircle2,
  ArrowLeft,
  Phone,
  Search,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';
import type { LocalService } from '@/types';

interface LocalServicesModuleProps {
  onBack?: () => void;
}

export function LocalServicesModule({ onBack }: LocalServicesModuleProps) {
  const { currentUser, addToast } = useSociety();
  const [services, setServices] = useState<LocalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderingId, setOrderingId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SocietyApi.localServices.list();
      if (res.data) {
        setServices(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const handleOrder = async (service: LocalService) => {
    setOrderingId(service.id);
    try {
      const res = await SocietyApi.localServices.order(service.id);
      if (res.data) {
        addToast(
          'Order Placed with Local Store',
          `Order #${res.data.orderId} confirmed! ETA: ${res.data.eta}. Delivery Gate Pass ${res.data.passCode} sent to Gate 1 security.`,
          'success'
        );
      }
    } finally {
      setOrderingId(null);
    }
  };

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'grocery':
        return <ShoppingBag className="w-5 h-5" />;
      case 'water':
        return <Droplets className="w-5 h-5" />;
      case 'laundry':
        return <Shirt className="w-5 h-5" />;
      case 'cleaning':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.providerName.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-base font-bold text-[#0E2628]">Local Services &amp; Ordering</h1>
            <p className="text-[11px] text-[#4E6E70]">
              Verified Vendors with Direct Gate Delivery Clearance
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Guarantee Banner */}
      <div className="p-3.5 rounded-2xl bg-[#E6F3F3] border border-[#C4E4E6] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0D5C63] text-white flex items-center justify-center font-bold flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-[#073B3E]">Direct Flat Delivery</p>
          <p className="text-[#0E2628]/80 text-[11px]">
            Orders placed automatically generate an instant gate pass code for the delivery agent so
            they are cleared at Gate 1 without bothering you with calls.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groceries, water cans, laundry, repairs…"
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#0D5C63]"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading local services…</div>
        ) : filteredServices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No services match your search query.
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0D5C63]/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center font-bold shadow-2xs">
                    {getIcon(service.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0E2628]">{service.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">
                        {service.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{service.providerName}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" />
                        {service.rating}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-700">ETA: {service.eta}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-800">{service.priceStarting}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${service.phone}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Call Store</span>
                </a>

                <button
                  onClick={() => handleOrder(service)}
                  disabled={orderingId === service.id}
                  className="px-4 py-1.5 rounded-full bg-[#0D5C63] hover:bg-[#094348] text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {orderingId === service.id ? 'Ordering…' : 'Order Now (1-Tap)'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

