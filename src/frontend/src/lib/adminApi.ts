const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

function adminReq(method: string, path: string, body?: any, params?: Record<string, string>) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) throw new Error("Not authenticated");

  const url = new URL(`${API_BASE}/admin${path}`, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  return fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
    return data;
  });
}

export const adminApi = {
  // Analytics
  overview: () => adminReq("GET", "/analytics/overview"),
  usersOverTime: (days?: number) => adminReq("GET", "/analytics/users-over-time", undefined, { days: String(days || 30) }),
  jobsByIndustry: () => adminReq("GET", "/analytics/jobs-by-industry"),
  matchStats: () => adminReq("GET", "/analytics/match-stats"),
  chatUsage: (days?: number) => adminReq("GET", "/analytics/chat-usage", undefined, { days: String(days || 30) }),

  // Users
  listUsers: (p?: { page?: number; search?: string }) =>
    adminReq("GET", "/users", undefined, p ? Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])) : undefined),
  getUser: (id: number) => adminReq("GET", `/users/${id}`),
  updateUser: (id: number, data: any) => adminReq("PUT", `/users/${id}`, data),
  deleteUser: (id: number) => adminReq("DELETE", `/users/${id}`),
  getUserProfile: (id: number) => adminReq("GET", `/users/${id}/profile`),
  getUserPreferences: (id: number) => adminReq("GET", `/users/${id}/preferences`),
  getUserConversations: (id: number) => adminReq("GET", `/users/${id}/conversations`),
  getUserMatches: (id: number) => adminReq("GET", `/users/${id}/matches`),
  resetUserPassword: (id: number) => adminReq("POST", `/users/${id}/reset-password`),

  // Jobs
  listJobs: (p?: { page?: number; status?: string; search?: string }) =>
    adminReq("GET", "/jobs", undefined, p ? Object.fromEntries(Object.entries(p).filter(([_, v]) => v).map(([k, v]) => [k, String(v)])) : undefined),
  getJob: (id: number) => adminReq("GET", `/jobs/${id}`),
  createJob: (data: any) => adminReq("POST", "/jobs", data),
  updateJob: (id: number, data: any) => adminReq("PUT", `/jobs/${id}`, data),
  deleteJob: (id: number) => adminReq("DELETE", `/jobs/${id}`),
  updateJobStatus: (id: number, status: string) => adminReq("PATCH", `/jobs/${id}/status`, { status }),

  // Matches
  listMatches: (p?: { page?: number; status?: string; min_score?: number }) =>
    adminReq("GET", "/matches", undefined, p ? Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])) : undefined),
  updateMatchStatus: (id: number, status: string) => adminReq("PATCH", `/matches/${id}/status`, { status }),
  deleteMatch: (id: number) => adminReq("DELETE", `/matches/${id}`),
  bulkUpdateMatches: (matchIds: number[], status: string) => adminReq("POST", "/matches/bulk-status", { match_ids: matchIds, status }),

  // Conversations
  listConversations: (p?: { page?: number; search?: string; user_id?: number }) =>
    adminReq("GET", "/conversations", undefined, p ? Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])) : undefined),

  // System
  health: () => adminReq("GET", "/system/health"),
  listConfig: () => adminReq("GET", "/system/config"),
  updateConfig: (key: string, value: string) => adminReq("PUT", `/system/config/${key}`, { value }),
  listAuditLog: (p?: { page?: number }) =>
    adminReq("GET", "/system/audit-log", undefined, p ? { page: String(p.page || 1) } : undefined),
};
