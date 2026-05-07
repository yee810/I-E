import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Send, Phone, MessageSquare, Briefcase, Menu, MapPin, CheckCircle2, Edit3, X, Clock } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Logo } from "../components/Logo";
import { api } from "../lib/api";

type JobData = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchReason: string;
  time?: string;
  matchPercentage?: string;
  requirements?: string[];
  responsibilities?: string[];
  salary?: string;
  deadline?: string;
  applyMethod?: string;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  isInitial?: boolean;
  isJobMatch?: boolean;
  isProfileSummary?: boolean;
  jobsData?: JobData[];
};

export function ChatScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAddedSummary = useRef(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t("chat.greeting"),
      isJobMatch: true,
      jobsData: [],
    },
  ]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("onboarding") === "complete" && !hasAddedSummary.current) {
      hasAddedSummary.current = true;
      navigate(location.pathname, { replace: true });

      setTimeout(() => {
        setMessages((prev) => {
          if (prev.some((m) => m.isProfileSummary)) return prev;
          return [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: t("chat.profileSummaryIntro"),
              isProfileSummary: true,
            },
          ];
        });
      }, 500);
    }
  }, [location, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userId = Number(localStorage.getItem("userId"));
    if (!userId) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: t("chat.notLoggedIn") },
      ]);
      return;
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: inputText };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const data = await api.chat(userId, inputText);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply || t("chat.processing"),
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: t("chat.errorGeneric"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProfile = () => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: t("chat.profileConfirmed"),
    };
    setMessages((prev) => [...prev, newUserMsg]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("chat.profileSaved"),
        },
      ]);
    }, 1000);
  };

  const handlePassJob = (jobId: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: t("chat.notInterested"),
      },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("chat.notInterestedReply"),
        },
      ]);
    }, 1000);
  };

  const handleApplyJob = (jobId: string) => {
    alert(t("chat.redirectApply"));
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {!selectedJob && <Sidebar />}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
          <button className="p-2 -ml-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold">Jobro</span>
          <div className="w-8 h-8" /> {/* Spacer */}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Logo className="w-8 h-8" />
                  </div>
                )}

                <div className={`flex flex-col gap-2 w-full ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gray-100 text-gray-900 max-w-[80%]"
                        : msg.isJobMatch
                        ? "bg-transparent px-0 py-0 w-full"
                        : "text-gray-900 whitespace-pre-wrap max-w-[80%]"
                    }`}
                  >
                    {msg.isJobMatch && msg.jobsData ? (
                      <div>
                        <p className="text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : msg.isProfileSummary ? (
                      <div>
                        <p className="text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Profile Summary Card */}
                  {msg.isProfileSummary && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm w-full max-w-2xl">
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 bg-[#5c9be6]/20 rounded-full flex items-center justify-center text-[#113a7a] text-2xl font-bold">
                          A
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xl">Alex Chen</h4>
                          <p className="text-gray-500 text-base">{t("chat.targetIndustries")}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("chat.targetIndustries")}</p>
                          <p className="text-sm text-gray-900 font-medium">FinTech, Management Consulting</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("chat.keyStrengths")}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">High Ambition</span>
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold">Interpersonal Sensitivity</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("chat.workExperience")}</p>
                        <div className="space-y-4">
                          <div className="relative pl-4 border-l-2 border-gray-200">
                            <div className="absolute w-2.5 h-2.5 bg-[#5c9be6] rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                            <h5 className="text-sm font-bold text-gray-900">Business Analyst Intern</h5>
                            <p className="text-[#5c9be6] font-medium text-xs mb-1">McKinsey & Company</p>
                            <p className="text-xs text-gray-500">Jun 2024 - Aug 2024</p>
                          </div>
                          <div className="relative pl-4 border-l-2 border-gray-200">
                            <div className="absolute w-2.5 h-2.5 bg-gray-300 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                            <h5 className="text-sm font-bold text-gray-900">Product Intern</h5>
                            <p className="text-[#5c9be6] font-medium text-xs mb-1">Tencent</p>
                            <p className="text-xs text-gray-500">May 2023 - Aug 2023</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("chat.education")}</p>
                        <div className="relative pl-4 border-l-2 border-gray-200">
                          <div className="absolute w-2.5 h-2.5 bg-[#5c9be6] rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                          <h5 className="text-sm font-bold text-gray-900">The University of Hong Kong (HKU)</h5>
                          <p className="text-[#5c9be6] font-medium text-xs mb-1">Bachelor of Business Administration</p>
                          <p className="text-xs text-gray-500">Expected Graduation: May 2025</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleConfirmProfile}
                          className="flex-1 bg-[#113a7a] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#0d2b5c] transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {t("chat.looksGood")}
                        </button>
                        <button
                          onClick={() => navigate("/profile-confirmation")}
                          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center gap-2"
                        >
                          <Edit3 className="w-5 h-5" />
                          {t("common.edit")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Job Match Card */}
                  {msg.isJobMatch && msg.jobsData && (
                    <div className="mt-4 w-full max-w-4xl">
                      <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
                        {msg.jobsData.map((job) => (
                          <div
                            key={job.id}
                            onClick={() => setSelectedJob(job)}
                            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-w-[300px] max-w-[320px] shrink-0 snap-start flex flex-col cursor-pointer hover:border-[#5c9be6]/50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{job.title}</h4>
                              {job.matchPercentage && (
                                <span className="bg-[#5c9be6]/20 text-[#113a7a] text-xs font-bold px-2 py-1 rounded-full shrink-0 ml-2">
                                  {t("chat.highMatch")}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 font-medium text-sm mb-1">{job.company}</p>
                            <p className="text-gray-400 text-xs mb-4">{job.location} &middot; {job.time}</p>

                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-4 flex-1">{job.matchReason}</p>

                            <div className="flex gap-3 mt-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePassJob(job.id);
                                }}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-full hover:bg-gray-50 transition-colors"
                              >
                                {t("chat.notInterested")}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyJob(job.id);
                                }}
                                className="flex-1 bg-[#113a7a] text-white text-sm font-semibold py-2 rounded-full hover:bg-[#0d2b5c] transition-colors"
                              >
                                {t("common.apply")}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 justify-start"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Logo className="w-8 h-8" />
                </div>
                <div className="px-5 py-3.5 rounded-2xl bg-gray-50 text-gray-500 text-[15px] flex items-center gap-1">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                </div>
              </motion.div>
            )}
            <div className="h-40" /> {/* Spacer to clear the absolute input area */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4 md:px-8">
          <div className="max-w-4xl mx-auto relative">
            <div className="relative flex items-end gap-2 bg-gray-100 rounded-3xl p-2 border border-gray-200 focus-within:border-gray-300 focus-within:bg-white transition-colors shadow-sm">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t("chat.placeholder")}
                className="w-full max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 pl-4 pr-12 text-[15px] leading-relaxed"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-3 bottom-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:bg-gray-400 transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-3">
              <p className="text-xs text-gray-400">{t("chat.disclaimer")}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Job Detail Pane */}
      {selectedJob && (
        <aside className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto shadow-xl z-20 absolute md:relative right-0">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold">{t("chat.jobDetails")}</h2>
            <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
              <p className="text-lg text-[#5c9be6] font-medium">{selectedJob.company}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {selectedJob.location}
                </span>
                {selectedJob.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {t("common.time")}: {selectedJob.time}
                  </span>
                )}
                {selectedJob.deadline && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {t("jobs.deadline")}: {selectedJob.deadline}
                  </span>
                )}
              </div>
            </div>

            {selectedJob.salary && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("chat.salary")}</p>
                <p className="font-semibold text-gray-900">{selectedJob.salary}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t("chat.personalizedRationale")}</h3>
              <div className="bg-[#5c9be6]/5 p-4 rounded-xl border border-[#5c9be6]/20">
                <p className="text-sm text-[#113a7a] leading-relaxed">{selectedJob.matchReason}</p>
              </div>
            </div>

            {selectedJob.responsibilities && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t("chat.responsibilities")}</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {selectedJob.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.requirements && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t("chat.requirements")}</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {selectedJob.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.applyMethod && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t("chat.howToApply")}</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedJob.applyMethod.includes("@") ? (
                    <p className="text-sm text-gray-700">
                      {t("chat.emailResumeTo")}{" "}
                      <a href={`mailto:${selectedJob.applyMethod}`} className="text-[#5c9be6] hover:underline font-medium">
                        {selectedJob.applyMethod}
                      </a>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      {t("chat.applyViaWebsite")}{" "}
                      <a href={selectedJob.applyMethod} target="_blank" rel="noopener noreferrer" className="text-[#5c9be6] hover:underline font-medium">
                        {selectedJob.applyMethod}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => {
                  handlePassJob(selectedJob.id);
                  setSelectedJob(null);
                }}
                className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t("chat.notInterested")}
              </button>
              <button
                onClick={() => {
                  handleApplyJob(selectedJob.id);
                  setSelectedJob(null);
                }}
                className="flex-1 bg-[#113a7a] text-white font-semibold py-3 rounded-xl hover:bg-[#0d2b5c] transition-colors"
              >
                {t("common.applyNow")}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
