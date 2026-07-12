"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchKycSubmissions, type KycFilterParams } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

type KycRow = {
  id: number;
  user: string;
  tier: string;
  status: string;
  updated_at: string;
  meta_address_status?: string;
  meta_bill_status?: string;
  tier_1_verified?: boolean;
  tier_2_verified?: boolean;
  tier_3_verified?: boolean;
};

type PageResponse = {
  count: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
  data: KycRow[];
};

export default function KYCListPage() {
  const [data, setData] = useState<PageResponse | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [metaAddressStatus, setMetaAddressStatus] = useState("");
  const [metaBillStatus, setMetaBillStatus] = useState("");
  const [tier1Verified, setTier1Verified] = useState("");
  const [tier2Verified, setTier2Verified] = useState("");
  const [tier3Verified, setTier3Verified] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, metaAddressStatus, metaBillStatus, tier1Verified, tier2Verified, tier3Verified, updatedAt]);

  useEffect(() => {
    setLoading(true);
    const params: KycFilterParams = { page };
    if (search) params.search = search;
    if (metaAddressStatus) params.meta_address_status = metaAddressStatus;
    if (metaBillStatus) params.meta_bill_status = metaBillStatus;
    if (tier1Verified) params.tier_1_verified = tier1Verified;
    if (tier2Verified) params.tier_2_verified = tier2Verified;
    if (tier3Verified) params.tier_3_verified = tier3Verified;
    if (updatedAt) params.updated_at = updatedAt;
    fetchKycSubmissions(params)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, search, metaAddressStatus, metaBillStatus, tier1Verified, tier2Verified, tier3Verified, updatedAt]);

  const rows = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.currentPage ?? 1;

  function normalizeStatus(s: string) {
    return s.toLowerCase();
  }

  return (
    <>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-headline-lg text-primary">KYC Individual Verification</h2>
          <p className="text-body-md text-on-surface-variant">
            Review and manage institutional-grade identity submissions.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-primary text-primary rounded font-label-md hover:bg-surface-container-low transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded font-label-md hover:opacity-90 transition-opacity">
            Batch Approve
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="font-label-md text-outline uppercase tracking-wider mb-1">Total Submissions</p>
          <p className="text-display-lg text-primary">{data?.count ?? "—"}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="font-label-md text-outline uppercase tracking-wider mb-1">Current Page</p>
          <p className="text-display-lg text-primary">{currentPage}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant border-l-4 border-l-error">
          <p className="font-label-md text-outline uppercase tracking-wider mb-1">Total Pages</p>
          <p className="text-display-lg text-error">{totalPages}</p>
        </div>
        <div className="bg-primary text-on-primary p-4 rounded-xl flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-label-md text-primary-fixed opacity-70 uppercase tracking-wider mb-1">Tier 1 Verified</p>
            <p className="text-headline-md font-bold text-secondary-fixed">
              {rows.filter((r) => r.tier_1_verified).length} verified
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant">
        <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
            <input
              className="w-full pl-9 pr-4 py-1.5 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
              placeholder="Search by user or ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-1.5 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
            value={metaAddressStatus}
            onChange={(e) => setMetaAddressStatus(e.target.value)}
          >
            <option value="">All Meta Address</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
            <option value="approved">Approved</option>
            <option value="submitted">Submitted</option>
            <option value="awaiting">Awaiting</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <select
            className="px-3 py-1.5 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
            value={metaBillStatus}
            onChange={(e) => setMetaBillStatus(e.target.value)}
          >
            <option value="">All Meta Bill</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
            <option value="approved">Approved</option>
            <option value="submitted">Submitted</option>
            <option value="awaiting">Awaiting</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <select
            className="px-3 py-1.5 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
            value={tier1Verified}
            onChange={(e) => setTier1Verified(e.target.value)}
          >
            <option value="">Tier 1: All</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
          <select
            className="px-3 py-1.5 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
            value={tier2Verified}
            onChange={(e) => setTier2Verified(e.target.value)}
          >
            <option value="">Tier 2: All</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
          <select
            className="px-3 py-1.5 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
            value={tier3Verified}
            onChange={(e) => setTier3Verified(e.target.value)}
          >
            <option value="">Tier 3: All</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
          <input
            type="date"
            className="px-3 py-1.5 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
            value={updatedAt}
            onChange={(e) => setUpdatedAt(e.target.value)}
          />
          <button
            className="px-3 py-1.5 text-body-sm font-label-md text-outline border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setMetaAddressStatus("");
              setMetaBillStatus("");
              setTier1Verified("");
              setTier2Verified("");
              setTier3Verified("");
              setUpdatedAt("");
            }}
          >
            Reset
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-body-sm text-on-surface-variant">Loading KYC submissions...</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-body-sm text-on-surface-variant">No submissions found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary text-on-primary">
                <tr>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px]">User</th>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px]">Meta Address</th>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px]">Meta Bill</th>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px]">Tier 1</th>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px]">Tier 2</th>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px]">Tier 3</th>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px]">Last Updated</th>
                  <th className="px-4 py-3 font-label-md uppercase tracking-widest text-[10px] text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {row.user?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-body-md font-semibold text-primary">{row.user || `User #${row.id}`}</p>
                          <p className="text-[11px] text-outline">#{row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {row.meta_address_status ? (
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-tighter ${
                          ["verified", "approved"].includes(normalizeStatus(row.meta_address_status))
                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : ["rejected", "unverified"].includes(normalizeStatus(row.meta_address_status))
                              ? "bg-[#FFEBEE] text-[#C62828]"
                              : "bg-[#FFF3E0] text-[#EF6C00]"
                        }`}>
                          {row.meta_address_status}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {row.meta_bill_status ? (
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-tighter ${
                          ["verified", "approved"].includes(normalizeStatus(row.meta_bill_status))
                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : ["rejected", "unverified"].includes(normalizeStatus(row.meta_bill_status))
                              ? "bg-[#FFEBEE] text-[#C62828]"
                              : "bg-[#FFF3E0] text-[#EF6C00]"
                        }`}>
                          {row.meta_bill_status}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-tighter ${
                        row.tier_1_verified ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#C62828]"
                      }`}>
                        {row.tier_1_verified ? "Verified" : "Not Verified"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-tighter ${
                        row.tier_2_verified ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#C62828]"
                      }`}>
                        {row.tier_2_verified ? "Verified" : "Not Verified"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-tighter ${
                        row.tier_3_verified ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#C62828]"
                      }`}>
                        {row.tier_3_verified ? "Verified" : "Not Verified"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {row.updated_at ? new Date(row.updated_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="inline-flex items-center gap-1 p-2 rounded-full text-primary hover:bg-primary-fixed transition-colors"
                        href={`/kyc/${row.id}`}
                      >
                        <Icon name="visibility" />
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
            Page {currentPage} of {totalPages} ({data?.count ?? 0} total entries)
          </p>
          <div className="flex gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!data?.previousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Icon name="chevron_left" className="text-sm" />
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
              disabled={!data?.nextPage}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <Icon name="chevron_right" className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}