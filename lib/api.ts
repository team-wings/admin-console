const API_BASE = "http://127.0.0.1:8000/staff";

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

export async function fetchKycSubmissions() {
  return apiClient("/user-kyc-management/", { method: "GET" });
}

export async function fetchKycSubmissionDetail(id: string | number) {
  return apiClient(`/user-kyc-management/${id}/`, { method: "GET" });
}

export async function fetchAllWebhookPayments() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("http://127.0.0.1:8000/staff/all-webhook-payments/", { headers });
  if (!res.ok) {
    throw new Error("Failed to fetch webhook payments");
  }
  return res.json();
}
