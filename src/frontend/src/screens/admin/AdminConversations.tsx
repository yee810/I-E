import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../lib/adminApi";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminConversations() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listConversations({ page, search: search || undefined, user_id: userIdFilter || undefined })
      .then((r) => { setConversations(r.data || r); setTotal(r.totalPages || 1); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, userIdFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("admin.conversations.title")}</h1>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("admin.conversations.searchContent")}
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 w-80"
          />
        </div>
        <input
          type="number"
          value={userIdFilter}
          onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
          placeholder={t("admin.conversations.filterByUser")}
          className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm w-40"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.id")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.users.email")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.conversations.role")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.conversations.content")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.time")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t("common.loading")}</td></tr>
            ) : conversations.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t("common.noData")}</td></tr>
            ) : conversations.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm text-gray-500">{c.id}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{c.user_email || c.user_id}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{c.role}</td>
                <td className="px-5 py-3.5 text-sm text-gray-700 max-w-md truncate">{c.content}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{c.created_at?.slice(0, 16) || c.timestamp?.slice(0, 16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-sm text-gray-600">{t("common.page")} {page} {t("common.of")} {total}</span>
          <button disabled={page >= total} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
}
