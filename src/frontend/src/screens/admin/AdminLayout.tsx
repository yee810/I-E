import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Briefcase, GitCompareArrows, MessageSquare, Settings, ArrowLeft, Shield } from "lucide-react";
import { adminApi } from "../../lib/adminApi";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, labelKey: "admin.dashboard.title", end: true },
  { to: "/admin/users", icon: Users, labelKey: "admin.users.title" },
  { to: "/admin/jobs", icon: Briefcase, labelKey: "admin.jobs.title" },
  { to: "/admin/matches", icon: GitCompareArrows, labelKey: "admin.matches.title" },
  { to: "/admin/conversations", icon: MessageSquare, labelKey: "admin.conversations.title" },
  { to: "/admin/system", icon: Settings, labelKey: "admin.system.title" },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      navigate("/");
      return;
    }
    adminApi
      .health()
      .then((h) => {
        setAuthorized(true);
        setAdminEmail(h.adminEmail || localStorage.getItem("userEmail") || "admin");
      })
      .catch(() => {
        setAuthorized(false);
        setTimeout(() => navigate("/"), 2000);
      });
  }, [navigate]);

  if (authorized === null)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">{t("admin.verifying")}</p>
      </div>
    );

  if (authorized === false)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-semibold text-lg">{t("admin.noPermission")}</p>
          <p className="text-gray-400 mt-2">{t("admin.noPermissionDesc")}</p>
        </div>
      </div>
    );

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#113a7a] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">{t("admin.panelTitle")}</h1>
              <p className="text-xs text-gray-400">{t("admin.panelSubtitle")}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-[#113a7a] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            to="/chat"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("admin.backToFront")}
          </Link>
          <div className="px-3 py-2 text-xs text-gray-400 truncate">{adminEmail}</div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
