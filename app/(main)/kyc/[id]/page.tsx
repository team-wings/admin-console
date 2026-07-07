"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchKycSubmissionDetail } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";

type KycDetailData = {
  id: number;
  user: string;
  tier: string;
  status: string;
  updated_at: string;
};

function buildFallbackDetail(id: number): KycDetailData {
  return {
    id,
    user: `Applicant ${id}`,
    tier: "Tier 1",
    status: "Verified",
    updated_at: new Date().toISOString(),
  };
}

export default function KycSubmissionDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [detail, setDetail] = useState<KycDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let active = true;

    fetchKycSubmissionDetail(id)
      .then((data) => {
        if (active) {
          setDetail({
            id: data.id ?? Number(id),
            user: data.user ?? `Applicant ${id}`,
            tier: data.tier ?? "Tier 1",
            status: data.status ?? "Verified",
            updated_at: data.updated_at ?? new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        if (active) {
          setDetail(buildFallbackDetail(Number(id)));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  function normalizeStatus(status: string) {
    return status.toLowerCase();
  }

  const reviewSteps = [
    { label: "Identity verification", done: true },
    { label: "Tier upgrade review", done: true },
    { label: "Document validation", done: false },
  ];

  const metadataItems = [
    { label: "Application ID", value: detail?.id ?? "—" },
    { label: "Assigned tier", value: detail?.tier ?? "—" },
    { label: "Last update", value: detail?.updated_at ? new Date(detail.updated_at).toLocaleString() : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
            <Link className="hover:text-primary" href="/kyc">
              KYC Queue
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">Review</span>
          </nav>
          <h2 className="text-headline-lg text-primary">Review KYC Submission</h2>
          <p className="text-body-md text-on-surface-variant">
            This screen mirrors the review experience from the HTML portal and uses the live endpoint data when available.
          </p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container" href="/kyc">
            Back to Queue
          </Link>
          <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary hover:opacity-90">
            Request Clarification
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-body-sm text-on-surface-variant">
          Loading submission details...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-lg font-bold text-primary">
                    {detail?.user?.charAt(0) ?? "U"}
                  </div>
                  <div>
                    <p className="text-label-md uppercase tracking-widest text-on-surface-variant">Applicant Name</p>
                    <h3 className="text-headline-md text-primary">{detail?.user ?? "Pending review"}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={normalizeStatus(detail?.status ?? "verified") as "pending" | "verified" | "settled" | "flagged" | "failed" | "processing" | "active" | "suspended" | "completed"} />
                  <span className="rounded-full bg-secondary-fixed px-3 py-1 text-xs font-bold uppercase text-on-secondary-fixed-variant">
                    {detail?.tier ?? "Tier 1"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-headline-md text-primary">Tier review summary</h4>
                  <span className="text-sm text-on-surface-variant">Dummy review view</span>
                </div>
                <div className="space-y-3">
                  {reviewSteps.map((step) => (
                    <div key={step.label} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container p-3">
                      <span className="text-body-sm text-primary">{step.label}</span>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${step.done ? "bg-green-100 text-green-700" : "bg-surface-container-high text-on-surface-variant"}`}>
                        {step.done ? "Completed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-headline-md text-primary">Verification notes</h4>
                  <Icon name="sticky_note_2" className="text-secondary" />
                </div>
                <p className="text-body-sm leading-6 text-on-surface-variant">
                  This review view is prepared from the existing KYC review layout and will be updated once the final payload structure is shared by the API team.
                </p>
                <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container p-3 text-body-sm text-on-surface-variant">
                  Reviewer recommendation: request a quick document recheck if the applicant is attempting to move to a higher tier.
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <h4 className="mb-4 text-headline-md text-primary">Submission metadata</h4>
              <div className="space-y-3">
                {metadataItems.map((item) => (
                  <div key={item.label} className="rounded-lg border border-outline-variant bg-surface-container p-3">
                    <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{item.label}</p>
                    <p className="mt-1 text-body-sm font-semibold text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <h4 className="mb-4 text-headline-md text-primary">Review actions</h4>
              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high">
                  <span>Approve request</span>
                  <Icon name="check_circle" className="text-secondary" />
                </button>
                <button className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high">
                  <span>Flag for review</span>
                  <Icon name="warning" className="text-error" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
