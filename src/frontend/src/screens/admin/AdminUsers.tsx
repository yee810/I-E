import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../lib/adminApi";
import { Search, X, ChevronLeft, ChevronRight, Trash2, Edit3, KeyRound } from "lucide-react";

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listUsers({ page, search: search || undefined })
      .then((r) => { setUsers(r.data); setTotal(r.totalPages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const selectUser = async (u: any) => {
    setSelected(u);
    try {
      const [profile, prefs, conv, match] = await Promise.all([
        adminApi.getUserProfile(u.id).catch(() => null),
        adminApi.getUserPreferences(u.id).catch(() => null),
        adminApi.getUserConversations(u.id).catch(() => null),
        adminApi.getUserMatches(u.id).catch(() => null),
      ]);
      setDetail({ profile: profile?.profile, prefs: prefs?.preference, conversations: conv?.data || [], matches: match?.data || [] });
    } catch { setDetail(null); }
  };

  const handleRoleToggle = async (u: any) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    if (!confirm(`${t("admin.users.updateRole")}: ${u.email} → ${newRole}?`)) return;
    await adminApi.updateUser(u.id, { role: newRole });
    load();
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`${t("admin.users.deleteConfirm")} (${u.email})`)) return;
    await adminApi.deleteUser(u.id);
    if (selected?.id === u.id) { setSelected(null); setDetail(null); }
    load();
  };

  const handleResetPassword = async (u: any) => {
    if (!confirm(`${t("admin.users.resetPasswordConfirm")} (${u.email})`)) return;
    try {
      const res = await adminApi.resetUserPassword(u.id);
      alert(`${t("admin.users.newPassword")}: ${res.tempPassword}`);
    } catch (err: any) {
      alert(err.message || "Failed to reset password");
    }
  };

  const statusColor = (role: string) => role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="flex h-full">
      <div className={`flex-1 p-8 ${selected ? "border-r border-gray-200" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.users.title")}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t("common.search")}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 w-60"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.id")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.users.email")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.users.name")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.users.role")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.users.registeredAt")}</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t("common.loading")}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t("common.noData")}</td></tr>
              ) : users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => selectUser(u)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors ${selected?.id === u.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-5 py-3.5 text-sm text-gray-500">{u.id}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{u.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{u.name || "-"}</td>
                  <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusColor(u.role)}`}>{u.role}</span></td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{u.created_at?.slice(0, 16)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleRoleToggle(u); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title={t("admin.users.updateRole")}><Edit3 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleResetPassword(u); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-amber-600 ml-1" title={t("admin.users.resetPassword")}><KeyRound className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(u); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 ml-1" title={t("common.delete")}><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-sm text-gray-600">{t("common.page")} {page} {t("common.of")} {total}</span>
            <button disabled={page >= total} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
          </div>
        )}
      </div>

      {selected && detail && (
        <aside className="w-96 bg-white overflow-y-auto p-6 space-y-6 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{t("admin.users.profile")}</h2>
            <button onClick={() => { setSelected(null); setDetail(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 bg-[#5c9be6]/20 rounded-full flex items-center justify-center text-[#113a7a] text-xl font-bold">{(selected.name || selected.email)[0]?.toUpperCase()}</div>
            <div>
              <p className="font-semibold text-gray-900">{selected.name || selected.email}</p>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(selected.role)}`}>{selected.role}</span>
            </div>
          </div>

          {detail.profile && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("admin.users.profile")}</h4>
              {detail.profile.skills && <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Skills:</span> {detail.profile.skills}</p>}
              {detail.profile.education?.length > 0 && <div className="text-sm text-gray-700 mb-2"><span className="font-medium">Education:</span> {detail.profile.education.map((e: any, i: number) => <p key={i} className="ml-2 text-gray-600">{e.school} — {e.degree}</p>)}</div>}
              {detail.profile.experience?.length > 0 && <div className="text-sm text-gray-700"><span className="font-medium">Experience:</span> {detail.profile.experience.map((e: any, i: number) => <p key={i} className="ml-2 text-gray-600">{e.title} @ {e.company}</p>)}</div>}
            </section>
          )}

          {detail.prefs && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("admin.users.preferences")}</h4>
              <div className="text-sm text-gray-700 space-y-1">
                {detail.prefs.target_roles && <p><span className="font-medium">Roles:</span> {detail.prefs.target_roles}</p>}
                {detail.prefs.target_industries && <p><span className="font-medium">Industries:</span> {detail.prefs.target_industries}</p>}
                {detail.prefs.target_locations && <p><span className="font-medium">Locations:</span> {detail.prefs.target_locations}</p>}
                {(detail.prefs.salary_min || detail.prefs.salary_max) && <p><span className="font-medium">Salary:</span> {detail.prefs.salary_min} - {detail.prefs.salary_max}</p>}
              </div>
            </section>
          )}

          {detail.matches.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("admin.users.matches")}</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {detail.matches.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                    <span className="text-gray-700 truncate flex-1">{m.title || `${t("common.id")} #${m.job_id}`}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${m.status === "accepted" ? "bg-green-100 text-green-700" : m.status === "rejected" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>{m.status}</span>
                    <span className="text-xs text-gray-400 ml-2">{m.match_score?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {detail.conversations.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("admin.users.conversations")}</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detail.conversations.slice(-20).map((c: any, i: number) => (
                  <div key={i} className={`text-sm p-2 rounded-lg ${c.role === "user" ? "bg-blue-50" : "bg-gray-50"}`}>
                    <span className="font-medium text-xs text-gray-500">{c.role}:</span>
                    <p className="text-gray-700 mt-0.5 line-clamp-3">{c.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      )}
    </div>
  );
}
