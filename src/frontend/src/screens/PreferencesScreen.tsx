import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { api } from "../lib/api";

export function PreferencesScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [salary, setSalary] = useState(25000);
  const [targetRoles, setTargetRoles] = useState("");
  const [days, setDays] = useState("");
  const [duration, setDuration] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    const userId = Number(localStorage.getItem("userId"));
    if (!userId) {
      setError(t("preferences.sessionExpired"));
      return;
    }
    try {
      setLoading(true);
      await api.savePreferences({
        user_id: userId,
        target_roles: targetRoles,
        target_industries: industry,
        availability_days: days ? Number(days) : null,
        availability_months: duration ? Number(duration.replace("+", "")) : null,
        salary_min: 0,
        salary_max: salary === 30000 ? null : salary,
        company_size: companySize,
      });
      navigate("/chat");
    } catch (e: any) {
      setError(e.message || t("preferences.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      title={t("auth.title")}
      subtitle={t("auth.subtitle")}
      currentStep={3}
      totalSteps={3}
      onNext={handleNext}
      onBack={() => navigate("/profile-input")}
      nextLabel={loading ? t("preferences.saving") : t("preferences.continueToChat")}
      backLabel={t("common.back")}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{t("preferences.title")}</h2>
        <p className="text-base text-gray-500 mb-8">{t("preferences.subtitle")}</p>

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
              <span className="text-sm font-medium text-[#5c9be6]">{salary === 30000 ? "30k+" : salary.toLocaleString()} HKD/month</span>
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
