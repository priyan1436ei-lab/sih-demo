import React, { useState, useEffect } from "react";
import { UserSession, UserRole, Language, TRANSLATIONS } from "../types";
import { SUPPORTED_LANGUAGES } from "../data/translations";
import { sendOtp, verifyOtp, loginUser } from "../services/api";
import {
  Shield,
  Stethoscope,
  Building2,
  Phone,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Globe2,
  Info,
  Tractor,
  KeyRound,
  ShieldCheck,
  MapPin,
  ExternalLink
} from "lucide-react";

interface LoginRoleScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LoginRoleScreen: React.FC<LoginRoleScreenProps> = ({
  onLoginSuccess,
  language,
  onLanguageChange
}) => {
  const isHi = language === "hi";

  // Check URL hash or query params for direct portal entry
  const getInitialRole = (): UserRole => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("farmer") || hash.includes("kisan")) return "farmer";
      if (hash.includes("vet") || hash.includes("doctor")) return "vet";
      if (hash.includes("admin") || hash.includes("govt") || hash.includes("official")) return "admin";
      const params = new URLSearchParams(window.location.search);
      const portal = params.get("portal") || params.get("role");
      if (portal === "farmer") return "farmer";
      if (portal === "vet") return "vet";
      if (portal === "admin") return "admin";
    }
    return "farmer";
  };

  const [selectedRole, setSelectedRole] = useState<UserRole>(getInitialRole);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  // Synchronize hash with portal selection
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("farmer") || hash.includes("kisan")) setSelectedRole("farmer");
      else if (hash.includes("vet") || hash.includes("doctor")) setSelectedRole("vet");
      else if (hash.includes("admin") || hash.includes("govt") || hash.includes("official")) setSelectedRole("admin");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handlePortalSwitch = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage("");
    setSuccessInfo("");
    if (typeof window !== "undefined") {
      window.location.hash = role;
    }
  };

  // Farmer Form State
  const [farmerPhone, setFarmerPhone] = useState("+91 98251 44102");
  const [farmerName, setFarmerName] = useState("Rameshwar Patel");
  const [farmerVillage, setFarmerVillage] = useState("Mogri");
  const [farmerDistrict, setFarmerDistrict] = useState("Anand");
  const [farmerLivestock, setFarmerLivestock] = useState("4 Gir Cows, 2 Murrah Buffaloes");
  const [farmerOtp, setFarmerOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [consented, setConsented] = useState(true);

  // Vet Form State
  const [vetEmail, setVetEmail] = useState("dr.vikram.vet@dahd.gov.in");
  const [vetPassword, setVetPassword] = useState("••••••••");
  const [vetName, setVetName] = useState("Dr. Vikram Joshi");
  const [vciNumber, setVciNumber] = useState("VCI-GUJ-2018-8491");
  const [vetClinic, setVetClinic] = useState("Anand Central Veterinary Polyclinic");
  const [vetDistrict, setVetDistrict] = useState("Anand");
  const [vetDegree, setVetDegree] = useState("B.V.Sc & A.H., M.V.Sc (Epidemiology)");

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState("epidemiology.hq@dahd.nic.in");
  const [adminName, setAdminName] = useState("Dr. K. S. Rathore");
  const [adminDesignation, setAdminDesignation] = useState("Joint Director (State Epidemiological Lead)");
  const [adminDept, setAdminDept] = useState("Department of Animal Husbandry & Dairying (DAHD)");
  const [adminHQ, setAdminHQ] = useState("Gujarat State Command Center, Gandhinagar");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  // Farmer Sign Up / Register Handler
  const handleFarmerSignUp = () => {
    if (!farmerName.trim()) {
      setErrorMessage(isHi ? "कृपया अपना पूरा नाम दर्ज करें" : "Please enter your full name");
      return;
    }
    if (!farmerPhone || farmerPhone.length < 10) {
      setErrorMessage(isHi ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number");
      return;
    }
    if (!consented) {
      setErrorMessage(isHi ? "कृपया डेटा गोपनीयता सहमति स्वीकार करें" : "Please accept the DPDP data protection consent");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    const session: UserSession = {
      id: `usr-farmer-${Date.now().toString().slice(-4)}`,
      name: farmerName,
      role: "farmer",
      phoneOrEmail: farmerPhone,
      phone: farmerPhone,
      village: farmerVillage,
      district: farmerDistrict,
      token: `jwt-farmer-${Date.now()}`,
      consented: true
    };
    setSuccessInfo(isHi ? "पंजीकरण सफल! आपके किसान पोर्टल पर जाया जा रहा है..." : "Account created! Navigating to your Farmer Dashboard...");
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(session);
    }, 350);
  };

  // Vet Sign Up / Register Handler
  const handleVetSignUp = () => {
    if (!vetName.trim() || !vciNumber.trim()) {
      setErrorMessage(isHi ? "कृपया डॉक्टर का नाम एवं वीसीआई पंजीकरण संख्या दर्ज करें" : "Please enter Doctor name and VCI registration number");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    const session: UserSession = {
      id: `usr-vet-${Date.now().toString().slice(-4)}`,
      name: vetName,
      role: "vet",
      phoneOrEmail: vetEmail,
      email: vetEmail,
      vciNumber: vciNumber,
      district: vetDistrict,
      organization: vetClinic,
      token: `jwt-vet-${Date.now()}`,
      consented: true
    };
    setSuccessInfo(isHi ? "चिकित्सक खाता पंजीकृत! क्लिनिकल डेस्क पर जाया जा रहा है..." : "Doctor registered! Navigating to your Veterinary Clinical Desk...");
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(session);
    }, 350);
  };

  // Admin Sign Up / Register Handler
  const handleAdminSignUp = () => {
    if (!adminName.trim() || !adminEmail.trim()) {
      setErrorMessage(isHi ? "कृपया अधिकारी का नाम एवं शासकीय ईमेल दर्ज करें" : "Please enter Official name and official email");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    const session: UserSession = {
      id: `usr-admin-${Date.now().toString().slice(-4)}`,
      name: adminName,
      role: "admin",
      phoneOrEmail: adminEmail,
      email: adminEmail,
      district: adminHQ,
      organization: adminDept,
      token: `jwt-admin-${Date.now()}`,
      consented: true
    };
    setSuccessInfo(isHi ? "शासकीय पहचान सत्यापित! राज्य प्रकोप कमांड सेंटर पर जाया जा रहा है..." : "Official ID registered! Navigating to Outbreak Command Center...");
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(session);
    }, 350);
  };

  const handleSendOtp = async () => {
    if (!farmerPhone || farmerPhone.length < 10) {
      setErrorMessage(isHi ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number");
      return;
    }
    if (!consented) {
      setErrorMessage(isHi ? "कृपया डेटा गोपनीयता सहमति स्वीकार करें" : "Please accept the DPDP data protection consent");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    try {
      await sendOtp(farmerPhone);
      setOtpSent(true);
      setSuccessInfo(isHi ? "SMS द्वारा OTP भेजा गया (परीक्षण कोड: 849201)" : "OTP sent via SMS (Demo code: 849201)");
    } catch {
      setErrorMessage("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyFarmerOtp = async () => {
    if (!farmerOtp) {
      setErrorMessage(isHi ? "कृपया 6 अंकों का OTP दर्ज करें" : "Please enter the 6-digit OTP");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    try {
      const res = await verifyOtp({
        phone: farmerPhone,
        otp: farmerOtp,
        name: farmerName,
        village: farmerVillage,
        district: farmerDistrict,
        consented
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid OTP entered");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVetLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await loginUser({
        role: "vet",
        email: vetEmail,
        name: vetName,
        vciNumber,
        district: "Anand"
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || "Veterinarian login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await loginUser({
        role: "admin",
        email: adminEmail,
        name: adminName,
        district: "Gujarat State HQ"
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || "Admin login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    if (role === "farmer") {
      onLoginSuccess({
        id: "usr-farmer-01",
        name: "Rameshwar Patel",
        role: "farmer",
        phone: "+91 98251 44102",
        village: "Mogri",
        district: "Anand",
        token: "demo-jwt-farmer",
        consented: true
      });
    } else if (role === "vet") {
      onLoginSuccess({
        id: "usr-vet-01",
        name: "Dr. Vikram Joshi (M.V.Sc)",
        role: "vet",
        email: "dr.vikram.vet@dahd.gov.in",
        vciNumber: "VCI-GUJ-2018-8491",
        district: "Anand",
        organization: "Anand Central Veterinary Polyclinic",
        token: "demo-jwt-vet",
        consented: true
      });
    } else {
      onLoginSuccess({
        id: "usr-admin-01",
        name: "Dr. K. S. Rathore",
        role: "admin",
        email: "epidemiology.hq@dahd.nic.in",
        district: "Gujarat State HQ",
        organization: "Department of Animal Husbandry & Dairying (DAHD)",
        token: "demo-jwt-admin",
        consented: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between text-stone-900">
      {/* Top Header */}
      <header className="bg-emerald-950 text-white border-b border-emerald-900 py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-xl shadow-xs">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight">
                  PashuRaksha AI
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700">
                  पशुरक्षा AI
                </span>
              </div>
              <p className="text-[11px] text-emerald-300">
                National Livestock Disease Surveillance & Early Outbreak Warning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-xl bg-emerald-900/90 px-2.5 py-1 text-xs font-semibold border border-emerald-700">
              <Globe2 className="w-3.5 h-3.5 text-emerald-300 mr-1.5 shrink-0" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-emerald-100 font-bold text-xs focus:outline-none cursor-pointer"
                title="Select App Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-emerald-950 text-white">
                    {l.nativeName} ({l.label})
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-xl border border-emerald-800">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center my-auto">
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden backdrop-blur-xs">
          {/* Welcome Banner with Telemetry Badges */}
          <div className="bg-gradient-to-br from-emerald-950 via-[#0a3826] to-[#04281b] text-white p-6 sm:p-8 relative overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>National Livestock Disease Surveillance Mission</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
                {isHi ? "पशुरक्षा AI डिजिटल स्वास्थ्य पोर्टल" : "PashuRaksha AI Healthcare & Outbreak Portal"}
              </h1>

              <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl mx-auto leading-relaxed">
                {isHi
                  ? "पशु रोग रिपोर्टिंग, एआई जोखिम निदान एवं आपातकालीन 1962 पशु एम्बुलेंस प्रेषण हेतु अपनी अधिकृत भूमिका चुनें।"
                  : "Empowering rural farmers with instant lesion analysis, connecting certified veterinarians for rapid clinical triage, and equipping state authorities with real-time outbreak surveillance."}
              </p>

              {/* National Surveillance Telemetry Ticker */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 max-w-3xl mx-auto">
                <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-left">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">Active Districts</span>
                  <span className="text-lg font-bold font-mono text-white">24 Zones</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-left">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block tracking-wider">1962 Ambulances</span>
                  <span className="text-lg font-bold font-mono text-white">128 Dispatched</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-left">
                  <span className="text-[10px] text-teal-300 font-bold uppercase block tracking-wider">Triage Accuracy</span>
                  <span className="text-lg font-bold font-mono text-white">99.4%</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-left">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">DPDP Privacy</span>
                  <span className="text-lg font-bold font-mono text-white">Certified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Portal Gateway Selector Tabs */}
          <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                {isHi ? "प्रवेश हेतु अपना अधिकृत पोर्टल चुनें" : "Select Your Dedicated Portal Gateway"}
              </span>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
                Independent role gateways • Direct hash navigation: <code className="text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono">#{selectedRole}</code>
              </span>
            </div>

            {/* 3 Dedicated Gateways */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Farmer Portal Tab */}
              <button
                type="button"
                onClick={() => handlePortalSwitch("farmer")}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedRole === "farmer"
                    ? "border-amber-600 bg-amber-50/90 shadow-md ring-2 ring-amber-500/30"
                    : "border-stone-200 bg-white hover:bg-stone-100 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg shadow-2xs">
                    🌾
                  </div>
                  {selectedRole === "farmer" ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      Portal 1
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    {isHi ? "किसान / पशुपालक पोर्टल" : "Farmer / Dairy Owner"}
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded font-mono font-bold">1962</span>
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Symptom intake, camera scan, offline sync & animal digital health cards.
                  </p>
                </div>
              </button>

              {/* Veterinarian Portal Tab */}
              <button
                type="button"
                onClick={() => handlePortalSwitch("vet")}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedRole === "vet"
                    ? "border-teal-600 bg-teal-50/90 shadow-md ring-2 ring-teal-500/30"
                    : "border-stone-200 bg-white hover:bg-stone-100 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-lg shadow-2xs">
                    🩺
                  </div>
                  {selectedRole === "vet" ? (
                    <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      Portal 2
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    {isHi ? "पशु चिकित्सक अधिकारी" : "Veterinarian (VCI)"}
                    <span className="text-[10px] px-1.5 py-0.2 bg-teal-200/80 text-teal-900 rounded font-mono font-bold">VCI</span>
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    1962 call-out queue, clinical triage, Rx generation & active-learning retraining.
                  </p>
                </div>
              </button>

              {/* Admin Portal Tab */}
              <button
                type="button"
                onClick={() => handlePortalSwitch("admin")}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedRole === "admin"
                    ? "border-blue-600 bg-blue-50/90 shadow-md ring-2 ring-blue-500/30"
                    : "border-stone-200 bg-white hover:bg-stone-100 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-lg shadow-2xs">
                    🏛️
                  </div>
                  {selectedRole === "admin" ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      Portal 3
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    {isHi ? "राज्य निगरानी अधिकारी" : "Govt Health Official"}
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-200/80 text-blue-900 rounded font-mono font-bold">DAHD</span>
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    State epidemiological analytics, GIS outbreak radar & emergency biosecurity advisories.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Active Portal Gateway Content Container */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Dedicated Role Isolation Banner */}
            {selectedRole === "farmer" && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      {isHi ? "किसान पोर्टल सुरक्षा एवं अलगाव" : "Dedicated Farmer Portal Gateway"}
                    </h4>
                    <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                      Logging in here grants access <strong>ONLY to the Farmer Dashboard</strong> (AI disease reporting, voice IVR, and personal animal records). Clinical queues and administrative tools are strictly isolated.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("farmer")}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>1-Click Farmer Sign In</span>
                </button>
              </div>
            )}

            {selectedRole === "vet" && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-400/40 text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                      {isHi ? "पशु चिकित्सा अधिकारी पोर्टल अलगाव" : "Dedicated Veterinary Officer Gateway"}
                    </h4>
                    <p className="text-xs text-teal-800/90 mt-0.5 leading-relaxed">
                      Logging in here grants access <strong>ONLY to the Veterinary Clinical Dashboard</strong> (1962 call-out triage, active-learning retraining, and prescription desk). Farmer forms and state commands are strictly isolated.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("vet")}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>1-Click Vet Sign In</span>
                </button>
              </div>
            )}

            {selectedRole === "admin" && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/40 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      {isHi ? "राज्य महामारी निगरानी पोर्टल अलगाव" : "Dedicated State Health Official Gateway"}
                    </h4>
                    <p className="text-xs text-blue-800/90 mt-0.5 leading-relaxed">
                      Logging in here grants access <strong>ONLY to the State Health Outbreak Command Center</strong> (GIS cluster detection, ring vaccination planning, and advisory broadcast). Field-level call-outs and farm intakes are strictly isolated.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("admin")}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>1-Click Admin Sign In</span>
                </button>
              </div>
            )}

            {/* Auth Mode Toggle: Sign Up (Default) vs Sign In */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-100/90 p-2 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMessage("");
                  }}
                  className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    authMode === "signup"
                      ? "bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700"
                      : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isHi ? "नया खाता पंजीकरण (Sign Up)" : "1. Create Account (Sign Up)"}</span>
                  <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.2 rounded font-mono font-normal">Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setErrorMessage("");
                  }}
                  className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    authMode === "login"
                      ? "bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700"
                      : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? "मौजूदा खाता लॉगिन (Sign In)" : "2. Existing Account (Sign In)"}</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 font-medium hidden md:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Step 1 of 2: Register/Sign In to proceed to your role dashboard</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Info */}
            {successInfo && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successInfo}</span>
              </div>
            )}

            {/* Form Section per Role and Mode */}
            <div className="bg-stone-50/90 rounded-2xl p-5 border border-stone-200 space-y-4">
              {/* ==================== SIGN UP MODE ==================== */}
              {authMode === "signup" && (
                <div>
                  {/* FARMER SIGN UP FORM */}
                  {selectedRole === "farmer" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <div>
                          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <Tractor className="w-4 h-4 text-amber-700" />
                            {isHi ? "नया किसान खाता पंजीकरण" : "New Farmer Account Registration"}
                          </span>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Create your livestock digital health account. Once submitted, you will immediately enter your Farmer Dashboard.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                          1962 / Kisan Portal
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "किसान का पूरा नाम:" : "Farmer Full Name:"}
                          </label>
                          <input
                            type="text"
                            value={farmerName}
                            onChange={(e) => setFarmerName(e.target.value)}
                            placeholder="Rameshwar Patel"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "मोबाइल नंबर (SMS/अलर्ट हेतु):" : "Mobile Phone (For Alerts/OTP):"}
                          </label>
                          <input
                            type="tel"
                            value={farmerPhone}
                            onChange={(e) => setFarmerPhone(e.target.value)}
                            placeholder="+91 98251 44102"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "गाँव / ग्राम पंचायत:" : "Village / Gram Panchayat:"}
                          </label>
                          <input
                            type="text"
                            value={farmerVillage}
                            onChange={(e) => setFarmerVillage(e.target.value)}
                            placeholder="Mogri"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "ज़िला:" : "District:"}
                          </label>
                          <input
                            type="text"
                            value={farmerDistrict}
                            onChange={(e) => setFarmerDistrict(e.target.value)}
                            placeholder="Anand"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "पशुधन का विवरण:" : "Livestock Holdings:"}
                          </label>
                          <input
                            type="text"
                            value={farmerLivestock}
                            onChange={(e) => setFarmerLivestock(e.target.value)}
                            placeholder="4 Cows, 2 Buffaloes"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* DPDP Consent */}
                      <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="farmerSignUpConsent"
                          checked={consented}
                          onChange={(e) => setConsented(e.target.checked)}
                          className="mt-0.5 rounded text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="farmerSignUpConsent" className="text-[11px] text-stone-600 leading-snug cursor-pointer">
                          <strong>DPDP Act 2023 Consent:</strong> I agree to register my livestock records and receive early disease advisories and 1962 emergency mobile ambulance triage assistance.
                        </label>
                      </div>

                      {/* Sign Up Actions */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={handleFarmerSignUp}
                          disabled={isLoading}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-emerald-800 hover:from-amber-800 hover:to-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>{isLoading ? "Registering..." : "Sign Up & Proceed to Farmer Dashboard →"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoLogin("farmer")}
                          className="py-3 px-4 rounded-xl bg-amber-100 text-amber-950 hover:bg-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-300 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          <span>⚡ 1-Click Demo Sign Up & Enter</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VET SIGN UP FORM */}
                  {selectedRole === "vet" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <div>
                          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4 text-teal-700" />
                            {isHi ? "पशु चिकित्सक अधिकारी नया पंजीकरण" : "Veterinary Officer Official Registration"}
                          </span>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Register your VCI certification to access the 1962 clinical triage queue and prescription console.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-teal-900 bg-teal-200/80 px-2 py-0.5 rounded">
                          VCI Clinical Desk
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Doctor Name & Title:
                          </label>
                          <input
                            type="text"
                            value={vetName}
                            onChange={(e) => setVetName(e.target.value)}
                            placeholder="Dr. Vikram Joshi"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            VCI Registration Certificate No.:
                          </label>
                          <input
                            type="text"
                            value={vciNumber}
                            onChange={(e) => setVciNumber(e.target.value)}
                            placeholder="VCI-GUJ-2018-8491"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Assigned Polyclinic / Dispensary:
                          </label>
                          <input
                            type="text"
                            value={vetClinic}
                            onChange={(e) => setVetClinic(e.target.value)}
                            placeholder="Anand Central Veterinary Polyclinic"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Jurisdiction District:
                          </label>
                          <input
                            type="text"
                            value={vetDistrict}
                            onChange={(e) => setVetDistrict(e.target.value)}
                            placeholder="Anand"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Qualifications / Degree:
                          </label>
                          <input
                            type="text"
                            value={vetDegree}
                            onChange={(e) => setVetDegree(e.target.value)}
                            placeholder="B.V.Sc & A.H., M.V.Sc"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Official DAHD / Dept Email:
                          </label>
                          <input
                            type="email"
                            value={vetEmail}
                            onChange={(e) => setVetEmail(e.target.value)}
                            placeholder="dr.vikram.vet@dahd.gov.in"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Secure Clinical Password:
                          </label>
                          <input
                            type="password"
                            value={vetPassword}
                            onChange={(e) => setVetPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={handleVetSignUp}
                          disabled={isLoading}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-900 hover:from-teal-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4 text-teal-300" />
                          <span>{isLoading ? "Verifying VCI..." : "Register Doctor ID & Enter Clinical Desk →"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoLogin("vet")}
                          className="py-3 px-4 rounded-xl bg-teal-100 text-teal-950 hover:bg-teal-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-teal-300 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                          <span>⚡ 1-Click Demo Sign Up & Enter</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ADMIN / HEALTH OFFICIAL SIGN UP FORM */}
                  {selectedRole === "admin" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <div>
                          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-blue-700" />
                            {isHi ? "राज्य निगरानी अधिकारी नया पंजीकरण" : "State Health Official Account Registration"}
                          </span>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Register official departmental credentials for GIS outbreak surveillance and containment advisories.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded">
                          DAHD / NIC Radar
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Official Full Name:
                          </label>
                          <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Dr. K. S. Rathore"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Official Designation:
                          </label>
                          <input
                            type="text"
                            value={adminDesignation}
                            onChange={(e) => setAdminDesignation(e.target.value)}
                            placeholder="Joint Director (State Epidemiological Lead)"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Department / Directorate:
                          </label>
                          <input
                            type="text"
                            value={adminDept}
                            onChange={(e) => setAdminDept(e.target.value)}
                            placeholder="Department of Animal Husbandry & Dairying (DAHD)"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            State Headquarters / Jurisdiction:
                          </label>
                          <input
                            type="text"
                            value={adminHQ}
                            onChange={(e) => setAdminHQ(e.target.value)}
                            placeholder="Gujarat State Command Center, Gandhinagar"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Government Email (.gov.in / .nic.in):
                          </label>
                          <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="epidemiology.hq@dahd.nic.in"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Secure Access Password:
                          </label>
                          <input
                            type="password"
                            defaultValue="••••••••"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={handleAdminSignUp}
                          disabled={isLoading}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <Building2 className="w-4 h-4 text-blue-300" />
                          <span>{isLoading ? "Verifying Official ID..." : "Register Official ID & Enter Command Center →"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoLogin("admin")}
                          className="py-3 px-4 rounded-xl bg-blue-100 text-blue-950 hover:bg-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-300 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                          <span>⚡ 1-Click Demo Sign Up & Enter</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== SIGN IN MODE ==================== */}
              {authMode === "login" && (
                <div>
                  {/* VET LOGIN VIEW */}
                  {selectedRole === "vet" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-emerald-700" />
                          Veterinary Officer Clinical Queue Authentication
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">VCI / DAHD Portal</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Official DAHD Email / ID:
                          </label>
                          <input
                            type="email"
                            value={vetEmail}
                            onChange={(e) => setVetEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            VCI Registration Number:
                          </label>
                          <input
                            type="text"
                            value={vciNumber}
                            onChange={(e) => setVciNumber(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Doctor Name:
                          </label>
                          <input
                            type="text"
                            value={vetName}
                            onChange={(e) => setVetName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Password:
                          </label>
                          <input
                            type="password"
                            value={vetPassword}
                            onChange={(e) => setVetPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={handleVetLogin}
                          disabled={isLoading}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span>{isLoading ? "Authenticating..." : "Sign In & Move to Clinical Queue →"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoLogin("vet")}
                          className="py-3 px-4 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-300"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span>⚡ 1-Click Direct Vet Login</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FARMER LOGIN VIEW */}
                  {selectedRole === "farmer" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-emerald-700" />
                          {isHi ? "किसान मोबाइल एवं OTP प्रमाणीकरण" : "Farmer Mobile OTP Sign In"}
                        </span>
                        <span className="text-[11px] text-stone-500 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">SMS / IVR Call</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "मोबाइल नंबर:" : "Mobile Phone Number:"}
                          </label>
                          <input
                            type="tel"
                            value={farmerPhone}
                            onChange={(e) => setFarmerPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="+91 98251 44102"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "किसान का नाम:" : "Farmer Name:"}
                          </label>
                          <input
                            type="text"
                            value={farmerName}
                            onChange={(e) => setFarmerName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {isHi ? "गांव एवं जिला:" : "Village & District:"}
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={farmerVillage}
                              onChange={(e) => setFarmerVillage(e.target.value)}
                              className="w-1/2 px-2 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              placeholder="Mogri"
                            />
                            <input
                              type="text"
                              value={farmerDistrict}
                              onChange={(e) => setFarmerDistrict(e.target.value)}
                              className="w-1/2 px-2 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              placeholder="Anand"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DPDP Consent */}
                      <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="farmerConsent"
                          checked={consented}
                          onChange={(e) => setConsented(e.target.checked)}
                          className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="farmerConsent" className="text-[11px] text-stone-600 leading-snug cursor-pointer">
                          <strong>DPDP Act 2023 Consent:</strong> I consent to sharing livestock symptoms, photos, and location coordinates with authorized veterinarians and disease surveillance authorities for animal healthcare and outbreak prevention.
                        </label>
                      </div>

                      {/* OTP Send / Verify */}
                      {!otpSent ? (
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{isLoading ? "Sending OTP..." : "Send Verification OTP (SMS)"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDemoLogin("farmer")}
                            className="py-3 px-4 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-300"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            <span>⚡ 1-Click Direct Farmer Sign In</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={farmerOtp}
                              onChange={(e) => setFarmerOtp(e.target.value)}
                              placeholder="Enter 6-digit OTP (demo: 849201)"
                              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono tracking-widest text-center font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              maxLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setFarmerOtp("849201")}
                              className="px-3 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-300"
                            >
                              Auto-fill
                            </button>
                            <button
                              type="button"
                              onClick={handleVerifyFarmerOtp}
                              disabled={isLoading}
                              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              {isLoading ? "Verifying..." : "Verify & Move to Dashboard →"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADMIN LOGIN VIEW */}
                  {selectedRole === "admin" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-700" />
                          State Health Official & Outbreak Command Center Sign In
                        </span>
                        <span className="text-[11px] text-stone-500 font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">DAHD / NIC</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Official Govt Email:
                          </label>
                          <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Designation / Name:
                          </label>
                          <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={handleAdminLogin}
                          disabled={isLoading}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>{isLoading ? "Authenticating..." : "Access Outbreak Command Center →"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoLogin("admin")}
                          className="py-3 px-4 rounded-xl bg-blue-100 text-blue-900 hover:bg-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-300"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                          <span>⚡ 1-Click Direct Admin Sign In</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Flow Guidance */}
            <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-300/80 text-stone-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Strict Role-Based Isolation:</strong> Each portal directs users exclusively to their designated dashboard. A farmer cannot view veterinary or government command screens, and vice versa. To switch roles, click <em>"Sign Out / Switch Portal"</em> in the header.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-500 py-4 border-t border-stone-200 bg-white">
        PashuRaksha AI • Department of Animal Husbandry & Dairying (DAHD) & ICAR-IVRI Collaboration
      </footer>
    </div>
  );
};
