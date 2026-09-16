import React, { useState, useEffect } from "react";
import { CaseReport, Language, TRANSLATIONS } from "../types";
import { updateCaseStatus, submitRetrainingFeedback, fetchRetrainingDataset } from "../services/api";
import { LabReferralModal } from "./LabReferralModal";
import {
  Stethoscope,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  FileText,
  FlaskConical,
  Pill,
  Clock,
  Phone,
  MapPin,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  Sparkles,
  UserCheck,
  Send,
  Eye,
  Camera,
  Truck,
  Navigation,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PhoneCall
} from "lucide-react";

interface VetDashboardProps {
  cases: CaseReport[];
  lang: Language;
  onCaseUpdated: (updated: CaseReport) => void;
}

export const VetDashboard: React.FC<VetDashboardProps> = ({
  cases,
  lang,
  onCaseUpdated
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Call-out Mode: default to escalated-only call-outs
  const [callOutMode, setCallOutMode] = useState<"escalated_only" | "all">("escalated_only");

  // Selection & Filters
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLabModalOpen, setIsLabModalOpen] = useState<boolean>(false);

  // Edit / Workflow State
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [vetNotes, setVetNotes] = useState<string>("");
  const [treatmentPlan, setTreatmentPlan] = useState<string>("");
  const [vetStatus, setVetStatus] = useState<CaseReport["vetStatus"]>("Pending Review");
  const [assignedVet, setAssignedVet] = useState<string>("Dr. Vikram Joshi (B.V.Sc & A.H)");

  // Active-Learning Feedback for Model Retraining
  const [confirmedDiagnosisLabel, setConfirmedDiagnosisLabel] = useState<string>("");
  const [retrainingNotes, setRetrainingNotes] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);
  const [retrainDatasetCount, setRetrainDatasetCount] = useState<number>(0);

  // Load Retraining Dataset Stats on Mount
  useEffect(() => {
    fetchRetrainingDataset().then((data) => {
      if (data && typeof data.totalSamples === "number") {
        setRetrainDatasetCount(data.totalSamples);
      }
    });
  }, []);

  // Filter Cases according to Call-Out Mode and user filters
  const filteredCases = cases
    .filter((c) => {
      // Escalation-Only filter:
      if (callOutMode === "escalated_only") {
        const isEscalated =
          c.routingTier === "known_urgent_escalated" ||
          c.routingTier === "unrecognized_escalated" ||
          c.vetStatus === "Urgent-Escalated" ||
          c.vetStatus === "Escalated - Unrecognized" ||
          c.vetStatus === "Vet Dispatched" ||
          c.vetStatus === "Vet En Route" ||
          c.vetStatus === "Treated" ||
          c.aiAnalysis.riskLevel === "High" ||
          c.aiAnalysis.confidence < 0.60;
        if (!isEscalated) return false;
      }

      if (filterRisk !== "all" && c.aiAnalysis.riskLevel !== filterRisk) return false;
      if (filterStatus !== "all" && c.vetStatus !== filterStatus) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchText = `${c.id} ${c.species} ${c.breed} ${c.tagId} ${c.farmerName} ${c.village} ${c.district} ${c.aiAnalysis.suspectedDisease} ${c.routingTier || ""}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => b.aiAnalysis.riskScore - a.aiAnalysis.riskScore);

  // Auto-select first case if none or invalid
  const selectedCase =
    cases.find((c) => c.id === selectedCaseId) ||
    filteredCases[0] ||
    cases[0];

  // Sync state whenever selected case changes
  useEffect(() => {
    if (selectedCase) {
      setSelectedCaseId(selectedCase.id);
      setVetNotes(selectedCase.vetNotes || "");
      setTreatmentPlan(selectedCase.treatmentPlan || "");
      setVetStatus(selectedCase.vetStatus);
      if (selectedCase.assignedVet) setAssignedVet(selectedCase.assignedVet);
      setConfirmedDiagnosisLabel(
        selectedCase.retrainingFeedback?.confirmedLabel ||
        selectedCase.aiAnalysis.suspectedDisease ||
        ""
      );
      setRetrainingNotes(selectedCase.retrainingFeedback?.notes || "");
      setFeedbackSuccessMsg(null);
    }
  }, [selectedCase?.id]);

  // Derived counts
  const urgentEscalatedCount = cases.filter(
    (c) =>
      c.routingTier === "known_urgent_escalated" ||
      c.vetStatus === "Urgent-Escalated" ||
      c.aiAnalysis.riskLevel === "High"
  ).length;

  const unrecognizedCount = cases.filter(
    (c) =>
      c.routingTier === "unrecognized_escalated" ||
      c.vetStatus === "Escalated - Unrecognized" ||
      c.aiAnalysis.confidence < 0.60
  ).length;

  const enRouteCount = cases.filter(
    (c) => c.vetStatus === "Vet Dispatched" || c.vetStatus === "Vet En Route"
  ).length;

  // Workflow Handlers
  const handleDispatchUnit = async () => {
    if (!selectedCase) return;
    setIsUpdating(true);
    try {
      const updates: Partial<CaseReport> = {
        vetStatus: "Vet Dispatched",
        dispatchedAt: new Date().toISOString(),
        assignedVet,
        vetNotes: vetNotes || `Call-out dispatched from ${selectedCase.nearestVetClinic?.name || "Dispensary"} by ${assignedVet}.`
      };
      const ok = await updateCaseStatus(selectedCase.id, updates);
      if (ok) {
        setVetStatus("Vet Dispatched");
        onCaseUpdated({ ...selectedCase, ...updates });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkEnRoute = async () => {
    if (!selectedCase) return;
    setIsUpdating(true);
    try {
      const updates: Partial<CaseReport> = {
        vetStatus: "Vet En Route",
        assignedVet
      };
      const ok = await updateCaseStatus(selectedCase.id, updates);
      if (ok) {
        setVetStatus("Vet En Route");
        onCaseUpdated({ ...selectedCase, ...updates });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkTreated = async () => {
    if (!selectedCase) return;
    setIsUpdating(true);
    try {
      const updates: Partial<CaseReport> = {
        vetStatus: "Treated",
        treatedAt: new Date().toISOString(),
        treatmentPlan,
        vetNotes,
        assignedVet
      };
      const ok = await updateCaseStatus(selectedCase.id, updates);
      if (ok) {
        setVetStatus("Treated");
        onCaseUpdated({ ...selectedCase, ...updates });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedCase) return;
    setIsUpdating(true);
    try {
      const updates: Partial<CaseReport> = {
        vetStatus: "Resolved",
        treatmentPlan,
        vetNotes,
        assignedVet
      };
      const ok = await updateCaseStatus(selectedCase.id, updates);
      if (ok) {
        setVetStatus("Resolved");
        onCaseUpdated({ ...selectedCase, ...updates });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Active-Learning Feedback for Model Retraining
  const handleSubmitRetraining = async () => {
    if (!selectedCase || !confirmedDiagnosisLabel) return;
    setIsSubmittingFeedback(true);
    setFeedbackSuccessMsg(null);
    try {
      const res = await submitRetrainingFeedback({
        caseId: selectedCase.id,
        confirmedLabel: confirmedDiagnosisLabel,
        notes: retrainingNotes,
        vetName: assignedVet
      });

      if (res && res.success) {
        setFeedbackSuccessMsg(
          `Diagnosis "${confirmedDiagnosisLabel}" confirmed & queued to retrain AI model! Active corpus: ${res.totalRetrainSamples} samples.`
        );
        setRetrainDatasetCount(res.totalRetrainSamples);

        const updatedReport: CaseReport = {
          ...selectedCase,
          retrainingFeedback: {
            isFedBack: true,
            confirmedLabel: confirmedDiagnosisLabel,
            submittedAt: new Date().toISOString(),
            notes: retrainingNotes
          },
          vetNotes: `${selectedCase.vetNotes ? selectedCase.vetNotes + " | " : ""}Confirmed Diagnosis: ${confirmedDiagnosisLabel} (Fed back for model retraining)`
        };
        onCaseUpdated(updatedReport);
      }
    } catch (err) {
      console.error("Retraining feedback error:", err);
      alert("Failed to submit retraining feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Quick Prescription Protocol templates
  const applyQuickTreatment = (disease: string) => {
    if (disease.includes("Lumpy")) {
      setVetNotes("Clinical skin nodules typical of Capripoxvirus. Administered secondary bacterial cover and antipyretic.");
      setTreatmentPlan("Meloxicam + Paracetamol 100mg/ml inj (15ml IM OD x 3 days), Ceftiofur sodium 1g inj IM, Ivermectin 1ml/50kg SC for fly control, topical Potassium Permanganate 1:1000 wash on ulcerated skin nodules.");
    } else if (disease.includes("Foot & Mouth")) {
      setVetNotes("Pathognomonic ruptured oral mucosal vesicles and interdigital hoof erosions. Strict biosecurity cordon established.");
      setTreatmentPlan("Boro-glycerine application in oral cavity, 1% Potassium Permanganate foot-dip twice daily, Flunixin meglumine for acute anti-inflammatory analgesia, Enrofloxacin 10% inj.");
    } else if (disease.includes("Mastitis")) {
      setVetNotes("CMT 3+ positive in left rear quarter. Fibrinous clots and painful acute swelling.");
      setTreatmentPlan("Frequent quarter stripping every 2 hours, Intramammary Cloxacillin + Ampicillin infusion, oral Serratiopeptidase boluses, cold ice compresses on inflamed gland.");
    } else {
      setVetNotes("On-site clinical examination completed. Supportive therapy prescribed.");
      setTreatmentPlan("Broad-spectrum antibiotic cover, supportive multivitamin + liver extract inj, fluid electrolyte balance.");
    }
  };

  const getTierBadge = (caseItem: CaseReport) => {
    const tier =
      caseItem.routingTier ||
      (caseItem.aiAnalysis.confidence < 0.60
        ? "unrecognized_escalated"
        : caseItem.aiAnalysis.riskLevel === "High"
        ? "known_urgent_escalated"
        : "known_self_treated");

    if (tier === "known_urgent_escalated") {
      return {
        label: "🚨 Urgent-Escalated",
        className: "bg-rose-100 text-rose-800 border-rose-300 font-bold"
      };
    }
    if (tier === "unrecognized_escalated") {
      return {
        label: "🔍 Unrecognized Pathogen",
        className: "bg-indigo-100 text-indigo-800 border-indigo-300 font-bold"
      };
    }
    return {
      label: "Self-Treated / AI",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold"
    };
  };

  const getStatusBadge = (status: CaseReport["vetStatus"]) => {
    switch (status) {
      case "Vet Dispatched":
        return { label: "Dispatched", className: "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse" };
      case "Vet En Route":
        return { label: "En Route (~ETA)", className: "bg-amber-200 text-amber-950 border border-amber-400 font-bold" };
      case "Treated":
        return { label: "Treated On-Site", className: "bg-blue-100 text-blue-900 border border-blue-300 font-bold" };
      case "Resolved":
        return { label: "Resolved", className: "bg-emerald-100 text-emerald-900 border border-emerald-300" };
      case "Lab Referred":
        return { label: "Lab Referred", className: "bg-purple-100 text-purple-900 border border-purple-300" };
      case "Urgent-Escalated":
      case "Escalated - Unrecognized":
        return { label: "Pending Dispatch", className: "bg-rose-100 text-rose-800 border border-rose-300 font-bold animate-pulse" };
      default:
        return { label: status || "New", className: "bg-stone-100 text-stone-700 border border-stone-300" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Escalation-Only Call-Out Architecture Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#07251a] via-[#051c14] to-[#02120d] text-white border border-emerald-800/60 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>Escalation-Only Veterinary Dispatch Unit</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                <span>VCI Reg. Verified</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-display text-white">
              Rapid Field Response for High-Urgency & Unrecognized Cases
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/85 max-w-3xl leading-relaxed">
              <strong>Clinical Triage Protocol:</strong> Standard livestock conditions with high AI certainty are resolved via automated farmer first-aid. This console receives <strong>priority call-out escalations</strong> for contagious cluster risks and unknown pathogens requiring farm visits, biosafety cordons, and active-learning retraining.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md text-center min-w-[120px]">
              <span className="text-[10px] text-emerald-300 block uppercase font-bold tracking-wider">AI Retrain Corpus</span>
              <span className="text-2xl font-mono font-bold text-amber-300">{retrainDatasetCount}</span>
              <span className="text-[10px] text-stone-300 block font-semibold">Active Samples</span>
            </div>
          </div>
        </div>
      </div>

      {/* Triage Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-2xs hover:shadow-md transition-all hover:border-rose-300">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
            <span>Critical Call-Outs</span>
            <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-rose-700 mt-1">{urgentEscalatedCount}</p>
          <span className="text-[11px] text-rose-700 font-semibold block mt-0.5">High urgency / contagious</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-indigo-200/80 shadow-2xs hover:shadow-md transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
            <span>Unrecognized Cases</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-indigo-900 mt-1">{unrecognizedCount}</p>
          <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">AI confidence &lt;60% • Retrain</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs hover:shadow-md transition-all hover:border-amber-300">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
            <span>Doctors En Route</span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 mt-1">{enRouteCount}</p>
          <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">Mobile clinics dispatched</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs hover:shadow-md transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
            <span>Total Triage Intake</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900 mt-1">{cases.length}</p>
          <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">Live + Self-care archive</span>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Case Detail & Clinical Call-out Lifecycle on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triage Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
          {/* Mode Switcher */}
          <div className="p-1 bg-stone-100 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCallOutMode("escalated_only")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                callOutMode === "escalated_only"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>🚨 Active Call-Outs ({urgentEscalatedCount + unrecognizedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setCallOutMode("all")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                callOutMode === "all"
                  ? "bg-stone-800 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>All Intake Archive ({cases.length})</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tag ID, farmer, disease, village..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 text-stone-900"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex gap-2 text-xs">
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="flex-1 px-2 py-1 rounded-lg border border-stone-300 bg-stone-50 text-stone-700 text-xs"
              >
                <option value="all">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-2 py-1 rounded-lg border border-stone-300 bg-stone-50 text-stone-700 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Pending Review">Pending Review / Alert</option>
                <option value="Vet Dispatched">Vet Dispatched</option>
                <option value="Vet En Route">Vet En Route</option>
                <option value="Treated">Treated On-Site</option>
                <option value="Resolved">Resolved</option>
                <option value="Lab Referred">Lab Referred</option>
              </select>
            </div>
          </div>

          {/* Case Items List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const tierBadge = getTierBadge(c);
              const statusBadge = getStatusBadge(c.vetStatus);

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500"
                      : "border-stone-200 bg-stone-50/50 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${tierBadge.className}`}>
                          {tierBadge.label}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 mt-1 truncate">
                        {c.tagId} • {c.species} ({c.breed})
                      </p>
                      <p className="text-xs text-stone-700 font-semibold truncate">
                        {c.aiAnalysis.suspectedDisease}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        c.aiAnalysis.riskLevel === "High"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : c.aiAnalysis.riskLevel === "Medium"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {c.aiAnalysis.riskScore}% Risk
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-1 border-t border-stone-200/50">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {c.village}, {c.district}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="text-center py-10 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-300 text-stone-500 text-xs space-y-2">
                <Stethoscope className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="font-bold text-stone-700">No matching cases in this view</p>
                <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                  {callOutMode === "escalated_only"
                    ? "No high-urgency call-outs or unrecognized pathogens active. Routine cases are handled directly by farmers."
                    : "Intake queue is clear. Reports submitted from Farmer app or IVR will appear here."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Case Deep-Dive & Clinical On-Site Call-Out Lifecycle (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-5">
          {selectedCase ? (
            <>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                      Case #{selectedCase.id}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getTierBadge(selectedCase).className}`}>
                      {getTierBadge(selectedCase).label}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(selectedCase.vetStatus).className}`}>
                      Status: {selectedCase.vetStatus}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-stone-900 mt-1.5">
                    {selectedCase.aiAnalysis.suspectedDisease}
                  </h2>
                </div>

                <div className="text-left sm:text-right text-xs text-stone-500">
                  <p>Reported: {new Date(selectedCase.reportedAt).toLocaleDateString()} at {new Date(selectedCase.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="font-semibold text-stone-800 mt-0.5 flex items-center gap-1.5 sm:justify-end">
                    <span>Farmer: {selectedCase.farmerName}</span>
                    <a
                      href={`tel:${selectedCase.farmerPhone}`}
                      className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                      title="Call Farmer"
                    >
                      <PhoneCall className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>

              {/* On-Site Call-Out Lifecycle Action Bar */}
              <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-emerald-950 text-sm">
                      Field Veterinary Call-Out Operations
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800">
                    Dispensary: {selectedCase.nearestVetClinic?.name || "Local Block Hospital"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Step 1: Dispatch */}
                  <button
                    type="button"
                    onClick={handleDispatchUnit}
                    disabled={isUpdating || ["Vet Dispatched", "Vet En Route", "Treated", "Resolved"].includes(selectedCase.vetStatus)}
                    className="p-2.5 rounded-xl border text-center font-bold transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 bg-white hover:bg-emerald-100 border-emerald-300 text-emerald-950"
                  >
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>1. Dispatch Unit</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {["Vet Dispatched", "Vet En Route", "Treated", "Resolved"].includes(selectedCase.vetStatus) ? "✓ Dispatched" : "Send Vet"}
                    </span>
                  </button>

                  {/* Step 2: Navigate to GPS */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCase.latitude},${selectedCase.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleMarkEnRoute()}
                    className="p-2.5 rounded-xl border text-center font-bold transition-all flex flex-col items-center justify-center gap-1 bg-white hover:bg-emerald-100 border-emerald-300 text-emerald-950"
                  >
                    <Navigation className="w-4 h-4 text-emerald-700" />
                    <span>2. GPS Route</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {selectedCase.latitude.toFixed(2)}, {selectedCase.longitude.toFixed(2)}
                    </span>
                  </a>

                  {/* Step 3: On-Site Treatment */}
                  <button
                    type="button"
                    onClick={handleMarkTreated}
                    disabled={isUpdating || ["Treated", "Resolved"].includes(selectedCase.vetStatus)}
                    className="p-2.5 rounded-xl border text-center font-bold transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 bg-white hover:bg-emerald-100 border-emerald-300 text-emerald-950"
                  >
                    <Pill className="w-4 h-4 text-emerald-700" />
                    <span>3. Log Treatment</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {["Treated", "Resolved"].includes(selectedCase.vetStatus) ? "✓ Administered" : "Mark Treated"}
                    </span>
                  </button>

                  {/* Step 4: Resolve */}
                  <button
                    type="button"
                    onClick={handleMarkResolved}
                    disabled={isUpdating || selectedCase.vetStatus === "Resolved"}
                    className="p-2.5 rounded-xl border text-center font-bold transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 bg-white hover:bg-emerald-100 border-emerald-300 text-emerald-950"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>4. Resolve Case</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {selectedCase.vetStatus === "Resolved" ? "✓ Closed" : "Close Out"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Patient Photo & Clinical Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Photo */}
                <div className="sm:col-span-5">
                  <div className="relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200 h-48 sm:h-56">
                    {selectedCase.photoUrl ? (
                      <img
                        src={selectedCase.photoUrl}
                        alt="Patient lesion"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                        <FileText className="w-8 h-8 text-stone-300 mb-1" />
                        <span>No image attached</span>
                      </div>
                    )}

                    {selectedCase.aiAnalysis.detectedLesions.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] text-white">
                        <span className="font-bold text-amber-300">YOLO Detection:</span>{" "}
                        {selectedCase.aiAnalysis.detectedLesions.map((l) => l.label).join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vitals & Clinical Metrics */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-500 block">Temperature</span>
                      <span className="text-base font-bold text-rose-600">
                        {selectedCase.bodyTemperatureF} °F
                      </span>
                      <span className="text-[10px] text-stone-400">Normal: 101.5°F</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-500 block">Activity & Feeding</span>
                      <span className="text-sm font-bold text-stone-800 block">
                        {selectedCase.activityLevel}
                      </span>
                      <span className="text-[11px] text-stone-600">
                        Appetite: {selectedCase.appetite}
                      </span>
                    </div>
                  </div>

                  {/* Symptoms List */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 font-semibold block mb-1">
                      Reported Symptoms ({selectedCase.symptoms.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCase.symptoms.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-800 text-[11px] font-medium"
                        >
                          • {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Location & Herd biosecurity alert */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">
                        📍 {selectedCase.village}, {selectedCase.district} ({selectedCase.state})
                      </span>
                      <span className="text-[11px] text-amber-800">
                        GPS: {selectedCase.latitude}, {selectedCase.longitude}
                      </span>
                    </div>
                    {selectedCase.aiAnalysis.quarantineRequired && (
                      <span className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px]">
                        Quarantine Required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Active-Learning AI Retraining Section */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-700" />
                    <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider">
                      AI Model Active-Learning & Retraining Feedback
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">
                    Closed-Loop Veterinary Feedback
                  </span>
                </div>

                <p className="text-xs text-indigo-900 leading-relaxed">
                  When you diagnose an unrecognized disease or adjust the AI's initial prediction on-site, enter the confirmed clinical diagnosis below. This updates the national labeled retraining corpus so the AI engine recognizes this pathogen in future reports.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-950 mb-1">
                      Confirmed Disease Diagnosis
                    </label>
                    <input
                      type="text"
                      value={confirmedDiagnosisLabel}
                      onChange={(e) => setConfirmedDiagnosisLabel(e.target.value)}
                      placeholder="e.g. Atypical Caprine Dermatitis"
                      className="w-full px-3 py-2 rounded-xl border border-indigo-300 text-xs bg-white text-stone-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-indigo-950 mb-1">
                      Retraining Notes / Differential Observations
                    </label>
                    <input
                      type="text"
                      value={retrainingNotes}
                      onChange={(e) => setRetrainingNotes(e.target.value)}
                      placeholder="e.g. Verified by skin scraping microscopy and PCR"
                      className="w-full px-3 py-2 rounded-xl border border-indigo-300 text-xs bg-white text-stone-900"
                    />
                  </div>
                </div>

                {feedbackSuccessMsg && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{feedbackSuccessMsg}</span>
                  </div>
                )}

                {selectedCase.retrainingFeedback?.isFedBack && !feedbackSuccessMsg && (
                  <div className="p-2.5 bg-indigo-100/70 border border-indigo-300 text-indigo-950 rounded-xl text-xs flex items-center justify-between">
                    <span>
                      ✓ Previously fed back as: <strong>{selectedCase.retrainingFeedback.confirmedLabel}</strong> ({new Date(selectedCase.retrainingFeedback.submittedAt).toLocaleDateString()})
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700">In Retraining Queue</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSubmitRetraining}
                    disabled={isSubmittingFeedback || !confirmedDiagnosisLabel}
                    className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{isSubmittingFeedback ? "Submitting to Retrain Model..." : "Feed Confirmed Diagnosis to Retrain AI Model"}</span>
                  </button>
                </div>
              </div>

              {/* Lab Referral & Diagnostic Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                      National Diagnostic Laboratory Network (CADRAD / NIHSAD)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLabModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>{selectedCase.labReferral ? "Manage Lab Results & Follow-up" : "Refer Sample to Lab"}</span>
                  </button>
                </div>

                {selectedCase.labReferral ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        Tracking: <span className="font-mono text-emerald-800">{selectedCase.labReferral.trackingCode}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {selectedCase.labReferral.status || "Dispatched - Testing in Progress"}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      <strong>Facility:</strong> {selectedCase.labReferral.labName} • <strong>Sample:</strong> {selectedCase.labReferral.sampleType}
                    </p>
                    {selectedCase.labReferral.clinicalNotes && (
                      <p className="text-[11px] text-stone-500 italic">
                        "{selectedCase.labReferral.clinicalNotes}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-800">
                    For severe contagious suspicions (LSD / FMD / Anthrax / PPR), dispatch tissue biopsies or serum for confirmatory Real-Time PCR.
                  </p>
                )}
              </div>

              {/* Quick Prescription Protocols */}
              <div className="border-t border-stone-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Veterinary Standard Protocols:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyQuickTreatment("Lumpy")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-medium hover:bg-emerald-100"
                  >
                    💊 Auto-fill LSD Protocol
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickTreatment("Foot & Mouth")}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-xs font-medium hover:bg-rose-100"
                  >
                    💊 Auto-fill FMD Protocol
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickTreatment("Mastitis")}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-xs font-medium hover:bg-amber-100"
                  >
                    💊 Auto-fill Mastitis Protocol
                  </button>
                </div>
              </div>

              {/* Vet Action & Prescription Form */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-emerald-700" />
                  Clinical Decisions & Follow-up
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Triage Workflow Status
                    </label>
                    <select
                      value={vetStatus}
                      onChange={(e) => setVetStatus(e.target.value as CaseReport["vetStatus"])}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-stone-900"
                    >
                      <option value="Pending Review">Pending Review / Incoming Alert</option>
                      <option value="Urgent-Escalated">Urgent-Escalated</option>
                      <option value="Escalated - Unrecognized">Escalated - Unrecognized</option>
                      <option value="Vet Dispatched">Vet Dispatched</option>
                      <option value="Vet En Route">Vet En Route</option>
                      <option value="Treated">Treated On-Site</option>
                      <option value="Diagnosis Confirmed">Diagnosis Confirmed</option>
                      <option value="Lab Referred">Lab Referred (IVRI / CADRAD)</option>
                      <option value="Treatment Prescribed">Treatment Prescribed</option>
                      <option value="Resolved">Resolved / Recovered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Attending Veterinarian
                    </label>
                    <input
                      type="text"
                      value={assignedVet}
                      onChange={(e) => setAssignedVet(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Clinical Diagnosis Notes & Observations
                  </label>
                  <textarea
                    rows={2}
                    value={vetNotes}
                    onChange={(e) => setVetNotes(e.target.value)}
                    placeholder="Enter diagnostic confirmation, differential observations, or sample collection details..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Prescribed Treatment Plan (Farmer SMS & Dispensary Chart)
                  </label>
                  <textarea
                    rows={2}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="e.g. Meloxicam + Paracetamol inj, Potassium permanganate wash, Ceftiofur sodium..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        const updates: Partial<CaseReport> = {
                          vetStatus,
                          vetNotes,
                          treatmentPlan,
                          assignedVet
                        };
                        const ok = await updateCaseStatus(selectedCase.id, updates);
                        if (ok) {
                          onCaseUpdated({ ...selectedCase, ...updates });
                        }
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={isUpdating}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isUpdating ? "Saving..." : "Save Decisions & Update Case"}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-stone-400">
              Select a case from the triage queue to review.
            </div>
          )}
        </div>
      </div>

      {/* Lab Referral & Follow-up Modal */}
      {selectedCase && (
        <LabReferralModal
          isOpen={isLabModalOpen}
          onClose={() => setIsLabModalOpen(false)}
          caseReport={selectedCase}
          language={lang}
          vetName={assignedVet}
          onReferralComplete={(updatedCase) => {
            onCaseUpdated(updatedCase);
            setVetStatus(updatedCase.vetStatus);
            if (updatedCase.treatmentPlan) setTreatmentPlan(updatedCase.treatmentPlan);
            if (updatedCase.vetNotes) setVetNotes(updatedCase.vetNotes);
          }}
        />
      )}
    </div>
  );
};
