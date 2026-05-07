import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../lib/adminApi";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function AdminSystem() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<any>(null);
  const [config, setConfig] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [h, c, a] = await Promise.all([
        adminApi.health(),
        adminApi.config(),
        adminApi.auditLog(logPage).catch(() => ({ data: [], totalPages: 1 })),
      ]);
      setHealth(h);
      setConfig(c.config || c.data || []);
      setAuditLog(a.data || []);
      setLogTotal(a.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleConfigSave = async (key: string) => {
    await adminApi.updateConfig(key, editValue);
    setEditingKey(null);
    load();
  };

  if (loading) return <div className="p-8 text-gray-400">{t("common.loading")}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("admin.system.title")}</h1>

      {/* Health */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.system.health")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("admin.system.db")}</p>
            <p className={`text-lg font-bold ${health?.db === "connected" ? "text-green-600" : "text-red-500"}`}>{health?.db || "-"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("admin.system.dbSize")}</p>
            <p className="text-lg font-bold text-gray-900">{health?.dbSize || "-"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("admin.system.totalUsers")}</p>
            <p className="text-lg font-bold text-gray-900">{health?.totalUsers ?? "-"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("admin.system.totalJobs")}</p>
            <p className="text-lg font-bold text-gray-900">{health?.totalJobs ?? "-"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("admin.system.uptime")}</p>
            <p className="text-lg font-bold text-gray-900">{health?.uptime || "-"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("admin.system.aiService")}</p>
            <p className={`text-lg font-bold ${health?.aiEnabled ? "text-green-600" : "text-gray-400"}`}>
              {health?.aiEnabled ? t("admin.system.enabled") : t("admin.system.disabled")}
            </p>
          </div>
        </div>
      </section>

      {/* Config */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t("admin.system.config")}</h2>
          <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.system.configKey")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.system.configValue")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.system.configDesc")}</th>
              </tr>
            </thead>
            <tbody>
              {config.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">{t("common.noData")}</td></tr>
              ) : config.map((row: any) => (
                <tr key={row.key} className="border-b border-gray-50">
                  <td className="px-5 py-3 text-sm font-mono text-gray-700">{row.key}</td>
                  <td className="px-5 py-3">
                    {editingKey === row.key ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm w-48"
                        />
                        <button onClick={() => handleConfigSave(row.key)} className="px-3 py-1.5 bg-[#113a7a] text-white rounded-lg text-xs">{t("common.save")}</button>
                        <button onClick={() => setEditingKey(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs">{t("common.cancel")}</button>
                      </div>
                    ) : (
                      <span
                        className="text-sm text-gray-700 cursor-pointer hover:text-[#5c9be6]"
                        onClick={() => { setEditingKey(row.key); setEditValue(row.value || ""); }}
                      >
                        {row.value || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{row.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Audit Log */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.system.auditLog")}</h2>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.id")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.system.admin")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.system.action")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.system.targetType")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.system.targetId")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.time")}</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t("admin.system.noLogs")}</td></tr>
              ) : auditLog.map((log: any) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3.5 text-sm text-gray-500">{log.id}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{log.admin_email || log.admin_id}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{log.action}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{log.target_type}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{log.target_id}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{log.created_at?.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logTotal > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button disabled={logPage <= 1} onClick={() => setLogPage(logPage - 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-sm text-gray-600">{t("common.page")} {logPage} {t("common.of")} {logTotal}</span>
            <button disabled={logPage >= logTotal} onClick={() => setLogPage(logPage + 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
          </div>
        )}
      </section>
    </div>
  );
}
