'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Camera,
  X,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Sparkles,
  Building,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';

interface FacilityQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SAMPLE_FACILITY_QRS = [
  { id: 'amen_01', name: 'Clubhouse AC Unit 2', location: 'Ground Floor Clubhouse' },
  { id: 'amen_02', name: 'Gym Treadmill #3', location: 'Fitness Centre 1st Floor' },
  { id: 'amen_03', name: 'Tennis Court Floodlight B', location: 'Outdoor Sports Deck' },
  { id: 'amen_04', name: 'Swimming Pool Filter Pump', location: 'Pool Filtration Plant' },
  { id: 'amen_05', name: 'Tower A Passenger Lift #2', location: 'Wing A Main Lobby' },
];

export function FacilityQRScannerModal({
  isOpen,
  onClose,
  onSuccess,
}: FacilityQRScannerModalProps) {
  const { currentUser, addToast } = useSociety();
  const [scannedFacility, setScannedFacility] = useState(SAMPLE_FACILITY_QRS[1]);
  const [isScanning, setIsScanning] = useState(true);
  const [complaintTitle, setComplaintTitle] = useState('Treadmill belt slipping under load');
  const [complaintDesc, setComplaintDesc] = useState(
    'The incline motor is making a loud buzzing sound and belt stops abruptly at speeds above 8 km/h.'
  );
  const [photoAttached, setPhotoAttached] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleScanPreset = (fac: (typeof SAMPLE_FACILITY_QRS)[0]) => {
    setScannedFacility(fac);
    setComplaintTitle(`${fac.name} Malfunction`);
    setComplaintDesc(`Equipment at ${fac.location} reported malfunctioning via QR Code scan.`);
    setIsScanning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await SocietyApi.services.createServiceRequest({
        deskType: 'Helpdesk',
        category: 'Facility Equipment',
        title: `[QR] ${complaintTitle}`,
        description: `${complaintDesc} (Equipment: ${scannedFacility.name} at ${scannedFacility.location})`,
        facilityId: scannedFacility.id,
        qrScanned: true,
        photoBefore: photoAttached ? '/images/smart_society_campus_isometric.jpg' : undefined,
      });

      if (res.data) {
        addToast(
          'Facility Malfunction Logged',
          `Complaint for ${scannedFacility.name} filed with priority tag. Staff alerted.`,
          'success'
        );
        if (onSuccess) onSuccess();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl space-y-4 animate-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-[#073B3E] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D5C63] flex items-center justify-center text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Facility QR Scanner</h2>
              <p className="text-[10px] text-emerald-200">ANACITY Unique Feature</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {isScanning ? (
            <div className="space-y-3.5 text-center">
              {/* Camera Scanner Viewfinder Simulator */}
              <div className="relative w-full aspect-square max-h-56 bg-slate-900 rounded-2xl overflow-hidden border-2 border-[#0D5C63] flex items-center justify-center mx-auto shadow-inner">
                <div className="w-40 h-40 border-2 border-dashed border-emerald-400/90 rounded-2xl flex items-center justify-center relative">
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 animate-bounce" />
                  <Camera className="w-10 h-10 text-emerald-400/60" />
                </div>
                <div className="absolute bottom-2 inset-x-2 text-center text-[10px] text-emerald-200 bg-black/60 py-1 rounded-md">
                  Point camera at QR sticker attached on the amenity
                </div>
              </div>

              {/* Quick Preset Selector for instant demo */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Or tap an amenity QR code below to simulate:
                </span>
                <div className="space-y-1">
                  {SAMPLE_FACILITY_QRS.map((fac) => (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => handleScanPreset(fac)}
                      className="w-full p-2 rounded-xl bg-slate-50 hover:bg-[#E6F3F3] text-left border border-slate-200/80 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-[#0E2628] block">{fac.name}</span>
                        <span className="text-[10px] text-slate-500">{fac.location}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#0D5C63] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Scanned Form Screen */
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div className="p-3 rounded-2xl bg-[#E6F3F3] border border-[#C4E4E6] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#0D5C63]">
                    QR Verified Equipment
                  </span>
                  <p className="font-bold text-xs text-[#073B3E]">{scannedFacility.name}</p>
                  <p className="text-[10px] text-slate-500">{scannedFacility.location}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="text-[10px] font-bold text-[#0D5C63] underline"
                >
                  Rescan
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Issue Summary
                </label>
                <input
                  type="text"
                  required
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Malfunction Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              {/* Photo Attachment Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-600 font-medium">Attach Equipment Photo</span>
                <button
                  type="button"
                  onClick={() => setPhotoAttached(!photoAttached)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    photoAttached
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {photoAttached ? '✓ Photo Attached' : '+ Add Photo'}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#0D5C63] text-white font-bold text-xs hover:bg-[#094348] transition-colors shadow-md"
              >
                {submitting ? 'Submitting to Staff…' : 'Submit QR Facility Complaint'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

