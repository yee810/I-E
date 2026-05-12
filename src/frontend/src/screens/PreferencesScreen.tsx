import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { api } from "../lib/api";

const STEP_ICONS: Record<string, string> = {
  filter: "\u{1F50D}",
  scan: "\u{1F4CB}",
  tool_call: "\u{1F441}",
  tool_result: "\u{1F4C4}",
  scoring: "⚖️",
  done: "✅",
};

const INDUSTRY_MAP_ZH: Record<string, string> = {
  "fintech": "金融科技", "consulting": "咨询", "technology": "科技",
  "banking": "银行", "healthcare": "医疗",
};

export function PreferencesScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const prefills = (location.state as any)?.prefills || {};

  const [salary, setSalary] = useState<number>(prefills.expectedSalary || 25000);
  const [targetRoles, setTargetRoles] = useState<string>(prefills.targetRoles?.join("、") || "");
  const [days, setDays] = useState("");
  const [duration, setDuration] = useState("");
  const [industry, setIndustry] = useState<string>(prefills.targetIndustry || "");
  const [companySize, setCompanySize] = useState("");
  const [excludedRoles, setExcludedRoles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [matching, setMatching] = useState(false);
  const [agentSteps, setAgentSteps] = useState<any[]>([]);

  const handleNext = async () => {
    if (!industry) {
      setError(t("preferences.industryRequired") || "请选择目标行业");
      return;
    }
    try {
      setLoading(true);
      await api.savePreferences({
        target_roles: targetRoles,
        target_industries: industry,
        excluded_roles: excludedRoles ? JSON.stringify(excludedRoles.split(/[,，]/).map(s => s.trim()).filter(Boolean)) : null,
        availability_days: days ? Number(days) : null,
        availability_months: duration ? Number(duration.replace("+", "")) : null,
        salary_min: 0,
        salary_max: salary === 30000 ? null : salary,
        company_size: companySize,
      });
      setLoading(false);
      setMatching(true);
      setAgentSteps([]);
      try {
        await api.streamMatching(10, (step) => {
          setAgentSteps(prev => [...prev, step]);
        });
      } catch {
        await api.runMatching(5);
      }
      navigate("/chat");
    } catch (e: any) {
      setError(e.message || t("preferences.saveFailed"));
    } finally {
      setLoading(false);
      setMatching(false);
    }
  };

  const hasPrefill = prefills.targetRoles?.length > 0 || prefills.targetIndustry || prefills.expectedSalary;

  return (
    <OnboardingLayout
      title={t("auth.title")}
      subtitle={t("auth.subtitle")}
      currentStep={3}
      totalSteps={3}
      onNext={handleNext}
      onBack={() => navigate("/profile-input")}
      nextLabel={matching ? t("preferences.matching") : loading ? t("preferences.saving") : t("preferences.continueToChat")}
      nextDisabled={loading || matching}
      backLabel={t("common.back")}
    >
      <div className="space-y-6 relative">
        {matching && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center -m-8 p-8">
            <div className="w-12 h-12 border-4 border-[#5c9be6] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-900">{t("preferences.matching")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("preferences.matchingHint")}</p>
            {agentSteps.length > 0 && (
              <div className="mt-4 w-full max-w-xs space-y-2">
                {agentSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/80 rounded-lg px-3 py-1.5 shadow-sm">
                    <span className="text-sm shrink-0">{STEP_ICONS?.[step.type] || "•"}</span>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-medium text-gray-900">{step.label}</p>
                      <p className="text-[11px] text-gray-500 truncate">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{t("preferences.title")}</h2>
        <p className="text-base text-gray-500 mb-8">{t("preferences.subtitle")}</p>

        {hasPrefill && (
          <div className="bg-[#5c9be6]/5 border border-[#5c9be6]/20 rounded-xl p-3 flex items-start gap-2">
            <span className="text-[#5c9be6] text-sm mt-0.5">✦</span>
            <p className="text-xs text-[#113a7a]">{t("preferences.prefilledFromResume")}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("preferences.targetRoles")} <span className="text-red-500 ml-0.5">{t("auth.required")}</span></label>
            <input
              type="text"
              placeholder={t("preferences.targetRolesPlaceholder")}
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("preferences.excludedRoles")}</label>
            <input
              type="text"
              placeholder={t("preferences.excludedRolesPlaceholder")}
              value={excludedRoles}
              onChange={(e) => setExcludedRoles(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("preferences.availability")} <span className="text-gray-400 font-normal ml-1">({t("preferences.availabilityNote")})</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>{t("preferences.daysPerWeek")}</option>
                <option value="1">{t("preferences.days.1")}</option>
                <option value="2">{t("preferences.days.2")}</option>
                <option value="3">{t("preferences.days.3")}</option>
                <option value="4">{t("preferences.days.4")}</option>
                <option value="5">{t("preferences.days.5")}</option>
              </select>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>{t("preferences.duration")}</option>
                <option value="1">{t("preferences.months.1")}</option>
                <option value="2">{t("preferences.months.2")}</option>
                <option value="3">{t("preferences.months.3")}</option>
                <option value="6">{t("preferences.months.6")}</option>
                <option value="12">{t("preferences.months.12")}</option>
                <option value="12+">{t("preferences.months.12+")}</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">{t("preferences.salaryExpectation")}</label>
              <span className="text-sm font-medium text-[#5c9be6]">{salary === 30000 ? "30k+" : salary.toLocaleString()} CNY/month</span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="1000"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5c9be6]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0</span>
              <span>30k+</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("preferences.industry")}</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>{t("preferences.selectIndustry")}</option>
                <option value="fintech">{t("preferences.industries.fintech")}</option>
                <option value="consulting">{t("preferences.industries.consulting")}</option>
                <option value="technology">{t("preferences.industries.technology")}</option>
                <option value="banking">{t("preferences.industries.banking")}</option>
                <option value="healthcare">{t("preferences.industries.healthcare")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("preferences.companySize")}</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>{t("preferences.selectCompanySize")}</option>
                <option value="startup">{t("preferences.sizes.startup")}</option>
                <option value="sme">{t("preferences.sizes.sme")}</option>
                <option value="mid">{t("preferences.sizes.mid")}</option>
                <option value="mnc">{t("preferences.sizes.mnc")}</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </OnboardingLayout>
  );
}
