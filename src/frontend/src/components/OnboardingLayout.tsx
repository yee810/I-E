import { ReactNode } from "react";
import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { Logo } from "./Logo";

interface OnboardingLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
}

export function OnboardingLayout({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextLabel = "Next Step",
  backLabel = "Back",
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Logo className="w-8 h-8" />
        <span className="text-xl font-bold text-gray-900 tracking-tight">Jobro</span>
      </div>

      {/* Center Avatar & Headers */}
      {currentStep === 1 && (
        <div className="flex flex-col items-center mt-12 mb-8 text-center z-10">
          <Logo className="w-20 h-20 mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 text-sm md:text-base">{subtitle}</p>
        </div>
      )}

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 w-full max-w-2xl z-10 mb-8 ${currentStep !== 1 ? 'mt-24' : ''}`}
      >
        {children}
      </motion.div>

      {/* Pagination Dots */}
      <div className="flex items-center gap-2 mb-8 z-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all ${i === currentStep - 1 ? "w-6 bg-[#5c9be6]" : "w-2 bg-gray-300"}`}
          />
        ))}
      </div>

      {/* Bottom Buttons */}
      <div className="flex items-center gap-4 w-full max-w-md z-10">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-4 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          >
            {backLabel}
          </button>
        )}
        {onNext && (
          <button 
            onClick={onNext}
            className="flex-1 bg-[#113a7a] text-white font-medium py-4 rounded-full hover:bg-[#0d2b5c] transition-colors shadow-md"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
