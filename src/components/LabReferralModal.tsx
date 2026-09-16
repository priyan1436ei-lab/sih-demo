import React, { useState } from "react";
import { CaseReport, LabReferral, Language } from "../types";
import { referToLab, submitFollowUp } from "../services/api";
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  Printer,
  FileText,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface LabReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseReport: CaseReport | null;
  onReferralComplete: (updatedCase: CaseReport) => void;
  language: Language;
  vetName: string;
}

const ACCREDITED_LABS = [
  {
    id: "CADRAD",
    name: "CADRAD - Centre for Animal Disease Research and Diagnosis (ICAR-IVRI, Bareilly)",
    specialty: "National Referral Lab for Lumpy Skin Disease, Brucellosis, Anthrax & Avian Diseases"
  },
  {
    id: "NIHSAD",
    name: "NIHSAD - National Institute of High Security Animal Diseases (ICAR, Bhopal)",
    specialty: "Biosafety Level 3+ Viral Epidemics & High Consequence Pathogens"
  },
  {
    id: "RDDL_WEST",
    name: "Anand Regional Animal Disease Diagnostic Laboratory (RDDL West Zone)",
    specialty: "State Diagnostic Testing & FMD Sero-monitoring"
  },
  {
    id: "STATE_BIO",
    name: "State Veterinary Biologicals & Diagnostic Lab (SVBP)",
    specialty: "Vaccine Validation & Field Diagnostic Assays"
  }
];

const SAMPLE_TYPES = [
  { id: "scab_biopsy", name: "Skin Nodule Scab & Tissue Biopsy (Capripoxvirus PCR)" },
  { id: "blood_serum", name: "Whole Blood & Clotted Serum (ELISA / Antigen typing)" },
  { id: "vesicular_fluid", name: "Vesicular Fluid & Tongue Epithelium (FMD typing)" },
  { id: "swabs", name: "Nasal & Ocular Swabs (Viral/Bacterial transport medium)" },
  { id: "milk", name: "Quarter Milk Sample (CMT & Culture sensitivity)" }
];

export const LabReferralModal: React.FC<LabReferralModalProps> = ({
  isOpen,
  onClose,
  caseReport,
  onReferralComplete,
  language,
  vetName
}) => {
  const isHi = language === "hi";

  // Flow step: "form" | "confirmation" | "followup"
  const [currentStep, setCurrentStep] = useState<"form" | "confirmation" | "followup">(
    caseReport?.labReferral ? "confirmation" : "form"
  );

  const [selectedLab, setSelectedLab] = useState(ACCREDITED_LABS[0].name);
  const [selectedSampleType, setSelectedSampleType] = useState(SAMPLE_TYPES[0].name);
  const [priority, setPriority] = useState<"Routine" | "Urgent" | "Biohazard Level 3">("Urgent");
  const [clinicalNotes, setClinicalNotes] = useState(
    `Suspected ${caseReport?.aiAnalysis.suspectedDisease || "clinical outbreak"}. Requesting confirmatory Real-Time PCR and strain typing. Animal exhibited typical nodules and fever >104°F.`
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReferral, setCreatedReferral] = useState<LabReferral | null>(
    caseReport?.labReferral || null
  );

  // Follow-up inputs
  const [confirmedDisease, setConfirmedDisease] = useState(
    caseReport?.aiAnalysis.suspectedDisease || "Lumpy Skin Disease (Capripoxvirus)"
  );
  const [labResultSummary, setLabResultSummary] = useState(
    "CADRAD PCR Test Result: POSITIVE for Capripoxvirus DNA. Cycle Threshold (Ct) value: 21.4 (High viral load)."
  );
  const [prescribedTreatment, setPrescribedTreatment] = useState(
    "1. Meloxicam + Paracetamol bolus (antipyretic/analgesic) for 5 days\n2. Ceftiofur Sodium 1g IM (secondary bacterial protection)\n3. Potassium permanganate 1:1000 wash on burst nodules\n4. Supportive liver tonic & multivitamins."
  );
  const [followUpStatus, setFollowUpStatus] = useState<"In Treatment" | "Resolved">("In Treatment");

  if (!isOpen || !caseReport) return null;

  const handleSubmitReferral = async () => {
    setIsSubmitting(true);
    try {
      const res = await referToLab(caseReport.id, {
        labName: selectedLab,
        sampleType: selectedSampleType,
        priority,
        clinicalNotes,
        vetName
      });
      setCreatedReferral(res.labReferral);
      setCurrentStep("confirmation");
      onReferralComplete(res.case);
    } catch (err: any) {
      alert(err.message || "Failed to dispatch lab referral");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteFollowUp = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitFollowUp(caseReport.id, {
        confirmedDisease,
        labResultSummary,
        treatmentPlan: prescribedTreatment,
        status: followUpStatus,
        vetName
      });
      onReferralComplete(res.case);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to submit follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Step Indicator */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-xl shadow-xs">
              🧪
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isHi ? "पशु रोग निदान प्रयोगशाला रेफरल" : "Veterinary Diagnostic Lab Referral"}
              </h2>
              <p className="text-xs text-emerald-200">
                {caseReport.tagId} • {caseReport.species} ({caseReport.breed}) • Case #{caseReport.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumb Steps */}
        <div className="flex items-center justify-between bg-stone-100 px-6 py-2 border-b border-stone-200 text-xs font-semibold">
          <span
            className={`flex items-center gap-1.5 ${
              currentStep === "form" ? "text-emerald-800 font-bold" : "text-stone-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Lab Dispatch Form</span>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />

          <span
            className={`flex items-center gap-1.5 ${
              currentStep === "confirmation" ? "text-emerald-800 font-bold" : "text-stone-500"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === "confirmation" || currentStep === "followup"
                  ? "bg-emerald-700 text-white"
                  : "bg-stone-300 text-stone-700"
              }`}
            >
              2
            </span>
            <span>Referral Confirmation</span>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />

          <span
            className={`flex items-center gap-1.5 ${
              currentStep === "followup" ? "text-emerald-800 font-bold" : "text-stone-500"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === "followup" ? "bg-emerald-700 text-white" : "bg-stone-300 text-stone-700"
              }`}
            >
              3
            </span>
            <span>Result & Treatment Plan</span>
          </span>
        </div>

        {/* STEP 1: FORM */}
        {currentStep === "form" && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  AI Suspicion: {caseReport.aiAnalysis.suspectedDisease} ({caseReport.aiAnalysis.riskLevel} Risk)
                </span>
                <span className="text-amber-800 text-[11px]">
                  Dispatch biological sample in cold-chain transport medium (2-4°C) to an ICAR/DAHD accredited diagnostic facility.
                </span>
              </div>
            </div>

            {/* Select Lab */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Designated Accredited Laboratory
              </label>
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 text-stone-900 focus:bg-white"
              >
                {ACCREDITED_LABS.map((lab) => (
                  <option key={lab.id} value={lab.name}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Sample Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Sample Type Collected
                </label>
                <select
                  value={selectedSampleType}
                  onChange={(e) => setSelectedSampleType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 text-stone-900"
                >
                  {SAMPLE_TYPES.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Diagnostic Urgency
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 text-stone-900"
                >
                  <option value="Routine">Routine Serological Screen</option>
                  <option value="Urgent">Urgent Outbreak Investigation</option>
                  <option value="Biohazard Level 3">Biohazard Level 3 Emergency</option>
                </select>
              </div>
            </div>

            {/* Clinical Referral Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Clinical Referral Notes & Anamnesis
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white"
                placeholder="Include duration of illness, lesions observed, herd vaccination status..."
              />
            </div>

            {/* Cold chain checklist */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1 text-stone-700">
              <span className="font-bold text-stone-800 block">Biological Safety Checklist:</span>
              <p className="text-[11px] text-stone-600">
                ✓ Leak-proof triple packaging container sealed
              </p>
              <p className="text-[11px] text-stone-600">
                ✓ Cold-chain dry ice/gel packs placed at 2-4°C
              </p>
              <p className="text-[11px] text-stone-600">
                ✓ INAPH ear tag barcode #{caseReport.tagId} affixed to specimen vial
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReferral}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Dispatching..." : "Generate Referral & Dispatch Sample"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REFERRAL CONFIRMATION */}
        {currentStep === "confirmation" && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-emerald-900 text-sm">
                  Sample Referral Dispatched Successfully!
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Case status has transitioned to <span className="font-bold">"Lab Referred"</span>.
                </p>
              </div>
            </div>

            {/* Referral Voucher Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-sans font-bold">Referral Tracking Code:</span>
                <span className="text-sm font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                  {createdReferral?.trackingCode || "CADRAD-2026-89102"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div>
                  <span className="text-stone-400 block">Animal Tag ID:</span>
                  <span className="font-bold text-stone-800">{caseReport.tagId}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Dispatch Lab:</span>
                  <span className="font-bold text-stone-800">{createdReferral?.labName || selectedLab}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Sample Collected:</span>
                  <span className="font-bold text-stone-800">{createdReferral?.sampleType || selectedSampleType}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Dispatched By:</span>
                  <span className="font-bold text-stone-800">{vetName}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Standard PCR Turnaround: 24 - 48 hours</span>
              </div>
              <span className="text-[11px] font-bold text-blue-700">Cold Chain Active</span>
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-100 text-center"
              >
                Back to Case Queue
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep("followup")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Proceed to Follow-up & Treatment Plan →</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FOLLOW-UP & TREATMENT PLAN */}
        {currentStep === "followup" && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
              <span className="font-bold block">
                Lab Diagnostic Results Receipt & Prescription
              </span>
              <span className="text-[11px] text-purple-700">
                Confirm diagnostic outcome based on laboratory findings and assign an authorized treatment plan.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Confirmed Laboratory Diagnosis
              </label>
              <input
                type="text"
                value={confirmedDisease}
                onChange={(e) => setConfirmedDisease(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Diagnostic Assay & Molecular Summary
              </label>
              <textarea
                rows={2}
                value={labResultSummary}
                onChange={(e) => setLabResultSummary(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Prescribed Veterinary Treatment Plan
              </label>
              <textarea
                rows={3}
                value={prescribedTreatment}
                onChange={(e) => setPrescribedTreatment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Update Case Status To:
                </label>
                <select
                  value={followUpStatus}
                  onChange={(e) => setFollowUpStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                >
                  <option value="In Treatment">In Treatment (Active Medication)</option>
                  <option value="Resolved">Resolved / Complete Recovery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Attending Veterinary Surgeon
                </label>
                <input
                  type="text"
                  value={vetName}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-100 font-semibold text-stone-700"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep("confirmation")}
                className="px-4 py-2 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-100"
              >
                ← Back to Referral
              </button>

              <button
                type="button"
                onClick={handleCompleteFollowUp}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Updating..." : "Save Treatment & Update Status"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
