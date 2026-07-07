"use client";

import Link from "next/link";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect } from "react";
import { fetchAllWebhookPayments, fetchKycSubmissions } from "@/lib/api";

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
};

const transactions = [
  { date: "2023-10-28", entity: "Goldman Sachs Int.", ref: "SWIFT #TRX-99210", status: "Settled", amount: "-$2,400,000.00", positive: false },
  { date: "2023-10-27", entity: "AWS Cloud Infrastructure", ref: "INV-2023-09", status: "Settled", amount: "-$42,150.00", positive: false },
  { date: "2023-10-27", entity: "Inbound WIRE - Oracle Corp", ref: "REF: LICENSE_FY24", status: "Processing", amount: "+$850,000.00", positive: true },
];

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
  const [loading, setLoading] = useState(true);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    fetchAllWebhookPayments()
      .then((res) => setWebhooks(res.results.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetchKycSubmissions()
      .then((res) => setKycSubmissions(res.results.slice(0, 5)))
      .catch(() => setKycSubmissions([]))
      .finally(() => setKycLoading(false));
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

  function normalizeStatus(status: string) {
    return status.toLowerCase();
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
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Request for upgrade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {kycLoading ? (
                <tr>
                  <td className="px-2 sm:px-4 py-3 text-body-sm text-on-surface-variant" colSpan={4}>Loading recent KYC submissions...</td>
                </tr>
              ) : (
                kycSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-body-sm font-bold text-primary">{item.user}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-body-sm text-on-surface-variant">{item.tier}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <StatusBadge status={normalizeStatus(item.status) as "pending" | "verified" | "settled" | "flagged" | "failed" | "processing" | "active" | "suspended" | "completed"} />
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
              {transactions.map((tx) => (
                <tr key={tx.ref} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 data-font text-body-sm text-on-surface-variant">{tx.date}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-body-sm text-primary">{tx.entity}</span>
                      <span className="text-label-md text-on-surface-variant">{tx.ref}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <StatusBadge status={tx.status.toLowerCase() as "settled" | "processing"} />
                  </td>
                  <td className={`px-2 sm:px-4 py-2 sm:py-3 text-right data-font font-bold ${tx.positive ? "text-green-600" : "text-primary"}`}>
                    {tx.amount}
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
