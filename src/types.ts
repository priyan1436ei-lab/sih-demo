export type UserRole = "farmer" | "vet" | "admin";
export type Language = "en" | "hi" | "gu" | "pa" | "mr" | "bn" | "te" | "ta";

export interface UserSession {
  id?: string;
  role: UserRole;
  name: string;
  phoneOrEmail: string;
  phone?: string;
  email?: string;
  token: string;
  district?: string;
  village?: string;
  vciNumber?: string; // Veterinary Council of India registration
  organization?: string;
  consented: boolean;
}

export interface LabReferral {
  id: string;
  caseId: string;
  tagId: string;
  labName: string;
  sampleType: string;
  priority: "Routine" | "Urgent" | "Biohazard Level 3";
  suspectedDisease: string;
  clinicalNotes: string;
  dispatchedAt: string;
  dispatchedBy: string;
  trackingCode: string;
  status: "Dispatched" | "In Transit" | "Testing" | "Result Confirmed";
  resultSummary?: string;
  confirmedDisease?: string;
  confirmedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
}

export interface ImageQualityAssessment {
  isAcceptable: boolean;
  qualityScore: number; // 0 - 100
  issues: string[];
  retakeRecommended: boolean;
  brightnessScore?: number;
  contrastScore?: number;
  sharpnessScore?: number;
  glareScore?: number;
  resolutionScore?: number;
  animalDetected?: boolean;
  feedback?: string;
  metrics?: {
    blurStatus: "Sharp" | "Mild Blur" | "Severe Blur";
    exposureStatus: "Well Exposed" | "Underexposed" | "Overexposed / Glare" | "Dark Coat (Optimized)";
    resolutionStatus: "Optimal (HD)" | "Standard" | "Low Resolution";
    laplacianVariance: number;
    averageLuminance: number;
    glareRatio: number;
    darkRatio: number;
  };
}

export interface DetectedLesion {
  label: string;
  confidence: number;
  location?: string;
}

export interface RiskAnalysis {
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number; // 0 - 100
  suspectedDisease: string;
  alternativeDiseases: string[];
  confidence: number;
  detectedLesions: DetectedLesion[];
  recommendedActions: string[];
  quarantineRequired: boolean;
  contagionRisk: "Low" | "Moderate" | "Severe";
  modelSource: string;
  latencyMs?: number;
  mlModel?: string;
  mlConfidence?: number;
  topPredictions?: Array<{ disease: string; confidence: number }>;
  lowConfidence?: boolean;
  explanation?: string;
  urgencyLevel?: string;
  vetRecommended?: boolean;
  disclaimer?: string;
  riskBreakdown?: {
    baseScore: number;
    symptomScore: number;
    vaccinationScore: number;
    clusterScore: number;
    historyScore: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  category?: "disease" | "first_aid" | "vaccination" | "helpline" | "nutrition" | "general";
  quickActions?: Array<{ label: string; action: string }>;
  suggestedFollowUps?: string[];
  latencyMs?: number;
}

export interface VaccinationRecord {
  name: string;
  date: string;
  nextDueDate: string;
}

export interface MedicalHistoryEvent {
  date: string;
  event: string;
  status: string;
}

export interface AnimalRecord {
  id: string;
  tagId: string; // e.g. IN-28491029 (INAPH tag)
  name: string;
  species: "Cow" | "Buffalo" | "Goat" | "Sheep";
  breed: string;
  ageYears: number;
  gender: "Female" | "Male";
  ownerName: string;
  ownerPhone: string;
  village: string;
  district: string;
  state: string;
  photoUrl?: string;
  vaccinations: VaccinationRecord[];
  history: MedicalHistoryEvent[];
}

export interface CaseReport {
  id: string;
  animalId?: string;
  tagId: string;
  species: string;
  breed: string;
  age: number;
  farmerName: string;
  farmerPhone: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  symptoms: string[];
  bodyTemperatureF: number;
  activityLevel: "Normal" | "Lethargic" | "Recumbent/Down";
  appetite: "Normal" | "Reduced" | "Anorexic";
  lesionType?: string;
  reportedAt: string;
  syncStatus: "synced" | "pending_sync";
  reportingChannel: "app" | "ivr_voice";
  aiAnalysis: RiskAnalysis;
  routingTier?: "known_self_treated" | "known_urgent_escalated" | "unrecognized_escalated";
  nearestVetClinic?: {
    name: string;
    distanceKm: number;
    phone: string;
    doctorName: string;
    etaMinutes: number;
  };
  retrainingFeedback?: {
    isFedBack: boolean;
    confirmedLabel: string;
    submittedAt: string;
    notes?: string;
  };
  dispatchedAt?: string;
  treatedAt?: string;
  vetStatus:
    | "Self-Treated / AI-guided"
    | "Pending Review"
    | "Urgent-Escalated"
    | "Escalated - Unrecognized"
    | "Vet Dispatched"
    | "Vet En Route"
    | "Treated"
    | "Resolved"
    | "Lab Referred"
    | "Diagnosis Confirmed"
    | "Treatment Prescribed";
  vetNotes?: string;
  treatmentPlan?: string;
  assignedVet?: string;
  labReferral?: LabReferral;
  imageQuality?: ImageQualityAssessment;
  requiresHumanVerification?: boolean;
}

export interface OutbreakCluster {
  id: string;
  disease: string;
  riskLevel: "Low" | "Medium" | "High";
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  caseCount: number;
  district: string;
  cases: string[];
  firstReported: string;
  lastReported: string;
  status: "Active Watch" | "Warning" | "High Alert - Quarantined";
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  riskLevel: "Low" | "Medium" | "High";
  targetAudience: "all" | "farmers" | "vets" | "officials";
  district: string;
  timestamp: string;
  read: boolean;
  caseId?: string;
}

import { TRANSLATIONS as EXPANDED_TRANSLATIONS, TranslationDictionary } from "./data/translations";

export { EXPANDED_TRANSLATIONS as TRANSLATIONS, type TranslationDictionary };

export const COMMON_SYMPTOMS = [
  { id: "nodules", en: "Circular skin nodules / lumps", hi: "शरीर पर गांठें / फफोले (लम्पी)", icon: "🔴", severity: "high", category: "Skin & Lesions" },
  { id: "fever", en: "High body fever (>103°F)", hi: "तेज़ बुखार (>103°F)", icon: "🌡️", severity: "high", category: "Systemic" },
  { id: "saliva", en: "Excessive stringy saliva drooling", hi: "मुंह से लार/झाग टपकना (खुरहा)", icon: "💧", severity: "high", category: "Oral & Head" },
  { id: "lameness", en: "Severe lameness / hoof lesions", hi: "लंगड़ाना / खुर में छाले", icon: "🐾", severity: "high", category: "Limbs & Mobility" },
  { id: "appetite_loss", en: "Loss of appetite / off-feed", hi: "चारा न खाना / सुस्त होना", icon: "🌾", severity: "medium", category: "Systemic" },
  { id: "milk_drop", en: "Sudden drop in milk yield", hi: "दूध उत्पादन में अचानक गिरावट", icon: "🥛", severity: "medium", category: "Mammary" },
  { id: "udder_swelling", en: "Swollen / painful udder quarter", hi: "थन में सूजन / दर्द (मैस्टाइटिस)", icon: "🐄", severity: "medium", category: "Mammary" },
  { id: "discharge", en: "Discharge from eyes / nose", hi: "आंख और नाक से स्राव", icon: "👃", severity: "medium", category: "Oral & Head" },
  { id: "diarrhea", en: "Severe diarrhea / loose dung", hi: "दस्त / गोबर पतला होना", icon: "⚠️", severity: "high", category: "Digestive" },
  { id: "rapid_breathing", en: "Labored / rapid breathing", hi: "सांस लेने में तकलीफ़ / घरघराहट", icon: "🫁", severity: "high", category: "Respiratory" },
  { id: "throat_swelling", en: "Swelling in throat / briskets", hi: "गले में सूजन (गलघोंटू / HS)", icon: "⚡", severity: "high", category: "Respiratory" },
  { id: "red_urine", en: "Dark red / coffee urine (Hemoglobinuria)", hi: "लाल / गहरा पेशाब (बबेसिओसिस)", icon: "🩸", severity: "high", category: "Excretory" },
  { id: "crepitating_muscle", en: "Crepitating / gas swelling in muscle", hi: "मांसपेशियों में चरचराहट/गैस सूजन (BQ)", icon: "⚡", severity: "high", category: "Limbs & Mobility" },
  { id: "tarry_blood", en: "Dark tarry bloody discharge from orifices", hi: "मुंह/नाक/गुदा से काला जमा हुआ खून (एंथ्रेक्स)", icon: "☣️", severity: "high", category: "Emergency" },
  { id: "swollen_lymph", en: "Massive prescapular lymph node swelling", hi: "गिल्टियों (लिम्फ नोड) में भारी सूजन (थाइलेरिया)", icon: "🔬", severity: "high", category: "Systemic" },
  { id: "jaundice", en: "Severe yellow jaundice (mucous membranes)", hi: "आंख/मसूड़ों में गहरा पीलिया (एनाप्लाज्मा)", icon: "🟡", severity: "medium", category: "Systemic" },
  { id: "late_abortion", en: "Late-term abortion / retained placenta", hi: "गर्भपात (6-8 माह) / जेर रुकना (ब्रुसेला)", icon: "🤰", severity: "high", category: "Reproductive" },
  { id: "necrotic_mouth", en: "Cheesy necrotic sores in mouth", hi: "मुंह में सफेद छाले व पपड़ी (PPR / बकरी प्लेग)", icon: "🐐", severity: "high", category: "Oral & Head" },
  { id: "coughing_grunting", en: "Violent coughing with grunting dyspnea", hi: "तेज़ खांसी व सांस खींचना (बकरी फेफड़ा रोग/CCPP)", icon: "🫁", severity: "high", category: "Respiratory" },
  { id: "downer_neck", en: "S-shaped neck curvature / downer cow", hi: "गर्दन मुड़ना / प्रसव बाद गिरना (मिल्क फीवर)", icon: "🐄", severity: "high", category: "Metabolic" },
  { id: "bloat_flank", en: "Ballooning left flank distension (Bloat)", hi: "बाईं कोख में गैस का गुब्बारा (अफारा/टिम्पनी)", icon: "🎈", severity: "high", category: "Digestive" },
  { id: "acetone_breath", en: "Sweet acetone odor breath / off grain", hi: "मीठी सांस / दाना न खाना (कीटोसिस)", icon: "🍬", severity: "medium", category: "Metabolic" },
  { id: "blue_tongue", en: "Cyanotic blue tongue / coronitis", hi: "नीली सूजी जीभ / खुर की पट्टी (ब्लू टंग)", icon: "👅", severity: "high", category: "Oral & Head" },
  { id: "swine_purple_skin", en: "Purple blotches on ears & abdomen", hi: "कानों व पेट पर बैंगनी चकत्ते (स्वाइन फीवर)", icon: "🐖", severity: "high", category: "Skin & Lesions" },
  { id: "hoarse_bellowing", en: "Hoarse bellowing / choking / tenesmus", hi: "लगातार असामान्य रंभाना / गले में अटकाव (रेबीज)", icon: "🔊", severity: "high", category: "Nervous" }
];
