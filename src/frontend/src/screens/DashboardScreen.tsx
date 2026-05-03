import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BadgeCheck, MapPin, Clock, X } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { api } from "../lib/api";

type JobData = {
  id: number;
  title: string;
  company: string;
  location: string;
  appliedDate?: string;
  time?: string;
  matchReason?: string;
  matchScore?: string;
  verified?: boolean;
  logo: string;
  requirements?: string[];
  responsibilities?: string[];
  salary?: string;
  deadline?: string;
  applyMethod?: string;
};

export function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<"applied" | "suggested">("suggested");
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<JobData[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api
      .getRecommendations(userId, 10)
      .then((data) => {
        const mapped = (data.recommendations || []).map((r: any) => ({
          id: r.job_id ?? r.id,
          title: r.title,
          company: r.company,
          location: r.location ?? "",
          time: "Suggested",
          matchReason: r.match_reason ?? "",
          matchScore: typeof r.match_score === "number" ? `${Math.round(r.match_score * 100)}% Match` : undefined,
          verified: true,
          logo: `https://picsum.photos/seed/${(r.company ?? "").replace(/\s+/g, "").toLowerCase()}/100/100`,
          requirements: r.requirements ? String(r.requirements).split("\n").filter(Boolean) : [],
          responsibilities: r.responsibilities ? String(r.responsibilities).split("\n").filter(Boolean) : [],
          salary: r.salary_min
            ? `$${r.salary_min.toLocaleString()}${r.salary_max ? ` - $${r.salary_max.toLocaleString()}` : ""} / month`
            : undefined,
          deadline: r.deadline ?? "",
          applyMethod: r.source_url ?? "",
        }));
        setSuggestedJobs(mapped);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("applied")}
                className={`pb-4 text-lg font-medium transition-colors relative ${
                  activeTab === "applied" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Applied Jobs
                {activeTab === "applied" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("suggested")}
                className={`pb-4 text-lg font-medium transition-colors relative ${
                  activeTab === "suggested" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Suggested by AI
                {activeTab === "suggested" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            </div>

            {loading && <p className="text-gray-500">Loading recommendations...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="bg-white">
              {activeTab === "applied" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {appliedJobs.length === 0 ? (
                    <p className="text-gray-500">No applied jobs yet.</p>
                  ) : (
                    appliedJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedJob(job)}
                        className={`flex py-6 border-b border-gray-200 last:border-0 cursor-pointer transition-colors hover:bg-gray-50 -mx-4 px-4 rounded-xl ${
                          selectedJob?.id === job.id ? "bg-gray-50" : ""
                        }`}
                      >
                        <div className="w-16 h-16 mr-5 shrink-0">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-full h-full object-cover rounded-sm"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-[19px] font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
                            {job.title}
                            {job.verified && <BadgeCheck className="w-5 h-5 text-[#5c9be6]" />}
                          </h3>
                          <p className="text-[17px] text-gray-900 mt-1">{job.company}</p>
                          <p className="text-[15px] text-gray-500 mt-0.5">{job.location}</p>
                          <p className="text-[14px] text-gray-500 mt-1.5">{job.appliedDate}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "suggested" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {suggestedJobs.length === 0 && !loading ? (
                    <p className="text-gray-500">No suggestions yet. Complete your profile and preferences to get matched!</p>
                  ) : (
                    suggestedJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedJob(job)}
                        className={`flex py-6 border-b border-gray-200 last:border-0 cursor-pointer transition-colors hover:bg-gray-50 -mx-4 px-4 rounded-xl ${
                          selectedJob?.id === job.id ? "bg-gray-50" : ""
                        }`}
                      >
                        <div className="w-16 h-16 mr-5 shrink-0">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-full h-full object-cover rounded-sm"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-[19px] font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
                            {job.title}
                          </h3>
                          <p className="text-[17px] text-gray-900 mt-1">{job.company}</p>
                          <p className="text-[15px] text-gray-500 mt-0.5">{job.location}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[14px] text-gray-500">Suggested today</span>
                            {job.matchScore && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#5c9be6]/10 text-[#113a7a]">
                                {job.matchScore}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Job Detail Pane */}
      {selectedJob && (
        <aside className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto shadow-xl z-20 absolute md:relative right-0">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold">Job Details</h2>
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
                    <Clock className="w-4 h-4" /> Posted: {selectedJob.time}
                  </span>
                )}
                {selectedJob.deadline && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Deadline: {selectedJob.deadline}
                  </span>
                )}
              </div>
            </div>

            {selectedJob.salary && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Salary</p>
                <p className="font-semibold text-gray-900">{selectedJob.salary}</p>
              </div>
            )}

            {selectedJob.matchReason && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Personalized Rationale</h3>
                <div className="bg-[#5c9be6]/5 p-4 rounded-xl border border-[#5c9be6]/20">
                  <p className="text-sm text-[#113a7a] leading-relaxed">{selectedJob.matchReason}</p>
                </div>
              </div>
            )}

            {selectedJob.responsibilities && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {selectedJob.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.requirements && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {selectedJob.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.applyMethod && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">How to Apply</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedJob.applyMethod.includes("@") ? (
                    <p className="text-sm text-gray-700">
                      Email your resume to:{" "}
                      <a href={`mailto:${selectedJob.applyMethod}`} className="text-[#5c9be6] hover:underline font-medium">
                        {selectedJob.applyMethod}
                      </a>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      Apply via website:{" "}
                      <a href={selectedJob.applyMethod} target="_blank" rel="noopener noreferrer" className="text-[#5c9be6] hover:underline font-medium">
                        {selectedJob.applyMethod}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              {activeTab === "suggested" && (
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Not interested
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 bg-[#113a7a] text-white font-semibold py-3 rounded-xl hover:bg-[#0d2b5c] transition-colors"
              >
                {activeTab === "suggested" ? "Apply Now" : "View Application"}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
