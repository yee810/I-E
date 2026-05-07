import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../lib/adminApi";
import { Search, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export default function AdminMatches() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listMatches({ page, status: statusFilter || undefined, min_score: scoreFilter ? Number(scoreFilter) : undefined })
      .then((r) => { setMatches(r.data); setTotal(r.totalPages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, statusFilter, scoreFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: number, status: string) => {
    await adminApi.updateMatchStatus(id, status);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("admin.matches.deleteConfirm"))) return;
    await adminApi.deleteMatch(id);
    load();
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkStatus = async (status: string) => {
    if (selected.size === 0) return;
    if (!confirm(t("admin.matches.bulkConfirm", { count: selected.size, status }))) return;
    await Promise.all([...selected].map((id) => adminApi.updateMatchStatus(id, status)));
    setSelected(new Set());
    load();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.matches.title")}</h1>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selected.size} {t("admin.matches.selected")}</span>
            <select
              onChange={(e) => { if (e.target.value) handleBulkStatus(e.target.value); e.target.value = ""; }}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              defaultValue=""
            >
              <option value="" disabled>{t("admin.matches.bulkUpdate")}</option>
              {["pending", "accepted", "rejected", "expired"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
          <option value="">{t("admin.matches.allStatus")}</option>
          {["pending", "accepted", "rejected", "expired"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            min="0"
            max="100"
            value={scoreFilter}
            onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }}
            placeholder={t("admin.matches.minScore")}
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-32"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 w-10">
                <input type="checkbox" onChange={(e) => e.target.checked ? setSelected(new Set(matches.map((m) => m.id))) : setSelected(new Set())} />
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.id")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.matches.user")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.matches.job")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.matches.score")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.status")}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t("common.loading")}</td></tr>
            ) : matches.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t("common.noData")}</td></tr>
            ) : matches.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3.5"><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} /></td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{m.id}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{m.user_email || m.user_id}</td>
                <td className="px-5 py-3.5 text-sm text-gray-900">{m.job_title || m.job_id}</td>
                <td className="px-5 py-3.5 text-sm text-gray-700">{typeof m.match_score === "number" ? m.match_score.toFixed(2) : "-"}</td>
                <td className="px-5 py-3.5">
                  <select
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border-0 bg-transparent cursor-pointer ${m.status === "accepted" ? "bg-green-100 text-green-700" : m.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {["pending", "accepted", "rejected", "expired"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
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
