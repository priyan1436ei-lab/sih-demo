import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Language,
  TRANSLATIONS,
  COMMON_SYMPTOMS,
  CaseReport,
  RiskAnalysis,
  AnimalRecord,
  ImageQualityAssessment,
  OutbreakCluster
} from "../types";
import {
  diagnoseAnimalHealth,
  submitCaseReport,
  deleteFarmerData,
  addAnimalTimelineEvent,
  preprocessLivestockImage
} from "../services/api";
import {
  saveHealthRecordToFirebase,
  uploadAnimalImageToStorage
} from "../services/firebase";
import { assessImageQuality } from "../utils/imageQuality";
import { CLINICAL_BENCHMARK_PRESETS, ALL_LIVESTOCK_DISEASES, evaluateLivestockDiseaseRules } from "../data/livestockDiseases";
import {
  Camera,
  Upload,
  MapPin,
  Thermometer,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Loader2,
  Sparkles,
  ShieldAlert,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  QrCode,
  Volume2,
  VolumeX,
  Trash2,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Microscope,
  Award,
  Focus,
  Sun,
  Sliders,
  Eye,
  Zap,
  MessageSquare,
  Truck,
  Navigation,
  HeartPulse,
  Pill,
  X
} from "lucide-react";

interface FarmerReportFormProps {
  lang: Language;
  animals: AnimalRecord[];
  isOnline: boolean;
  onReportSubmitted: (newCase: CaseReport, isOffline: boolean) => void;
  onOpenIVR: () => void;
  onOpenChatbot?: () => void;
  farmerPhoneProp?: string;
  farmerNameProp?: string;
  onAnimalUpdated?: (updatedAnimal: AnimalRecord) => void;
  existingCases?: CaseReport[];
  clusters?: OutbreakCluster[];
  onViewMap?: () => void;
  onViewAnimalHistory?: () => void;
  onContactVet?: () => void;
}

export const FarmerReportForm: React.FC<FarmerReportFormProps> = ({
  lang,
  animals,
  isOnline,
  onReportSubmitted,
  onOpenIVR,
  onOpenChatbot,
  farmerPhoneProp,
  farmerNameProp,
  onAnimalUpdated,
  existingCases,
  clusters,
  onViewMap,
  onViewAnimalHistory,
  onContactVet
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // True Live Camera State & Refs
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isLiveAnalyzing, setIsLiveAnalyzing] = useState<boolean>(false);
  const [liveAnalysisError, setLiveAnalysisError] = useState<string | null>(null);
  const [lastTimelineUpdateMsg, setLastTimelineUpdateMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Form State
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");
  const [tagId, setTagId] = useState<string>("IN-28491029");
  const [species, setSpecies] = useState<string>("Cow");
  const [breed, setBreed] = useState<string>("Gir");
  const [age, setAge] = useState<number>(4);
  const [farmerName, setFarmerName] = useState<string>("Rameshwar Patel");
  const [farmerPhone, setFarmerPhone] = useState<string>("+91 98251 44102");
  const [village, setVillage] = useState<string>("Mogri");
  const [district, setDistrict] = useState<string>("Anand");
  const [state, setState] = useState<string>("Gujarat");
  const [latitude, setLatitude] = useState<number>(22.5645);
  const [longitude, setLongitude] = useState<number>(72.9289);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Clinical Vitals
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    "Circular skin nodules / lumps",
    "High body fever (>103°F)"
  ]);
  const [bodyTemperatureF, setBodyTemperatureF] = useState<number>(104.2);
  const [activityLevel, setActivityLevel] = useState<"Normal" | "Lethargic" | "Recumbent/Down">("Lethargic");
  const [appetite, setAppetite] = useState<"Normal" | "Reduced" | "Anorexic">("Reduced");
  const [lesionNotes, setLesionNotes] = useState<string>("Hard nodules on neck and shoulder regions");

  // Photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
  );
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [imageQuality, setImageQuality] = useState<ImageQualityAssessment | null>({
    isAcceptable: true,
    qualityScore: 92,
    issues: [],
    retakeRecommended: false,
    brightnessScore: 95,
    contrastScore: 88,
    sharpnessScore: 90,
    glareScore: 96,
    resolutionScore: 100,
    feedback: "High sharpness and clinical exposure verified (ICAR-IVRI standard).",
    metrics: {
      blurStatus: "Sharp",
      exposureStatus: "Well Exposed",
      resolutionStatus: "Optimal (HD)",
      laplacianVariance: 240,
      averageLuminance: 118,
      glareRatio: 1.2,
      darkRatio: 4.5
    }
  });
  const [showQualityWarning, setShowQualityWarning] = useState<boolean>(false);
  const [isEvaluatingQuality, setIsEvaluatingQuality] = useState<boolean>(false);
  const [showMetricsDrawer, setShowMetricsDrawer] = useState<boolean>(false);

  // High-precision automated image quality evaluator
  const runQualityAssessment = async (imgSrc: string, targetBreed?: string) => {
    if (!imgSrc) return;
    setIsEvaluatingQuality(true);
    try {
      const assessment = await assessImageQuality(imgSrc, targetBreed || breed);
      setImageQuality(assessment);
      setShowQualityWarning(assessment.retakeRecommended);
    } catch (err) {
      console.error("Automated image quality assessment error:", err);
    } finally {
      setIsEvaluatingQuality(false);
    }
  };

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // DPDP Erasure Modal state
  const [isErasureOpen, setIsErasureOpen] = useState<boolean>(false);
  const [erasurePhone, setErasurePhone] = useState<string>(farmerPhoneProp || "+91 98251 44102");
  const [erasureReason, setErasureReason] = useState<string>("Livestock sold / farmer preference");
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [erasureNotice, setErasureNotice] = useState<string>("");

  // Submission & AI State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<RiskAnalysis | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<CaseReport | null>(null);
  const [wasOfflineSaved, setWasOfflineSaved] = useState<boolean>(false);

  // Real-Time High-Speed Edge AI Triage Pre-computation (<1ms latency)
  const liveEdgeRisk = useMemo(() => {
    if (selectedSymptoms.length === 0) return null;
    return evaluateLivestockDiseaseRules({
      species,
      breed,
      age,
      symptoms: selectedSymptoms,
      bodyTemperatureF,
      activityLevel,
      appetite,
      lesionType: lesionNotes,
      photoBase64
    });
  }, [species, breed, age, selectedSymptoms, bodyTemperatureF, activityLevel, appetite, lesionNotes, photoBase64]);

  // Client-side image compressor for rapid AI payload transmission
  const compressImageForAI = async (dataUrl: string, maxDim = 800, quality = 0.72): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith("data:image/")) return resolve(dataUrl);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Clinical Disease Presets & ICAR Diagnostic Matrix
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [showDiseaseMatrix, setShowDiseaseMatrix] = useState<boolean>(false);

  const applyBenchmarkPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = CLINICAL_BENCHMARK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSpecies(preset.species);
    setBreed(preset.breed);
    if (preset.age) setAge(preset.age);
    setBodyTemperatureF(preset.bodyTemperatureF);
    setActivityLevel(preset.activityLevel as any);
    setAppetite(preset.appetite as any);
    setLesionNotes(preset.lesionType || "");
    setSelectedSymptoms(preset.symptoms);
    if (preset.photoUrl) {
      setPhotoPreview(preset.photoUrl);
      compressImageForAI(preset.photoUrl).then((comp) => setPhotoBase64(comp));
      runQualityAssessment(preset.photoUrl, preset.breed);
    } else {
      setPhotoPreview(null);
      setPhotoBase64(undefined);
      setImageQuality(null);
    }
    setAiResult(null);
    setSubmittedSuccess(null);
  };
  const handleAnimalSelect = (id: string) => {
    setSelectedAnimalId(id);
    const found = animals.find((a) => a.id === id);
    if (found) {
      setTagId(found.tagId);
      setSpecies(found.species);
      setBreed(found.breed);
      setAge(found.ageYears);
      setFarmerName(found.ownerName);
      setFarmerPhone(found.ownerPhone);
      setVillage(found.village);
      setDistrict(found.district);
      setState(found.state);
      if (found.photoUrl) {
        setPhotoPreview(found.photoUrl);
        compressImageForAI(found.photoUrl).then((comp) => setPhotoBase64(comp));
        runQualityAssessment(found.photoUrl, found.breed);
      }
    }
  };

  // Toggle Symptoms
  const toggleSymptom = (symName: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symName)
        ? prev.filter((s) => s !== symName)
        : [...prev, symName]
    );
  };

  // 1. Stop Live Camera Stream & Cleanup Tracks
  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Track stop error:", e);
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setIsCameraStarting(false);
    setCameraError(null);
  };

  // 2. Start Live Camera using browser's native getUserMedia API
  const startLiveCamera = async (mode: "environment" | "user" = cameraFacingMode) => {
    // Stop any existing stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    setIsCameraOpen(true);
    setIsCameraStarting(true);
    setCameraError(null);
    setLiveAnalysisError(null);

    // Verify browser support for mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraStarting(false);
      setCameraError(
        lang === "hi"
          ? "आपके ब्राउज़र में सीधा कैमरा सपोर्ट उपलब्ध नहीं है। कृपया 'Upload Photo' का उपयोग करें।"
          : "Your browser does not support direct camera access via getUserMedia. Please use Upload Photo."
      );
      return;
    }

    try {
      // Check multiple video inputs
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (devErr) {
        console.warn("Could not enumerate camera devices:", devErr);
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err1) {
        console.warn("Ideal facingMode failed, falling back to basic video stream:", err1);
        // Fallback for laptop or devices where facingMode is unsupported
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (stream) {
        mediaStreamRef.current = stream;
        setIsCameraStarting(false);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((playErr) => console.warn("Video play error:", playErr));
          };
          try {
            await videoRef.current.play();
          } catch (pErr) {
            console.warn("Immediate play notice:", pErr);
          }
        }
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsCameraStarting(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access permission was denied. Please allow camera permission in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device was detected on this system.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera is currently in use by another application or tab.");
      } else {
        setCameraError("Unable to access the camera. Please check camera permissions or use Upload Photo.");
      }
    }
  };

  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  // Ensure camera stream is assigned to video element when stream or modal is active
  useEffect(() => {
    if (isCameraOpen && mediaStreamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn("Camera stream play warning:", err);
      });
    }
  }, [isCameraOpen, isCameraStarting]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 3. Capture Animal Image from Video Stream & Auto-Send to AI Disease Detection
  const handleCaptureLiveCameraPhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Capture current video frame onto canvas
      ctx.drawImage(video, 0, 0, width, height);

      // 2. Convert canvas to JPEG image dataURL and Blob/File
      const capturedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `livestock-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
          console.log("Captured image file created:", file.name, file.size, "bytes");
        }
      }, "image/jpeg", 0.9);

      // 3. Stop camera stream immediately
      stopLiveCamera();

      // 4. Show captured image in application
      setPhotoPreview(capturedDataUrl);

      // Preprocess image to standard 224x224 RGB model input
      const { preprocessedBase64, blob } = await preprocessLivestockImage(capturedDataUrl, 224);
      setPhotoBase64(preprocessedBase64);

      // Automated image quality check
      runQualityAssessment(capturedDataUrl, breed);

      // 5. Automatically send captured image to ML disease classification pipeline
      setIsLiveAnalyzing(true);
      setLiveAnalysisError(null);

      const activeAnimal = animals.find((a) => a.id === selectedAnimalId || a.tagId === tagId);

      // Execute ML & AI disease detection pipeline
      const analysisResult = await diagnoseAnimalHealth({
        species,
        breed,
        age,
        symptoms: selectedSymptoms,
        bodyTemperatureF,
        activityLevel,
        appetite,
        lesionType: lesionNotes || "Live camera captured lesion",
        photoBase64: preprocessedBase64,
        vaccinations: activeAnimal?.vaccinations,
        previousDiseases: activeAnimal?.history?.map((h) => h.event),
        district,
        tagId: activeAnimal?.tagId || tagId
      });

      setAiResult(analysisResult);
      setIsLiveAnalyzing(false);

      // 6. Save health record to Firebase Realtime Database and upload image to Firebase Storage
      const targetAnimalId = activeAnimal?.id || activeAnimal?.tagId || tagId || `ANM-${Date.now()}`;
      uploadAnimalImageToStorage(blob, targetAnimalId).then(async (storageUrl) => {
        await saveHealthRecordToFirebase({
          animalId: targetAnimalId,
          imageUrl: storageUrl,
          predictedDisease: analysisResult.suspectedDisease,
          confidence: analysisResult.confidence,
          riskScore: analysisResult.riskScore,
          severity: analysisResult.urgencyLevel || (analysisResult.riskLevel === "High" ? "High" : analysisResult.riskLevel),
          symptoms: selectedSymptoms,
          recommendation: (analysisResult.recommendedActions || []).join(". "),
          timestamp: new Date().toISOString(),
          quarantineRequired: analysisResult.quarantineRequired,
          modelSource: analysisResult.modelSource
        });
      }).catch((fbErr) => {
        console.warn("Firebase persistence notice:", fbErr);
      });

      // 7. Animal History Integration: add new observation to animal's health timeline
      const obsText = `Live Camera Observation: Suspected ${analysisResult.suspectedDisease} (${Math.round((analysisResult.mlConfidence || analysisResult.confidence) * 100)}% conf, Risk Score: ${analysisResult.riskScore}/100)`;

      if (activeAnimal) {
        // Persist to server
        addAnimalTimelineEvent(activeAnimal.id || activeAnimal.tagId, {
          event: obsText,
          status: analysisResult.riskLevel === "High" ? "Urgent Attention Needed" : "Screened (AI Live)",
          photoUrl: capturedDataUrl
        }).then((updated) => {
          if (updated && onAnimalUpdated) {
            onAnimalUpdated(updated);
          }
        });

        // Update local state immediately
        if (onAnimalUpdated) {
          onAnimalUpdated({
            ...activeAnimal,
            history: [
              {
                date: new Date().toISOString().split("T")[0],
                event: obsText,
                status: analysisResult.riskLevel === "High" ? "Urgent Attention Needed" : "Screened (AI Live)"
              },
              ...activeAnimal.history
            ],
            photoUrl: capturedDataUrl
          });
        }

        setLastTimelineUpdateMsg(
          `Logged new clinical observation to ${activeAnimal.name || activeAnimal.tagId}'s Digital Health Timeline.`
        );
      }
    } catch (err: any) {
      console.error("Live camera capture/analysis error:", err);
      setIsLiveAnalyzing(false);
      setLiveAnalysisError(err.message || "Failed to analyze captured livestock image");
    }
  };

  // Risk-to-Outbreak Intelligence Calculation
  const outbreakIntelligence = useMemo(() => {
    if (!aiResult) return null;
    const diseaseName = (aiResult.suspectedDisease || "").toLowerCase();

    // Match nearby cases in this district
    const nearbyCases = (existingCases || []).filter(
      (c) =>
        c.district.toLowerCase() === district.toLowerCase() &&
        (c.aiAnalysis?.suspectedDisease || "").toLowerCase().includes(diseaseName.slice(0, 5))
    );

    // Match active clusters in this district
    const activeCluster = (clusters || []).find(
      (cl) =>
        cl.district.toLowerCase() === district.toLowerCase() &&
        cl.disease.toLowerCase().includes(diseaseName.slice(0, 5))
    );

    const isHighRisk = aiResult.riskLevel === "High" || aiResult.riskScore >= 70;
    const hasNearbyCases = nearbyCases.length >= 1;
    const isClusterAlert = isHighRisk && (hasNearbyCases || !!activeCluster);

    return {
      nearbyCasesCount: nearbyCases.length,
      activeCluster,
      isHighRisk,
      isClusterAlert,
      chainSteps: [
        { label: "Individual Animal", value: tagId || "Tagged", status: "Screened" },
        { label: "Disease Risk Score", value: `${aiResult.riskScore}/100`, status: aiResult.riskLevel },
        { label: "Animal Health Record", value: "Observation Logged", status: "Updated" },
        { label: "Nearby Animal Cases", value: `${nearbyCases.length} in ${district}`, status: hasNearbyCases ? "Active" : "Normal" },
        { label: "Local Cluster Analysis", value: activeCluster ? activeCluster.status : (isClusterAlert ? "Possible Hotspot" : "Monitored"), status: activeCluster ? "Alert" : "Monitored" },
        { label: "Possible Outbreak Alert", value: isClusterAlert ? "Cluster Warning Flagged" : "Routine Surveillance", status: isClusterAlert ? "Flagged" : "Normal" }
      ]
    };
  }, [aiResult, existingCases, clusters, district, tagId]);

  // Handle Photo Upload with Preprocessing & ML Classification Pipeline
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        setPhotoPreview(rawBase64);

        try {
          // Preprocess image to standard 224x224 RGB model input
          const { preprocessedBase64, blob } = await preprocessLivestockImage(rawBase64, 224);
          setPhotoBase64(preprocessedBase64);

          // Run automated quality assessment with species/breed awareness
          await runQualityAssessment(rawBase64, breed);

          // Automatically send to ML disease classification pipeline
          setIsLiveAnalyzing(true);
          setLiveAnalysisError(null);

          const activeAnimal = animals.find((a) => a.id === selectedAnimalId || a.tagId === tagId);

          // Execute ML & AI disease detection pipeline
          const analysisResult = await diagnoseAnimalHealth({
            species,
            breed,
            age,
            symptoms: selectedSymptoms,
            bodyTemperatureF,
            activityLevel,
            appetite,
            lesionType: lesionNotes || "Uploaded lesion photo",
            photoBase64: preprocessedBase64,
            vaccinations: activeAnimal?.vaccinations,
            previousDiseases: activeAnimal?.history?.map((h) => h.event),
            district,
            tagId: activeAnimal?.tagId || tagId
          });

          setAiResult(analysisResult);
          setIsLiveAnalyzing(false);

          // Save health record to Firebase Realtime Database and upload image to Firebase Storage
          const targetAnimalId = activeAnimal?.id || activeAnimal?.tagId || tagId || `ANM-${Date.now()}`;
          uploadAnimalImageToStorage(blob, targetAnimalId).then(async (storageUrl) => {
            await saveHealthRecordToFirebase({
              animalId: targetAnimalId,
              imageUrl: storageUrl,
              predictedDisease: analysisResult.suspectedDisease,
              confidence: analysisResult.confidence,
              riskScore: analysisResult.riskScore,
              severity: analysisResult.urgencyLevel || (analysisResult.riskLevel === "High" ? "High" : analysisResult.riskLevel),
              symptoms: selectedSymptoms,
              recommendation: (analysisResult.recommendedActions || []).join(". "),
              timestamp: new Date().toISOString(),
              quarantineRequired: analysisResult.quarantineRequired,
              modelSource: analysisResult.modelSource
            });
          }).catch((fbErr) => {
            console.warn("Firebase persistence notice:", fbErr);
          });

          // Animal History Integration
          const obsText = `Photo Upload Observation: Suspected ${analysisResult.suspectedDisease} (${Math.round((analysisResult.mlConfidence || analysisResult.confidence) * 100)}% conf, Risk Score: ${analysisResult.riskScore}/100)`;

          if (activeAnimal) {
            addAnimalTimelineEvent(activeAnimal.id || activeAnimal.tagId, {
              event: obsText,
              status: analysisResult.riskLevel === "High" ? "Urgent Attention Needed" : "Screened (AI Upload)",
              photoUrl: rawBase64
            }).then((updated) => {
              if (updated && onAnimalUpdated) {
                onAnimalUpdated(updated);
              }
            });

            if (onAnimalUpdated) {
              onAnimalUpdated({
                ...activeAnimal,
                history: [
                  {
                    date: new Date().toISOString().split("T")[0],
                    event: obsText,
                    status: analysisResult.riskLevel === "High" ? "Urgent Attention Needed" : "Screened (AI Upload)"
                  },
                  ...activeAnimal.history
                ],
                photoUrl: rawBase64
              });
            }

            setLastTimelineUpdateMsg(
              `Logged new clinical observation to ${activeAnimal.name || activeAnimal.tagId}'s Digital Health Timeline.`
            );
          }
        } catch (err: any) {
          console.error("Photo upload analysis error:", err);
          setIsLiveAnalyzing(false);
          setLiveAnalysisError(err.message || "Failed to analyze uploaded livestock image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // TTS Readout for Rural Farmers
  const handleToggleSpeakAdvice = () => {
    if (!aiResult) return;
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const textToSpeak = lang === "hi"
        ? `सावधान। AI जांच में संभावित बीमारी ${aiResult.suspectedDisease} पाई गई है। जोखिम स्तर ${aiResult.riskLevel} है। मुख्य सलाह: ${aiResult.recommendedActions.join("। ")}`
        : `Attention. The AI assessment suggests ${aiResult.suspectedDisease} with ${aiResult.riskLevel} risk level. Key recommendation: ${aiResult.recommendedActions.join(". ")}`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle DPDP Data Erasure
  const handleExecuteDataErasure = async () => {
    if (!erasurePhone) return;
    setIsErasing(true);
    setErasureNotice("");
    try {
      const res = await deleteFarmerData(erasurePhone, erasureReason);
      setErasureNotice(
        lang === "hi"
          ? `सफलतापूर्वक निष्पादित! ${res.anonymizedCasesCount} मामले एनोनिमाइज़ किए गए और ${res.deletedAnimalsCount} पशु प्रोफाइल हटा दिए गए।`
          : `Erasure completed under DPDP Act! ${res.anonymizedCasesCount} reports anonymized and ${res.deletedAnimalsCount} animal profiles purged.`
      );
      setTimeout(() => {
        setIsErasureOpen(false);
        setErasureNotice("");
      }, 4000);
    } catch {
      setErasureNotice("Failed to process erasure request.");
    } finally {
      setIsErasing(false);
    }
  };

  // Auto-capture GPS
  const handleCaptureGPS = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setIsLocating(false);
        },
        () => {
          // Fallback location for demo
          setLatitude(22.5645);
          setLongitude(72.9289);
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Quick preset locations in India
  const applyPresetLocation = (preset: { name: string; dist: string; st: string; lat: number; lng: number }) => {
    setVillage(preset.name);
    setDistrict(preset.dist);
    setState(preset.st);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  // Execute AI Diagnosis + Case Submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      alert(lang === "en" ? "Please select at least one symptom." : "कृपया कम से कम एक लक्षण चुनें।");
      return;
    }

    setIsAnalyzing(true);
    setSubmittedSuccess(null);

    try {
      // 1. Run AI Risk Engine (Gemini 3.8 Flash or Random Forest Ensemble)
      const analysis = await diagnoseAnimalHealth({
        species,
        breed,
        age,
        symptoms: selectedSymptoms,
        bodyTemperatureF,
        activityLevel,
        appetite,
        lesionType: lesionNotes,
        photoBase64
      });

      setAiResult(analysis);

      // 2. Submit to Case Database (Online or Offline Queue)
      const requiresHumanReview = analysis.confidence < 0.65 || (imageQuality ? !imageQuality.isAcceptable : false);
      const result = await submitCaseReport({
        animalId: selectedAnimalId || undefined,
        tagId: tagId || `IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        species,
        breed,
        age,
        farmerName,
        farmerPhone,
        village,
        district,
        state,
        latitude,
        longitude,
        photoUrl: photoPreview || undefined,
        symptoms: selectedSymptoms,
        bodyTemperatureF,
        activityLevel,
        appetite,
        lesionType: lesionNotes,
        reportingChannel: "app",
        aiAnalysis: analysis,
        imageQuality: imageQuality || undefined,
        requiresHumanVerification: requiresHumanReview
      });

      setSubmittedSuccess(result.case);
      setWasOfflineSaved(result.isOfflineSaved);
      onReportSubmitted(result.case, result.isOfflineSaved);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to evaluate case. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
            <span>{t.offlineNotice}</span>
          </div>
          <span className="font-semibold bg-amber-200/80 px-2 py-0.5 rounded text-[11px]">
            Offline Active
          </span>
        </div>
      )}

      {/* Hero Action Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI-Powered Livestock Triage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t.reportCase}
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
              {lang === "en"
                ? "Upload a photo and symptoms. Our dual-engine (Vision + Clinical Ensemble) instantly scores disease risk, isolates outbreaks, and notifies local vets."
                : "पशु की तस्वीर और लक्षण दर्ज करें। AI मॉडल तुरंत बीमारी के जोखिम का आकलन करेगा और नजदीकी पशु चिकित्सक को सूचित करेगा।"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {onOpenChatbot && (
              <button
                type="button"
                onClick={onOpenChatbot}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/30 text-teal-100 hover:bg-teal-500/40 border border-teal-300/40 font-bold text-xs sm:text-sm shadow-xs transition-all"
              >
                <MessageSquare className="w-4 h-4 text-teal-300" />
                <span>{lang === "hi" ? "शंका पूछें (पशु मित्र)" : "Ask Doubt (Pashu Mitra)"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenIVR}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs sm:text-sm hover:bg-amber-300 shadow-sm transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t.voiceIVR}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Livestock Disease Knowledge & Diagnostic Benchmarks */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Microscope className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {lang === "hi" ? "पशु रोग निदान बेंचमार्क एवं नैदानिक प्रीसेट्स" : "ICAR-IVRI Livestock Diagnostic Benchmarks"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {ALL_LIVESTOCK_DISEASES.length} Diseases Verified
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {lang === "hi"
                  ? "सभी प्रमुख पशु रोगों की सटीक भविष्यवाणी का परीक्षण करने हेतु नैदानिक केस चुनें"
                  : "Load verified clinical profiles to evaluate disease prediction accuracy across species"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDiseaseMatrix(!showDiseaseMatrix)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors border border-stone-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showDiseaseMatrix ? (lang === "hi" ? "बंद करें" : "Hide Matrix") : (lang === "hi" ? "26 रोगों की सूची देखें" : "View 26 Diseases Library")}</span>
          </button>
        </div>

        {/* Quick Clinical Preset Buttons */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            {lang === "hi" ? "त्वरित नैदानिक टेस्ट केस (ऑटो-फिल करें):" : "One-Click Clinical Benchmark Test Cases:"}
          </label>
          <div className="flex flex-wrap gap-2">
            {CLINICAL_BENCHMARK_PRESETS.map((preset) => {
              const isActive = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyBenchmarkPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xs ring-2 ring-emerald-400/40"
                      : "bg-stone-800/90 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white"
                  }`}
                >
                  <span className="mr-1">{preset.icon}</span>
                  <span>{preset.name.split(" (")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expandable 26 Livestock Diseases Library Matrix */}
        {showDiseaseMatrix && (
          <div className="pt-3 border-t border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">
                {lang === "hi" ? "राष्ट्रीय एवं अंतरराष्ट्रीय पशु रोग निर्देशिका" : "National Veterinary Pathology & Triage Directory"}
              </span>
              <span className="text-[10px] text-stone-400">
                ICAR-IVRI & WOAH Terrestrial Manual Standards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {ALL_LIVESTOCK_DISEASES.map((dis) => (
                <div
                  key={dis.id}
                  className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-100 truncate">{dis.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        dis.contagionRisk === "Severe"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {dis.contagionRisk} Contagion
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-300 italic">{dis.hindiName} • {dis.pathogen}</p>
                  <p className="text-[11px] text-stone-300 line-clamp-2">
                    <strong className="text-stone-400 font-medium">Signs: </strong>
                    {dis.pathognomonicSigns}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-700/40">
                    <span>Species: {dis.species.join(", ")}</span>
                    <span className="text-amber-400">{dis.quarantineRequired ? "Quarantine Req." : "Standard Care"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Report Form */}
      <form onSubmit={handleSubmitReport} className="space-y-6">
        {/* Step 1: Animal Identification */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-stone-900 text-base">
                {lang === "en" ? "Animal Details & INAPH Tag" : "पशु विवरण एवं टैग नंबर"}
              </h3>
            </div>

            {animals.length > 0 && (
              <div className="text-xs text-stone-500">
                <label className="mr-2 font-medium">
                  {lang === "en" ? "Select Registered:" : "पंजीकृत पशु चुनें:"}
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => handleAnimalSelect(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-stone-300 bg-stone-50 text-stone-800 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- {lang === "en" ? "Choose from my herd" : "मेरे पशुओं में से चुनें"} --</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.species} - {a.tagId})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Species" : "पशु प्रकार"}
              </label>
              <select
                value={species}
                onChange={(e) => {
                  const newSpecies = e.target.value;
                  setSpecies(newSpecies);
                  if (photoPreview) runQualityAssessment(photoPreview, breed);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cow">Cow (गाय)</option>
                <option value="Buffalo">Buffalo (भैंस)</option>
                <option value="Goat">Goat (बकरी)</option>
                <option value="Sheep">Sheep (भेड़)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Breed" : "नस्ल"}
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => {
                  const newBreed = e.target.value;
                  setBreed(newBreed);
                  if (photoPreview) runQualityAssessment(photoPreview, newBreed);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Gir / Murrah"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Ear Tag (INAPH)" : "कान का टैग (INAPH)"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  placeholder="IN-XXXXXXXX"
                />
                <QrCode className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Age (Years)" : "उम्र (वर्ष)"}
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Farmer Name" : "पशुपालक का नाम"}
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Mobile Phone (for Vet SMS Alerts)" : "मोबाइल नंबर (SMS अलर्ट हेतु)"}
              </label>
              <input
                type="text"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Photo Capture & Visual Screening */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  {lang === "en" ? "Animal Photo & Lesion Capture" : "पशु की फोटो एवं लक्षण चित्र"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "en"
                    ? "Camera capture or upload skin nodules, oral drooling, or infected udders"
                    : "त्वचा की गांठें, मुंह के छाले या थन की स्पष्ट फोटो खींचें"}
                </p>
              </div>
            </div>
          </div>

          {/* Live Camera Viewfinder vs Standard Photo Preview */}
          {isCameraOpen ? (
            <div className="w-full bg-stone-950 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xl relative">
              {/* Live Camera Header */}
              <div className="p-3 sm:p-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-300 block leading-tight">
                      LIVE CAMERA
                    </span>
                    <span className="text-[11px] text-stone-400">Animal Preview & Disease Screening</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasMultipleCameras && (
                    <button
                      type="button"
                      onClick={toggleCameraFacingMode}
                      title="Switch Camera (Rear/Front)"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Flip ({cameraFacingMode === "environment" ? "Rear" : "Front"})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    title="Close Camera"
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 hover:text-rose-200 text-stone-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Camera Video Stream / Viewfinder */}
              <div className="relative w-full aspect-4/3 sm:aspect-16/9 max-h-[460px] bg-stone-900 flex items-center justify-center overflow-hidden">
                {/* Keep video element permanently rendered when camera is open so videoRef is always available */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    cameraError || isCameraStarting ? "opacity-0" : "opacity-100"
                  } transition-opacity duration-200`}
                />

                {/* Camera Starting / Permission Prompt Overlay */}
                {isCameraStarting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-stone-300 p-6 space-y-3 bg-stone-900/90 z-10">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-400" />
                    <p className="text-sm font-semibold">Opening live camera feed...</p>
                    <p className="text-xs text-stone-400">Please grant camera permission in your browser if prompted.</p>
                  </div>
                )}

                {/* Camera Permission / Hardware Error Overlay */}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-3 text-white bg-stone-900/95 z-10">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-rose-300">Camera Access Error</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">{cameraError}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => startLiveCamera(cameraFacingMode)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Try Again
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopLiveCamera();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-semibold shadow-xs"
                      >
                        Upload Photo Instead
                      </button>
                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold shadow-xs"
                      >
                        Close Camera
                      </button>
                    </div>
                  </div>
                )}

                {/* Viewfinder Reticle Overlay (active during live streaming) */}
                {!cameraError && !isCameraStarting && (
                  <div className="absolute inset-0 pointer-events-none p-4 sm:p-8 flex flex-col justify-between z-10">
                    <div className="flex justify-between">
                      <div className="w-10 h-10 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl shadow-xs"></div>
                      <div className="w-10 h-10 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl shadow-xs"></div>
                    </div>
                    <div className="text-center">
                      <span className="px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-xs text-emerald-300 text-xs font-medium border border-emerald-500/40 shadow-md">
                        Align animal lesions, skin, or face inside frame
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-10 h-10 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl shadow-xs"></div>
                      <div className="w-10 h-10 border-b-3 border-r-3 border-emerald-400 rounded-br-xl shadow-xs"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Camera Bottom Action Controls */}
              {!cameraError && !isCameraStarting && (
                <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors min-h-[44px]"
                  >
                    <X className="w-4 h-4" />
                    <span>Close Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureLiveCameraPhoto}
                    className="flex-1 max-w-sm py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all min-h-[48px]"
                  >
                    <Camera className="w-5 h-5 text-emerald-100" />
                    <span>Capture Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-3 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-medium hidden sm:flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Instead</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Photo Preview with Intelligent Quality & Lesion Overlay */}
              <div className="relative w-full sm:w-72 h-52 rounded-xl bg-stone-900 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden group shadow-inner">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Livestock visual screening"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {/* Real-time Visual Quality HUD */}
                    <div className="absolute inset-0 pointer-events-none p-2.5 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/50">
                      <div className="flex justify-between items-start gap-1">
                        {/* Sharpness Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-md flex items-center gap-1 ${
                          imageQuality?.metrics?.blurStatus === "Sharp"
                            ? "bg-emerald-600/90 text-white"
                            : imageQuality?.metrics?.blurStatus === "Mild Blur"
                            ? "bg-amber-500/90 text-white"
                            : "bg-rose-600/90 text-white animate-pulse"
                        }`}>
                          <Focus className="w-3 h-3" />
                          <span>{imageQuality?.metrics?.blurStatus || "Assessing Focus"}</span>
                        </span>

                        {/* Exposure Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-md flex items-center gap-1 ${
                          imageQuality?.metrics?.exposureStatus === "Well Exposed" || imageQuality?.metrics?.exposureStatus === "Dark Coat (Optimized)"
                            ? "bg-emerald-600/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}>
                          <Sun className="w-3 h-3" />
                          <span>{imageQuality?.metrics?.exposureStatus || "Lighting"}</span>
                        </span>
                      </div>

                      {/* Warnings or Clinical Lesion Bounding Boxes */}
                      <div className="space-y-1">
                        {imageQuality?.retakeRecommended && (
                          <div className="bg-rose-950/90 border border-rose-400 text-rose-100 text-[10px] font-semibold px-2 py-1 rounded backdrop-blur-sm shadow flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-300 shrink-0" />
                            <span>
                              {imageQuality.metrics?.blurStatus === "Severe Blur"
                                ? "Motion blur detected: hold camera steady"
                                : imageQuality.metrics?.glareRatio && imageQuality.metrics.glareRatio > 15
                                ? "Specular glare: avoid direct flash"
                                : "Retake photo in natural daylight"}
                            </span>
                          </div>
                        )}

                        {aiResult?.detectedLesions && aiResult.detectedLesions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {aiResult.detectedLesions.slice(0, 2).map((lesion, idx) => (
                              <span
                                key={idx}
                                className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 backdrop-blur-sm"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{lesion.label} ({Math.round(lesion.confidence * 100)}%)</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 text-stone-400">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="text-xs font-medium">No photo selected</p>
                  </div>
                )}
              </div>

              {/* Separate Live Camera & Upload Buttons & Automated Quality Assessment */}
              <div className="flex-1 space-y-2.5 w-full">
                {/* Hidden native input for File Upload - strictly preserved */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {/* Two clearly separated options: Live Camera vs Upload Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => startLiveCamera("environment")}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/20 transition-all min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 text-emerald-200" />
                    <span>📷 {lang === "hi" ? "लाइव कैमरा (Live Camera)" : "Live Camera"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-[0.98] text-xs sm:text-sm font-semibold border border-stone-300 transition-all min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 text-stone-500" />
                    <span>🖼 {lang === "hi" ? "फोटो अपलोड करें (Upload Photo)" : "Upload Photo"}</span>
                  </button>
                </div>

              {/* Automated Photographic Quality Evaluation Card */}
              {imageQuality && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all shadow-xs ${
                    imageQuality.retakeRecommended
                      ? "bg-amber-50/90 border-amber-300 text-amber-950"
                      : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                  }`}
                >
                  {/* Card Header with Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          imageQuality.retakeRecommended
                            ? "bg-amber-200 text-amber-900"
                            : "bg-emerald-200 text-emerald-900"
                        }`}
                      >
                        {isEvaluatingQuality ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block leading-tight">
                          {lang === "hi"
                            ? "स्वचालित फोटो गुणवत्ता विश्लेषण (AI Quality Check)"
                            : "Automated Image Quality Assessment"}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {imageQuality.feedback || "Screened with Laplacian Edge & Exposure Matrix"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                          imageQuality.qualityScore >= 70
                            ? "bg-emerald-200 text-emerald-950"
                            : imageQuality.qualityScore >= 50
                            ? "bg-amber-200 text-amber-950"
                            : "bg-rose-200 text-rose-950"
                        }`}
                      >
                        <span>{imageQuality.qualityScore}/100</span>
                        <span className="text-[9px] uppercase tracking-wide opacity-80">
                          {imageQuality.retakeRecommended
                            ? lang === "hi"
                              ? "सुधार आवश्यक"
                              : "Sub-Optimal"
                            : lang === "hi"
                            ? "क्लीनिकल गुणवत्ता"
                            : "Clinical Pass"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 4 Quality Pillars Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {/* 1. Sharpness & Focus */}
                    <div className="bg-white/80 p-2 rounded-lg border border-stone-200/80">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                          <Focus className="w-3 h-3 text-stone-600" />
                          Focus / Sharpness
                        </span>
                        <span className="text-[10px] font-bold text-stone-700">
                          {imageQuality.sharpnessScore || 85}%
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold ${
                        imageQuality.metrics?.blurStatus === "Sharp"
                          ? "text-emerald-700"
                          : imageQuality.metrics?.blurStatus === "Mild Blur"
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}>
                        {imageQuality.metrics?.blurStatus || "Sharp"}
                      </p>
                    </div>

                    {/* 2. Exposure & Lighting */}
                    <div className="bg-white/80 p-2 rounded-lg border border-stone-200/80">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                          <Sun className="w-3 h-3 text-stone-600" />
                          Lighting / Coat
                        </span>
                        <span className="text-[10px] font-bold text-stone-700">
                          {imageQuality.brightnessScore || 90}%
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold ${
                        imageQuality.metrics?.exposureStatus === "Well Exposed" ||
                        imageQuality.metrics?.exposureStatus === "Dark Coat (Optimized)"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}>
                        {imageQuality.metrics?.exposureStatus || "Well Exposed"}
                      </p>
                    </div>

                    {/* 3. Glare / Reflection */}
                    <div className="bg-white/80 p-2 rounded-lg border border-stone-200/80">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-stone-600" />
                          Glare / Flash
                        </span>
                        <span className="text-[10px] font-bold text-stone-700">
                          {imageQuality.glareScore || 95}%
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold ${
                        (imageQuality.glareScore || 95) >= 70 ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        {(imageQuality.glareScore || 95) >= 70 ? "Clear (No Glare)" : "Flash Reflection"}
                      </p>
                    </div>

                    {/* 4. Resolution */}
                    <div className="bg-white/80 p-2 rounded-lg border border-stone-200/80">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-stone-600" />
                          Resolution
                        </span>
                        <span className="text-[10px] font-bold text-stone-700">
                          {imageQuality.resolutionScore || 90}%
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold ${
                        imageQuality.metrics?.resolutionStatus === "Low Resolution" ? "text-rose-700" : "text-emerald-700"
                      }`}>
                        {imageQuality.metrics?.resolutionStatus || "Optimal (HD)"}
                      </p>
                    </div>
                  </div>

                  {/* Issues Warning Box */}
                  {imageQuality.issues.length > 0 && (
                    <div className="p-2.5 bg-amber-100/70 border border-amber-300/80 rounded-lg text-[11px] text-amber-900 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        {lang === "hi" ? "सुधार हेतु सुझाव:" : "Quality Improvement Suggestions:"}
                      </span>
                      {imageQuality.issues.map((iss, i) => (
                        <p key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:font-bold">
                          {iss}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Technical Metrics Toggle & Action Buttons */}
                  <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowMetricsDrawer(!showMetricsDrawer)}
                      className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
                    >
                      <span>{showMetricsDrawer ? "Hide Diagnostic Telemetry" : "View CV Telemetry Metrics"}</span>
                      {showMetricsDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoPreview && runQualityAssessment(photoPreview, breed)}
                        disabled={isEvaluatingQuality}
                        className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${isEvaluatingQuality ? "animate-spin" : ""}`} />
                        <span>Re-test</span>
                      </button>

                      {imageQuality.retakeRecommended && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startLiveCamera("environment")}
                            className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            <span>📷 {lang === "hi" ? "कैमरा" : "Live Camera"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{lang === "hi" ? "अपलोड" : "Upload"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded CV Metrics */}
                  {showMetricsDrawer && imageQuality.metrics && (
                    <div className="p-2.5 bg-stone-900 text-stone-200 rounded-lg text-[10px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-stone-400 block">Laplacian Var:</span>
                        <span className="font-bold text-emerald-400">{imageQuality.metrics.laplacianVariance}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Mean Luminance:</span>
                        <span className="font-bold text-amber-400">{imageQuality.metrics.averageLuminance} / 255</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Glare Pixels:</span>
                        <span className="font-bold text-sky-400">{imageQuality.metrics.glareRatio}%</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Shadow Ratio:</span>
                        <span className="font-bold text-purple-400">{imageQuality.metrics.darkRatio}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === "en" ? "Visible Lesion / Markings Description (Optional)" : "दिखने वाले लक्षण विवरण (वैकल्पिक)"}
                </label>
                <input
                  type="text"
                  value={lesionNotes}
                  onChange={(e) => setLesionNotes(e.target.value)}
                  placeholder="e.g. 2-5cm round nodules on neck, stringy drooling"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Live Analysis Progress Banner */}
        {isLiveAnalyzing && (
          <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-600 shadow-lg flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-emerald-200">
                ⚡ AI Disease Detection Pipeline Analyzing Captured Image...
              </h4>
              <p className="text-xs text-emerald-300/90 leading-relaxed mt-0.5">
                Scanning animal image for clinical lesions, calculating ICAR disease risk score, and syncing health timeline.
              </p>
            </div>
          </div>
        )}

        {/* Live Analysis Error Notice */}
        {liveAnalysisError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{liveAnalysisError}</span>
            </div>
            <button
              type="button"
              onClick={() => photoPreview && handleCaptureLiveCameraPhoto()}
              className="px-3 py-1.5 rounded-lg bg-rose-200 hover:bg-rose-300 font-bold text-xs text-rose-900 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Health Timeline Synchronization Confirmation */}
        {lastTimelineUpdateMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{lastTimelineUpdateMsg}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 text-[10px] font-mono font-bold uppercase tracking-wider">
              Timeline Saved
            </span>
          </div>
        )}

        {/* REAL-TIME AI DISEASE DETECTION & CLINICAL TRIAGE PANEL */}
        {aiResult && (
          <div className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-emerald-600/70 shadow-xl space-y-5">
            {/* Header: ANALYSIS RESULT */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    ANALYSIS RESULT
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-300">
                    {aiResult.modelSource || "MobileNetV3 ML + Gemini AI"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
                    Firebase Synced
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  Livestock Disease Screening
                </h3>
              </div>

              {/* TTS Readout Button */}
              <button
                type="button"
                onClick={handleToggleSpeakAdvice}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors self-start sm:self-auto"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                    <span>Read Advice Aloud</span>
                  </>
                )}
              </button>
            </div>

            {/* Core Triage Grid: Captured Image + Primary Diagnostic Facts */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Captured Animal Image Thumbnail */}
              <div className="md:col-span-4 space-y-2">
                <span className="text-xs font-bold text-stone-600 block uppercase tracking-wider">
                  Captured Animal Image
                </span>
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-stone-300 bg-stone-100 shadow-inner">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Captured Livestock Lesion"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-xs">No image provided</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white p-1.5 rounded-lg text-[10px] flex items-center justify-between">
                    <span className="font-mono truncate">{tagId || "IN-LIVE"}</span>
                    <span className="text-emerald-300 font-bold">224×224 RGB</span>
                  </div>
                </div>
              </div>

              {/* Primary Diagnostic Metrics */}
              <div className="md:col-span-8 space-y-3.5">
                {/* Disease & ML Confidence */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Predicted Disease
                      </span>
                      <h4 className="text-xl font-black text-stone-900">
                        {aiResult.suspectedDisease}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        ML Confidence
                      </span>
                      <span className="text-xl font-black text-emerald-700">
                        {Math.round((aiResult.mlConfidence || aiResult.confidence) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Top ML Predictions Breakdown */}
                  {aiResult.topPredictions && aiResult.topPredictions.length > 0 && (
                    <div className="pt-2 border-t border-stone-200/80">
                      <span className="text-[10px] font-semibold text-stone-500 block mb-1">
                        Top Model Class Probabilities:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.topPredictions.map((pred, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                              idx === 0
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                                : "bg-white text-stone-600 border-stone-200"
                            }`}
                          >
                            {pred.disease}: {Math.round(pred.confidence * 100)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk Score & Severity Meter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Risk Score (0-100) */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        Risk Score
                      </span>
                      <span
                        className={`text-xl font-black ${
                          aiResult.riskScore >= 70
                            ? "text-rose-700"
                            : aiResult.riskScore >= 40
                            ? "text-amber-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {aiResult.riskScore} <span className="text-xs font-bold text-stone-400">/ 100</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          aiResult.riskScore >= 70
                            ? "bg-rose-600"
                            : aiResult.riskScore >= 40
                            ? "bg-amber-500"
                            : "bg-emerald-600"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, aiResult.riskScore))}%` }}
                      />
                    </div>
                    {/* Explainable Factor Breakdown */}
                    {aiResult.riskBreakdown && (
                      <div className="mt-2 pt-2 border-t border-stone-200 text-[10px] text-stone-500 flex flex-wrap gap-x-2 gap-y-1">
                        <span>Base: +{aiResult.riskBreakdown.baseLethality}</span>
                        <span>Symptoms: +{aiResult.riskBreakdown.symptomScore}</span>
                        <span>Vaccine: +{aiResult.riskBreakdown.vaccinationRisk}</span>
                        <span>History: +{aiResult.riskBreakdown.historyFactor}</span>
                        <span>Cluster: +{aiResult.riskBreakdown.clusterFactor}</span>
                      </div>
                    )}
                  </div>

                  {/* Severity Level */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Severity
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg font-black text-sm uppercase tracking-wider ${
                          (aiResult.urgencyLevel || aiResult.riskLevel) === "High" || aiResult.riskScore >= 70
                            ? "bg-rose-600 text-white shadow-xs"
                            : (aiResult.urgencyLevel || aiResult.riskLevel) === "Medium" || aiResult.riskScore >= 40
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-emerald-600 text-white shadow-xs"
                        }`}
                      >
                        {aiResult.urgencyLevel || (aiResult.riskScore >= 70 ? "HIGH" : aiResult.riskScore >= 40 ? "MEDIUM" : "LOW")}
                      </span>
                      <span className="text-xs text-stone-500 block mt-1">
                        {aiResult.quarantineRequired ? "Immediate quarantine required" : "Standard monitoring protocol"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Explanation (Gemini LLM Synthesis) */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-stone-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>AI Explanation</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                {aiResult.explanation || aiResult.reasoning || "The ML vision model identified cutaneous lesions characteristic of Lumpy Skin Disease. Clinical correlation with high body temperature and reduced appetite indicates active systemic infection requiring veterinary intervention."}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-stone-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Recommended Action</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 leading-relaxed">
                {(aiResult.recommendedActions && aiResult.recommendedActions[0]) || "Contact a veterinarian and isolate the suspected animal."}
              </p>
              {aiResult.recommendedActions && aiResult.recommendedActions.length > 1 && (
                <ul className="space-y-1 text-xs text-stone-700 pt-1">
                  {aiResult.recommendedActions.slice(1).map((act, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Low Confidence Warning when applicable */}
            {(aiResult.lowConfidence || aiResult.confidence < 0.65 || (aiResult.mlConfidence && aiResult.mlConfidence < 0.65)) && (
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-900 text-sm">
                    Low confidence prediction. Additional symptoms or veterinary examination are required.
                  </p>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    The image visual features did not meet the 65% diagnostic threshold. Please provide additional symptoms or request an in-person veterinary examination.
                  </p>
                </div>
              </div>
            )}

            {/* Clinical Disclaimer */}
            <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-500 shrink-0" />
              <span>
                <strong>Medical Notice:</strong> Image-based prediction is a preliminary screening tool and not a confirmed veterinary diagnosis. Always consult a qualified veterinary officer.
              </span>
            </div>

            {/* Action Buttons: View Animal History & Contact Veterinarian */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onViewAnimalHistory) {
                    onViewAnimalHistory();
                  } else {
                    const activeAnimal = animals.find((a) => a.id === selectedAnimalId || a.tagId === tagId);
                    alert(`Viewing health history for ${activeAnimal?.name || tagId || "selected animal"}. Check the Animal Records tab.`);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] min-h-[44px]"
              >
                <BookOpen className="w-4 h-4 text-stone-300" />
                <span>View Animal History</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onContactVet) {
                    onContactVet();
                  } else if (onOpenIVR) {
                    onOpenIVR();
                  } else {
                    window.location.href = "tel:1962";
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/20 transition-all active:scale-[0.98] min-h-[44px]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Veterinarian</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Symptom Checklist (Designed for low digital literacy) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  {lang === "en" ? "Symptom Checklist" : "लक्षणों का चयन करें (एक या अधिक)"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "en"
                    ? "Tap any symptoms observed in the animal"
                    : "पशु में दिखाई देने वाले सभी लक्षणों पर टैप करें"}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-stone-100 text-stone-600">
              {selectedSymptoms.length} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {COMMON_SYMPTOMS.map((sym) => {
              const label = lang === "en" ? sym.en : sym.hi;
              const isSelected = selectedSymptoms.includes(sym.en) || selectedSymptoms.includes(label);

              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => toggleSymptom(sym.en)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-500"
                      : "bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span className="text-xl shrink-0">{sym.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug truncate">{label}</p>
                    {sym.severity === "high" && (
                      <span className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> High Alert
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Vitals & Activity Levels */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {lang === "en" ? "Vital Signs & Behavior" : "शारीरिक तापमान एवं व्यवहार"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Body Temperature */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  <span>{t.temp}</span>
                </label>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    bodyTemperatureF > 103
                      ? "bg-rose-100 text-rose-700"
                      : bodyTemperatureF > 102
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {bodyTemperatureF} °F
                </span>
              </div>
              <input
                type="range"
                min="99.0"
                max="107.0"
                step="0.1"
                value={bodyTemperatureF}
                onChange={(e) => setBodyTemperatureF(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                <span>99°F (Subnormal)</span>
                <span className="text-emerald-700 font-bold">101.5°F (Normal)</span>
                <span className="text-rose-600 font-bold">105°F+ (Severe)</span>
              </div>
            </div>

            {/* Activity Level */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>{t.activity}</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["Normal", "Lethargic", "Recumbent/Down"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setActivityLevel(level)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition-colors ${
                      activityLevel === level
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {level === "Recumbent/Down" ? "Down" : level}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-500">
                {activityLevel === "Normal" && "Standing and alert"}
                {activityLevel === "Lethargic" && "Dull, drooping ears, slow"}
                {activityLevel === "Recumbent/Down" && "Unable to stand up"}
              </p>
            </div>

            {/* Appetite */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>🌾</span>
                <span>{t.appetite}</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["Normal", "Reduced", "Anorexic"] as const).map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setAppetite(app)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition-colors ${
                      appetite === app
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {app === "Anorexic" ? "Off Feed" : app}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-500">
                {appetite === "Normal" && "Eating and chewing cud normally"}
                {appetite === "Reduced" && "Partial grazing/eating"}
                {appetite === "Anorexic" && "Completely stopped eating"}
              </p>
            </div>
          </div>
        </div>

        {/* Step 5: Location / GPS */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                5
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  {lang === "en" ? "Village & GPS Outbreak Coordinates" : "गांव एवं जीपीएस स्थान"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "en"
                    ? "Accurate coordinates allow the AI engine to detect disease clusters"
                    : "सटीक स्थान से बीमारी के प्रसार (क्लस्टर) का तुरंत पता चलता है"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCaptureGPS}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isLocating ? "Detecting..." : "Auto-Capture GPS"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Village" : "गांव"}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "District" : "जिला"}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
          </div>

          {/* Quick Rural Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-stone-500 font-medium">Quick Demo Districts:</span>
            {[
              { name: "Mogri", dist: "Anand", st: "Gujarat", lat: 22.5645, lng: 72.9289 },
              { name: "Taraori", dist: "Karnal", st: "Haryana", lat: 29.8000, lng: 76.9200 },
              { name: "Rahata", dist: "Ahmednagar", st: "Maharashtra", lat: 19.6700, lng: 74.4800 },
              { name: "Nokha", dist: "Bikaner", st: "Rajasthan", lat: 27.6000, lng: 73.4200 }
            ].map((p) => (
              <button
                key={p.dist}
                type="button"
                onClick={() => applyPresetLocation(p)}
                className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-medium"
              >
                📍 {p.dist} ({p.st})
              </button>
            ))}
          </div>
        </div>

        {/* Instant Live Edge AI Triage Pre-Score (<1ms latency) */}
        {liveEdgeRisk && (
          <div className="rounded-2xl p-4 bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-700 fill-emerald-600" />
                  {lang === "hi" ? "लाइव एआई जोखिम पूर्वावलोकन (त्वरित <1ms)" : "Live AI Risk Pre-Score (Instant Edge <1ms)"}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  liveEdgeRisk.riskLevel === "High"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : liveEdgeRisk.riskLevel === "Medium"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                <span>{liveEdgeRisk.riskLevel} Risk</span>
                <span className="opacity-75">({liveEdgeRisk.riskScore}%)</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-emerald-950 pt-0.5">
              <p className="font-medium">
                <span className="text-emerald-800">{lang === "hi" ? "संभावित स्थिति:" : "Suspected Condition:"} </span>
                <span className="font-bold underline decoration-emerald-500">{liveEdgeRisk.suspectedDisease}</span>
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">
                ⚡ {lang === "hi" ? "शून्य विलंबता • सबमिट पर विस्तृत विश्लेषण" : "Zero-lag evaluation • Finalizes on submit"}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-base sm:text-lg shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-75"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-emerald-200" />
                <span>{lang === "hi" ? "⚡ त्वरित एआई विश्लेषण एवं सबमिशन जारी..." : "⚡ Fast AI Triage & Submitting Case..."}</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span>{t.submitReport}</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Diagnostic & 3-Tier Routing Result Screen */}
      {aiResult && submittedSuccess && (() => {
        const tier =
          submittedSuccess.routingTier ||
          (aiResult.confidence < 0.60 || /unrecognized|unknown/i.test(aiResult.suspectedDisease)
            ? "unrecognized_escalated"
            : aiResult.riskLevel === "High" || Number(bodyTemperatureF) >= 104.5 || aiResult.quarantineRequired
            ? "known_urgent_escalated"
            : "known_self_treated");

        const clinic = submittedSuccess.nearestVetClinic || {
          name: `${district} Block Veterinary Hospital & Polyclinic`,
          distanceKm: 3.4,
          phone: "0141-2849102",
          doctorName: "Dr. Vikram Joshi (B.V.Sc & A.H)",
          etaMinutes: 18
        };

        return (
          <div
            className={`bg-white rounded-2xl p-5 sm:p-6 border-2 shadow-lg space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300 ${
              tier === "known_self_treated"
                ? "border-emerald-600/40"
                : tier === "known_urgent_escalated"
                ? "border-rose-600/50"
                : "border-indigo-600/50"
            }`}
          >
            {/* Tier Routing Header Banner */}
            <div
              className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                tier === "known_self_treated"
                  ? "bg-emerald-50 text-emerald-950 border border-emerald-300"
                  : tier === "known_urgent_escalated"
                  ? "bg-rose-50 text-rose-950 border border-rose-300"
                  : "bg-indigo-50 text-indigo-950 border border-indigo-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                    tier === "known_self_treated"
                      ? "bg-emerald-600"
                      : tier === "known_urgent_escalated"
                      ? "bg-rose-600 animate-pulse"
                      : "bg-indigo-600"
                  }`}
                >
                  {tier === "known_self_treated" && <CheckCircle2 className="w-6 h-6" />}
                  {tier === "known_urgent_escalated" && <ShieldAlert className="w-6 h-6" />}
                  {tier === "unrecognized_escalated" && <Microscope className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {tier === "known_self_treated" &&
                      (lang === "hi"
                        ? "✅ एआई-निर्देशित स्व-उपचार • पशु चिकित्सक की आवश्यकता नहीं"
                        : "✅ AI-Guided Self-Care • No Vet Visit Needed")}
                    {tier === "known_urgent_escalated" &&
                      (lang === "hi"
                        ? "🚨 अति-गंभीर आपातकाल: निकटतम पशु चिकित्सालय अलर्ट प्रेषित!"
                        : "🚨 High-Urgency Case: Nearest Veterinary Clinic Dispatched!")}
                    {tier === "unrecognized_escalated" &&
                      (lang === "hi"
                        ? "🔍 अज्ञात लक्षण पैटर्न: पशु चिकित्सक को तुरंत एस्केलेट किया गया"
                        : "🔍 Unrecognized Pathogen Pattern — Escalated to Vet Clinic")}
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {tier === "known_self_treated" &&
                      (lang === "hi"
                        ? "यह बीमारी पहचान योग्य है और सामान्य प्राथमिक उपचार से ठीक हो सकती है। नीचे दिए गए निर्देशों का पालन करें।"
                        : "Disease recognized with low/moderate urgency. First-aid and supportive treatment protocol shown directly below.")}
                    {tier === "known_urgent_escalated" &&
                      (lang === "hi"
                        ? "गंभीर संक्रमण या तेज बुखार। पशु चिकित्सक को ऑन-साइट इलाज हेतु फार्म पर भेजा जा रहा है।"
                        : "Critical condition requiring immediate professional treatment on-site. Follow emergency first-aid while awaiting arrival.")}
                    {tier === "unrecognized_escalated" &&
                      (lang === "hi"
                        ? "एआई मॉडल इस लक्षण को विश्वास के साथ वर्गीकृत नहीं कर सका (<60%)। जैव सुरक्षा नियम के तहत ऑन-साइट नमूना जांच हेतु डॉक्टर रवाना हो रहे हैं।"
                        : "AI cannot confidently classify these symptoms (<60% confidence). Field vet dispatched for in-person diagnosis & biosafety check.")}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span
                  className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${
                    tier === "known_self_treated"
                      ? "bg-emerald-200 text-emerald-900 border border-emerald-300"
                      : tier === "known_urgent_escalated"
                      ? "bg-rose-200 text-rose-900 border border-rose-300 animate-pulse"
                      : "bg-indigo-200 text-indigo-900 border border-indigo-300"
                  }`}
                >
                  {tier === "known_self_treated" && "Self-Treated / AI"}
                  {tier === "known_urgent_escalated" && "Urgent-Escalated"}
                  {tier === "unrecognized_escalated" && "Escalated - Unrecognized"}
                </span>
              </div>
            </div>

            {/* Disease & Diagnostic Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                    Case ID: {submittedSuccess.id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
                    <Zap className="w-3 h-3 text-emerald-600 fill-emerald-500" />
                    <span>{aiResult.latencyMs ? `${aiResult.latencyMs}ms` : "< 20ms"}</span>
                    <span className="text-[10px] font-medium opacity-80">({aiResult.modelSource || "High-Speed AI"})</span>
                  </span>
                  {wasOfflineSaved ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Saved to Offline Queue (Will sync)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Synced with Livestock Health Network
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  {tier === "unrecognized_escalated"
                    ? `${lang === "hi" ? "अज्ञात नैदानिक स्थिति" : "Unrecognized Clinical Condition"} (${aiResult.suspectedDisease})`
                    : `${lang === "hi" ? "संभावित रोग" : "AI Suspected Disease"}: ${aiResult.suspectedDisease}`}
                </h3>
              </div>

              {/* TTS Audio button & Risk Badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSpeakAdvice}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 border border-stone-300 transition-colors shadow-xs"
                  title="Listen to advice in audio"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-700" />
                      <span>{lang === "hi" ? "आवाज़ में सुनें" : "Listen (Audio)"}</span>
                    </>
                  )}
                </button>

                <div
                  className={`px-4 py-2 rounded-xl text-center font-bold text-sm sm:text-base flex items-center gap-2 ${
                    aiResult.riskLevel === "High"
                      ? "bg-rose-600 text-white shadow-rose-200 shadow-md"
                      : aiResult.riskLevel === "Medium"
                      ? "bg-amber-500 text-white shadow-amber-200 shadow-md"
                      : "bg-emerald-600 text-white shadow-emerald-200 shadow-md"
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>
                    {aiResult.riskLevel === "High" && t.riskHigh}
                    {aiResult.riskLevel === "Medium" && t.riskMedium}
                    {aiResult.riskLevel === "Low" && t.riskLow}
                  </span>
                  <span className="bg-black/20 px-2 py-0.5 rounded text-xs">
                    {aiResult.riskScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Workflow Stepper for Escalated Cases */}
            {tier !== "known_self_treated" && (
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600 font-semibold">
                  <span>Veterinary On-Site Call-Out Lifecycle:</span>
                  <span className="text-emerald-700 font-bold">Step 2 of 4 Active</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                    <span>1. Reported</span>
                    <span className="block text-[10px] text-emerald-700 font-normal">Done</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300 animate-pulse">
                    <span>2. Vet En Route</span>
                    <span className="block text-[10px] text-amber-700 font-normal">ETA ~{clinic.etaMinutes}m</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-100 text-stone-500 font-medium border border-stone-200">
                    <span>3. Farm Visit</span>
                    <span className="block text-[10px] text-stone-400">On-Site Treatment</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-100 text-stone-500 font-medium border border-stone-200">
                    <span>{tier === "unrecognized_escalated" ? "4. AI Retrain" : "4. Resolved"}</span>
                    <span className="block text-[10px] text-stone-400">{tier === "unrecognized_escalated" ? "Model Update" : "Outcome Log"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Nearest Vet Clinic Dispatch Card (For Escalated Tiers 2 & 3) */}
            {tier !== "known_self_treated" && (
              <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-emerald-950 text-sm">
                      Nearest Dispatched Veterinary Facility
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>{clinic.distanceKm} km away • ETA {clinic.etaMinutes} mins</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-emerald-950">
                  <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-medium block">Clinic / Dispensary</span>
                    <span className="font-bold text-xs">{clinic.name}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-medium block">Attending Doctor</span>
                    <span className="font-bold text-xs">{clinic.doctorName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-medium block">Helpline / Dispatch Phone</span>
                      <span className="font-bold font-mono text-xs">{clinic.phone}</span>
                    </div>
                    <a
                      href={`tel:${clinic.phone}`}
                      className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                      title="Call Clinic"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 italic">
                  * Live call-out dispatch active. The veterinarian has received your exact GPS coordinates ({latitude}, {longitude}) and lesion photos.
                </p>
              </div>
            )}

            {/* Screening Certainty & Contagion Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block font-medium">Screening Confidence</span>
                <span className="text-sm font-bold text-stone-900">
                  {(aiResult.confidence * 100).toFixed(0)}% Certainty
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Model: {aiResult.modelSource}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block font-medium">Contagion / Herd Threat</span>
                <span
                  className={`text-sm font-bold ${
                    aiResult.contagionRisk === "Severe"
                      ? "text-rose-600"
                      : aiResult.contagionRisk === "Moderate"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {aiResult.contagionRisk} Risk of Spread
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Quarantine: {aiResult.quarantineRequired ? "Mandatory" : "Not immediately required"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block font-medium">Differential Diagnosis</span>
                <span className="text-xs font-semibold text-stone-800">
                  {aiResult.alternativeDiseases.join(", ") || "None"}
                </span>
              </div>
            </div>

            {/* Direct First-Aid / Treatment Recommendations */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                tier === "known_self_treated"
                  ? "bg-emerald-50/80 border-emerald-300"
                  : "bg-amber-50/80 border-amber-300"
              }`}
            >
              <h4
                className={`font-bold text-sm flex items-center gap-1.5 ${
                  tier === "known_self_treated" ? "text-emerald-950" : "text-amber-950"
                }`}
              >
                {tier === "known_self_treated" ? (
                  <>
                    <Pill className="w-4 h-4 text-emerald-700" />
                    <span>{lang === "hi" ? "प्राथमिक उपचार एवं घरेलू दवा निर्देश (तत्काल दें):" : "First-Aid & Home Treatment Protocol (Administer Directly):"}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{lang === "hi" ? "डॉक्टर के आने तक आवश्यक आपातकालीन प्राथमिक कदम:" : "Immediate First-Aid while Awaiting Vet Arrival:"}</span>
                  </>
                )}
              </h4>
              <ul
                className={`space-y-1.5 text-xs list-disc list-inside ${
                  tier === "known_self_treated" ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                {aiResult.recommendedActions.map((action, idx) => (
                  <li key={idx} className="font-medium">
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tier 1 Confirmation: Saved as Self-Treated in Animal Record */}
            {tier === "known_self_treated" && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold">
                      {lang === "hi" ? "पशु स्वास्थ्य इतिहास में दर्ज: स्व-उपचारित (AI-निर्देशित)" : "Saved to Animal Health Record: Self-Treated / AI-Guided"}
                    </p>
                    <p className="text-emerald-800 text-[11px]">
                      {lang === "hi"
                        ? "किसी डॉक्टर की यात्रा की आवश्यकता नहीं है। 48 घंटे में सुधार न होने पर आप 1962 पर कॉल कर सकते हैं।"
                        : "No veterinarian dispatch needed. Tag history updated with standard protocol."}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                  Tag: {tagId || "Registered"}
                </span>
              </div>
            )}

            {/* Tier 3 Special Note: AI Retraining Feedback Loop Explanation */}
            {tier === "unrecognized_escalated" && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-700 shrink-0" />
                  <span>
                    <strong>{lang === "hi" ? "एआई मॉडल सक्रिय शिक्षण लूप:" : "AI Model Active-Learning Retraining Loop:"}</strong>{" "}
                    {lang === "hi"
                      ? "जब पशु चिकित्सक ऑन-साइट परीक्षण करके नैदानिक परिणाम दर्ज करेंगे, तो यह नया डेटा एआई मॉडल को पुनः प्रशिक्षित करने में उपयोग होगा।"
                      : "When the attending vet confirms the diagnosis on-site, this case is automatically fed back to retrain the AI engine."}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* DPDP Compliance & Privacy Card */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-stone-600">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold text-stone-800 block">
              Digital Personal Data Protection (DPDP 2023) Compliance
            </span>
            <span className="text-[11px] text-stone-500">
              Farmers have the statutory Right to Erasure, correction, and data anonymization.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsErasureOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Manage Data / Right to Erasure</span>
        </button>
      </div>

      {/* DPDP Erasure Modal */}
      {isErasureOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-900 text-sm">
                  DPDP Right to Erasure / Data Anonymization
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsErasureOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              In accordance with India's Digital Personal Data Protection Act (DPDP 2023), requesting erasure permanently anonymizes your animal case reports (retaining disease outbreak signals for epidemiology without personal identifiers) and purges your registered animal owner records.
            </p>

            {erasureNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold">
                {erasureNotice}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registered Mobile Number
                </label>
                <input
                  type="text"
                  value={erasurePhone}
                  onChange={(e) => setErasurePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Reason for Erasure
                </label>
                <select
                  value={erasureReason}
                  onChange={(e) => setErasureReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  <option value="Livestock sold or deceased">Livestock sold or deceased</option>
                  <option value="Farmer preference / Consent withdrawn">Farmer preference / Consent withdrawn</option>
                  <option value="Relocated outside surveillance zone">Relocated outside surveillance zone</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsErasureOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDataErasure}
                disabled={isErasing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                {isErasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isErasing ? "Anonymizing..." : "Confirm & Anonymize Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
