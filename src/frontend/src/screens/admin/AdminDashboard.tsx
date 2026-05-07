import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../lib/adminApi";
import { Users, Briefcase, GitCompareArrows, Activity, TrendingUp, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [overview, setOverview] = useState<any>(null);
  const [industry, setIndustry] = useState<any[]>([]);
  const [matchStats, setMatchStats] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.overview(),
      adminApi.jobsByIndustry(),
      adminApi.matchStats(),
      adminApi.usersOverTime(30),
    ])
      .then(([o, i, m, t]) => {
        setOverview(o);
        setIndustry(i.data || []);
        setMatchStats(m);
        setTrend(t.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400">{t("common.loading")}</div>;
  if (!overview) return <div className="p-8 text-red-400">{t("common.loading")}</div>;

  const cards = [
    { labelKey: "admin.dashboard.totalUsers", value: overview.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
    { labelKey: "admin.dashboard.totalJobs", value: overview.totalJobs, icon: Briefcase, color: "bg-green-50 text-green-600" },
    { labelKey: "admin.dashboard.totalMatches", value: overview.totalMatches, icon: GitCompareArrows, color: "bg-purple-50 text-purple-600" },
    { labelKey: "admin.dashboard.activeJobs", value: overview.activeJobs, icon: Activity, color: "bg-emerald-50 text-emerald-600" },
    { labelKey: "admin.dashboard.pendingMatches", value: overview.pendingMatches, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
    { labelKey: "admin.dashboard.avgScore", value: overview.avgMatchScore, icon: BarChart3, color: "bg-rose-50 text-rose-600" },
  ];

  const maxTrend = Math.max(...trend.map((t) => t.count), 1);
  const statusColors: Record<string, string> = { pending: "bg-amber-100 text-amber-700", accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", expired: "bg-gray-100 text-gray-500" };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("admin.dashboard.title")}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.labelKey} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{t(c.labelKey)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">{t("admin.dashboard.userTrend")}</h3>
          {trend.length === 0 ? (
            <p className="text-gray-400 text-sm">{t("common.noData")}</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {trend.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#5c9be6] rounded-t-sm transition-all"
                    style={{ height: `${(t.count / maxTrend) * 140}px`, minHeight: 2 }}
                  />
                  <span className="text-[9px] text-gray-400 -rotate-45 origin-top-left whitespace-nowrap">{t.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">{t("admin.dashboard.matchDistribution")}</h3>
          {matchStats?.byStatus?.length === 0 ? (
            <p className="text-gray-400 text-sm">{t("common.noData")}</p>
          ) : (
            <div className="space-y-3">
              {matchStats?.byStatus?.map((s: any) => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[s.status] || "bg-gray-100 text-gray-500"}`}>{s.status}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#113a7a] h-full rounded-full" style={{ width: `${(s.count / Math.max(...matchStats.byStatus.map((x: any) => x.count), 1)) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{s.count}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2">{t("admin.dashboard.avgScore")}: {matchStats?.avgScore}</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">{t("admin.dashboard.industryDistribution")}</h3>
          {industry.length === 0 ? (
            <p className="text-gray-400 text-sm">{t("common.noData")}</p>
          ) : (
            <div className="space-y-2">
              {industry.map((ind) => (
                <div key={ind.industry} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-700">{ind.industry}</span>
                  <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">{ind.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
