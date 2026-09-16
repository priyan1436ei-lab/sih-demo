import React, { useState } from "react";
import { CaseReport, OutbreakCluster, Language, TRANSLATIONS } from "../types";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  Shield,
  Send,
  CheckCircle2,
  Users
} from "lucide-react";

interface AdminDashboardProps {
  cases: CaseReport[];
  clusters: OutbreakCluster[];
  lang: Language;
  onBroadcastAlert: (alert: { title: string; message: string; district: string; riskLevel: "Low" | "Medium" | "High" }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cases,
  clusters,
  lang,
  onBroadcastAlert
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // District breakdowns
  const districtStats: { [key: string]: { total: number; high: number; med: number; low: number } } = {};
  cases.forEach((c) => {
    if (!districtStats[c.district]) {
      districtStats[c.district] = { total: 0, high: 0, med: 0, low: 0 };
    }
    districtStats[c.district].total++;
    if (c.aiAnalysis.riskLevel === "High") districtStats[c.district].high++;
    else if (c.aiAnalysis.riskLevel === "Medium") districtStats[c.district].med++;
    else districtStats[c.district].low++;
  });

  // Disease breakdowns
  const diseaseStats: { [key: string]: number } = {};
  cases.forEach((c) => {
    const dis = c.aiAnalysis.suspectedDisease.split("(")[0].trim();
    diseaseStats[dis] = (diseaseStats[dis] || 0) + 1;
  });

  // Species breakdowns
  const speciesStats: { [key: string]: number } = {};
  cases.forEach((c) => {
    speciesStats[c.species] = (speciesStats[c.species] || 0) + 1;
  });

  // Broadcast Alert Form
  const [broadcastTitle, setBroadcastTitle] = useState<string>("Emergency Vaccination & Quarantine Ring Advisory");
  const [broadcastMsg, setBroadcastMsg] = useState<string>(
    "Mandatory ring vaccination (5km radius) ordered in Anand district following clustered Lumpy Skin Disease reports."
  );
  const [broadcastDistrict, setBroadcastDistrict] = useState<string>("Anand");
  const [broadcastRisk, setBroadcastRisk] = useState<"Low" | "Medium" | "High">("High");
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    onBroadcastAlert({
      title: broadcastTitle,
      message: broadcastMsg,
      district: broadcastDistrict,
      riskLevel: broadcastRisk
    });
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ["Case_ID,Tag_ID,Species,Breed,Disease,Risk_Level,Risk_Score,Farmer_Name,Phone,Village,District,Temp_F,Vet_Status,Reported_At"];
    const rows = cases.map((c) =>
      [
        c.id,
        c.tagId,
        c.species,
        c.breed,
        `"${c.aiAnalysis.suspectedDisease.replace(/"/g, '""')}"`,
        c.aiAnalysis.riskLevel,
        c.aiAnalysis.riskScore,
        `"${c.farmerName}"`,
        c.farmerPhone,
        `"${c.village}"`,
        `"${c.district}"`,
        c.bodyTemperatureF,
        c.vetStatus,
        c.reportedAt
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PashuRaksha_Outbreak_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Export */}
      <div className="bg-gradient-to-br from-[#0c1f38] via-[#09182d] to-[#040e1c] text-white rounded-3xl p-6 sm:p-7 border border-blue-900/60 shadow-xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>DAHD • ICAR-IVRI Command Center</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span>3 Active Cordons</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-display text-white">
              {t.govtAnalytics}
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl leading-relaxed">
              Real-time geospatial epidemiological surveillance, cluster contagion rate forecasting, ring vaccination dispatch, and inter-district biosecurity alerts.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md text-left min-w-[130px]">
              <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider block">Surveillance Census</span>
              <span className="text-xl font-bold font-mono text-white">{cases.length} Records</span>
              <span className="text-[10px] text-emerald-300 block font-semibold">99.4% Validated</span>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all border border-blue-400/30"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Export Epidemiological CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* District Tally Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(districtStats).map(([district, stat]) => (
          <div
            key={district}
            className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5 hover:shadow-md transition-all hover:border-blue-300"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-stone-900 text-base flex items-center gap-1.5">
                <span>📍</span>
                <span>{district}</span>
              </h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono">
                {stat.total} Reports
              </span>
            </div>

            {/* Micro bar chart */}
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(stat.high / stat.total) * 100}%` }}
                className="bg-rose-600 h-full"
                title={`High: ${stat.high}`}
              />
              <div
                style={{ width: `${(stat.med / stat.total) * 100}%` }}
                className="bg-amber-500 h-full"
                title={`Med: ${stat.med}`}
              />
              <div
                style={{ width: `${(stat.low / stat.total) * 100}%` }}
                className="bg-emerald-600 h-full"
                title={`Low: ${stat.low}`}
              />
            </div>

            <div className="flex justify-between text-[11px] text-stone-500 font-semibold pt-0.5">
              <span className="text-rose-600 font-bold">{stat.high} High</span>
              <span className="text-amber-600 font-bold">{stat.med} Med</span>
              <span className="text-emerald-700 font-bold">{stat.low} Low</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Breakdown: Diseases & Species Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Suspected Disease Distribution */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              Suspected Disease Incidences
            </h3>
            <span className="text-xs text-stone-500 font-medium">Cluster Frequency</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(diseaseStats).map(([dis, count]) => {
              const percent = Math.round((count / cases.length) * 100);
              return (
                <div key={dis} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-stone-800">
                    <span>{dis}</span>
                    <span>{count} cases ({percent}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full ${
                        dis.includes("Lumpy")
                          ? "bg-rose-600"
                          : dis.includes("Foot")
                          ? "bg-rose-500"
                          : dis.includes("Mastitis")
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Species Breakdown & Alert Thresholds */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-700" />
              Livestock Species Affected
            </h3>
            <span className="text-xs text-stone-500 font-medium">Active Census</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            {Object.entries(speciesStats).map(([species, count]) => (
              <div
                key={species}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-stone-500 block">{species}</span>
                  <span className="text-lg font-bold text-stone-900">{count}</span>
                </div>
                <span className="text-xl">
                  {species === "Cow" ? "🐄" : species === "Buffalo" ? "🐃" : "🐐"}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Shield className="w-4 h-4 text-blue-600" />
              National Animal Disease Control Program (NADCP) Targets:
            </div>
            <p className="text-blue-800 text-[11px]">
              FMD & Brucellosis 100% ear-tagging coverage mandated. Current registered herd protection rate across Anand district is at 84.6%.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Tool */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-600" />
              Issue Official District Health & Biosecurity Advisory
            </h3>
            <p className="text-xs text-stone-500">
              Broadcasts immediate push notification and SMS advisory to registered farmers, veterinarians, and dispensaries.
            </p>
          </div>
        </div>

        {broadcastSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Advisory broadcast dispatched to all field units in {broadcastDistrict}!</span>
          </div>
        )}

        <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-stone-700 font-semibold mb-1">
                Advisory Title
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Target District
              </label>
              <select
                value={broadcastDistrict}
                onChange={(e) => setBroadcastDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                {Object.keys(districtStats).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="All Districts">All Districts (Statewide)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Advisory Message & Movement Restrictions
            </label>
            <textarea
              rows={2}
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Advisory to District</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
