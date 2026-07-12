"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { fetchTransactionDetail, type TransactionEntry } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";

const PUSH_LIMIT = 5;

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return `₦${Math.abs(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tx, setTx] = useState<TransactionEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionId = params?.id as string;

  const [pushCount, setPushCount] = useState(0);
  const [pushFinalised, setPushFinalised] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);

  const handleReversedPush = useCallback(async () => {
    if (pushFinalised || pushCount >= PUSH_LIMIT) return;
    setPushing(true);
    setPushError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/staff/transactions/check-reversed-status-confirmation/${transactionId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const newCount = pushCount + 1;
      setPushCount(newCount);
      if (newCount >= PUSH_LIMIT) {
        setPushFinalised(true);
        setPushError("The final state has been finalised");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Push failed");
      }
    } catch (err) {
      setPushError(err instanceof Error ? err.message : "Push failed");
    } finally {
      setPushing(false);
    }
  }, [transactionId, pushCount, pushFinalised]);

  const handleProcessingPush = useCallback(async () => {
    if (pushFinalised || pushCount >= PUSH_LIMIT) return;
    setPushing(true);
    setPushError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/staff/transactions/check-processing-status/${transactionId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const newCount = pushCount + 1;
      setPushCount(newCount);
      if (newCount >= PUSH_LIMIT) {
        setPushFinalised(true);
        setPushError("The final state has been finalised");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Push failed");
      }
    } catch (err) {
      setPushError(err instanceof Error ? err.message : "Push failed");
    } finally {
      setPushing(false);
    }
  }, [transactionId, pushCount, pushFinalised]);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    setError(null);
    fetchTransactionDetail(transactionId)
      .then((res) => setTx(res.data || res))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load transaction"))
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-body-md text-on-surface-variant">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="error_outline" className="text-4xl text-error" />
        <p className="text-body-md text-error">{error || "Transaction not found"}</p>
        <button onClick={() => router.back()} className="text-secondary font-bold hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const showReversedAction = tx.status === "reversed";
  const showProcessingAction = tx.status === "processing";

  const counterpartyName = tx.type === "credit"
    ? tx.sender?.name || "Unknown"
    : tx.receiver_name || tx.receiver?.name || "Unknown";

  const counterpartyBank = tx.type === "credit"
    ? tx.sender?.bank_name || ""
    : tx.receiver_bank || tx.receiver?.bank_name || "";

  const counterpartyAccount = tx.type === "credit"
    ? tx.sender?.account_number || ""
    : tx.receiver_account_number || tx.receiver?.account_number || "";

  const senderBalanceBefore = tx.sender?.balance_before;
  const senderBalanceAfter = tx.sender?.balance_after;

  return (
    <>
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="arrow_back" />
        </button>
        <h2 className="text-headline-md font-bold text-primary">Transaction Details</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={tx.status as "completed" | "reversed" | "pending" | "failed" | "processing"} />
              <span className="text-on-surface-variant font-label-md text-[11px]">{tx.transaction_id}</span>
              {showReversedAction && (
                <button
                  onClick={handleReversedPush}
                  disabled={pushFinalised || pushing}
                  className={`ml-2 px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${
                    pushFinalised
                      ? "bg-outline-variant text-on-surface-variant cursor-not-allowed"
                      : "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFE0B2]"
                  }`}
                >
                  {pushing ? "Pushing..." : pushFinalised ? "Finalised" : `Check Status (${PUSH_LIMIT - pushCount} left)`}
                </button>
              )}
              {showProcessingAction && (
                <button
                  onClick={handleProcessingPush}
                  disabled={pushFinalised || pushing}
                  className={`ml-2 px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${
                    pushFinalised
                      ? "bg-outline-variant text-on-surface-variant cursor-not-allowed"
                      : "bg-[#FFF8E1] text-[#F57F17] hover:bg-[#FFECB3]"
                  }`}
                >
                  {pushing ? "Pushing..." : pushFinalised ? "Finalised" : `Check Status (${PUSH_LIMIT - pushCount} left)`}
                </button>
              )}
            </div>
            {pushError && (
              <p className="text-[11px] text-error mb-2">{pushError}</p>
            )}
            <h3 className={`text-display-lg mb-1 ${
              tx.status === "reversed" ? "text-on-surface" : tx.type === "credit" ? "text-green-600" : "text-error"
            }`}>
              {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.total_amount || tx.amount)}
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {tx.transaction_type === "transfer" ? "Transfer" : tx.transaction_type === "bill" ? "Bill Payment" : tx.transaction_type === "funding" ? "Funding" : "Disbursement"}
              {" • "}
              <span className="text-secondary font-semibold capitalize">{tx.type}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button className="bg-primary text-on-primary px-4 py-3 rounded-lg font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/10">
              <Icon name="download" />
              Download Receipt
            </button>
          </div>
        </div>

        <div className="bg-primary-container text-on-primary-container rounded-xl p-6 flex flex-col justify-between border border-primary relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-label-md text-on-primary-container opacity-70 uppercase mb-3">Counterparty</p>
            <h4 className="text-headline-md text-secondary-fixed mb-2">{counterpartyName}</h4>
            {counterpartyBank && (
              <p className="text-body-sm mb-1">{counterpartyBank}</p>
            )}
            {counterpartyAccount && (
              <p className="text-body-sm opacity-80 font-mono">{counterpartyAccount}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <h4 className="font-label-md text-primary mb-4 border-b border-outline-variant pb-2">Transaction Metadata</h4>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Transaction ID</p>
              <p className="text-on-surface font-semibold font-mono text-[13px]">{tx.transaction_id}</p>
            </div>
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Type</p>
              <p className="text-on-surface font-semibold capitalize">{tx.type}</p>
            </div>
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Amount</p>
              <p className="text-on-surface font-semibold">{formatCurrency(tx.amount)}</p>
            </div>
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Fee</p>
              <p className="text-on-surface font-semibold">{formatCurrency(tx.fee)}</p>
            </div>
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Total Amount</p>
              <p className="text-on-surface font-semibold">{formatCurrency(tx.total_amount)}</p>
            </div>
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Transaction Type</p>
              <p className="text-on-surface font-semibold capitalize">{tx.transaction_type}</p>
            </div>
            <div className="col-span-2">
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Narration</p>
              <p className="text-on-surface font-semibold">{tx.narration || "No narration"}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <h4 className="font-label-md text-primary mb-4 border-b border-outline-variant pb-2">Sender Details</h4>
          <div className="grid grid-cols-2 gap-y-4">
            <div className="col-span-2">
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Name</p>
              <p className="text-on-surface font-semibold">{tx.sender?.name || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Email</p>
              <p className="text-on-surface font-semibold">{tx.sender?.email || "N/A"}</p>
            </div>
            {senderBalanceBefore != null && (
              <div>
                <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Balance Before</p>
                <p className="text-on-surface font-semibold font-mono">
                  {formatCurrency(parseFloat(senderBalanceBefore))}
                </p>
              </div>
            )}
            {senderBalanceAfter != null && (
              <div>
                <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Balance After</p>
                <p className="text-on-surface font-semibold font-mono">
                  {formatCurrency(parseFloat(senderBalanceAfter))}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <h4 className="font-label-md text-primary mb-4 border-b border-outline-variant pb-2">Receiver Details</h4>
          <div className="grid grid-cols-2 gap-y-4">
            <div className="col-span-2">
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Name</p>
              <p className="text-on-surface font-semibold">{tx.receiver_name || tx.receiver?.name || "N/A"}</p>
            </div>
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Bank</p>
              <p className="text-on-surface font-semibold">{tx.receiver_bank || tx.receiver?.bank_name || "N/A"}</p>
            </div>
            <div>
              <p className="font-label-md text-on-surface-variant opacity-60 uppercase mb-1">Account Number</p>
              <p className="text-on-surface font-semibold font-mono">{tx.receiver_account_number || tx.receiver?.account_number || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <h4 className="font-label-md text-primary mb-4 border-b border-outline-variant pb-2">Timeline</h4>
          <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
            <div className="relative">
              <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-secondary ring-4 ring-white z-10" />
              <p className="font-label-md text-on-surface-variant opacity-60">{formatTimestamp(tx.timestamp)}</p>
              <p className="text-body-md text-on-surface font-semibold">Transaction Initiated</p>
              <p className="text-body-sm text-on-surface-variant">Transaction was created and processed</p>
            </div>
            <div className="relative">
              <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full ring-4 ring-white z-10 ${
                tx.status === "completed" ? "bg-secondary" : tx.status === "reversed" || tx.status === "failed" ? "bg-error" : "bg-outline"
              }`} />
              <p className="font-label-md text-on-surface-variant opacity-60">{formatTimestamp(tx.timestamp)}</p>
              <p className="text-body-md text-on-surface font-semibold capitalize">Status: {tx.status}</p>
              <p className="text-body-sm text-on-surface-variant">
                {tx.status === "completed" ? "Transaction completed successfully" :
                 tx.status === "reversed" ? "Transaction was reversed" :
                 tx.status === "failed" ? "Transaction failed" :
                 "Transaction is being processed"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-6 border-t border-outline-variant pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-on-surface-variant text-body-sm">
          Transaction Reference: <span className="font-mono bg-surface-container px-1">{tx.transaction_id}</span>
        </p>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-primary font-label-md flex items-center gap-1 hover:underline">
            <Icon name="arrow_back" className="text-sm" />
            Back to Ledger
          </button>
        </div>
      </footer>
    </>
  );
}
