import React, { useState, useEffect } from "react";
import {
  UserRole,
  Language,
  CaseReport,
  AnimalRecord,
  OutbreakCluster,
  AlertNotification,
  UserSession,
  TRANSLATIONS
} from "./types";
import {
  fetchCases,
  fetchAnimals,
  fetchOutbreaks,
  fetchAlerts,
  getOfflineQueue,
  syncOfflineReports,
  checkServerHealth
} from "./services/api";
import { Header } from "./components/Header";
import { FarmerReportForm } from "./components/FarmerReportForm";
import { VetDashboard } from "./components/VetDashboard";
import { OutbreakMap } from "./components/OutbreakMap";
import { AnimalRecordsView } from "./components/AnimalRecordsView";
import { AdminDashboard } from "./components/AdminDashboard";
import { AlertsDrawer } from "./components/AlertsDrawer";
import { IVRVoiceModal } from "./components/IVRVoiceModal";
import { AuthModal } from "./components/AuthModal";
import { LoginRoleScreen } from "./components/LoginRoleScreen";
import { LivestockChatbot } from "./components/LivestockChatbot";
import {
  Tractor,
  Stethoscope,
  Building2,
  MapPin,
  ClipboardList,
  Flame,
  ShieldCheck,
  PhoneCall,
  RefreshCw,
  Bell,
  AlertCircle,
  MessageSquare
} from "lucide-react";

export default function App() {
  // Global App State
  const [currentRole, setCurrentRole] = useState<UserRole>("vet");
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("pashuraksha_lang") as Language;
      return saved && ["en", "hi", "gu", "pa", "mr", "bn", "te", "ta"].includes(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem("pashuraksha_lang", newLang);
    } catch {
      // ignore storage errors
    }
  };

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Data Collections
  const [cases, setCases] = useState<CaseReport[]>([]);
  const [animals, setAnimals] = useState<AnimalRecord[]>([]);
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  // Navigation Sub-tab per Role
  const [farmerTab, setFarmerTab] = useState<"report" | "map" | "records">("report");
  const [vetTab, setVetTab] = useState<"queue" | "map" | "records">("queue");
  const [adminTab, setAdminTab] = useState<"analytics" | "map" | "records">("map");

  // User Authentication State
  // When opened, the application first displays the Sign Up page, then moves to the next page upon signup/auth.
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isIVROpen, setIsIVROpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Update page title and hash according to authenticated role
  useEffect(() => {
    if (!currentUser) {
      document.title = "PashuRaksha AI - Dedicated Role Portals";
    } else if (currentUser.role === "farmer") {
      document.title = "PashuRaksha AI • Kisan Portal (Farmer)";
    } else if (currentUser.role === "vet") {
      document.title = "PashuRaksha AI • Veterinary Officer Portal (VCI)";
    } else if (currentUser.role === "admin") {
      document.title = "PashuRaksha AI • DAHD State Outbreak Command Center";
    }
  }, [currentUser]);

  const handleAuthSuccess = (session: UserSession) => {
    setCurrentUser(session);
    localStorage.setItem("pashuraksha_user", JSON.stringify(session));
    setCurrentRole(session.role);
    setIsAuthOpen(false);
    if (session.role === "farmer") setFarmerTab("report");
    if (session.role === "vet") setVetTab("queue");
    if (session.role === "admin") setAdminTab("analytics");
    if (typeof window !== "undefined") {
      window.location.hash = session.role;
    }
    const roleLabel = session.role === "farmer" ? "Farmer Portal" : session.role === "vet" ? "Veterinary Clinical Desk" : "State Health Command";
    showToast(`Authenticated: Welcome to the ${roleLabel}, ${session.name}`);
  };

  const handleLogout = () => {
    const prevRole = currentUser?.role;
    setCurrentUser(null);
    localStorage.removeItem("pashuraksha_user");
    if (typeof window !== "undefined" && prevRole) {
      window.location.hash = prevRole;
    }
    showToast(lang === "hi" ? "सफलतापूर्वक लॉगआउट। कृपया अपना पोर्टल चुनें।" : "Signed out. Please select your dedicated portal gateway to sign in.");
  };

  // Helper to show transient banner
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Check offline queue count
  const updatePendingCount = () => {
    const q = getOfflineQueue();
    setPendingSyncCount(q.length);
  };

  // Initial Data Load
  const loadAllData = async () => {
    const [fetchedCases, fetchedAnimals, fetchedOutbreaks, fetchedAlerts] = await Promise.all([
      fetchCases(),
      fetchAnimals(),
      fetchOutbreaks(),
      fetchAlerts()
    ]);

    setCases(fetchedCases);
    setAnimals(fetchedAnimals);
    setClusters(fetchedOutbreaks.clusters || []);
    setAlerts(fetchedAlerts);
    updatePendingCount();
  };

  useEffect(() => {
    loadAllData();

    // Listen for online / offline events
    const handleOnline = async () => {
      setIsOnline(true);
      showToast("Online connectivity restored! Checking for unsynced reports...");
      const res = await syncOfflineReports();
      if (res.syncedCount > 0) {
        showToast(`Successfully synced ${res.syncedCount} offline reports with central veterinary database.`);
        loadAllData();
      }
      updatePendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast("Network disconnected. Offline-first mode active. Reports will be saved locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic check
    const interval = setInterval(async () => {
      const alive = await checkServerHealth();
      setIsOnline(alive);
      updatePendingCount();
    }, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Manual Trigger Sync
  const handleTriggerSync = async () => {
    showToast("Synchronizing offline queue with server...");
    const res = await syncOfflineReports();
    updatePendingCount();
    await loadAllData();
    showToast(`Sync complete! ${res.syncedCount} records processed.`);
  };

  // Handle New Case from Farmer Report
  const handleReportSubmitted = async (newCase: CaseReport, isOffline: boolean) => {
    setCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
    updatePendingCount();

    if (isOffline) {
      showToast("Case saved to device offline queue! Will auto-sync once internet connects.");
    } else {
      showToast(`Case ${newCase.id} successfully uploaded and assigned to ${newCase.district} veterinary dispensary.`);
      // Refresh clusters, alerts and animal history
      const out = await fetchOutbreaks();
      setClusters(out.clusters || []);
      const alt = await fetchAlerts();
      setAlerts(alt);
      const freshAnimals = await fetchAnimals();
      setAnimals(freshAnimals);
    }
  };

  const handleAnimalUpdated = (updated: AnimalRecord) => {
    setAnimals((prev) =>
      prev.map((a) => (a.id === updated.id || a.tagId === updated.tagId ? updated : a))
    );
  };

  // Handle IVR Voice Case Created
  const handleIVRCaseCreated = async (newCase: CaseReport) => {
    setCases((prev) => [newCase, ...prev]);
    showToast(`IVR Voice Report ${newCase.id} ingested into triage queue!`);
    const out = await fetchOutbreaks();
    setClusters(out.clusters || []);
    const alt = await fetchAlerts();
    setAlerts(alt);
  };

  // Handle Vet updating case
  const handleCaseUpdated = (updated: CaseReport) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`Case ${updated.id} clinical records updated successfully.`);
  };

  // Handle Admin broadcast
  const handleBroadcastAlert = async (alertData: {
    title: string;
    message: string;
    district: string;
    riskLevel: "Low" | "Medium" | "High";
  }) => {
    const newAlert: AlertNotification = {
      id: `ALT-BC-${Date.now().toString().slice(-4)}`,
      title: alertData.title,
      message: alertData.message,
      riskLevel: alertData.riskLevel,
      targetAudience: "all",
      district: alertData.district,
      timestamp: new Date().toISOString(),
      read: false
    };

    setAlerts((prev) => [newAlert, ...prev]);
    showToast(`Advisory published to ${alertData.district} district field stations!`);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  if (!currentUser) {
    return (
      <LoginRoleScreen
        onLoginSuccess={handleAuthSuccess}
        language={lang}
        onLanguageChange={handleLangChange}
      />
    );
  }

  // Active Role is strictly governed by the authenticated user session
  const activeRole: UserRole = currentUser.role;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col selection:bg-emerald-200">
      {/* Universal App Header */}
      <Header
        currentRole={activeRole}
        onRoleChange={setCurrentRole}
        lang={lang}
        onLangChange={handleLangChange}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={handleTriggerSync}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenIVR={() => setIsIVROpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-gradient-to-r from-emerald-950 via-[#073827] to-[#04281c] text-emerald-100 px-4 py-2.5 text-xs sm:text-sm font-medium border-b border-emerald-700/80 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="max-w-7xl mx-auto flex items-center gap-2 w-full justify-between">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-emerald-100">{toastMessage}</span>
            </span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-300 hover:text-white text-xs font-bold px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors"
            >
              Dismiss ✕
            </button>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs based on Active Role */}
      <div className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs sticky top-[104px] z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
          {/* Farmer Sub-tabs */}
          {activeRole === "farmer" && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                onClick={() => setFarmerTab("report")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  farmerTab === "report"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.reportCase}</span>
              </button>

              <button
                onClick={() => setFarmerTab("map")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  farmerTab === "map"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.outbreakMap}</span>
                {clusters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold">
                    {clusters.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFarmerTab("records")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  farmerTab === "records"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <span className="text-sm">🐄</span>
                <span>{t.animalRecords}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono font-bold">
                  {animals.length}
                </span>
              </button>
            </div>
          )}

          {/* Veterinarian Sub-tabs */}
          {activeRole === "vet" && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                onClick={() => setVetTab("queue")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  vetTab === "queue"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                <span>{t.vetDashboard}</span>
                {cases.filter(c => c.urgencyLevel === "High" && c.vetStatus !== "Resolved").length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs animate-pulse">
                    {cases.filter(c => c.urgencyLevel === "High" && c.vetStatus !== "Resolved").length} Call-Outs
                  </span>
                )}
              </button>

              <button
                onClick={() => setVetTab("map")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  vetTab === "map"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.outbreakMap}</span>
                {clusters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold">
                    {clusters.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setVetTab("records")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  vetTab === "records"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <span className="text-sm">🐄</span>
                <span>{t.animalRecords}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono font-bold">
                  {animals.length}
                </span>
              </button>
            </div>
          )}

          {/* Admin Sub-tabs */}
          {activeRole === "admin" && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                onClick={() => setAdminTab("map")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  adminTab === "map"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.outbreakMap}</span>
                {clusters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {clusters.length} Clusters
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminTab("analytics")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  adminTab === "analytics"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.govtAnalytics}</span>
              </button>

              <button
                onClick={() => setAdminTab("records")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                  adminTab === "records"
                    ? "bg-emerald-800 text-white shadow-emerald-950/20 shadow-md ring-1 ring-emerald-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <span className="text-sm">🐄</span>
                <span>{t.animalRecords}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono font-bold">
                  {animals.length}
                </span>
              </button>
            </div>
          )}

          <div className="text-xs text-stone-600 font-semibold hidden md:flex items-center gap-2 bg-stone-100/80 px-3 py-1 rounded-xl border border-stone-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-stone-700">Radar Active: Anand • Karnal • Ahmednagar • Bikaner</span>
          </div>
        </div>
      </div>

      {/* Main App Content Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex-1 w-full">
        {/* FARMER VIEWS */}
        {activeRole === "farmer" && (
          <>
            {farmerTab === "report" && (
              <FarmerReportForm
                lang={lang}
                animals={animals}
                isOnline={isOnline}
                onReportSubmitted={handleReportSubmitted}
                onOpenIVR={() => setIsIVROpen(true)}
                onOpenChatbot={() => setIsChatbotOpen(true)}
                farmerPhoneProp={currentUser?.phone}
                farmerNameProp={currentUser?.name}
                onAnimalUpdated={handleAnimalUpdated}
                existingCases={cases}
                clusters={clusters}
                onViewMap={() => setFarmerTab("map")}
                onViewAnimalHistory={() => setFarmerTab("records")}
                onContactVet={() => setIsIVROpen(true)}
              />
            )}
            {farmerTab === "map" && (
              <OutbreakMap cases={cases} clusters={clusters} lang={lang} />
            )}
            {farmerTab === "records" && (
              <AnimalRecordsView
                animals={animals}
                lang={lang}
                onAnimalAdded={(newAnm) => setAnimals((prev) => [...prev, newAnm])}
                onSelectForReporting={(anm) => {
                  setFarmerTab("report");
                }}
              />
            )}
          </>
        )}

        {/* VETERINARIAN VIEWS */}
        {activeRole === "vet" && (
          <>
            {vetTab === "queue" && (
              <VetDashboard
                cases={cases}
                lang={lang}
                onCaseUpdated={handleCaseUpdated}
              />
            )}
            {vetTab === "map" && (
              <OutbreakMap cases={cases} clusters={clusters} lang={lang} />
            )}
            {vetTab === "records" && (
              <AnimalRecordsView
                animals={animals}
                lang={lang}
                onAnimalAdded={(newAnm) => setAnimals((prev) => [...prev, newAnm])}
                onSelectForReporting={() => setVetTab("queue")}
              />
            )}
          </>
        )}

        {/* ADMIN VIEWS */}
        {activeRole === "admin" && (
          <>
            {adminTab === "map" && (
              <OutbreakMap cases={cases} clusters={clusters} lang={lang} />
            )}
            {adminTab === "analytics" && (
              <AdminDashboard
                cases={cases}
                clusters={clusters}
                lang={lang}
                onBroadcastAlert={handleBroadcastAlert}
              />
            )}
            {adminTab === "records" && (
              <AnimalRecordsView
                animals={animals}
                lang={lang}
                onAnimalAdded={(newAnm) => setAnimals((prev) => [...prev, newAnm])}
                onSelectForReporting={() => setAdminTab("map")}
              />
            )}
          </>
        )}
      </main>

      {/* Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        lang={lang}
        onAlertMarkedRead={(id) => {
          setAlerts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, read: true } : a))
          );
        }}
      />

      {/* IVR Voice Simulation Dialog */}
      <IVRVoiceModal
        isOpen={isIVROpen}
        onClose={() => setIsIVROpen(false)}
        lang={lang}
        onCaseCreated={handleIVRCaseCreated}
      />

      {/* Role-Based Authentication & OTP Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        language={lang}
        defaultRole={currentRole}
      />

      {/* Floating 24x7 Pashu Mitra AI Chatbot Launcher */}
      {!isChatbotOpen && (
        <button
          type="button"
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-40 group flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-2xl border-2 border-emerald-400/50 hover:scale-105 active:scale-95 transition-all duration-200"
          title={lang === "hi" ? "पशु स्वास्थ्य शंका समाधान (पशु मित्र)" : "Ask Any Animal Health Doubt (Pashu Mitra AI)"}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <MessageSquare className="w-4 h-4 text-emerald-200" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-emerald-900 animate-pulse" />
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                {lang === "hi" ? "शंका पूछें" : "Pashu Mitra AI"}
              </span>
              <span className="px-1.5 py-0.5 bg-amber-400 text-stone-900 text-[9px] font-black rounded-full uppercase tracking-wider">
                {lang === "hi" ? "24x7 AI" : "Chatbot"}
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/90 hidden sm:block">
              {lang === "hi" ? "पशु रोग व स्वास्थ्य सलाहकार" : "Livestock Doubts & Advice"}
            </p>
          </div>
        </button>
      )}

      {/* Pashu Mitra AI Chatbot Window */}
      <LivestockChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        lang={lang}
        onLangChange={handleLangChange}
        userRole={currentRole}
        onNavigateTab={(tab) => {
          if (currentRole === "farmer") setFarmerTab(tab);
          else if (currentRole === "vet") setVetTab(tab as any);
          else setAdminTab(tab as any);
        }}
        onOpenIVR={() => setIsIVROpen(true)}
      />

      {/* Rural India Livestock Platform Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">PashuRaksha AI</span>
            <span>•</span>
            <span>National Livestock Disease Early Outbreak Warning System</span>
          </div>
          <div className="flex items-center gap-4 text-stone-600">
            <span>Integrated with INAPH Tagging</span>
            <span>•</span>
            <span>IVRI / CADRAD Protocol</span>
            <span>•</span>
            <span>Offline-First PWA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
