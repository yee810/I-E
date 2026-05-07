import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link as LinkIcon, UploadCloud, FileText, Globe } from "lucide-react";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { api } from "../lib/api";

export function ProfileInputScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setError("");
    } else {
      setError(t("profile.uploadPdfOnly"));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    }
  };

  const handleNext = async () => {
    const userId = Number(localStorage.getItem("userId"));
    if (!userId) {
      setError(t("profile.sessionExpired"));
      return;
    }
    if (!file) {
      navigate("/preferences");
      return;
    }
    try {
      setUploading(true);
      await api.uploadResume(userId, file);
      navigate("/preferences");
    } catch (e: any) {
      setError(e.message || t("profile.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <OnboardingLayout
      title={t("auth.title")}
      subtitle={t("auth.subtitle")}
      currentStep={2}
      totalSteps={3}
      onNext={handleNext}
      onBack={() => navigate("/")}
      nextLabel={uploading ? t("profile.parsing") : t("common.nextStep")}
      backLabel={t("common.back")}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{t("profile.title")}</h2>
        <p className="text-base text-gray-500 mb-8">{t("profile.subtitle")}</p>

        <input
          type="file"
          accept="application/pdf"
          ref={fileRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("profile.resume")} <span className="text-red-500 ml-0.5">{t("auth.required")}</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-[#5c9be6] transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-[#5c9be6]" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">{t("profile.uploadHint")}</p>
            <p className="text-xs text-gray-500">{t("profile.uploadLimit")}</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center p-4 bg-[#5c9be6]/10 rounded-xl border border-[#5c9be6]/20">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <FileText className="w-5 h-5 text-[#5c9be6]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{file.name}</p>
              <p className="text-xs text-[#5c9be6] font-medium mt-0.5">{t("profile.readyToUpload")}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t("profile.linkedinUrl")}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              placeholder={t("profile.linkedinPlaceholder")}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t("profile.otherLinks")}</label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              placeholder={t("profile.otherLinksPlaceholder")}
              rows={3}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] transition-all text-sm resize-none"
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
