const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

async function req(method: string, path: string, body?: any, extra?: RequestInit) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...extra,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => req("GET", "/health"),
  register: (email: string, password: string) => req("POST", "/auth/register", { email, password }),
  login: (email: string, password: string) => req("POST", "/auth/login", { email, password }),
  getProfile: (user_id: number) => req("GET", `/profiles/me?user_id=${user_id}`),
  updateProfile: (body: any) => req("PUT", "/profiles/me", body),
  uploadResume: (user_id: number, file: File) => {
    const form = new FormData();
    form.append("user_id", String(user_id));
    form.append("file", file);
    return req("POST", "/profiles/resume-upload", undefined, {
      method: "POST",
      headers: {},
      body: form,
    });
  },
  getPreferences: (user_id: number) => req("GET", `/preferences?user_id=${user_id}`),
  savePreferences: (body: any) => req("POST", "/preferences", body),
  getJobs: (limit?: number, offset?: number) => req("GET", `/jobs?limit=${limit ?? 50}&offset=${offset ?? 0}`),
  bulkImportJobs: (jobs: any[]) => req("POST", "/jobs/bulk", { jobs }),
  getRecommendations: (user_id: number, limit?: number) => req("GET", `/matching/recommendations?user_id=${user_id}&limit=${limit ?? 10}`),
  runMatching: (user_id: number, limit?: number) => req("POST", "/matching/run", { user_id, limit }),
  sendFeedback: (match_id: number, type: string, comment?: string) => req("POST", "/feedback", { match_id, type, comment }),
  chat: (user_id: number, message: string) => req("POST", "/chat", { user_id, message }),
  trackEvent: (event_type: string, user_id?: number, payload?: any) => req("POST", "/events", { event_type, user_id, payload }),
};
