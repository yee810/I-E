import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../lib/adminApi";
import { Search, Plus, X, ChevronLeft, ChevronRight, Trash2, Edit3 } from "lucide-react";

const STATUS_OPTIONS = ["active", "paused", "closed", "archived"];
const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  closed: "bg-gray-100 text-gray-500",
  archived: "bg-purple-100 text-purple-700",
};

export default function AdminJobs() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listJobs({ page, search: search || undefined, status: statusFilter || undefined })
      .then((r) => { setJobs(r.data); setTotal(r.totalPages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: number, status: string) => {
    await adminApi.updateJobStatus(id, status);
    load();
  };

  const handleDelete = async (job: any) => {
    if (!confirm(t("admin.jobs.deleteConfirm"))) return;
    await adminApi.deleteJob(job.id);
    load();
  };

  const handleSave = async (data: any) => {
    if (editJob) {
      await adminApi.updateJob(editJob.id, data);
    } else {
      await adminApi.createJob(data);
    }
    setShowModal(false);
    setEditJob(null);
    load();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.jobs.title")}</h1>
        <button
          onClick={() => { setEditJob(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#113a7a] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0d2b5c]"
        >
          <Plus className="w-4 h-4" /> {t("admin.jobs.createJob")}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("common.search")} className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 w-60" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
          <option value="">{t("common.all")}</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.id")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.jobs.jobTitle")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.jobs.company")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.jobs.location")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.status")}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("admin.jobs.salary")}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t("common.loading")}</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t("common.noData")}</td></tr>
            ) : jobs.map((j) => (
              <tr key={j.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm text-gray-500">{j.id}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{j.title}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{j.company}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{j.location || "-"}</td>
                <td className="px-5 py-3.5">
                  <select
                    value={j.status}
                    onChange={(e) => handleStatusChange(j.id, e.target.value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border-0 bg-transparent cursor-pointer ${STATUS_COLORS[j.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{j.salary_min && j.salary_max ? `${j.salary_min}-${j.salary_max} ${j.salary_currency || "HKD"}` : "-"}</td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => { setEditJob(j); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(j)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-sm text-gray-600">{t("common.page")} {page} {t("common.of")} {total}</span>
          <button disabled={page >= total} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
        </div>
      )}

      {showModal && <JobModal job={editJob} onSave={handleSave} onClose={() => { setShowModal(false); setEditJob(null); }} t={t} />}
    </div>
  );
}

function JobModal({ job, onSave, onClose, t }: { job: any; onSave: (d: any) => void; onClose: () => void; t: any }) {
  const [form, setForm] = useState({
    title: job?.title || "",
    company: job?.company || "",
    location: job?.location || "",
    description: job?.description || "",
    requirements: job?.requirements || "",
    responsibilities: job?.responsibilities || "",
    salary_min: job?.salary_min || "",
    salary_max: job?.salary_max || "",
    salary_currency: job?.salary_currency || "HKD",
    deadline: job?.deadline || "",
    job_type: job?.job_type || "",
    industry: job?.industry || "",
    role_type: job?.role_type || "",
    seniority: job?.seniority || "",
    status: job?.status || "active",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = "w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20";
  const jobTitleLabel = t("admin.jobs.jobTitle");
  const companyLabel = t("admin.jobs.company");
  const locationLabel = t("admin.jobs.location");
  const industryLabel = t("admin.jobs.industry");
  const deadlineLabel = t("admin.jobs.deadline");
  const salaryLabel = t("admin.jobs.salary");
  const reqLabel = t("admin.jobs.requirements");
  const respLabel = t("admin.jobs.responsibilities");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{job ? t("admin.jobs.editJob") : t("admin.jobs.createJob")}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{jobTitleLabel}</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{companyLabel}</label>
            <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{locationLabel}</label>
            <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{industryLabel}</label>
            <input type="text" value={form.industry} onChange={(e) => update("industry", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Job Type</label>
            <input type="text" value={form.job_type} onChange={(e) => update("job_type", e.target.value)} placeholder="full-time, part-time, internship" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role Type</label>
            <input type="text" value={form.role_type} onChange={(e) => update("role_type", e.target.value)} placeholder="frontend, backend, etc." className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Seniority</label>
            <input type="text" value={form.seniority} onChange={(e) => update("seniority", e.target.value)} placeholder="junior, mid, senior" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{deadlineLabel}</label>
            <input type="text" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} placeholder="YYYY-MM-DD" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{salaryLabel} (min)</label>
            <input type="number" value={String(form.salary_min)} onChange={(e) => update("salary_min", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{salaryLabel} (max)</label>
            <input type="number" value={String(form.salary_max)} onChange={(e) => update("salary_max", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Currency</label>
            <input type="text" value={form.salary_currency} onChange={(e) => update("salary_currency", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t("common.status")}</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputCls}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={inputCls + " resize-none"} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{reqLabel}</label>
            <textarea value={form.requirements} onChange={(e) => update("requirements", e.target.value)} rows={3} className={inputCls + " resize-none"} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{respLabel}</label>
            <textarea value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} rows={3} className={inputCls + " resize-none"} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200">{t("common.cancel")}</button>
          <button onClick={() => onSave(form)} className="px-5 py-2.5 bg-[#113a7a] text-white rounded-xl text-sm font-semibold hover:bg-[#0d2b5c]">{t("common.save")}</button>
        </div>
      </div>
    </div>
  );
}
