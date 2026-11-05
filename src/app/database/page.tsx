'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Database, RefreshCw, Table as TableIcon, CheckCircle2, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface DbInspectorResponse {
  database: string;
  host: string;
  activeTable: string;
  tables: string[];
  counts: Record<string, number>;
  columns: string[];
  rows: Record<string, unknown>[];
}

export default function DatabaseExplorerPage() {
  const [activeTable, setActiveTable] = useState('visitors');
  const [data, setData] = useState<DbInspectorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchTableData = useCallback(async (tbl: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/db-inspector?table=${encodeURIComponent(tbl)}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        setLastRefreshed(new Date().toLocaleTimeString('en-IN'));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTableData(activeTable);
    const interval = setInterval(() => {
      void fetchTableData(activeTable);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTable, fetchTableData]);

  const filteredRows = (data?.rows || []).filter((row) =>
    search.trim()
      ? JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top phpMyAdmin-style Header Bar */}
      <header className="bg-[#073B3E] text-white px-5 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App UI
          </Link>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-300" />
            <div>
              <h1 className="text-sm font-bold tracking-tight flex items-center gap-2">
                MySQL Live Database Inspector (phpMyAdmin View)
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3" />
                  LIVE CONNECTED (Auto-refresh 3s)
                </span>
              </h1>
              <p className="text-[11px] text-slate-300 font-mono">
                Server: {data?.host || '127.0.0.1'}:3306 » Database: {data?.database || 'apna_society'} » Table: {activeTable}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-300">Last synced: {lastRefreshed}</span>
          )}
          <button
            type="button"
            onClick={() => fetchTableData(activeTable)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D5C63] hover:bg-[#2A9296] text-xs font-bold border border-white/15 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: All 24 MySQL Tables with Live Row Counts */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tables ({data?.tables.length || 24})
          </div>
          {(data?.tables || []).map((tbl) => {
            const active = tbl === activeTable;
            const count = data?.counts?.[tbl] ?? 0;
            return (
              <button
                key={tbl}
                type="button"
                onClick={() => setActiveTable(tbl)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#0D5C63] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <TableIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                  <span className="truncate font-mono">{tbl}</span>
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main Content: SQL Query Banner + Table Data Grid */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* SQL Query Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="font-mono text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <span className="text-[#0D5C63] font-bold">SELECT</span> *{' '}
              <span className="text-[#0D5C63] font-bold">FROM</span> `{activeTable}`{' '}
              <span className="text-[#0D5C63] font-bold">ORDER BY</span> created_at{' '}
              <span className="text-[#0D5C63] font-bold">DESC LIMIT</span> 100;
            </div>

            <div className="relative w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Filter ${activeTable} rows...`}
                className="w-full pl-3.5 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0D5C63]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono">
                    {(data?.columns || []).map((col) => (
                      <th key={col} className="px-3.5 py-2.5 font-bold whitespace-nowrap border-r border-slate-200/60">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 font-mono text-[11px]">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={Math.max(1, data?.columns.length || 1)}
                        className="px-4 py-8 text-center text-slate-400 font-sans"
                      >
                        No rows in `{activeTable}` matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#E6F3F3]/40 transition-colors">
                        {(data?.columns || []).map((col) => {
                          const val = row[col];
                          const display =
                            val === null || val === undefined
                              ? 'NULL'
                              : typeof val === 'object'
                              ? JSON.stringify(val)
                              : String(val);
                          return (
                            <td
                              key={col}
                              className="px-3.5 py-2 whitespace-nowrap max-w-xs truncate border-r border-slate-100"
                              title={display}
                            >
                              {val === null ? (
                                <span className="italic text-slate-400">NULL</span>
                              ) : (
                                display
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

