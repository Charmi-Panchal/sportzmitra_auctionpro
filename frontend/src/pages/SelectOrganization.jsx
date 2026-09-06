import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Layers, AlertCircle, RefreshCw, ArrowRight, Trophy } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../api/api";

const ACCENT_RING = [
  "from-[#EC008C]/15 to-[#EC008C]/5 text-[#EC008C]",
  "from-[#8DC63F]/20 to-[#8DC63F]/5 text-[#4c7a12]",
  "from-sky-500/15 to-sky-500/5 text-sky-600",
  "from-amber-500/15 to-amber-500/5 text-amber-600",
];

function orgInitials(name = "") {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "OR";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function OrgCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-slate-100" />
      </div>
      <div className="mt-5 h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
      <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 h-4 w-full animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function SelectOrganization() {
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/organizations/my-organizations");
      setOrganizations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load organizations:", err);
      setError(
        err.response?.data?.message || "Failed to load organizations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return (
    <AdminLayout
      title="Select Organization"
      subtitle="Choose tournament group"
      active="Overview"
    >
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 font-sans text-slate-800 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Page header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EC008C] to-[#c4006f] text-white shadow-lg shadow-pink-200">
                <Trophy size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Your Organizations
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Pick a tournament group to manage its auctions
                </p>
              </div>
            </div>

            {!loading && !error && organizations.length > 0 && (
              <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm sm:self-auto">
                <Building2 size={14} className="text-[#EC008C]" />
                {organizations.length} organization
                {organizations.length === 1 ? "" : "s"}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrgCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <AlertCircle className="h-7 w-7 text-rose-500" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-800">{error}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Check your connection and try again
              </p>
              <button
                onClick={fetchOrganizations}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#EC008C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#d4007d] active:scale-95"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : organizations.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                <Building2 className="h-7 w-7 text-slate-300" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-700">
                No organizations yet
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Organizations assigned to your account will show up here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {organizations.map((org, index) => {
                const accent = ACCENT_RING[index % ACCENT_RING.length];
                return (
                  <button
                    key={org.id}
                    onClick={() =>
                      navigate(`/admin/organizations/${org.id}/auctions`)
                    }
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8DC63F]/50 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black ${accent}`}
                        >
                          {orgInitials(org.organization_name)}
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {org.plan_type || "Standard"}
                        </span>
                      </div>

                      <h2 className="mt-4 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#EC008C]">
                        {org.organization_name}
                      </h2>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Layers size={14} className="text-slate-400" />
                        Max auctions
                      </span>
                      <span className="flex items-center gap-1 text-sm font-extrabold text-slate-900">
                        {org.max_auctions_allowed}
                        <ArrowRight
                          size={15}
                          className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#EC008C]"
                        />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}