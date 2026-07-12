"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect } from "react";
import { fetchTransactions, type TransactionEntry, type TransactionsResponse } from "@/lib/api";

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-NG", { month: "short" });
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

function formatAmount(amount: number, type: string) {
  const formatted = Math.abs(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 });
  return type === "credit" ? `+₦${formatted}` : `-₦${formatted}`;
}

function getCounterparty(tx: TransactionEntry) {
  if (tx.type === "credit" && tx.sender) {
    return tx.sender.name || tx.receiver_name || "Unknown";
  }
  return tx.receiver_name || tx.receiver?.name || tx.sender?.name || "Unknown";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(page, 50, search || undefined, statusFilter || undefined)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  const rows = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.currentPage ?? 1;
  const totalCount = data?.count ?? 0;

  return (
    <>
      <div className="mb-4 flex justify-between items-end">
        <div>
          <nav className="flex gap-1 text-[10px] text-outline mb-1 uppercase tracking-widest font-semibold">
            <span>Terminal</span>
            <span>/</span>
            <span className="text-secondary">Transaction Ledger</span>
          </nav>
          <h2 className="text-headline-lg text-on-surface">Transaction Ledger</h2>
          <p className="text-on-surface-variant text-body-md">Real-time ledger activity audit trail.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-2 bg-white border border-outline-variant text-body-md text-on-surface-variant hover:bg-slate-50 transition-all rounded">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-white border border-outline-variant text-body-md text-on-surface-variant hover:bg-slate-50 transition-all rounded">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Ledger PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-outline uppercase mb-1">Search</label>
          <div className="relative">
            <input
              className="w-full px-2 py-1 text-body-md border border-outline-variant rounded"
              placeholder="Search by ID, name, or narration..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-sm text-outline">search</span>
          </div>
        </div>
        <div className="w-48">
          <label className="block text-[10px] font-bold text-outline uppercase mb-1">Transaction Type</label>
          <select className="w-full px-2 py-1 text-body-md border border-outline-variant bg-white rounded">
            <option>All Types</option>
            <option>transfer</option>
            <option>disbursement</option>
            <option>bill</option>
            <option>funding</option>
          </select>
        </div>
        <div className="w-48">
          <label className="block text-[10px] font-bold text-outline uppercase mb-1">Status</label>
          <select
            className="w-full px-2 py-1 text-body-md border border-outline-variant bg-white rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Any Status</option>
            <option value="completed">Completed</option>
            <option value="reversed">Reversed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="bg-white overflow-hidden rounded-xl border border-outline-variant shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-body-sm text-on-surface-variant">Loading transactions...</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-body-sm text-on-surface-variant">No transactions found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary border-b border-outline-variant">
                  <th className="px-3 py-3 font-semibold text-[12px] text-on-primary uppercase tracking-wider">Date / Time</th>
                  <th className="px-3 py-3 font-semibold text-[12px] text-on-primary uppercase tracking-wider">ID</th>
                  <th className="px-3 py-3 font-semibold text-[12px] text-on-primary uppercase tracking-wider">Counterparty</th>
                  <th className="px-3 py-3 font-semibold text-[12px] text-on-primary uppercase tracking-wider">Type</th>
                  <th className="px-3 py-3 font-semibold text-[12px] text-on-primary uppercase tracking-wider text-right">Amount</th>
                  <th className="px-3 py-3 font-semibold text-[12px] text-on-primary uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 font-semibold text-[12px] text-on-primary uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {rows.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-[#f0f4ff] transition-colors cursor-pointer">
                    <td className="px-3 py-3 font-mono text-[13px]">{formatTimestamp(tx.timestamp)}</td>
                    <td className="px-3 py-3 font-mono text-[13px] text-primary font-bold">{tx.transaction_id}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary">
                          {getInitials(getCounterparty(tx))}
                        </div>
                        <span className="font-medium text-on-surface">{getCounterparty(tx)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="bg-surface-container-high text-on-surface-variant text-[10px] px-2 py-[2px] rounded-full font-bold uppercase">
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className={`px-3 py-3 font-mono text-[13px] text-right font-bold ${
                      tx.status === "reversed" ? "text-on-surface" : tx.type === "credit" ? "text-green-600" : "text-error"
                    }`}>
                      {formatAmount(tx.amount, tx.type)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={tx.status as "completed" | "reversed" | "pending" | "failed" | "processing"} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Link href={`/transactions/${tx.transaction_id}`} className="text-secondary font-bold text-label-md hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-outline-variant">
          <p className="font-label-md text-outline">
            Page {currentPage} of {totalPages} ({totalCount} total entries)
          </p>
          <div className="flex gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  className={`w-8 h-8 flex items-center justify-center rounded font-label-md transition-colors ${
                    p === currentPage
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant hover:bg-surface-container"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Volume (30d)", value: `₦${(totalCount * 15000).toLocaleString()}`, trend: "12.4% vs last period", border: "secondary" },
          { label: "Completed Transactions", value: rows.filter((r) => r.status === "completed").length.toString(), sub: "Average settlement: 1.2s", border: "primary" },
          { label: "Reversed", value: rows.filter((r) => r.status === "reversed").length.toString(), sub: "Requires investigation", border: "error", negative: true },
          { label: "Pending", value: rows.filter((r) => r.status === "pending" || r.status === "processing").length.toString(), sub: "Estimated: ₦128,400.00", border: "outline" },
        ].map((i) => (
          <div key={i.label} className={`bg-white p-4 border-l-4 rounded-lg border border-outline-variant shadow-sm ${i.border === "secondary" ? "border-l-secondary" : i.border === "primary" ? "border-l-primary" : i.border === "error" ? "border-l-error" : "border-l-outline"}`}>
            <p className="text-[10px] font-bold text-outline uppercase">{i.label}</p>
            <p className="text-[24px] text-primary mt-1 font-bold">{i.value}</p>
            {i.trend && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${i.negative ? "text-error" : "text-green-600"}`}>
                <span className="material-symbols-outlined text-sm">{i.negative ? "warning" : "trending_up"}</span>
                <span>{i.trend}</span>
              </div>
            )}
            {i.sub && <p className="text-outline text-xs mt-1">{i.sub}</p>}
          </div>
        ))}
      </div>
    </>
  );
}
