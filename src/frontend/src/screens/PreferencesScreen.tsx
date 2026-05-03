import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { api } from "../lib/api";

export function PreferencesScreen() {
  const navigate = useNavigate();
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
      setError("Session expired. Please register again.");
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
      setError(e.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      title="Hey there, I'm your AI recruiting buddy Jobro"
      subtitle="Helping you leap forward in your career"
      currentStep={3}
      totalSteps={3}
      onNext={handleNext}
      onBack={() => navigate("/profile-input")}
      nextLabel={loading ? "Saving..." : "Continue to Chat"}
      backLabel="Back"
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Preferences</h2>
        <p className="text-base text-gray-500 mb-8">Tell us what you're looking for so we can find the best matches.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Roles <span className="text-red-500 ml-0.5">*</span></label>
            <input
              type="text"
              placeholder='e.g., "Investment Banking Analyst"'
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Availability <span className="text-gray-400 font-normal ml-1">(for internships)</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>Days per week</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
              </select>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>Duration</option>
                <option value="1">1 month</option>
                <option value="2">2 months</option>
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="12+">1 year+</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Salary Expectation</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>Select Industry</option>
                <option value="fintech">FinTech</option>
                <option value="consulting">Consulting</option>
                <option value="technology">Technology</option>
                <option value="banking">Banking</option>
                <option value="healthcare">Healthcare</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm appearance-none"
              >
                <option value="" disabled>Select Company Size</option>
                <option value="startup">Startup (1-50)</option>
                <option value="sme">SME (51-200)</option>
                <option value="mid">Mid-size (201-1000)</option>
                <option value="mnc">MNC (1000+)</option>
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
