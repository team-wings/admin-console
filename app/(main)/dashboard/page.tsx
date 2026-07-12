"use client";

import Link from "next/link";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect } from "react";
import { fetchAllWebhookPayments, fetchKycSubmissions, fetchTransactions, fetchHealthStatus, type TransactionEntry, type HealthStatus } from "@/lib/api";

type WebhookEntry = {
  id: number;
  user: string;
  event: string;
  amount: string;
  status: string;
  created_at: string;
};

type KycSubmissionEntry = {
  id: number;
  user: string;
  tier: string;
  status: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  bvn?: string;
  nin?: string;
  selfie_url?: string;
  meta_bvn_status?: string;
  meta_nin_status?: string;
  meta_selfie_status?: string;
  meta_address_status?: string;
  meta_bill_status?: string;
  tier_1_verified?: boolean;
  tier_2_verified?: boolean;
  tier_3_verified?: boolean;
};

function TableCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest bento-card rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-outline-variant flex justify-between items-center">
        <h4 className="text-headline-md text-lg text-primary">{title}</h4>
        {action}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmissionEntry[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionEntry[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycLoading, setKycLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    fetchAllWebhookPayments()
      .then((res) => setWebhooks(res.results.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetchKycSubmissions()
      .then((res) => setKycSubmissions((res.data || res.results || []).slice(0, 5)))
      .catch(() => setKycSubmissions([]))
      .finally(() => setKycLoading(false));

    fetchTransactions()
      .then((res) => setRecentTransactions((res.data?.data || []).slice(0, 5)))
      .catch(() => setRecentTransactions([]))
      .finally(() => setTxLoading(false));

    fetchHealthStatus()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-NG", { month: "short" });
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const seconds = d.getSeconds().toString().padStart(2, "0");
    const ms = d.getMilliseconds().toString().padStart(3, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}.${ms}`;
  }

  function normalizeStatus(status?: string) {
    return status?.toLowerCase() ?? "";
  }

  function formatTxDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
  }

  function getTxCounterparty(tx: TransactionEntry) {
    if (tx.type === "credit" && tx.sender) return tx.sender.name;
    return tx.receiver_name || tx.receiver?.name || tx.sender?.name || "Unknown";
  }

  function formatTxAmount(amount: number, type: string) {
    const formatted = Math.abs(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 });
    return type === "credit" ? `+₦${formatted}` : `-₦${formatted}`;
  }

  return (
    <>
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-2">
        <div>
          <h2 className="text-headline-lg text-primary">Operational Monitoring</h2>
          <p className="text-body-lg text-on-surface-variant">
            Real-time tracking of KYC submissions and system webhook events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button className="flex items-center gap-1 sm:gap-2 bg-surface-container-lowest border border-outline-variant px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold hover:bg-surface-container-low transition-colors text-xs sm:text-sm md:text-base">
            <span className="material-symbols-outlined text-lg sm:text-xl">person_add</span>
            <span>Add User</span>
          </button>
          <button className="flex items-center gap-1 sm:gap-2 bg-surface-container-lowest border border-outline-variant px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold hover:bg-surface-container-low transition-colors text-xs sm:text-sm md:text-base">
            <span className="material-symbols-outlined text-lg sm:text-xl">receipt_long</span>
            <span>Pay Bill</span>
          </button>
          <button className="flex items-center gap-1 sm:gap-2 bg-secondary-container text-on-secondary-container px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm text-xs sm:text-sm md:text-base">
            <span className="material-symbols-outlined text-lg sm:text-xl">add_circle</span>
            <span>New Transaction</span>
          </button>
        </div>
      </section>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-headline-md text-lg text-primary">Services Health</h4>
          {health && (
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-tighter ${
              health.overall_status === "up" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF3E0] text-[#EF6C00]"
            }`}>
              {health.overall_status}
            </span>
          )}
        </div>
        {!health ? (
          <p className="text-body-sm text-on-surface-variant">Loading health status...</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant">
              <div className={`w-3 h-3 rounded-full ${health.app.status === "up" ? "bg-[#2E7D32]" : "bg-[#C62828]"}`} />
              <div className="flex-1">
                <p className="text-body-sm font-semibold text-primary">App</p>
                <p className="text-[12px] text-on-surface-variant">{health.app.message}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(health.services).map(([name, svc]) => (
                <div key={name} className={`rounded-lg border p-3 ${
                  svc.status === "up" ? "border-[#E8F5E9] bg-[#E8F5E9]/30" : "border-[#FFEBEE] bg-[#FFEBEE]/30"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${svc.status === "up" ? "bg-[#2E7D32]" : "bg-[#C62828]"}`} />
                    <span className="text-[13px] font-bold text-primary capitalize">{name}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{svc.message}</p>
                </div>
              ))}
            </div>
            {health.errors && Object.keys(health.errors).length > 0 && (
              <div className="mt-3 pt-3 border-t border-outline-variant">
                {Object.entries(health.errors).map(([key, msg]) => (
                  <p key={key} className="text-[11px] text-error font-mono">{key}: {msg}</p>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 sm:col-span-6">
          <MetricCard
            label="Daily Transaction Inflow"
            value="₦4,250,000.00"
            icon="trending_up"
            trend={{ direction: "up", text: "+12.4% vs yesterday" }}
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <MetricCard
            label="Daily Transaction Outflow"
            value="₦1,820,000.00"
            icon="trending_down"
            trend={{ direction: "down", text: "-5.2% vs yesterday" }}
          />
        </div>

        <TableCard
          title="Recent KYC Submissions"
          action={<Link className="text-secondary font-bold text-label-md hover:underline" href="/kyc">View Queue</Link>}
        >
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Tiers</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Request for upgrade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {kycLoading ? (
                <tr>
                  <td className="px-2 sm:px-4 py-3 text-body-sm text-on-surface-variant" colSpan={3}>Loading recent KYC submissions...</td>
                </tr>
              ) : (
                kycSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-body-sm font-bold text-primary">{item.user}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-body-sm text-on-surface-variant">
                      {item.tier_1_verified && item.tier_2_verified && item.tier_3_verified
                        ? "Tier 3"
                        : item.tier_1_verified && item.tier_2_verified
                          ? "Tier 2"
                          : item.tier_1_verified
                            ? "Tier 1"
                            : "Not Verified"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <Link className="text-secondary font-bold text-label-md hover:underline" href={`/kyc/${item.id}`}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          title="Latest Webhook History"
          action={
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">LIVE</span>
              <a className="text-secondary font-bold text-label-md hover:underline" href="#">Debug Console</a>
            </div>
          }
        >
          {loading ? (
            <div className="p-4 text-center text-on-surface-variant text-body-sm">Loading webhook history...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Event Type</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {webhooks.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 data-font text-body-sm font-bold text-primary">{item.user}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-body-sm text-on-surface-variant">{item.event}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <StatusBadge status={item.status as "pending" | "verified" | "settled" | "flagged" | "failed" | "processing" | "active" | "suspended" | "completed"} />
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-body-sm text-on-surface-variant text-right whitespace-nowrap">₦{parseFloat(item.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-body-sm text-on-surface-variant hidden sm:table-cell">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>
      </div>
      <div className="bg-surface-container-lowest bento-card rounded-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-outline-variant flex justify-between items-center">
          <h4 className="text-headline-md text-lg text-primary">Recent Transactions</h4>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-lg sm:text-xl">filter_list</span>
            </button>
            <a className="text-secondary font-bold text-xs sm:text-label-md hover:underline whitespace-nowrap" href="#">Export CSV</a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Entity / Reference</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {txLoading ? (
                <tr>
                  <td className="px-2 sm:px-4 py-3 text-body-sm text-on-surface-variant" colSpan={4}>Loading recent transactions...</td>
                </tr>
              ) : recentTransactions.length === 0 ? (
                <tr>
                  <td className="px-2 sm:px-4 py-3 text-body-sm text-on-surface-variant" colSpan={4}>No transactions found.</td>
                </tr>
              ) : recentTransactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 data-font text-body-sm text-on-surface-variant">{formatTxDate(tx.timestamp)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-body-sm text-primary">{getTxCounterparty(tx)}</span>
                      <span className="text-label-md text-on-surface-variant">{tx.transaction_id}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <StatusBadge status={tx.status as "completed" | "reversed" | "pending" | "failed" | "processing"} />
                  </td>
                  <td className={`px-2 sm:px-4 py-2 sm:py-3 text-right data-font font-bold ${
                    tx.status === "reversed" ? "text-on-surface" : tx.type === "credit" ? "text-green-600" : "text-error"
                  }`}>
                    {formatTxAmount(tx.amount, tx.type)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-surface-container-low text-center">
          <button className="text-secondary font-bold text-body-sm hover:underline">
            View All Transactions
          </button>
        </div>
      </div>
    </>
  );
}
