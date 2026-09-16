import React from "react";
import { UserRole, Language, TRANSLATIONS, AlertNotification, UserSession } from "../types";
import { SUPPORTED_LANGUAGES } from "../data/translations";
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Bell,
  PhoneCall,
  RefreshCw,
  Stethoscope,
  Building2,
  Tractor,
  Languages,
  User,
  LogOut,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Globe
} from "lucide-react";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onTriggerSync: () => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenIVR: () => void;
  onOpenChatbot?: () => void;
  currentUser?: UserSession | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  lang,
  onLangChange,
  isOnline,
  pendingSyncCount,
  onTriggerSync,
  unreadAlertsCount,
  onOpenAlerts,
  onOpenIVR,
  onOpenChatbot,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-[#073827] to-[#04281c] text-white shadow-lg border-b border-emerald-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Brand & Tagline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-950/40 transition-transform group-hover:scale-105">
                  <ShieldAlert className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 font-display">
                    {t.appName}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Surveillance
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 hidden sm:block font-medium tracking-wide">
                  {t.tagline} • <span className="text-emerald-300/90 font-mono">ICAR-IVRI & DAHD Network</span>
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 sm:hidden">
              {onOpenChatbot && (
                <button
                  onClick={onOpenChatbot}
                  className="px-2.5 py-1.5 rounded-xl bg-teal-500/20 text-teal-200 border border-teal-400/40 hover:bg-teal-500/30 flex items-center gap-1 text-xs font-bold"
                  title="Pashu Mitra Chatbot (Ask Doubt)"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-300" />
                  <span>पशु मित्र</span>
                </button>
              )}
              <button
                onClick={onOpenIVR}
                className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                title="IVR Voice Report"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAlerts}
                className="relative p-2 rounded-xl bg-emerald-900 text-emerald-100 border border-emerald-700 hover:bg-emerald-800"
                title="Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
              {/* Mobile Language Selector */}
              <div className="flex items-center rounded-xl bg-emerald-900/90 px-2 py-1 border border-emerald-700 text-emerald-100 text-xs">
                <Globe className="w-3.5 h-3.5 text-emerald-300 mr-1 shrink-0" />
                <select
                  value={lang}
                  onChange={(e) => onLangChange(e.target.value as Language)}
                  className="bg-transparent text-emerald-100 font-bold text-xs focus:outline-none cursor-pointer"
                  title="Select App Language"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-emerald-950 text-white">
                      {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Right Panel: Sync, Chatbot, IVR, Language, Alerts */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            {/* Ask Doubt / Pashu Mitra AI Chatbot */}
            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/25 to-emerald-500/25 hover:from-teal-500/35 hover:to-emerald-500/35 text-teal-100 border border-teal-400/40 transition-all font-bold shadow-xs hover:shadow-teal-950/30 hover:border-teal-300"
                title="Ask Any Animal Health Doubt"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
                <span>{lang === "hi" ? "शंका समाधान (पशु मित्र)" : "Ask Doubt (Pashu Mitra)"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Offline / Online indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/90 shadow-2xs font-mono text-[11px]">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Offline Sync</span>
                </span>
              )}
              {pendingSyncCount > 0 && (
                <button
                  onClick={onTriggerSync}
                  className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-500/40 hover:bg-amber-500/50 font-bold"
                  title="Click to sync offline reports"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{pendingSyncCount}</span>
                </button>
              )}
            </div>

            {/* IVR Quick Launcher */}
            <button
              onClick={onOpenIVR}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-200 border border-amber-400/30 hover:bg-amber-500/25 transition-all font-semibold shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>IVR 1800-PASHU</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenAlerts}
              className="relative hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-900/90 text-emerald-100 hover:bg-emerald-800 border border-emerald-700/80 transition-all shadow-2xs font-semibold"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.alerts}</span>
              {unreadAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Language Selector Dropdown with All 8 Indian Languages */}
            <div className="hidden sm:flex items-center rounded-xl bg-emerald-950/90 px-2.5 py-1.5 border border-emerald-700/80 shadow-inner">
              <Languages className="w-3.5 h-3.5 text-emerald-300 mr-1.5 shrink-0" />
              <select
                value={lang}
                onChange={(e) => onLangChange(e.target.value as Language)}
                className="bg-transparent text-emerald-100 font-bold text-xs focus:outline-none cursor-pointer pr-1"
                title="Select App Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-emerald-950 text-white font-medium">
                    {l.nativeName} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-emerald-800/80">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-700 transition-colors text-xs font-semibold shadow-2xs"
                  title="Switch Role or Account"
                >
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="max-w-[120px] truncate font-medium">{currentUser.name}</span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1.5 rounded-xl text-emerald-300 hover:text-rose-300 hover:bg-emerald-800/80 border border-transparent hover:border-emerald-700 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "लॉगिन (OTP)" : "Sign In (OTP)"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Authenticated Portal & User Identity Bar (Strict Role-Gated) */}
        <div className="mt-2.5 pt-2 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {currentRole === "farmer" && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/25 text-amber-200 border border-amber-400/40 text-xs font-bold shadow-xs">
                  <Tractor className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === "hi" ? "किसान पोर्टल (अधिकृत)" : "Farmer / Kisan Portal"}</span>
                </span>
                <span className="text-xs text-emerald-200/90 font-medium hidden sm:inline">
                  {currentUser?.name || "Rameshwar Patel"} {currentUser?.village ? `• ${currentUser.village}, ${currentUser.district}` : "• Anand, Gujarat"}
                </span>
              </div>
            )}

            {currentRole === "vet" && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/25 text-teal-200 border border-teal-400/40 text-xs font-bold shadow-xs">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                  <span>{lang === "hi" ? "पशु चिकित्सा अधिकारी पोर्टल" : "Veterinary Officer Portal (VCI)"}</span>
                </span>
                <span className="text-xs text-emerald-200/90 font-medium hidden sm:inline">
                  {currentUser?.name || "Dr. Vikram Joshi"} • <span className="font-mono text-teal-300 text-[11px]">{currentUser?.vciNumber || "VCI-GUJ-2018-8491"}</span>
                </span>
              </div>
            )}

            {currentRole === "admin" && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/25 text-blue-200 border border-blue-400/40 text-xs font-bold shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  <span>{lang === "hi" ? "राज्य निगरानी एवं नियंत्रण केंद्र" : "DAHD State Epidemiological Center"}</span>
                </span>
                <span className="text-xs text-emerald-200/90 font-medium hidden sm:inline">
                  {currentUser?.name || "Dr. K. S. Rathore"} • <span className="text-blue-300 text-[11px]">Directorate HQ</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-[11px] text-emerald-200/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {currentRole === "farmer" && "🌾 Isolated Farmer Access: Diagnosis & Health Records"}
              {currentRole === "vet" && "🩺 Isolated Vet Access: 1962 Call-Outs & Clinical Triage"}
              {currentRole === "admin" && "🗺️ Isolated Official Access: Outbreak Radar & Advisory"}
            </span>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-bold transition-all shadow-xs"
                title="Sign out of this portal to switch users"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>{lang === "hi" ? "लॉगआउट / पोर्टल बदलें" : "Sign Out / Switch Portal"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
