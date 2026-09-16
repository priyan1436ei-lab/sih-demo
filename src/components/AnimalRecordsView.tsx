import React, { useState } from "react";
import { AnimalRecord, Language, TRANSLATIONS } from "../types";
import { createAnimal } from "../services/api";
import {
  QrCode,
  Plus,
  Search,
  Calendar,
  Syringe,
  ShieldCheck,
  FileClock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  X,
  AlertCircle
} from "lucide-react";

interface AnimalRecordsViewProps {
  animals: AnimalRecord[];
  lang: Language;
  onAnimalAdded: (newAnimal: AnimalRecord) => void;
  onSelectForReporting: (animal: AnimalRecord) => void;
}

export const AnimalRecordsView: React.FC<AnimalRecordsViewProps> = ({
  animals,
  lang,
  onAnimalAdded,
  onSelectForReporting
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalRecord | null>(animals[0] || null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Animal Form
  const [tagId, setTagId] = useState<string>(`IN-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [name, setName] = useState<string>("");
  const [species, setSpecies] = useState<AnimalRecord["species"]>("Cow");
  const [breed, setBreed] = useState<string>("Sahiwal");
  const [ageYears, setAgeYears] = useState<number>(3);
  const [gender, setGender] = useState<"Female" | "Male">("Female");
  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerPhone, setOwnerPhone] = useState<string>("+91 ");
  const [village, setVillage] = useState<string>("");
  const [district, setDistrict] = useState<string>("Anand");
  const [state, setState] = useState<string>("Gujarat");

  const filtered = animals.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.tagId.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.ownerName.toLowerCase().includes(q) ||
      a.breed.toLowerCase().includes(q) ||
      a.village.toLowerCase().includes(q) ||
      a.district.toLowerCase().includes(q)
    );
  });

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerName) {
      alert("Please provide animal name and owner details.");
      return;
    }

    const created = await createAnimal({
      tagId,
      name,
      species,
      breed,
      ageYears,
      gender,
      ownerName,
      ownerPhone,
      village: village || "Rural Block",
      district: district || "Anand",
      state: state || "Gujarat",
      photoUrl:
        species === "Cow"
          ? "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
          : species === "Buffalo"
          ? "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"
          : "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=600&q=80",
      vaccinations: [
        { name: "FMD Vaccine (Raksha-Ovac)", date: "2026-03-01", nextDueDate: "2026-09-01" },
        { name: "Deworming (Albendazole)", date: "2026-06-15", nextDueDate: "2026-09-15" }
      ],
      history: [
        { date: new Date().toISOString().split("T")[0], event: "Initial Registration on PashuRaksha INAPH Database", status: "Healthy" }
      ]
    });

    if (created) {
      onAnimalAdded(created);
      setSelectedAnimal(created);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#062419] via-[#041c13] to-[#02110c] text-white rounded-3xl p-6 sm:p-7 border border-emerald-800/60 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5 text-emerald-300" />
              <span>National Livestock Digital ID (INAPH / Bharat Pashudhan)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
              <span>{animals.length} Verified Records</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-display text-white">
            {t.animalRecords}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/85 max-w-2xl leading-relaxed">
            Maintain complete electronic health profiles, 12-digit ear-tag records, mandatory FMD/Brucellosis vaccination history, and automated clinical case references.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all border border-emerald-400/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Animal</span>
        </button>
      </div>

      {/* Main Grid: List on Left, Selected Profile on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Animal List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 text-base">
              Registered Livestock Herd
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
              {filtered.length} Animals
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Tag ID, name, owner, breed, village..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filtered.map((animal) => {
              const isSelected = selectedAnimal?.id === animal.id;

              return (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => setSelectedAnimal(animal)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-xs"
                      : "border-stone-200 bg-stone-50/60 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900">
                        {animal.name} ({animal.species} • {animal.breed})
                      </span>
                      <p className="text-[11px] font-mono text-emerald-800 font-semibold mt-0.5">
                        Tag: {animal.tagId}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {animal.ageYears} yrs • {animal.gender}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-1 border-t border-stone-200/60">
                    <span className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-stone-400" />
                      {animal.ownerName} ({animal.village})
                    </span>
                    <span className="text-emerald-700 font-medium">
                      {animal.vaccinations.length} Vaccinations
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Animal Profile Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-5">
          {selectedAnimal ? (
            <>
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    {selectedAnimal.photoUrl ? (
                      <img
                        src={selectedAnimal.photoUrl}
                        alt={selectedAnimal.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-stone-400">
                        {selectedAnimal.species[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-stone-900">
                        {selectedAnimal.name}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                        {selectedAnimal.tagId}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {selectedAnimal.breed} {selectedAnimal.species} • {selectedAnimal.ageYears} Years Old • {selectedAnimal.gender}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectForReporting(selectedAnimal)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  Report Sickness for this Animal
                </button>
              </div>

              {/* Owner & Location Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 font-medium block">Owner / Farmer</span>
                  <strong className="text-sm text-stone-900 block mt-0.5">
                    {selectedAnimal.ownerName}
                  </strong>
                  <span className="text-stone-600 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    {selectedAnimal.ownerPhone}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 font-medium block">Location / Jurisdiction</span>
                  <strong className="text-sm text-stone-900 block mt-0.5">
                    {selectedAnimal.village}, {selectedAnimal.district}
                  </strong>
                  <span className="text-stone-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    State: {selectedAnimal.state}
                  </span>
                </div>
              </div>

              {/* Vaccination History Card */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Syringe className="w-4 h-4 text-emerald-600" />
                    Vaccination Schedule & History
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    National Livestock Health Schedule
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">Vaccine Name</th>
                        <th className="p-2.5">Administered Date</th>
                        <th className="p-2.5">Next Due Date</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedAnimal.vaccinations.map((v, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="p-2.5 font-bold text-stone-800">{v.name}</td>
                          <td className="p-2.5 text-stone-600">{v.date}</td>
                          <td className="p-2.5 font-medium text-stone-900">{v.nextDueDate}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Protected
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Medical Events & Episode Timeline */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <FileClock className="w-4 h-4 text-emerald-600" />
                  Clinical & Disease Episode History
                </h4>

                <div className="space-y-2">
                  {selectedAnimal.history.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-[11px] text-stone-400 block font-mono">
                          {h.date}
                        </span>
                        <span className="font-semibold text-stone-800 mt-0.5 block">
                          {h.event}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 text-[10px] font-bold">
                        {h.status}
                      </span>
                    </div>
                  ))}

                  {selectedAnimal.history.length === 0 && (
                    <p className="text-xs text-stone-400 italic">No past illness recorded.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-stone-400">
              Select an animal from the list to view full health records.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register New Animal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                Register New Livestock Animal
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnimal} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Animal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Laxmi"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Ear Tag (INAPH)
                  </label>
                  <input
                    type="text"
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Species
                  </label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as AnimalRecord["species"])}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300"
                  >
                    <option value="Cow">Cow</option>
                    <option value="Buffalo">Buffalo</option>
                    <option value="Goat">Goat</option>
                    <option value="Sheep">Sheep</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={ageYears}
                    onChange={(e) => setAgeYears(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Farmer / Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Farmer Name"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Owner Phone
                  </label>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village Name"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
              >
                Save Animal to Digital Herd
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
