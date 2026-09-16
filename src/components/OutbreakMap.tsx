import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { CaseReport, OutbreakCluster, Language, TRANSLATIONS } from "../types";
import {
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Filter,
  Layers,
  Info,
  Maximize2,
  Calendar,
  Building2
} from "lucide-react";

interface OutbreakMapProps {
  cases: CaseReport[];
  clusters: OutbreakCluster[];
  lang: Language;
}

export const OutbreakMap: React.FC<OutbreakMapProps> = ({
  cases,
  clusters,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedDisease, setSelectedDisease] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedCluster, setSelectedCluster] = useState<OutbreakCluster | null>(null);

  // Distinct lists for dropdown
  const diseases = Array.from(new Set(cases.map((c) => c.aiAnalysis.suspectedDisease.split("(")[0].trim())));
  const districts = Array.from(new Set(cases.map((c) => c.district)));

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered around India's rural dairy heartland (Gujarat / Central-North India)
      const map = L.map(mapContainerRef.current, {
        center: [23.5, 75.5],
        zoom: 6,
        scrollWheelZoom: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Clusters
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Cluster Rings
    clusters.forEach((cluster) => {
      if (selectedDisease !== "all" && !cluster.disease.toLowerCase().includes(selectedDisease.toLowerCase())) {
        return;
      }
      if (selectedDistrict !== "all" && cluster.district !== selectedDistrict) {
        return;
      }

      const isHigh = cluster.riskLevel === "High";
      const isMedium = cluster.riskLevel === "Medium";
      const color = isHigh ? "#e11d48" : isMedium ? "#d97706" : "#059669";

      // Draw perimeter circle
      const circle = L.circle([cluster.centerLat, cluster.centerLng], {
        radius: cluster.radiusKm * 1000,
        color,
        fillColor: color,
        fillOpacity: isHigh ? 0.18 : 0.1,
        weight: isHigh ? 2.5 : 1.5,
        dashArray: isHigh ? "6, 4" : undefined
      }).addTo(layerGroup);

      circle.bindTooltip(
        `<b>${cluster.disease} Cluster</b><br/>${cluster.caseCount} reports in ${cluster.district}<br/>Status: ${cluster.status}`,
        { sticky: true }
      );

      circle.on("click", () => {
        setSelectedCluster(cluster);
        map.setView([cluster.centerLat, cluster.centerLng], 10);
      });
    });

    // 2. Render Individual Case Markers
    const bounds: L.LatLngExpression[] = [];

    cases.forEach((c) => {
      if (selectedDisease !== "all" && !c.aiAnalysis.suspectedDisease.toLowerCase().includes(selectedDisease.toLowerCase())) {
        return;
      }
      if (selectedDistrict !== "all" && c.district !== selectedDistrict) {
        return;
      }

      const isHigh = c.aiAnalysis.riskLevel === "High";
      const isMed = c.aiAnalysis.riskLevel === "Medium";
      const markerColor = isHigh ? "#dc2626" : isMed ? "#d97706" : "#059669";

      const marker = L.circleMarker([c.latitude, c.longitude], {
        radius: isHigh ? 9 : 7,
        fillColor: markerColor,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      }).addTo(layerGroup);

      bounds.push([c.latitude, c.longitude]);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #111827;">${c.tagId} (${c.species})</strong>
            <span style="background: ${isHigh ? "#fee2e2" : isMed ? "#fef3c7" : "#d1fae5"}; color: ${isHigh ? "#b91c1c" : isMed ? "#92400e" : "#065f46"}; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px;">
              ${c.aiAnalysis.riskLevel} (${c.aiAnalysis.riskScore}%)
            </span>
          </div>
          <p style="margin: 2px 0; color: #374151;"><strong>Disease:</strong> ${c.aiAnalysis.suspectedDisease}</p>
          <p style="margin: 2px 0; color: #4b5563;"><strong>Location:</strong> ${c.village}, ${c.district}</p>
          <p style="margin: 2px 0; color: #4b5563;"><strong>Temp:</strong> ${c.bodyTemperatureF}°F | <strong>Status:</strong> ${c.vetStatus}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Farmer: ${c.farmerName} (${c.farmerPhone})</p>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Fit bounds if available
    if (bounds.length > 0 && map) {
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 11 });
      } catch (err) {
        console.warn("fitBounds failed:", err);
      }
    }
  }, [cases, clusters, selectedDisease, selectedDistrict]);

  const activeHighClusters = clusters.filter((c) => c.riskLevel === "High");

  return (
    <div className="space-y-6">
      {/* Top Controls & Surveillance Header */}
      <div className="bg-gradient-to-br from-[#062419] via-[#041c13] to-[#02110c] text-white rounded-3xl p-6 sm:p-7 border border-emerald-800/60 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Spatial Epidemiological GIS Radar</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span>{clusters.length} Outbreak Clusters</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-display text-white">
              {t.outbreakMap}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/85 max-w-2xl leading-relaxed">
              Automated spatial clustering algorithm groups clinical symptom reports within 15km radii to detect emerging contagions before cross-district spread.
            </p>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
              <Filter className="w-3.5 h-3.5 text-emerald-300" />
              <select
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="bg-transparent font-bold text-white text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="text-stone-900">All Diseases ({diseases.length})</option>
                {diseases.map((d) => (
                  <option key={d} value={d} className="text-stone-900">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent font-bold text-white text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="text-stone-900">All Districts ({districts.length})</option>
                {districts.map((dst) => (
                  <option key={dst} value={dst} className="text-stone-900">
                    {dst}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Cluster Alerts Bar */}
        {activeHighClusters.length > 0 && (
          <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-200 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-rose-100">{activeHighClusters.length} Active High-Risk Clusters:</strong>{" "}
                {activeHighClusters.map((c) => `${c.disease} in ${c.district} (${c.caseCount} cases)`).join(" • ")}
              </span>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs border border-rose-400">
              5km Ring Quarantine Active
            </span>
          </div>
        )}
      </div>

      {/* Map Display Card */}
      <div className="bg-white rounded-2xl p-2 sm:p-3 border border-stone-200 shadow-md relative">
        {/* Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          className="w-full h-[520px] rounded-xl overflow-hidden z-10"
        />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-stone-200 shadow-md text-xs space-y-1.5 max-w-xs pointer-events-auto">
          <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wider">
            Risk & Cluster Legend
          </span>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shadow-xs" />
            <span>High Risk Report (&gt;75%)</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs" />
            <span>Medium Risk Report (45-75%)</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs" />
            <span>Low Risk / Resolved</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700 pt-1 border-t border-stone-200">
            <span className="w-4 h-4 rounded-full border-2 border-rose-500 border-dashed bg-rose-500/20" />
            <span>Outbreak Cluster Buffer Zone</span>
          </div>
        </div>
      </div>

      {/* Clusters Detail Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              Identified Geographic Outbreak Hotspots
            </h3>
            <p className="text-xs text-stone-500">
              Generated via DBSCAN spatial-symptom distance clustering algorithms
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-stone-100 text-stone-700">
            {clusters.length} Active Zones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((c) => {
            const isHigh = c.riskLevel === "High";

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all ${
                  isHigh
                    ? "bg-rose-50/40 border-rose-200"
                    : "bg-stone-50/70 border-stone-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700">
                      {c.id}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 mt-1">
                      {c.disease}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isHigh
                        ? "bg-rose-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {c.riskLevel} Risk
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-stone-600">
                  <p className="flex items-center justify-between">
                    <span>District Center:</span>
                    <strong className="text-stone-900">{c.district}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Cluster Radius:</span>
                    <strong className="text-stone-900">{c.radiusKm} km</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Cases Connected:</span>
                    <strong className="text-stone-900">{c.caseCount} livestock reports</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Containment:</span>
                    <span className="font-bold text-rose-700">{c.status}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
