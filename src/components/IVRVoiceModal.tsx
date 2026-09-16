import React, { useState } from "react";
import { Language, CaseReport } from "../types";
import { submitVoiceIVRReport } from "../services/api";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle
} from "lucide-react";

interface IVRVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onCaseCreated: (newCase: CaseReport) => void;
}

export const IVRVoiceModal: React.FC<IVRVoiceModalProps> = ({
  isOpen,
  onClose,
  lang,
  onCaseCreated
}) => {
  const [callerName, setCallerName] = useState<string>("Babulal Choudhary");
  const [callerPhone, setCallerPhone] = useState<string>("+91 94140 88219");
  const [district, setDistrict] = useState<string>("Anand");
  const [village, setVillage] = useState<string>("Mogri");
  const [transcript, setTranscript] = useState<string>(
    "मेरी गिर गाय को 2 दिन से 104 डिग्री तेज बुखार है और गर्दन तथा शरीर पर गोल गांठे (nodules) निकल आई हैं, चारा नहीं खा रही।"
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<boolean>(true);
  const [resultCase, setResultCase] = useState<CaseReport | null>(null);

  if (!isOpen) return null;

  const quickTranscripts = [
    {
      title: "LSD Scenario (Hindi)",
      text: "मेरी गिर गाय को 2 दिन से 104 डिग्री तेज बुखार है और गर्दन तथा शरीर पर गोल गांठे (nodules) निकल आई हैं, चारा नहीं खा रही।"
    },
    {
      title: "FMD Scenario (Hindi)",
      text: "मेरी मुर्राह भैंस के मुंह से झाग और लगातार लार टपक रही है और पैर में खुर के छाले हैं, वह लंगड़ा रही है।"
    },
    {
      title: "PPR Goat Scenario (Hindi)",
      text: "मेरी सिरोही बकरी को बहुत तेज बुखार है, नाक से पीला मवाद बह रहा है और दस्त लग गए हैं।"
    },
    {
      title: "Bovine Mastitis (English)",
      text: "My cow has severely swollen left hind teat with clot flakes in milk, not letting milkman touch the udder."
    }
  ];

  const handleProcessVoiceCall = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setResultCase(null);

    try {
      const created = await submitVoiceIVRReport({
        transcript,
        callerName,
        callerPhone,
        district,
        village
      });

      if (created) {
        setResultCase(created);
        onCaseCreated(created);
      }
    } catch (err) {
      console.error("IVR report error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 text-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-700 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-4 py-3 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">PashuRaksha IVR Voice Line</h3>
              <p className="text-[11px] text-emerald-200">
                Toll-Free 1800-PASHRK (1800-727-475)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* IVR Audio Simulation Banner */}
          <div className="p-3 rounded-xl bg-stone-800 border border-stone-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-amber-200">
                Interactive Voice Response (IVR) Agent
              </p>
              <p className="text-stone-400 text-[11px] mt-0.5">
                "नमस्कार! पशुरक्षा किसान हेल्पलाइन। अपने पशु के लक्षण और स्थान बताएं..."
              </p>
            </div>
          </div>

          {/* Caller Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Farmer Caller Name
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Caller Phone Number
              </label>
              <input
                type="text"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Village
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Voice Speech Transcript */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulated Voice Transcript (Hindi / Vernacular Speech)</span>
              </label>
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-emerald-500"
              placeholder="Speak or type description of sick animal..."
            />
          </div>

          {/* Quick Voice Scenarios */}
          <div>
            <span className="text-[11px] text-stone-400 block mb-1.5">
              Quick Audio Scenarios (Click to test NLP extraction):
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {quickTranscripts.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTranscript(q.text)}
                  className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700/60 text-left truncate text-stone-200 font-medium"
                >
                  🎙️ {q.title}
                </button>
              ))}
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcessVoiceCall}
            disabled={isProcessing || !transcript.trim()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Transcribing & Scoring NLP Case...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Process IVR Voice Call to Case Report</span>
              </>
            )}
          </button>

          {/* Success Outcome */}
          {resultCase && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Voice Intake Converted to Clinical Case
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-800 text-white text-[10px] font-bold">
                  {resultCase.id}
                </span>
              </div>
              <p className="text-stone-300">
                <strong className="text-white">Suspected Disease:</strong>{" "}
                {resultCase.aiAnalysis.suspectedDisease} (Risk Score:{" "}
                {resultCase.aiAnalysis.riskScore}%)
              </p>
              <p className="text-stone-400 text-[11px]">
                Reported by {resultCase.farmerName} in {resultCase.village}, {resultCase.district}.
                Added to live Veterinarian queue and geospatial outbreak cluster engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
