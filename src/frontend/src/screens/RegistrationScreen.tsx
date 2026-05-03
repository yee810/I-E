import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { api } from "../lib/api";

export function RegistrationScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.register(email, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", String(res.user.id));
      navigate("/profile-input");
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      title="Hey there, I'm your AI recruiting buddy Jobro"
      subtitle="Helping you leap forward in your career"
      currentStep={1}
      totalSteps={3}
      onNext={handleNext}
      nextLabel={loading ? "Registering..." : "Next Step"}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Verify Status</h2>
        <p className="text-base text-gray-500 mb-8">Enter your university email to continue.</p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">University Email <span className="text-red-500 ml-0.5">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="student@hku.hk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500 ml-0.5">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-base"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </OnboardingLayout>
  );
}
