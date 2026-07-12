"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  fetchKycSubmissionDetail,
  submitToNinepsbTier2,
  submitToNinepsbTier3,
  sendKycEmail,
  fetchProofOfAddress,
} from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";

type KycDetail = {
  id: number;
  user?: number;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  nationality?: string;
  state?: string;
  city?: string;
  street?: string;
  zip_code?: string;
  country_code?: string;
  address?: string;
  address_detail?: string;
  address_proof_url?: string;
  nearest_land_mark?: string;
  formatted_address?: string;
  profession?: string;
  height?: string | null;
  marital_status?: string;
  lga_of_origin?: string;
  lga_of_residence?: string;
  state_of_origin?: string;
  state_of_residence?: string;

  status?: string;
  status_reason?: string;
  document_type?: string;
  tier?: string;
  tier_1_verified?: boolean;
  tier_2_verified?: boolean;
  tier_3_verified?: boolean;

  bvn?: string;
  bvn_imagebase64?: string;
  selfie_url?: string;
  liveness_image1?: string;
  liveness_image2?: string;
  liveness_image3?: string;
  liveness_image4?: string;
  liveness_image5?: string;
  liveness_image6?: string;
  liveness_image7?: string;
  is_id_valid?: boolean;
  id_score?: number;
  is_valid_bvn?: boolean;

  nin?: string;
  nin_issue_date?: string;
  nin_front_id_url?: string;
  nin_back_id_url?: string;
  user_signature_url?: string;
  front_id_url?: string;
  back_id_url?: string;
  bill_proof_url?: string;
  pep_status?: string;
  conf_score?: string;
  match_score?: string;
  is_valid_nin?: boolean;
  smile_selfie_result_url?: string;

  meter_number?: string;
  meter_preference?: string;
  meter_category?: string;

  meta_bvn_status?: string;
  meta_nin_status?: string;
  meta_selfie_status?: string;
  meta_selfie_reason?: string;
  meta_address_status?: string;
  meta_address_reason?: string;
  meta_bill_status?: string;
  meta_bill_reason?: string;
  meta_id_documents_status?: string;
  meta_id_documents_reason?: string;
  meta_personal_infos_status?: string;
  meta_personal_infos_reason?: string;
  meta_cac_status?: string;
  meta_cac_reason?: string;

  smile_nin_response?: {
    FullData?: {
      photo?: string;
      phone?: string;
      email?: string;
      address?: string;
      lga?: string;
      state?: string;
      gender?: string;
      surname?: string;
      firstname?: string;
      middlename?: string;
      dateOfBirth?: string;
      birthCountry?: string;
      nationality?: string;
    };
  };
  meta_smile_selfie_verification?: {
    status?: string;
    message?: string;
    code?: string;
  };
  smile_id_response?: {
    FullName?: string;
    IDNumber?: string;
    IDStatus?: string;
    ResultCode?: string;
    ResultText?: string;
    PhoneNumber?: string;
    PhoneNumber2?: string;
    signature?: string;
    timestamp?: string;
    FullData?: {
      BVN?: string;
      nin?: string;
      ImageBase64?: string;
      firstName?: string;
      lastName?: string;
      middleName?: string;
      phoneNumber1?: string;
      phoneNumber2?: string;
      dateOfBirth?: string;
      nationality?: string;
      stateOfOrigin?: string;
      lgaOfOrigin?: string;
      residentialAddress?: string;
      maritalStatus?: string;
      levelOfAccount?: string;
      enrollmentBank?: string;
      enrollmentBranch?: string;
      registrationDate?: string;
      watchListed?: string;
      title?: string;
      gender?: string;
      nameOnCard?: string;
    };
  };
  google_map_response?: {
    formatted_address?: string;
    street?: string;
    locality?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    location_type?: string;
    google_maps_url?: string;
    zone?: string;
    route?: string;
  };
  meter_validation_response?: {
    data?: { amount?: string; customerName?: string; otherField?: string };
    status?: string;
    message?: string;
    responseCode?: string;
  };
  created_at?: string;
  updated_at?: string;
};

function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          {icon && <Icon name={icon} className="text-secondary" />}
          <h3 className="text-label-md font-bold uppercase tracking-wider text-primary">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (value === "" || value === null || value === undefined) return null;
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className="mt-0.5 text-body-sm font-semibold text-primary break-words">
        {value}
      </p>
    </div>
  );
}

function metaColor(s: string) {
  const status = s.toLowerCase();
  if (
    status === "verified" ||
    status === "approved" ||
    status === "completed"
  )
    return "bg-[#E8F5E9] text-[#2E7D32]";
  if (status === "awaiting" || status === "pending" || status === "submitted")
    return "bg-[#FFF3E0] text-[#EF6C00]";
  if (status === "flagged" || status === "rejected" || status === "unverified")
    return "bg-[#FFEBEE] text-[#C62828]";
  return "bg-surface-container text-on-surface-variant";
}

function MetaBadge({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${metaColor(status)}`}
    >
      {status}
    </span>
  );
}

function resolveImageUrl(src?: string): string | null {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://"))
    return src;
  if (src.startsWith("/9j/") || src.startsWith("iVBOR"))
    return `data:image/jpeg;base64,${src}`;
  return src;
}

function ImagePreview({
  src,
  label,
  onExpand,
}: {
  src?: string;
  label: string;
  onExpand: (url: string) => void;
}) {
  const url = resolveImageUrl(src);
  if (!url) return null;
  return (
    <div
      className="group relative w-20 h-20 rounded-lg bg-surface-container overflow-hidden border border-outline-variant cursor-pointer shrink-0"
      onClick={() => onExpand(url)}
    >
      <img className="w-full h-full object-cover" src={url} alt={label} />
      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Icon name="zoom_in" className="text-white text-sm" />
      </div>
    </div>
  );
}

function ImageModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const downloadFile = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "kyc-image.jpeg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      const link = document.createElement("a");
      link.href = url;
      link.download = "kyc-image.jpeg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold transition-colors"
            onClick={downloadFile}
          >
            <Icon name="download" className="text-base" />
            Download
          </button>
          <button
            className="text-white/80 hover:text-white text-sm font-bold transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <img
          className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
          src={url}
          alt="Expanded preview"
        />
      </div>
    </div>
  );
}

const allMetaKeys: { label: string; key: keyof KycDetail }[] = [
  { label: "Personal Infos", key: "meta_personal_infos_status" },
  { label: "BVN", key: "meta_bvn_status" },
  { label: "NIN", key: "meta_nin_status" },
  { label: "Selfie", key: "meta_selfie_status" },
  { label: "ID Documents", key: "meta_id_documents_status" },
  { label: "Address", key: "meta_address_status" },
  { label: "Bill", key: "meta_bill_status" },
  { label: "CAC", key: "meta_cac_status" },
];

const staticMetaKeys = [
  "unverified",
  "verified",
  "approved",
  "awaiting",
  "rejected",
  "pending",
  "submitted",
  "success",
];

export default function KycSubmissionDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [detail, setDetail] = useState<KycDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [proofOfAddressUrl, setProofOfAddressUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    fetchKycSubmissionDetail(id)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch(() => {
        if (active) setDetail(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function normalizeStatus(status?: string) {
    return (status ?? "pending").toLowerCase();
  }

  const smileId = detail?.smile_id_response?.FullData;
  const smileNin = detail?.smile_nin_response?.FullData;

  const isUpgradeToTier2 =
    detail?.meta_bill_status?.toLowerCase() === "submitted";
  const isUpgradeToTier3 =
    detail?.meta_address_status?.toLowerCase() === "submitted";
  const canUpgradeToTier2 =
    isUpgradeToTier2 && detail?.tier_1_verified && !detail?.tier_2_verified;
  const canUpgradeToTier3 =
    isUpgradeToTier3 && detail?.tier_2_verified && !detail?.tier_3_verified;

  async function handleUpgrade(endpoint: "tier-two" | "tier-three") {
    if (!id || upgrading) return;
    setUpgrading(true);
    try {
      const fn =
        endpoint === "tier-two" ? submitToNinepsbTier2 : submitToNinepsbTier3;
      const result = await fn(id);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              ...(endpoint === "tier-two"
                ? { tier_2_verified: true }
                : { tier_3_verified: true }),
            }
          : prev
      );
      alert(
        `Upgrade to ${endpoint === "tier-two" ? "Tier 2" : "Tier 3"} submitted to 9PSB successfully`
      );
    } catch (e: any) {
      alert(e.message || "Upgrade failed");
    } finally {
      setUpgrading(false);
    }
  }

  async function handleSendEmail() {
    if (!id || sendingEmail || !emailSubject.trim() || !emailBody.trim()) return;
    setSendingEmail(true);
    try {
      await sendKycEmail(id, emailSubject, emailBody);
      alert("Email sent successfully");
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailBody("");
    } catch (e: any) {
      alert(e.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleViewProofOfAddress() {
    if (!id || loadingProof) return;
    setLoadingProof(true);
    try {
      const res = await fetchProofOfAddress(id);
      const url = res?.data?.certificate_url || res?.certificate_url || res?.url || res?.data?.url;
      if (url) {
        const fullUrl = url.startsWith("http") ? url : `http://127.0.0.1:8000${url}`;
        window.open(fullUrl, "_blank");
      } else {
        alert("Proof of address certificate URL not found");
      }
    } catch (e: any) {
      alert(e.message || "Failed to fetch proof of address");
    } finally {
      setLoadingProof(false);
    }
  }

  if (loading) {
    return (
      <div className="flexitems-center justify-center py-20 text-body-sm text-on-surface-variant">
        Loading submission details...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-body-md text-on-surface-variant">
          Submission not found
        </p>
        <Link
          className="text-secondary font-bold text-label-md hover:underline"
          href="/kyc"
        >
          Back to Queue
        </Link>
      </div>
    );
  }

  const fullName =
    [detail.first_name, detail.middle_name, detail.last_name]
      .filter(Boolean)
      .join(" ") || `Applicant #${detail.id}`;
  const tierLabel =
    detail.tier_1_verified && detail.tier_2_verified && detail.tier_3_verified
      ? "Tier 3"
      : detail.tier_1_verified && detail.tier_2_verified
        ? "Tier 2"
        : detail.tier_1_verified
          ? "Tier 1"
          : "Unverified";

  const allImages: { src?: string; label: string }[] = [
    { src: detail.selfie_url, label: "Selfie" },
    ...(detail.liveness_image1
      ? [
          { src: detail.liveness_image1, label: "Liveness 1" },
          { src: detail.liveness_image2, label: "Liveness 2" },
          { src: detail.liveness_image3, label: "Liveness 3" },
          { src: detail.liveness_image4, label: "Liveness 4" },
          { src: detail.liveness_image5, label: "Liveness 5" },
          { src: detail.liveness_image6, label: "Liveness 6" },
          { src: detail.liveness_image7, label: "Liveness 7" },
        ]
      : []),
    { src: detail.bvn_imagebase64, label: "BVN Document" },
    { src: detail.nin_front_id_url, label: "NIN Front" },
    { src: detail.nin_back_id_url, label: "NIN Back" },
    { src: detail.user_signature_url, label: "Signature" },
    { src: detail.bill_proof_url, label: "Bill Proof" },
    { src: detail.front_id_url, label: "Front ID" },
    { src: detail.back_id_url, label: "Back ID" },
  ].filter((img) => resolveImageUrl(img.src));

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
            <Link className="hover:text-primary" href="/kyc">
              KYC Queue
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">Review</span>
          </nav>
          <h2 className="text-headline-lg text-primary">
            Review KYC Submission
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Verification Status:{" "}
            <span className="text-secondary font-bold capitalize">
              {detail.status || "Awaiting Review"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container transition-colors"
            href="/kyc"
          >
            Back to Queue
          </Link>
          <button className="rounded-lg bg-secondary text-on-secondary px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            Finalize & Submit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden border border-outline-variant shrink-0">
                {detail.selfie_url ? (
                  <img
                    className="w-full h-full object-cover cursor-pointer"
                    src={resolveImageUrl(detail.selfie_url)!}
                    alt="Selfie"
                    onClick={() =>
                      setExpandedImage(
                        resolveImageUrl(detail.selfie_url)!
                      )
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-lg font-bold">
                    {fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 flex-1 gap-4">
                <Field label="Full Name" value={fullName} />
                <Field label="Email" value={detail.email} />
                <Field label="Phone" value={detail.phone_number} />
                <Field label="Date of Birth" value={detail.date_of_birth} />
                <Field label="Gender" value={detail.gender} />
                <Field label="Nationality" value={detail.nationality || "Nigeria"} />
                <Field label="Marital Status" value={detail.marital_status} />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
                    Tier
                  </p>
                  <span className="inline-block mt-0.5 rounded-full bg-secondary-fixed px-3 py-1 text-xs font-bold uppercase text-on-secondary-fixed-variant">
                    {tierLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge
                status={normalizeStatus(detail.status) as any}
              />
              {allMetaKeys.map(({ label, key }) => (
                <MetaBadge
                  key={key}
                  status={detail[key] as string | undefined}
                />
              ))}
            </div>
          </div>

          {canUpgradeToTier2 && (
            <div className="rounded-xl border border-secondary bg-secondary-fixed/30 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon name="upgrade" className="text-secondary text-xl" />
                <div>
                  <p className="text-label-md font-bold text-on-secondary-fixed-variant">
                    Tier 1 &rarr; Tier 2 Upgrade Ready
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Bill documents submitted. Submit to 9PSB to process upgrade.
                  </p>
                </div>
              </div>
              <button
                className="shrink-0 rounded-lg bg-secondary text-on-secondary px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={upgrading}
                onClick={() => handleUpgrade("tier-two")}
              >
                {upgrading ? "Processing..." : "Submit to 9PSB"}
              </button>
            </div>
          )}

          {canUpgradeToTier3 && (
            <div className="rounded-xl border border-secondary bg-secondary-fixed/30 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon name="upgrade" className="text-secondary text-xl" />
                <div>
                  <p className="text-label-md font-bold text-on-secondary-fixed-variant">
                    Tier 2 &rarr; Tier 3 Upgrade Ready
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Address verified. Ready to submit to 9PSB for Tier 3 upgrade.
                  </p>
                </div>
              </div>
              <button
                className="shrink-0 rounded-lg bg-secondary text-on-secondary px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={upgrading}
                onClick={() => handleUpgrade("tier-three")}
              >
                {upgrading ? "Processing..." : "Submit to 9PSB"}
              </button>
            </div>
          )}

          <SectionCard
            icon="fingerprint"
            title="Tier 1 Review"
            action={<MetaBadge status={detail.meta_bvn_status} />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="BVN" value={detail.bvn} />
              <Field label="Document Type" value={detail.document_type} />
              <Field label="ID Valid" value={detail.is_id_valid ? "Yes" : "No"} />
              <Field label="ID Score" value={detail.id_score?.toString()} />
              <Field label="BVN Valid" value={detail.is_valid_bvn ? "Yes" : "No"} />
            </div>
            {allImages.filter((img) =>
              ["Selfie", "Liveness 1", "Liveness 2", "Liveness 3", "Liveness 4", "Liveness 5", "Liveness 6", "Liveness 7", "BVN Document"].includes(img.label)
            ).length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">
                  Liveness & Selfie Images
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Selfie", "Liveness 1", "Liveness 2", "Liveness 3", "Liveness 4", "Liveness 5", "Liveness 6", "Liveness 7", "BVN Document"].map((lbl) => {
                    const img = allImages.find((i) => i.label === lbl);
                    return img ? (
                      <ImagePreview
                        key={lbl}
                        src={img.src}
                        label={lbl}
                        onExpand={setExpandedImage}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {detail.meta_smile_selfie_verification && (
              <div className="mt-4 rounded-lg bg-[#E8F5E9] border border-[#2E7D32]/20 p-3 flex items-center gap-3">
                <Icon
                  name="check_circle"
                  className="text-[#2E7D32]"
                  filled
                />
                <div>
                  <p className="text-label-md font-bold uppercase text-[#2E7D32]">
                    Face Match:{" "}
                    {detail.meta_smile_selfie_verification.message ||
                      "Verified"}
                  </p>
                  {detail.match_score && (
                    <p className="text-body-sm text-[#2E7D32]">
                      Match Score: {detail.match_score}%
                    </p>
                  )}
                </div>
              </div>
            )}
            {smileId && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
                  BVN Info
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-surface-container p-3">
                  <Field label="Name on Card" value={smileId.nameOnCard} />
                  <Field label="Phone" value={smileId.phoneNumber1} />
                  <Field label="Phone 2" value={smileId.phoneNumber2} />
                  <Field label="DOB" value={smileId.dateOfBirth} />
                  <Field label="Nationality" value={smileId.nationality} />
                  <Field label="State of Origin" value={smileId.stateOfOrigin} />
                  <Field label="LGA of Origin" value={smileId.lgaOfOrigin} />
                  <Field label="Marital Status" value={smileId.maritalStatus} />
                  <Field label="Enrollment Bank" value={smileId.enrollmentBank} />
                  <Field label="Enrollment Branch" value={smileId.enrollmentBranch} />
                  <Field label="Registration Date" value={smileId.registrationDate} />
                  <Field label="Watchlisted" value={smileId.watchListed} />
                  <Field
                    label="Address"
                    value={smileId.residentialAddress}
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon="badge"
            title="Tier 2 Review"
            action={<MetaBadge status={detail.meta_nin_status} />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="NIN" value={detail.nin} />
              <Field label="NIN Issue Date" value={detail.nin_issue_date} />
              <Field label="PEP Status" value={detail.pep_status} />
              <Field label="Nearest Landmark" value={detail.nearest_land_mark} />
              <Field label="Confidence Score" value={detail.conf_score ? `${detail.conf_score}%` : undefined} />
              <Field label="Match Score" value={detail.match_score ? `${detail.match_score}%` : undefined} />
              <Field label="NIN Valid" value={detail.is_valid_nin ? "Yes" : "No"} />
            </div>
            {["NIN Front", "NIN Back", "Signature", "Bill Proof", "Front ID", "Back ID"].some((lbl) =>
              allImages.find((i) => i.label === lbl)
            ) && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">
                  Documents
                </p>
                <div className="flex flex-wrap gap-2">
                  {["NIN Front", "NIN Back", "Signature", "Bill Proof", "Front ID", "Back ID"].map((lbl) => {
                    const img = allImages.find((i) => i.label === lbl);
                    return img ? (
                      <ImagePreview
                        key={lbl}
                        src={img.src}
                        label={lbl}
                        onExpand={setExpandedImage}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {smileNin && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
                  NIN Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-surface-container p-3">
                  <Field label="Surname" value={smileNin.surname} />
                  <Field label="First Name" value={smileNin.firstname} />
                  <Field label="Middle Name" value={smileNin.middlename} />
                  <Field label="Phone" value={smileNin.phone} />
                  <Field label="Email" value={smileNin.email} />
                  <Field label="DOB" value={smileNin.dateOfBirth} />
                  <Field label="Gender" value={smileNin.gender} />
                  <Field label="LGA" value={smileNin.lga} />
                  <Field label="State" value={smileNin.state} />
                  <Field label="Birth Country" value={smileNin.birthCountry} />
                  <Field label="Nationality" value={smileNin.nationality} />
                  <Field
                    label="Address"
                    value={smileNin.address}
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon="map"
            title="Tier 3 Review"
            action={
              <div className="flex items-center gap-2">
                <MetaBadge status={detail.meta_bill_status} />
                <MetaBadge status={detail.meta_address_status} />
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Meter Number" value={detail.meter_number} />
              <Field label="Meter Preference" value={detail.meter_preference} />
              <Field label="Meter Category" value={detail.meter_category} />
            </div>
            {detail.meter_validation_response && (
              <div className="mt-4 rounded-lg bg-surface-container p-3 space-y-1">
                <Field
                  label="Meter Status"
                  value={detail.meter_validation_response.status}
                />
                <Field
                  label="Customer Name"
                  value={detail.meter_validation_response.data?.customerName}
                />
                <Field
                  label="Address"
                  value={detail.meter_validation_response.data?.otherField}
                />
                <Field
                  label="Amount"
                  value={detail.meter_validation_response.data?.amount}
                />
              </div>
            )}
            {detail.google_map_response && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
                    Structured Address
                  </p>
                  {detail.google_map_response.google_maps_url && (
                    <a
                      className="text-secondary text-label-md font-bold flex items-center gap-1 hover:underline"
                      href={detail.google_map_response.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name="pin_drop" className="text-sm" /> View on Map
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-surface-container p-3">
                  <Field
                    label="Formatted Address"
                    value={detail.google_map_response.formatted_address}
                    className="sm:col-span-3"
                  />
                  <Field label="Street" value={detail.google_map_response.street} />
                  <Field label="Locality" value={detail.google_map_response.locality} />
                  <Field label="State" value={detail.google_map_response.state} />
                  <Field label="Country" value={detail.google_map_response.country} />
                  <Field
                    label="Postal Code"
                    value={detail.google_map_response.postal_code}
                  />
                  <Field
                    label="Neighborhood"
                    value={detail.google_map_response.neighborhood}
                  />
                  <Field label="Zone" value={detail.google_map_response.zone} />
                  <Field
                    label="Lat / Lng"
                    value={
                      detail.google_map_response.latitude &&
                      detail.google_map_response.longitude
                        ? `${detail.google_map_response.latitude.toFixed(6)}, ${detail.google_map_response.longitude.toFixed(6)}`
                        : undefined
                    }
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {detail.address && (
            <SectionCard icon="home" title="Address Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Address"
                  value={detail.address}
                  className="sm:col-span-2"
                />
                <Field label="Street" value={detail.street} />
                <Field label="City" value={detail.city} />
                <Field label="State" value={detail.state} />
                <Field label="Zip Code" value={detail.zip_code} />
                <Field label="Country Code" value={detail.country_code} />
                <Field label="Address Detail" value={detail.address_detail} />
                <Field
                  label="Nearest Landmark"
                  value={detail.nearest_land_mark}
                />
                <Field label="State of Origin" value={detail.state_of_origin} />
                <Field
                  label="State of Residence"
                  value={detail.state_of_residence}
                />
                <Field label="LGA of Origin" value={detail.lga_of_origin} />
                <Field
                  label="LGA of Residence"
                  value={detail.lga_of_residence}
                />
                <Field label="Profession" value={detail.profession} />
                <Field label="Height" value={detail.height} />
              </div>
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Icon name="sticky_note_2" className="text-secondary" />
              <h3 className="text-label-md font-bold uppercase tracking-wider text-primary">
                Admin Metadata
              </h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg bg-surface-container p-3 border border-outline-variant/50">
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
                  Additional Notes
                </p>
                <p className="text-body-sm text-on-surface leading-relaxed">
                  {detail.status_reason || "No additional notes available."}
                </p>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-outline-variant/30">
                <span className="text-label-md text-on-surface-variant">
                  Application ID
                </span>
                <span className="text-label-md font-bold text-primary">
                  #{detail.id}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-outline-variant/30">
                <span className="text-label-md text-on-surface-variant">
                  User ID
                </span>
                <span className="text-label-md font-bold text-primary">
                  #{detail.user || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-outline-variant/30">
                <span className="text-label-md text-on-surface-variant">
                  Created
                </span>
                <span className="text-label-md text-primary">
                  {detail.created_at
                    ? new Date(detail.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-outline-variant/30">
                <span className="text-label-md text-on-surface-variant">
                  Updated
                </span>
                <span className="text-label-md text-primary">
                  {detail.updated_at
                    ? new Date(detail.updated_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              {detail.conf_score && (
                <div className="flex items-center justify-between py-2 border-t border-outline-variant/30">
                  <span className="text-label-md text-on-surface-variant">
                    Confidence
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{
                          width: `${Math.min(parseFloat(detail.conf_score), 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-label-md font-bold text-secondary">
                      {detail.conf_score}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <h3 className="text-label-md font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Icon name="verified_user" className="text-secondary" />
              Identity Checks
            </h3>
            <ul className="space-y-2">
              {[
                {
                  label: "Tier 1 Verified",
                  ok: detail.tier_1_verified,
                },
                {
                  label: "Tier 2 Verified",
                  ok: detail.tier_2_verified,
                },
                {
                  label: "Tier 3 Verified",
                  ok: detail.tier_3_verified,
                },
                {
                  label: "ID Valid",
                  ok: detail.is_id_valid,
                },
                {
                  label: "BVN Valid",
                  ok: detail.is_valid_bvn,
                },
                {
                  label: "NIN Valid",
                  ok: detail.is_valid_nin,
                },
                {
                  label: "PEP Screened",
                  ok:
                    detail.pep_status === "NO"
                      ? true
                      : detail.pep_status
                        ? true
                        : undefined,
                },
              ]
                .filter((item) => item.ok !== undefined)
                .map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <Icon
                      name="check_circle"
                      className={
                        item.ok ? "text-[#2E7D32]" : "text-on-surface-variant"
                      }
                      filled={!!item.ok}
                    />
                    <span className="text-body-sm text-on-surface">
                      {item.label}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <h3 className="text-label-md font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Icon name="settings" className="text-secondary" />
              Review Actions
            </h3>
            <div className="space-y-2">
              <button
                className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high transition-colors"
                onClick={() => setShowEmailModal(true)}
              >
                <span>Send Email</span>
                <Icon name="mail_outline" className="text-on-surface-variant" />
              </button>
              <button
                className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high transition-colors"
                onClick={handleViewProofOfAddress}
                disabled={loadingProof}
              >
                <span>{loadingProof ? "Loading..." : "View Proof of Address"}</span>
                <Icon name="description" className="text-on-surface-variant" />
              </button>
            </div>
          </div>

          {detail.status_reason && (
            <div className="rounded-xl border border-secondary bg-secondary-fixed text-on-secondary-fixed p-4 flex gap-3">
              <Icon name="warning" className="text-lg shrink-0" />
              <div>
                <p className="text-label-md font-bold">Status Reason</p>
                <p className="text-body-sm opacity-80">{detail.status_reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {expandedImage && (
        <ImageModal
          url={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}

      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-label-md font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Icon name="mail_outline" className="text-secondary" />
                Send Email to Applicant
              </h3>
              <button
                className="text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setShowEmailModal(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
                  Subject
                </label>
                <input
                  className="w-full px-3 py-2 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
                  placeholder="Email subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
                  Body
                </label>
                <textarea
                  className="w-full px-3 py-2 text-body-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary min-h-[160px] resize-y"
                  placeholder="Write your message..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 text-sm font-semibold text-outline border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-bold bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                onClick={handleSendEmail}
              >
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}