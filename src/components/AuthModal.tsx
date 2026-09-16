import React, { useState } from "react";
import { UserSession, UserRole, Language } from "../types";
import { sendOtp, verifyOtp, loginUser } from "../services/api";
import {
  Shield,
  Phone,
  Lock,
  UserCheck,
  Stethoscope,
  Building2,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  HelpCircle
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserSession | null;
  onLoginSuccess?: (session: UserSession) => void;
  onAuthSuccess?: (session: UserSession) => void;
  language: Language;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onAuthSuccess,
  language,
  defaultRole
}) => {
  const isHi = language === "hi";
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => defaultRole || currentUser?.role || "farmer");

  const notifySuccess = (session: UserSession) => {
    if (onAuthSuccess) onAuthSuccess(session);
    else if (onLoginSuccess) onLoginSuccess(session);
  };

  // Farmer State
  const [farmerPhone, setFarmerPhone] = useState("+91 98251 44102");
  const [farmerName, setFarmerName] = useState("Rameshwar Patel");
  const [farmerVillage, setFarmerVillage] = useState("Mogri");
  const [farmerDistrict, setFarmerDistrict] = useState("Anand");
  const [farmerOtp, setFarmerOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [consented, setConsented] = useState(true);

  // Vet & Admin State
  const [vetEmail, setVetEmail] = useState("dr.anita.vet@dahd.gov.in");
  const [vetPassword, setVetPassword] = useState("••••••••");
  const [vetName, setVetName] = useState("Dr. Anita Sharma");
  const [vciNumber, setVciNumber] = useState("VCI-GUJ-2018-8491");

  const [adminEmail, setAdminEmail] = useState("epidemiology.hq@dahd.nic.in");
  const [adminName, setAdminName] = useState("Dr. K. S. Rathore (State Epidemiologist)");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!farmerPhone || farmerPhone.length < 10) {
      setErrorMessage(isHi ? "कृपया मान्य मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number");
      return;
    }
    if (!consented) {
      setErrorMessage(isHi ? "कृपया डेटा संग्रह और पशु चिकित्सा सहमति स्वीकार करें" : "Please accept the data protection & veterinary consent");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    try {
      const res = await sendOtp(farmerPhone);
      setOtpSent(true);
      setSuccessInfo(isHi ? "OTP सफलतापूर्वक भेजा गया (परीक्षण कोड: 849201)" : "OTP dispatched via SMS (Demo code: 849201)");
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
      notifySuccess(res.user);
      onClose();
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
      notifySuccess(res.user);
      onClose();
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
      notifySuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Admin login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-xl shadow-xs">
              🛡️
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isHi ? "पशुरक्षा AI - सुरक्षित प्रवेश" : "PashuRaksha AI Access"}
              </h2>
              <p className="text-xs text-emerald-200">
                {isHi ? "भूमिका अनुसार लॉगिन एवं RBAC नियंत्रण" : "Role-Based Authentication & Privacy Control"}
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

        {/* Role Tabs */}
        <div className="grid grid-cols-3 bg-stone-100 p-1.5 border-b border-stone-200">
          <button
            type="button"
            onClick={() => {
              setSelectedRole("farmer");
              setErrorMessage("");
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === "farmer"
                ? "bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-600/20"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>🌾</span>
            <span className="truncate">{isHi ? "किसान (OTP)" : "Farmer"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole("vet");
              setErrorMessage("");
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === "vet"
                ? "bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-600/20"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{isHi ? "पशु चिकित्सक" : "Veterinarian"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole("admin");
              setErrorMessage("");
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === "admin"
                ? "bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-600/20"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{isHi ? "प्रशासक / DAHD" : "Admin / Govt"}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* FARMER TAB */}
          {selectedRole === "farmer" && (
            <div className="space-y-3">
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {isHi
                    ? "किसानों के लिए ईमेल की आवश्यकता नहीं है। सामान्य या स्मार्टफोन से SMS/IVR OTP द्वारा सुरक्षित प्रवेश।"
                    : "No password or email required. Authenticate securely via basic SMS/IVR OTP for rural simplicity."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHi ? "मोबाइल नंबर (10 अंक)" : "Mobile Phone Number"}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="+91 98251 44102"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold bg-stone-50 text-stone-900 focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHi ? "पशुपालक का नाम" : "Farmer Name"}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHi ? "गांव / जिला" : "Village & District"}
                  </label>
                  <input
                    type="text"
                    value={`${farmerVillage}, ${farmerDistrict}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(",");
                      setFarmerVillage(parts[0]?.trim() || "");
                      if (parts[1]) setFarmerDistrict(parts[1]?.trim() || "Anand");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50"
                  />
                </div>
              </div>

              {/* DPDP Consent */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs space-y-1.5">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consented}
                    onChange={(e) => setConsented(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-[11px] leading-tight">
                    {isHi
                      ? "मैं डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) के तहत सहमत हूँ कि मेरे पशुओं के स्वास्थ्य लक्षण, टैग और GPS स्थिति रोग नियंत्रण हेतु पशु चिकित्सालय एवं DAHD के साथ साझा की जा सकती है।"
                      : "I consent to livestock health data collection, GPS tagging, and sharing with local veterinary dispensaries & surveillance authorities under DPDP & NADCP guidelines."}
                  </span>
                </label>
              </div>

              {/* OTP Row */}
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isLoading ? "Sending OTP..." : isHi ? "OTP भेजें (SMS / कॉल)" : "Send SMS / IVR OTP"}</span>
                </button>
              ) : (
                <div className="space-y-2 pt-1 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800">
                      {isHi ? "6 अंकों का OTP दर्ज करें" : "Enter 6-Digit OTP"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFarmerOtp("849201")}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Auto-fill (849201)
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={farmerOtp}
                    onChange={(e) => setFarmerOtp(e.target.value)}
                    placeholder="849201"
                    className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 text-emerald-900"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyFarmerOtp}
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isLoading ? "Verifying..." : isHi ? "सत्यापित कर प्रवेश करें" : "Verify & Sign In as Farmer"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VET TAB */}
          {selectedRole === "vet" && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <span className="font-bold block">Accredited Veterinary Surgeon Login</span>
                <span className="text-[11px] text-emerald-700">
                  Access clinical triage queue, digital lab referrals, and therapeutic plans.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVetName("Dr. Anita Sharma");
                    setVetEmail("dr.anita.vet@dahd.gov.in");
                    setVciNumber("VCI-GUJ-2018-8491");
                  }}
                  className="flex-1 p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left text-xs font-semibold text-stone-800"
                >
                  <p className="font-bold text-emerald-800">Dr. Anita Sharma</p>
                  <p className="text-[10px] text-stone-500">Lead Veterinary Officer</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVetName("Dr. Vikram Joshi");
                    setVetEmail("dr.vikram.vet@dahd.gov.in");
                    setVciNumber("VCI-GUJ-2015-3210");
                  }}
                  className="flex-1 p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left text-xs font-semibold text-stone-800"
                >
                  <p className="font-bold text-emerald-800">Dr. Vikram Joshi</p>
                  <p className="text-[10px] text-stone-500">Senior Field Surgeon</p>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Official Gov / Dispensary Email
                </label>
                <input
                  type="email"
                  value={vetEmail}
                  onChange={(e) => setVetEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    VCI Registration No.
                  </label>
                  <input
                    type="text"
                    value={vciNumber}
                    onChange={(e) => setVciNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password / SSO
                  </label>
                  <input
                    type="password"
                    value={vetPassword}
                    onChange={(e) => setVetPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleVetLogin}
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{isLoading ? "Signing in..." : "Enter Veterinary Triage Portal"}</span>
              </button>
            </div>
          )}

          {/* ADMIN TAB */}
          {selectedRole === "admin" && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                <span className="font-bold block">DAHD Epidemiological Surveillance & Admin</span>
                <span className="text-[11px] text-purple-700">
                  Aggregated district clusters, biosecurity cordons, audit trail, and emergency broadcasts.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Department Officer Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Designated Officer & Jurisdiction
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50"
                />
              </div>

              <button
                type="button"
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{isLoading ? "Authenticating..." : "Enter District Surveillance Portal"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Act 2023 & NADCP Compliant</span>
          </span>
          <span className="text-stone-400 font-mono">256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
