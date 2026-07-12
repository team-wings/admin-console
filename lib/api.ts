const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/staff`;

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiClient(endpoint: string, options: RequestOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const body = options.body ? JSON.stringify(options.body) : undefined;

  console.log("[API Request]", { method: options.method || "POST", url, body: options.body });

  const res = await fetch(url, {
    method: options.method || "POST",
    headers,
    body,
  });

  const text = await res.text();

  console.log("[API Response]", { status: res.status, text });

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

export async function logoutAPI(refresh_token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/users/logout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) {
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }
    throw new Error(data.message || data.error || "Logout failed");
  }
  return res.json();
}

export async function loginAPI(email: string, password: string) {
  return apiClient("/users/login/", { body: { email, password } });
}

export async function verifyOTPAPI(otp: string) {
  return apiClient("/users/verify-login-otp/", { body: { otp_code: otp } });
}

export async function refreshTokenAPI(refresh_token: string) {
  return apiClient("/users/token/refresh", { body: { refresh_token } });
}

export async function resendOTPAPI(email: string) {
  return apiClient("/users/resend-login-otp/", { body: { email } });
}

export type KycFilterParams = {
  page?: number;
  search?: string;
  updated_at?: string;
  meta_address_status?: string;
  meta_bill_status?: string;
  status?: string;
  tier_1_verified?: string;
  tier_2_verified?: string;
  tier_3_verified?: string;
};

export async function fetchKycSubmissions(params?: KycFilterParams) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return apiClient(`/user-kyc-management/${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function fetchKycSubmissionDetail(id: string | number) {
  return apiClient(`/user-kyc-management/${id}/`, { method: "GET" });
}

export async function submitToNinepsbTier2(id: string | number) {
  return apiClient(`/user-kyc-management/${id}/submit-to-ninepsb-tier2/`, { method: "POST" });
}

export async function submitToNinepsbTier3(id: string | number) {
  return apiClient(`/user-kyc-management/${id}/submit-to-ninepsb-tier3/`, { method: "POST" });
}

export async function sendKycEmail(id: string | number, subject: string, body: string) {
  return apiClient(`/user-kyc-management/${id}/send-email/`, { body: { subject, body } });
}

export async function fetchProofOfAddress(id: string | number) {
  return apiClient(`/user-kyc-management/${id}/proof-of-address/`, { method: "GET" });
}

export type TransactionEntry = {
  transaction_id: string;
  amount: number;
  fee: number;
  total_amount: number;
  sender: {
    id?: number;
    name: string;
    email?: string;
    account_number?: string | null;
    account_balance?: string | null;
    bank_name?: string | null;
    bank_code?: string | null;
    balance_before?: string | null;
    balance_after?: string | null;
  };
  receiver?: {
    name: string;
    bank_code?: string;
    bank_name?: string;
    account_number?: string;
    id?: number;
    email?: string;
  };
  receiver_account_number?: string;
  receiver_bank?: string;
  receiver_bank_code?: string;
  receiver_name?: string;
  transaction_type: string;
  type: string;
  status: string;
  narration?: string | null;
  timestamp: string;
  date: number;
};

export type TransactionsResponse = {
  message: string;
  data: {
    count: number;
    currentPage: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
    data: TransactionEntry[];
  };
};

export async function fetchTransactions(page = 1, pageSize = 50, search?: string, status?: string) {
  let endpoint = `/transactions/histories/?page=${page}&page_size=${pageSize}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  if (status) endpoint += `&status=${encodeURIComponent(status)}`;
  return apiClient(endpoint, { method: "GET" }) as Promise<TransactionsResponse>;
}

export async function fetchTransactionDetail(transactionId: string) {
  return apiClient(`/transactions/histories/${transactionId}/`, { method: "GET" });
}

export type HealthStatus = {
  app: { status: string; message: string };
  services: Record<string, { status: string; message: string }>;
  overall_status: string;
  errors?: Record<string, string>;
};

export async function fetchHealthStatus() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/staff/health/health/`, { headers });
  return res.json() as Promise<HealthStatus>;
}

export async function fetchAllWebhookPayments() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/staff/all-webhook-payments/`, { headers });
  if (!res.ok) {
    throw new Error("Failed to fetch webhook payments");
  }
  return res.json();
}
