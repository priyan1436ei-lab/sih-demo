import React, { useState } from "react";
import { AlertNotification, Language, TRANSLATIONS } from "../types";
import { markAlertRead } from "../services/api";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Info,
  MapPin,
  Clock,
  Filter
} from "lucide-react";

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertNotification[];
  lang: Language;
  onAlertMarkedRead: (id: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  lang,
  onAlertMarkedRead
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [filterAudience, setFilterAudience] = useState<string>("all");

  if (!isOpen) return null;

  const filtered = alerts.filter((a) => {
    if (filterAudience === "all") return true;
    return a.targetAudience === filterAudience || a.targetAudience === "all";
  });

  const handleRead = async (id: string) => {
    await markAlertRead(id);
    onAlertMarkedRead(id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">{t.alerts}</h3>
              <p className="text-xs text-emerald-200">
                Early Disease Warnings & Official Advisories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audience Filter Tabs */}
        <div className="p-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-semibold">Filter Audience:</span>
          <div className="flex items-center gap-1">
            {(["all", "farmers", "vets", "officials"] as const).map((aud) => (
              <button
                key={aud}
                onClick={() => setFilterAudience(aud)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors capitalize ${
                  filterAudience === aud
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {aud}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((alert) => {
            const isHigh = alert.riskLevel === "High";
            const isMedium = alert.riskLevel === "Medium";

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  alert.read
                    ? "bg-stone-50 border-stone-200 opacity-80"
                    : isHigh
                    ? "bg-rose-50/80 border-rose-300 shadow-xs"
                    : "bg-amber-50/80 border-amber-300 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isHigh ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : isMedium ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug">
                      {alert.title}
                    </h4>
                  </div>

                  {!alert.read && (
                    <button
                      onClick={() => handleRead(alert.id)}
                      className="text-[10px] font-semibold text-emerald-800 hover:underline shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>

                <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-3 pt-2 border-t border-stone-200/50">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {alert.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-stone-400 text-xs">
              No notifications for this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
