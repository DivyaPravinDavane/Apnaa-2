'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { FileText, Search, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function AdminAuditReports() {
  const { auditLogs, addToast } = useSociety();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Action,Actor,Timestamp,Details']
        .concat(
          auditLogs.map(
            (l) => `"${l.id}","${l.action}","${l.actor}","${l.timestamp}","${l.details}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Society_Audit_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Audit Trail Exported', 'CSV report downloaded successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
            Audit Logs & Compliance Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
            Immutable log of gate verifications, booking creations, notice broadcasts, and policy modifications.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B21A8] text-white font-semibold text-xs hover:bg-[#581C87] transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#EAE2F2] shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action, or details..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8F6FC] border border-[#EAE2F2] rounded-xl text-xs focus:outline-none focus:border-[#6B21A8]"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} audit records
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F8F6FC] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EAE2F2]">
              <tr>
                <th className="px-6 py-4">Action Event</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{log.action}</td>
                  <td className="px-6 py-4 font-semibold text-[#6B21A8]">{log.actor}</td>
                  <td className="px-6 py-4 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="px-6 py-4 text-slate-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
