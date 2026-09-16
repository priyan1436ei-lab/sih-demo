import { RiskAnalysis } from "../types";

export interface LivestockDiseaseInfo {
  id: string;
  name: string;
  shortCode: string;
  hindiName: string;
  pathogen: string;
  species: string[];
  category: "Viral" | "Bacterial" | "Protozoal/Vector" | "Metabolic" | "Parasitic";
  zoonotic: boolean;
  cardinalSymptoms: string[];
  pathognomonicSigns: string;
  tempRangeF: string;
  contagionRisk: "Severe" | "Moderate" | "Low";
  quarantineRequired: boolean;
  notifiableOIE: boolean;
  treatmentSummary: string;
  prevention: string;
  differentialDiagnoses: string[];
}

export const ALL_LIVESTOCK_DISEASES: LivestockDiseaseInfo[] = [
  {
    id: "lsd",
    name: "Lumpy Skin Disease (LSD)",
    shortCode: "LSD",
    hindiName: "गांठदार त्वचा रोग (लम्पी स्किन डिजीज)",
    pathogen: "Capripoxvirus (Lumpy skin disease virus)",
    species: ["Cow", "Buffalo", "Cattle"],
    category: "Viral",
    zoonotic: false,
    cardinalSymptoms: [
      "Circular firm skin nodules/lumps (2-5 cm across head, neck, perineum, udder)",
      "High biphasic fever (>103.5°F)",
      "Enlarged prescapular and precrural superficial lymph nodes",
      "Edema of legs, briskets, and dewlap",
      "Ocular and nasal mucous discharge"
    ],
    pathognomonicSigns: "Circumscribed flat-topped cutaneous nodules that turn necrotic ('sit-fasts') leaving deep round craters",
    tempRangeF: "103.5 - 106.0°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "Symptomatic and supportive: Antipyretics (Meloxicam/Paracetamol), broad-spectrum coverage for secondary bacterial infection, antiseptic topical dressing (potassium permanganate 1:1000 / neem oil) to deter vectors.",
    prevention: "Goat Pox homologous vaccine / Live attenuated LSD vaccine (ICAR-IVRI Lumpi-ProVacInd), strict vector fly/mosquito netting.",
    differentialDiagnoses: ["Pseudo-LSD (Bovine Herpesvirus 2)", "Bovine Papillomatosis (Warts)", "Dermatophilosis", "Insect bite hypersensitivity"]
  },
  {
    id: "fmd",
    name: "Foot and Mouth Disease (FMD)",
    shortCode: "FMD",
    hindiName: "खुरपका-मुंहपका रोग (एफ.एम.डी. / खुरहा)",
    pathogen: "Aphthovirus (Picornaviridae serotypes O, A, Asia-1)",
    species: ["Cow", "Buffalo", "Goat", "Sheep", "Pig", "Cattle"],
    category: "Viral",
    zoonotic: false,
    cardinalSymptoms: [
      "Profuse stringy ropy salivation and frothing at mouth",
      "Vesicles/blisters on tongue, dental pad, inner lips, gums",
      "Coronary band and interdigital cleft blisters causing severe painful lameness",
      "Sudden cessation of rumination and extreme drop in milk yield",
      "Characteristic smacking sound of lips"
    ],
    pathognomonicSigns: "Ruptured oral blisters with raw red erosions on dorsal surface of tongue, combined with interdigital ulcerations",
    tempRangeF: "104.0 - 106.5°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "Supportive mouth wash with 2% boric acid or 1% sodium carbonate. Hoof dressing with 1% potassium permanganate or copper sulfate solution. Antibiotic sprays on ruptured hoof sores to prevent maggot infestation (myiasis).",
    prevention: "Biannual FMD trivalent inactivated vaccine under National Animal Disease Control Programme (NADCP). Complete animal movement restrictions.",
    differentialDiagnoses: ["Vesicular Stomatitis", "Bovine Viral Diarrhea (Mucosal Disease)", "Rinderpest (eradicated)", "Malignant Catarrhal Fever"]
  },
  {
    id: "hs",
    name: "Hemorrhagic Septicemia (HS / Shipping Fever)",
    shortCode: "HS",
    hindiName: "गलघोंटू (गला सूजना / एच.एस.)",
    pathogen: "Pasteurella multocida (Serotypes B:2 and E:2)",
    species: ["Cow", "Buffalo", "Cattle"],
    category: "Bacterial",
    zoonotic: false,
    cardinalSymptoms: [
      "Sudden onset high fever (104-107°F)",
      "Hot, painful, tense inflammatory swelling around throat, submandibular area, and dewlap",
      "Stertorous (snoring/grunting) breathing with extended neck and tongue protrusion",
      "Severe respiratory distress and asphyxia",
      "Rapid progression to recumbency and death within 12 to 36 hours"
    ],
    pathognomonicSigns: "Acute hot submandibular/brisket inflammatory edema with loud asphyxiating inspiratory stridor",
    tempRangeF: "104.5 - 107.0°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "EMERGENCY: Immediate early intervention with parenteral antibiotics (Ceftiofur, Enrofloxacin, Oxytetracycline, or Sulfa drugs) and NSAIDs (Flunixin meglumine / Meloxicam). High mortality if delayed past 24 hours.",
    prevention: "Annual pre-monsoon alum-precipitated or oil-adjuvant HS bacterin vaccine.",
    differentialDiagnoses: ["Anthrax (sudden death)", "Black Quarter (muscle crepitus)", "Acute Bloat", "Foreign body reticuloperitonitis"]
  },
  {
    id: "bq",
    name: "Black Quarter (BQ / Quarter Evil)",
    shortCode: "BQ",
    hindiName: "लंगड़ा बुखार (ब्लैक क्वार्टर / चरचूरिया)",
    pathogen: "Clostridium chauvoei (Gram-positive spore-forming anaerobe)",
    species: ["Cow", "Buffalo", "Sheep", "Cattle"],
    category: "Bacterial",
    zoonotic: false,
    cardinalSymptoms: [
      "Acute severe lameness in one hind or fore limb",
      "Hot, tender swelling of heavy muscle masses (thigh, rump, shoulder)",
      "Crepitation (crackling paper sound and feel) upon palpating the muscle due to gas accumulation",
      "Skin over swelling turns dry, cold, dark, and painless as necrosis sets in",
      "High pyrexia (104-106°F) followed by hypothermia before death"
    ],
    pathognomonicSigns: "Crepitant subcutaneous emphysema over swollen thigh/shoulder with sweetish rancid-butter odor on incising dark spongy muscle",
    tempRangeF: "104.0 - 106.0°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "High-dose Procaine Penicillin or crystalline Penicillin-G locally and parenterally in early stage. Do NOT expose necrotic carcass to scavengers; deep burial with unslaked quicklime.",
    prevention: "Pre-monsoon formalised Black Quarter polyvalent bacterin vaccine in animals aged 6-24 months.",
    differentialDiagnoses: ["Malignant Edema (Clostridium septicum)", "Anthrax", "Fractures / Acute trauma", "Lightning strike"]
  },
  {
    id: "anthrax",
    name: "Anthrax (Splenic Fever / Woolsorter's Disease)",
    shortCode: "ANTHRAX",
    hindiName: "एंथ्रेक्स (प्लीहा ज्वर / जहरी बुखार)",
    pathogen: "Bacillus anthracis (Endospore-forming zoonotic rod)",
    species: ["Cow", "Buffalo", "Goat", "Sheep", "Horse", "Pig", "Camel"],
    category: "Bacterial",
    zoonotic: true,
    cardinalSymptoms: [
      "Sudden peracute collapse and death with few prior signs",
      "Dark, tarry, uncoagulated bloody discharges oozing from mouth, nostrils, rectum, and vulva",
      "Complete absence or rapid loss of rigor mortis (carcass remains flaccid)",
      "Rapid bloating and putrefaction of the carcass",
      "Extreme pyrexia (>106°F) and dyspnea immediately prior to collapse"
    ],
    pathognomonicSigns: "Dark, thick, tar-like non-clotting blood oozing from all natural body orifices with incomplete rigor mortis",
    tempRangeF: "105.0 - 108.0°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "DANGER - ZOONOTIC BIOHAZARD: NEVER perform post-mortem autopsy (spores form on air contact). Deep burial (6+ feet) covered with quicklime or incineration. In living contacts: immediate high-dose Penicillin G or Ciprofloxacin.",
    prevention: "Sterne 34F2 live spore vaccine in endemic areas. Strict biosecurity and carcass disinfection.",
    differentialDiagnoses: ["Peracute Lightning strike", "Snakebite", "Acute HS", "Hypomagnesemic tetany"]
  },
  {
    id: "mastitis",
    name: "Clinical Bovine Mastitis",
    shortCode: "MASTITIS",
    hindiName: "थनैला रोग (मैस्टाइटिस)",
    pathogen: "Staphylococcus aureus, Streptococcus agalactiae, Escherichia coli",
    species: ["Cow", "Buffalo", "Goat", "Sheep"],
    category: "Bacterial",
    zoonotic: false,
    cardinalSymptoms: [
      "Hard, swollen, hot, and painful udder quarter",
      "Abnormal milk containing visible clots, flakes, yellowish pus, or blood streaks",
      "Watery serum-like milk secretion instead of normal milk",
      "Severe localized discomfort when touched during milking attempts",
      "Systemic fever (in toxic coliform mastitis) and appetite loss"
    ],
    pathognomonicSigns: "Firm indurated udder quarter with visible clots/fibrin flakes and discolored brownish/watery secretion on strip cup test",
    tempRangeF: "102.5 - 105.0°F (Normal to Elevated)",
    contagionRisk: "Moderate",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "Frequent complete hand-stripping of infected quarter into disinfectant bucket. Intramammary antibiotic infusion (Cephalosporin/Amoxicillin-Clavulanate) combined with parenteral anti-inflammatory (Meloxicam) and systemic antibiotics.",
    prevention: "Post-milking teat dipping in 0.5% iodine solution, dry cow antibiotic therapy, keeping cows standing for 30 minutes after milking.",
    differentialDiagnoses: ["Physiological udder edema", "Udder abscess / hematoma", "Leptospirosis ('cold mastitis')", "Subclinical mastitis"]
  },
  {
    id: "babesiosis",
    name: "Bovine Babesiosis (Redwater Fever / Tick Fever)",
    shortCode: "BABESIA",
    hindiName: "बबेसिओसिस (लाल पेशाब / टिक बुखार)",
    pathogen: "Babesia bigemina, Babesia bovis (Intra-erythrocytic protozoa)",
    species: ["Cow", "Buffalo", "Cattle"],
    category: "Protozoal/Vector",
    zoonotic: false,
    cardinalSymptoms: [
      "Hemoglobinuria: Distinctive dark red to coffee-colored urine",
      "High persistent fever (104.5 - 107.0°F)",
      "Severe progressive anemia with pale to yellowish jaundiced conjunctiva",
      "Presence of heavy tick infestation (Rhipicephalus microplus on perineum/ears)",
      "Tachycardia, accelerated bounding pulse, and severe weakness"
    ],
    pathognomonicSigns: "Deep port-wine / dark red to black coffee urine accompanied by extreme pale/icteric mucous membranes and ticks",
    tempRangeF: "104.5 - 107.0°F",
    contagionRisk: "Moderate",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "Specific anti-protozoal therapy: Diminazene aceturate (Berenil) at 3.5-5 mg/kg IM OR Imidocarb dipropionate at 1.2 mg/kg SC. Blood transfusion for packed cell volume <12%. Hematinics and B-complex vitamins.",
    prevention: "Strategic acaricide dipping/spraying (Flumethrin, Deltamethrin, Amitraz) to break tick vector lifecycle.",
    differentialDiagnoses: ["Post-parturient Hemoglobinuria (P deficiency)", "Bacillary Hemoglobinuria", "Bovine Theileriosis (clear urine)", "Leptospirosis"]
  },
  {
    id: "theileriosis",
    name: "Bovine Theileriosis (East Coast Fever / Malignant Gallsickness)",
    shortCode: "THEILERIA",
    hindiName: "थाइलेरियासिस (गिल्टियां सूजना / टिक बुखार)",
    pathogen: "Theileria annulata (Tropical Theileriosis / Hyalomma tick vector)",
    species: ["Cow", "Buffalo", "Cattle"],
    category: "Protozoal/Vector",
    zoonotic: false,
    cardinalSymptoms: [
      "Dramatic enlargement of superficial lymph nodes (prescapular and precrural lymph nodes)",
      "High undulating fever (105-107°F)",
      "Petechial hemorrhages on conjunctiva and third eyelid",
      "Corneal opacity (bilateral cloudy bluish haze in eyes / 'turning sickness')",
      "Severe anemia, dyspnea with pulmonary edema, and prominent tick presence (Hyalomma)"
    ],
    pathognomonicSigns: "Massively swollen prescapular lymph nodes ('golf-ball size') with corneal cloudiness, high fever, and clear urine (no hemoglobinuria)",
    tempRangeF: "105.0 - 107.5°F",
    contagionRisk: "Moderate",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "Specific drug of choice: Buparvaquone (2.5 mg/kg body weight IM, repeated once after 48-72 hours if needed) combined with long-acting Oxytetracycline and furosemide for pulmonary edema.",
    prevention: "Theileriosis schizont cell-culture live vaccine (Rakshavac-T), regular acaricidal sprays against Hyalomma ticks.",
    differentialDiagnoses: ["Babesiosis (red urine present)", "Anaplasmosis", "Trypanosomiasis (Surra)", "Malignant Catarrhal Fever"]
  },
  {
    id: "anaplasmosis",
    name: "Bovine Anaplasmosis (Gall Sickness)",
    shortCode: "ANAPLASMA",
    hindiName: "एनाप्लाज्मोसिस (पीलिया / पित्त बुखार)",
    pathogen: "Anaplasma marginale (Intra-erythrocytic rickettsia)",
    species: ["Cow", "Buffalo", "Goat", "Sheep", "Cattle"],
    category: "Protozoal/Vector",
    zoonotic: false,
    cardinalSymptoms: [
      "Severe progressive anemia followed by deep golden-yellow jaundice (icterus) of mucous membranes",
      "High body temperature (103.5-105.5°F)",
      "Constipation with hard dry dung balls covered in thick mucus or bile",
      "Rapid dehydration, emaciation, and aggressive hypoxia behavior",
      "Clear, amber or normal urine color (NEVER red wine/coffee colored)"
    ],
    pathognomonicSigns: "Intense icterus/jaundice and severe anemia with mucus-coated hard constipation without hemoglobinuria",
    tempRangeF: "103.5 - 106.0°F",
    contagionRisk: "Moderate",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "Long-acting Oxytetracycline (20 mg/kg IM single dose, repeated in 72 hours) or Imidocarb dipropionate (3 mg/kg SC). Supportive iron supplements and liver tonics.",
    prevention: "Tick vector management, single-use disposable needles during vaccinations/injections to prevent iatrogenic mechanical transmission.",
    differentialDiagnoses: ["Babesiosis (has red urine)", "Theileriosis (enlarged lymph nodes)", "Copper poisoning", "Leptospirosis"]
  },
  {
    id: "brucellosis",
    name: "Bovine Brucellosis (Bang's Disease / Contagious Abortion)",
    shortCode: "BRUCELLA",
    hindiName: "ब्रुसेलोसिस (संक्रामक गर्भपात / बैंग्स डिजीज)",
    pathogen: "Brucella abortus (Zoonotic intracellular bacterium)",
    species: ["Cow", "Buffalo", "Goat", "Sheep", "Pig", "Cattle"],
    category: "Bacterial",
    zoonotic: true,
    cardinalSymptoms: [
      "Late-term abortion (between 6th to 8th month of gestation)",
      "Retained fetal membranes (placenta) followed by foul necrotic metritis",
      "Leather-like thick leathery cotyledons on aborted placenta",
      "Hygroma (swelling and fluid accumulation) in carpal/stifle knee joints",
      "Orchitis and epididymitis in breeding bulls resulting in sterility"
    ],
    pathognomonicSigns: "Third-trimester abortion storms in herd with retained necrotic leathery placenta and knee hygromas",
    tempRangeF: "101.5 - 103.0°F (Often afebrile)",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "DANGER - ZOONOTIC: Causes Undulant/Malta Fever in humans. Treatment of animals is generally not permitted or ineffective. Strict isolation, safe disposal of aborted fetus and placenta with disinfectant.",
    prevention: "Calfhood vaccination of female calves aged 4-8 months with Brucella abortus Cotton Strain 19 or Strain 51 under National Control Programme.",
    differentialDiagnoses: ["Bovine Trichomoniasis", "Campylobacteriosis", "Leptospirosis", "Neosporosis", "BVDV"]
  },
  {
    id: "ppr",
    name: "Peste des Petits Ruminants (PPR / Goat Plague)",
    shortCode: "PPR",
    hindiName: "बकरी प्लेग (पी.पी.आर. / माता रोग)",
    pathogen: "Small Ruminant Morbillivirus (Paramyxoviridae)",
    species: ["Goat", "Sheep"],
    category: "Viral",
    zoonotic: false,
    cardinalSymptoms: [
      "Sudden high fever (104.0 - 106.5°F)",
      "Severe erosive necrotic stomatitis: Whitish cheesy plaques on gums, palate, inner cheeks",
      "Profuse serous to purulent oculonasal discharge that crusts and mats eyelids and nostrils",
      "Foul-smelling, severe watery diarrhea leading to dehydration and subnormal hypothermia",
      "Secondary bronchopneumonia with dyspnea and coughing"
    ],
    pathognomonicSigns: "Whitish necrotic pseudomembrane plaques on oral mucosa combined with foul dark diarrhea and encrusted eyelids in goats",
    tempRangeF: "104.0 - 106.5°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "Strict quarantine of flock. Supportive oral rehydration electrolytes (ORS), clean crusted discharges with warm saline. Broad-spectrum antibiotics (Enrofloxacin / Oxytetracycline) to prevent secondary pasteurellosis pneumonia.",
    prevention: "Live attenuated PPR homologous vaccine (Sungri 96 strain) provides immunity for 3+ years. Annual kid vaccination.",
    differentialDiagnoses: ["Contagious Caprine Pleuropneumonia (CCPP)", "Goat Pox", "Bluetongue", "Coccidiosis", "Contagious Ecthyma (Orf)"]
  },
  {
    id: "ccpp",
    name: "Contagious Caprine Pleuropneumonia (CCPP)",
    shortCode: "CCPP",
    hindiName: "संक्रामक बकरी फेफड़ा रोग (सी.सी.पी.पी.)",
    pathogen: "Mycoplasma capricolum subsp. capripneumoniae",
    species: ["Goat"],
    category: "Bacterial",
    zoonotic: false,
    cardinalSymptoms: [
      "Violent, frequent, painful coughing with grunting respiration",
      "Frothy, yellowish nasal discharge",
      "Dyspnea: Open-mouth breathing with neck outstretched and tongue protruding",
      "High persistent fever (104.5-106.5°F)",
      "Rapid emaciation and death within 3 to 7 days"
    ],
    pathognomonicSigns: "Strictly caprine acute pleuropneumonia with severe thoracic friction rub sounds and straw-colored pleural exudate on post-mortem",
    tempRangeF: "104.5 - 106.5°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "Early stage antibiotic administration with Tylosin, Tilmicosin, or long-acting Oxytetracycline. Quarantine affected herd.",
    prevention: "Inactivated mycoplasma vaccine with saponin adjuvant. Strict quarantine of newly introduced goats.",
    differentialDiagnoses: ["PPR (has oral sores and diarrhea)", "Pasteurellosis", "Lungworm infestation", "Caprine arthritis encephalitis (CAE)"]
  },
  {
    id: "goatpox",
    name: "Goat Pox & Sheep Pox",
    shortCode: "POX",
    hindiName: "भेड़-बकरी चेचक (माता रोग / पॉक्स)",
    pathogen: "Capripoxvirus (Sheeppox virus / Goatpox virus)",
    species: ["Goat", "Sheep"],
    category: "Viral",
    zoonotic: false,
    cardinalSymptoms: [
      "Eruptive papules progressing to pustules and scabs on unwoolled/hairless skin (lips, muzzle, groin, udder, scrotum, under tail)",
      "High pyrexia (104.0 - 106.0°F)",
      "Catarrhal rhinitis, conjunctivitis, and swollen eyelids",
      "Internal nodular lesions in lungs causing labored breathing and coughing",
      "High mortality in young lambs and kids (up to 50-80%)"
    ],
    pathognomonicSigns: "Widespread circular firm umbilicated papules/pustules with dark central scabs on hairless skin and lungs",
    tempRangeF: "104.0 - 106.0°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "Supportive nursing care: Wash lesions with mild potassium permanganate (1:1000) or boric acid. Antibiotic ointment on scabs. Parenteral antibiotics to prevent secondary pulmonary bacterial infection.",
    prevention: "Live attenuated Sheep Pox / Goat Pox tissue culture vaccine administered subcutaneously.",
    differentialDiagnoses: ["Contagious Ecthyma (Orf - localized to lips)", "Bluetongue", "PPR", "Mange / Scabies"]
  },
  {
    id: "enterotoxemia",
    name: "Enterotoxemia (Pulpy Kidney Disease / Overeating Disease)",
    shortCode: "ET",
    hindiName: "विषाक्तता (आंत्र विषाक्तता / गद-रोग)",
    pathogen: "Clostridium perfringens Type D (Epsilon toxin)",
    species: ["Goat", "Sheep", "Cattle"],
    category: "Bacterial",
    zoonotic: false,
    cardinalSymptoms: [
      "Peracute sudden death in best, fastest-growing lambs or kids",
      "Neurological signs: Opisthotonos (head thrown back towards spine), convulsions, chomping jaws, frothing at mouth",
      "Profuse pasty green diarrhea containing mucus or blood",
      "Staggering gait, blindness, and circling before recumbency",
      "Triggered by sudden access to rich lush green fodder, grains, or milk"
    ],
    pathognomonicSigns: "Opisthotonos and rapid post-mortem autolysis of kidneys ('pulpy kidney' with jelly-like soft cortex) in healthy lambs",
    tempRangeF: "101.5 - 104.0°F (Often subnormal at collapse)",
    contagionRisk: "Moderate",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "Emergency administration of Clostridium perfringens Type D antitoxin serum. Oral sulfur or antibiotic (penicillin), reduction in concentrate feeding, addition of dry roughage.",
    prevention: "Enterotoxemia (ET) alum-precipitated vaccine administered annually before lush seasonal pasture changes.",
    differentialDiagnoses: ["Polioencephalomalacia (PEM / Vitamin B1 deficiency)", "Tetanus", "Focal symmetrical encephalomalacia", "Plant poisoning"]
  },
  {
    id: "orf",
    name: "Contagious Ecthyma (Orf / Sore Mouth / Scabby Mouth)",
    shortCode: "ORF",
    hindiName: "संक्रामक एक्थिमा (मुंह के छाले / खुरंड)",
    pathogen: "Parapoxvirus",
    species: ["Goat", "Sheep"],
    category: "Viral",
    zoonotic: true,
    cardinalSymptoms: [
      "Proliferative, crusty, thick wart-like scabs on the commissures of the lips, muzzle, and nostrils",
      "Reluctance to feed or nurse due to oral soreness",
      "Teat lesions on nursing ewes/does from infected nursing kids",
      "Mild or no fever (mostly localized to mucocutaneous junctions)",
      "Lambs lose condition rapidly due to inability to graze"
    ],
    pathognomonicSigns: "Thick, elevated, cauliflower-like fissured scabs strictly localized around oral commissures and lips",
    tempRangeF: "102.0 - 103.5°F",
    contagionRisk: "Moderate",
    quarantineRequired: true,
    notifiableOIE: false,
    treatmentSummary: "ZOONOTIC PRECAUTION: Wear gloves when handling. Soften scabs with glycerine-iodine or boric ointment. Apply antibiotic sprays to prevent fly blow (maggots). Soft palatable mash and gruel.",
    prevention: "Autogenous scarification vaccine in endemic flocks. Isolate affected animals from lactating females.",
    differentialDiagnoses: ["Sheep Pox (generalized lesions + fever)", "Bluetongue", "PPR", "Ulcerative dermatosis"]
  },
  {
    id: "bluetongue",
    name: "Bluetongue (Catarrhal Fever of Sheep)",
    shortCode: "BT",
    hindiName: "ब्लू टंग (नीली जीभ रोग)",
    pathogen: "Bluetongue virus (Orbivirus transmitted by Culicoides midges)",
    species: ["Sheep", "Goat", "Cow", "Cattle"],
    category: "Viral",
    zoonotic: false,
    cardinalSymptoms: [
      "Severe edema of lips, tongue, muzzle, face, and submandibular area",
      "Cyanotic, swollen, protruding purplish-blue tongue",
      "Coronitis: Reddish-purple band at coronary band of hooves with lameness and kneeling gait",
      "High fever (105-107°F) with profuse mucopurulent nasal discharge",
      "Torticolis (wry neck) and wool break in recovering sheep"
    ],
    pathognomonicSigns: "Cyanotic swollen dark blue tongue with facial edema and distinctive coronitis band on hooves in sheep",
    tempRangeF: "104.5 - 107.0°F",
    contagionRisk: "Moderate",
    quarantineRequired: false,
    notifiableOIE: true,
    treatmentSummary: "No specific antiviral. Provide soft feed, shelter from intense sunlight (photophobia), NSAIDs for pain and inflammation, antibiotics for secondary respiratory bacterial infection.",
    prevention: "Pentavalent inactivated Bluetongue vaccine. Night confinement in insect-proof barns; insecticide spraying to control Culicoides midges.",
    differentialDiagnoses: ["PPR", "Contagious Ecthyma (Orf)", "Foot and Mouth Disease", "Photosensitization"]
  },
  {
    id: "asf",
    name: "African Swine Fever (ASF) & Classical Swine Fever (CSF)",
    shortCode: "SWINE_FEVER",
    hindiName: "अफ्रीकी स्वाइन फीवर / शूकर ज्वर",
    pathogen: "Asfarviridae (ASF) / Pestivirus (CSF)",
    species: ["Pig"],
    category: "Viral",
    zoonotic: false,
    cardinalSymptoms: [
      "High pyrexia (105 - 108°F)",
      "Erythematous cyanotic skin blotches: Reddish-purple discoloration on tips of ears, snout, tail, and abdomen",
      "Hemorrhages in skin, bloody diarrhea, and vomiting",
      "Severe ataxia, staggering, huddling together against cold",
      "Near 100% mortality in peracute/acute forms within 7 to 10 days"
    ],
    pathognomonicSigns: "Intense purple/cyanotic skin blotches on ears and belly with enlarged hemorrhagic dark-red friable spleen",
    tempRangeF: "105.0 - 108.0°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "NO TREATMENT: Highly contagious fatal viral infection. Immediate strict containment, official report to district veterinary officer, quarantine, and sanitary culling per Government of India ASF Action Plan.",
    prevention: "Strict farm biosecurity, ban swill feeding (kitchen/restaurant waste), CSF cell-culture vaccine for Classical Swine Fever.",
    differentialDiagnoses: ["Porcine Reproductive and Respiratory Syndrome (PRRS)", "Erysipelas (Diamond skin disease)", "Salmonellosis", "PDNS"]
  },
  {
    id: "rabies",
    name: "Bovine / Livestock Rabies",
    shortCode: "RABIES",
    hindiName: "रेबीज (अलर्क रोग / पागलपन)",
    pathogen: "Rabies lyssavirus (Rhabdoviridae)",
    species: ["Cow", "Buffalo", "Goat", "Sheep", "Horse", "Camel"],
    category: "Viral",
    zoonotic: true,
    cardinalSymptoms: [
      "Frequent, abnormal, continuous low-pitched hoarse bellowing/groaning",
      "Choking appearance: Inability to swallow saliva or food (hydrophobia sensation)",
      "Persistent tenesmus (straining to defecate) leading to rectal prolapse",
      "Aggressive form (charging, head butting, biting) or paralytic dumb form (knuckling fetlocks, ataxia)",
      "History of stray dog, jackal, or mongoose bite 2 to 12 weeks prior"
    ],
    pathognomonicSigns: "Hoarse repetitive bellowing, persistent straining (tenesmus), and pharyngeal paralysis with bite wound history",
    tempRangeF: "101.5 - 103.5°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "LETHAL ZOONOSIS: No cure once clinical symptoms appear. Fatal within 3-7 days. Strictly avoid inserting hands into mouth to search for suspected foreign choking objects! Euthanasia and sanitary disposal.",
    prevention: "Post-exposure prophylaxis (PEP) immediately after animal bite: Post-bite rabies vaccine on Days 0, 3, 7, 14, 28 with wound washing with soap.",
    differentialDiagnoses: ["Choking / Esophageal obstruction", "Listeriosis", "Ketosis (nervous form)", "Bovine spongiform encephalopathy", "Lead poisoning"]
  },
  {
    id: "milk_fever",
    name: "Milk Fever (Parturient Hypocalcemia / Downer Cow)",
    shortCode: "MILK_FEVER",
    hindiName: "मिल्क फीवर (सूतक ज्वर / कैल्शियम की कमी)",
    pathogen: "Metabolic deficiency of serum ionized calcium (Ca <5 mg/dL)",
    species: ["Cow", "Buffalo", "Goat"],
    category: "Metabolic",
    zoonotic: false,
    cardinalSymptoms: [
      "Occurs within 24 to 72 hours around or after calving in high-yielding dairy cows",
      "Sternal recumbency with characteristic 'S-shaped' neck curvature (head turned into flank)",
      "Cold extremities (cold ears, horns, muzzle, and extremities)",
      "Subnormal body temperature (hypothermia <100°F or 97-99°F)",
      "Dilated pupils, dry muzzle, complete rumen stasis, and inability to stand"
    ],
    pathognomonicSigns: "Downer cow post-calving with S-shaped neck curvature tucked into flank and cold ears with subnormal temperature",
    tempRangeF: "96.5 - 100.0°F (Subnormal Hypothermia)",
    contagionRisk: "Low",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "Slow intravenous infusion of Calcium Borogluconate (25% CBG, 450 mL warmed to body temperature) with simultaneous subcutaneous dose while auscultating heart rhythm. Immediate recovery response within 15-30 minutes.",
    prevention: "Low calcium or negative DCAD (dietary cation-anion difference) diet during late dry period; oral calcium gels at calving.",
    differentialDiagnoses: ["Maternal nerve paralysis (obturator)", "Acute toxic mastitis", "Botulism", "Ketosis", "Severe bloat"]
  },
  {
    id: "ketosis",
    name: "Bovine Ketosis (Acetonemia)",
    shortCode: "KETOSIS",
    hindiName: "कीटोसिस (एसिटोनेमिया / मीठी सांस)",
    pathogen: "Negative energy balance with accumulation of blood ketone bodies (BHBA)",
    species: ["Cow", "Buffalo"],
    category: "Metabolic",
    zoonotic: false,
    cardinalSymptoms: [
      "Sweetish sickly acetone/chloroform odor in exhaled breath, milk, and urine",
      "Drastic sudden reduction in milk yield in early lactation (2-6 weeks post-calving)",
      "Selective appetite: Refuses concentrates and grain, consumes only dry straw or fibrous forage",
      "Rapid body condition loss, tucked-up hollow flank",
      "Nervous form: Incessant licking of walls or manger, chewing inanimate objects, vacant stare"
    ],
    pathognomonicSigns: "Characteristic sweet acetone breath odor with sudden selective grain refusal and rapid emaciation 3 weeks post-calving",
    tempRangeF: "100.5 - 102.0°F (Normal to slight hypothermia)",
    contagionRisk: "Low",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "IV Glucose/Dextrose 20-50% (500 mL) to rapidly relieve hypoglycemia. Oral Propylene glycol or Glycerol drench (250-400 mL twice daily for 3-5 days). Glucocorticoids (Dexamethasone) and vitamin B12.",
    prevention: "Avoid overconditioning during dry period (aim for BCS 3.25-3.5); provide energy-dense balanced transition rations with rumen-protected choline.",
    differentialDiagnoses: ["Displaced Abomasum (LDA/RDA)", "Traumatic Reticuloperitonitis", "Subclinical Hypocalcemia", "Chronic Mastitis"]
  },
  {
    id: "bloat",
    name: "Tympanites (Acute Bloat / Ruminal Tympany)",
    shortCode: "BLOAT",
    hindiName: "अफारा (टिम्पनी / पेट फूलना)",
    pathogen: "Excessive gas trapping in rumen (frothy bloat or free-gas bloat)",
    species: ["Cow", "Buffalo", "Goat", "Sheep", "Cattle"],
    category: "Metabolic",
    zoonotic: false,
    cardinalSymptoms: [
      "Pronounced balloon-like distension of the left paralumbar fossa (left flank)",
      "Severe discomfort: Kicking at belly, stamping feet, grunting, and frequent lying down and rising",
      "Severe dyspnea: Open-mouth breathing with tongue extended, cyanosis of mucous membranes",
      "Tympanic 'drum-like' hollow ping sound when percussion and flicking left flank",
      "Occurs within hours after grazing wet clover, alfalfa, or lush legume pasture"
    ],
    pathognomonicSigns: "Asymmetrical ballooning distension of left flank with drum-like resonance and acute respiratory suffocation",
    tempRangeF: "101.0 - 102.5°F (Normal to slightly elevated)",
    contagionRisk: "Low",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "EMERGENCY: In free-gas bloat, pass a large-bore stomach tube. In frothy bloat, administer oral anti-foaming agents (Simethicone, peanut oil, turpentine oil 30-60 mL in linseed oil). In imminent asphyxiation, trocarise left rumen with trocar and cannula.",
    prevention: "Feed dry coarse hay before turning onto lush clover/legume pasture; bloat blocks with poloxalene.",
    differentialDiagnoses: ["Esophageal choke (foreign body obstruction)", "Acute vagus indigestion", "Abomasal torsion", "Anthrax (post-mortem bloat)"]
  },
  {
    id: "glanders",
    name: "Glanders (Farcy in Equines)",
    shortCode: "GLANDERS",
    hindiName: "ग्लैंडर्स (फारसी / अश्व ग्रंथि रोग)",
    pathogen: "Burkholderia mallei (Dangerous zoonotic bacterium)",
    species: ["Horse", "Donkey", "Mule"],
    category: "Bacterial",
    zoonotic: true,
    cardinalSymptoms: [
      "Nasal form: Nodules on nasal septum that ulcerate and heal leaving characteristic stellate (star-shaped) scars",
      "Thick, sticky, yellowish-green foul nasal discharge",
      "Cutaneous form (Farcy): Cord-like swollen lymphatic vessels with nodules ('farcy buds') that burst and discharge oily pus",
      "Enlargement and induration of submaxillary lymph nodes",
      "Chronic intermittent fever and progressive wasting"
    ],
    pathognomonicSigns: "Stellate star-shaped scars on nasal cartilage and ulcerated corded lymphatic 'farcy buds' discharging oily pus",
    tempRangeF: "101.5 - 104.0°F",
    contagionRisk: "Severe",
    quarantineRequired: true,
    notifiableOIE: true,
    treatmentSummary: "DANGER - ZOONOTIC BIOTHREAT: Treatment of equines is strictly prohibited by law due to human risk. Confirmed positive animals are humanely euthanized under the Glanders and Farcy Act.",
    prevention: "Mallein test screening for all equine movements, quarantine of imported equids, strict disinfection of stables.",
    differentialDiagnoses: ["Strangles (Streptococcus equi)", "Epizootic Lymphangitis", "Ulcerative lymphangitis", "Equine Viral Arteritis"]
  },
  {
    id: "surra",
    name: "Trypanosomiasis (Surra / Tibarsa)",
    shortCode: "SURRA",
    hindiName: "सर्रा (तिबरसा / मक्खी जनित रोग)",
    pathogen: "Trypanosoma evansi (Protozoa transmitted by Tabanus horseflies)",
    species: ["Camel", "Horse", "Cow", "Buffalo"],
    category: "Protozoal/Vector",
    zoonotic: false,
    cardinalSymptoms: [
      "Intermittent fluctuating fever spikes (undulating paroxysms)",
      "Edema of dependent parts (sheath, belly, limbs, brisket, and lower eyelids)",
      "Severe progressive emaciation and cachexia ('Surra' means rotten in Hindi)",
      "Extreme pale mucous membranes (severe anemia) and petechial hemorrhages",
      "Nervous signs in horses: Circling, head pressing, blindness, and paralysis of hindquarters"
    ],
    pathognomonicSigns: "Undulating fever spikes with dependent ventral belly/sheath edema and severe wasting cachexia in camels and equines",
    tempRangeF: "103.0 - 106.0°F (During paroxysm)",
    contagionRisk: "Moderate",
    quarantineRequired: false,
    notifiableOIE: false,
    treatmentSummary: "Specific trypanocides: Quinapyramine sulfate/chloride (Triquin) at 3-5 mg/kg SC or Diminazene aceturate (3.5-7 mg/kg IM) or Isometamidium chloride. Supportive liver tonics and hematinics.",
    prevention: "Control biting vector horseflies (Tabanus and Stomoxys) using pyrethroid sprays; prophylactic quinapyramine prosalt.",
    differentialDiagnoses: ["Equine Infectious Anemia", "Theileriosis", "Chronic Helminthiasis", "Malnutrition"]
  }
];

export interface DiseaseEvaluationInput {
  species: string;
  breed?: string;
  age?: number;
  symptoms: string[];
  bodyTemperatureF: number;
  activityLevel: string;
  appetite: string;
  lesionType?: string;
  photoBase64?: string;
}

/**
 * Expert Veterinary Clinical Multi-Criteria Decision Tree & Scoring Algorithm
 * Built according to ICAR-IVRI & WOAH/OIE livestock diagnostic standards.
 */
export function evaluateLivestockDiseaseRules(input: DiseaseEvaluationInput): RiskAnalysis {
  const syms = (input.symptoms || []).map((s) => s.toLowerCase());
  const temp = Number(input.bodyTemperatureF) || 101.5;
  const species = (input.species || "Cow").toLowerCase();
  const notes = (input.lesionType || "").toLowerCase();
  const isLethargic = input.activityLevel === "Lethargic";
  const isRecumbent = input.activityLevel === "Recumbent/Down";
  const isAnorexic = input.appetite === "Anorexic";
  const isReducedAppetite = input.appetite === "Reduced";

  // Score sheet for each candidate disease
  const scores: { [key: string]: { score: number; lesions: Array<{ label: string; confidence: number; location?: string }>; rationale: string[] } } = {};

  for (const d of ALL_LIVESTOCK_DISEASES) {
    scores[d.id] = { score: 0, lesions: [], rationale: [] };
  }

  // 1. SPECIES COMPATIBILITY CHECK
  for (const d of ALL_LIVESTOCK_DISEASES) {
    const isSpeciesAllowed = d.species.some((sp) => {
      const spL = sp.toLowerCase();
      if (spL === "cattle" && (species.includes("cow") || species.includes("buffalo") || species.includes("cattle") || species.includes("bovine"))) return true;
      return species.includes(spL);
    });

    if (!isSpeciesAllowed) {
      // Heavily penalize mismatching species
      scores[d.id].score -= 100;
    } else {
      scores[d.id].score += 15;
    }
  }

  // 2. PATHOGNOMONIC / HIGH-WEIGHT CLINICAL SIGNS CHECK

  // (A) Babesiosis: Red / dark coffee urine + high fever + anemia + ticks
  const hasRedUrine = syms.some((s) => s.includes("red") || s.includes("coffee") || s.includes("dark urine") || s.includes("hemoglobinuria") || s.includes("पेशाब") || s.includes("खून"));
  const hasTicks = syms.some((s) => s.includes("tick") || s.includes("चींचड़") || s.includes("किलनी")) || notes.includes("tick");
  if (hasRedUrine) {
    scores["babesiosis"].score += 75;
    scores["babesiosis"].rationale.push("Pathognomonic Hemoglobinuria (red/coffee urine) detected");
    scores["babesiosis"].lesions.push({ label: "Severe Hemoglobinuria (port-wine urine)", confidence: 0.96, location: "Urinary tract" });
    if (temp >= 103.5) scores["babesiosis"].score += 20;
    if (hasTicks) scores["babesiosis"].score += 20;
  }

  // (B) Black Quarter: Crepitant gas swelling in muscle + sudden lameness
  const hasCrepitation = syms.some((s) => s.includes("crepitat") || s.includes("crackl") || s.includes("gas") || s.includes("चरचूरिया")) || notes.includes("crepit") || notes.includes("gas");
  const hasMuscleSwelling = syms.some((s) => s.includes("shoulder") || s.includes("thigh") || s.includes("muscle") || s.includes("लंगड़ा") || s.includes("quarter")) || notes.includes("swelling");
  if (hasCrepitation || (hasMuscleSwelling && temp >= 104)) {
    scores["bq"].score += 75;
    scores["bq"].rationale.push("Crepitant gas swelling in heavy muscle mass");
    scores["bq"].lesions.push({ label: "Subcutaneous crepitant emphysema & muscular necrosis", confidence: 0.95, location: "Thigh/Shoulder" });
  }

  // (C) Anthrax: Tarry non-clotting blood from orifices + sudden death / collapse
  const hasBloodyOrifice = syms.some((s) => s.includes("tarry") || s.includes("orifice") || s.includes("rectum") || s.includes("bleeding") || s.includes("जहरी"));
  const hasPeracuteCollapse = isRecumbent && (temp > 105 || temp < 98);
  if (hasBloodyOrifice) {
    scores["anthrax"].score += 85;
    scores["anthrax"].rationale.push("DANGER: Incoagulable dark tarry blood oozing from natural body openings");
    scores["anthrax"].lesions.push({ label: "Dark tar-like uncoagulated blood discharge", confidence: 0.98, location: "Natural orifices" });
  } else if (hasPeracuteCollapse && notes.includes("sudden")) {
    scores["anthrax"].score += 35;
  }

  // (D) Lumpy Skin Disease (LSD): Circular skin nodules + high fever
  const hasNodules = syms.some((s) => s.includes("nodule") || s.includes("lump") || s.includes("गांठ") || s.includes("फफोले") || s.includes("eruption")) || notes.includes("nodule") || notes.includes("lump");
  if (hasNodules) {
    scores["lsd"].score += 65;
    scores["lsd"].rationale.push("Circumscribed nodular cutaneous eruptions observed across body");
    scores["lsd"].lesions.push({ label: "Circumscribed firm cutaneous nodules (2-5cm)", confidence: 0.94, location: "Head, neck, perineum, udder" });
    if (temp >= 103) scores["lsd"].score += 25;
  }

  // (E) Foot & Mouth Disease (FMD): Saliva drooling + mouth/hoof vesicles + lameness
  const hasSaliva = syms.some((s) => s.includes("saliva") || s.includes("drool") || s.includes("froth") || s.includes("लार") || s.includes("झाग"));
  const hasOralBlister = syms.some((s) => s.includes("mouth") || s.includes("tongue") || s.includes("vesicle") || s.includes("blister") || s.includes("छाले"));
  const hasHoofLesion = syms.some((s) => s.includes("hoof") || s.includes("lame") || s.includes("feet") || s.includes("खुर"));
  if (hasSaliva && (hasOralBlister || hasHoofLesion)) {
    scores["fmd"].score += 75;
    scores["fmd"].rationale.push("Profuse ropy salivation combined with ruptured mucosal/coronary blisters");
    scores["fmd"].lesions.push({ label: "Oral mucosal ulcerations & stringy saliva", confidence: 0.95, location: "Tongue & gums" });
    scores["fmd"].lesions.push({ label: "Interdigital cleft & coronary band erosions", confidence: 0.93, location: "Hooves" });
    if (temp >= 103) scores["fmd"].score += 15;
  } else if (hasSaliva && temp >= 103) {
    scores["fmd"].score += 45;
  }

  // (F) Hemorrhagic Septicemia (HS): Throat / submandibular swelling + respiratory snoring
  const hasThroatSwelling = syms.some((s) => s.includes("throat") || s.includes("गले") || s.includes("brisket") || s.includes("gal ghotu") || s.includes("submandibular"));
  const hasStertorous = syms.some((s) => s.includes("snoring") || s.includes("stertor") || s.includes("breathing") || s.includes("सांस") || s.includes("asphyxia"));
  if (hasThroatSwelling) {
    scores["hs"].score += 70;
    scores["hs"].rationale.push("Hot painful submandibular throat edema with acute respiratory distress");
    scores["hs"].lesions.push({ label: "Submandibular & brisket hot inflammatory edema", confidence: 0.96, location: "Throat & brisket" });
    if (hasStertorous) scores["hs"].score += 25;
    if (temp >= 104) scores["hs"].score += 20;
  }

  // (G) Clinical Mastitis: Swollen painful udder quarter + milk clots/flakes
  const hasUdder = syms.some((s) => s.includes("udder") || s.includes("teat") || s.includes("थन") || s.includes("mastitis") || s.includes("clot") || s.includes("दूध"));
  if (hasUdder) {
    scores["mastitis"].score += 70;
    scores["mastitis"].rationale.push("Acute localized inflammation of mammary quarter with altered milk consistency");
    scores["mastitis"].lesions.push({ label: "Acute induration & inflammatory clot formation", confidence: 0.92, location: "Mammary gland / teat" });
  }

  // (H) Theileriosis: Massively enlarged prescapular lymph nodes + corneal opacity
  const hasSwollenLymph = syms.some((s) => s.includes("lymph") || s.includes("node") || s.includes("गिल्टियां") || s.includes("prescapular") || s.includes("corneal") || s.includes("cloudy eye"));
  if (hasSwollenLymph || (hasTicks && temp >= 105 && !hasRedUrine)) {
    scores["theileriosis"].score += 65;
    scores["theileriosis"].rationale.push("Marked enlargement of superficial lymph nodes with high fever and tick exposure");
    scores["theileriosis"].lesions.push({ label: "Massive prescapular & precrural lymphadenopathy", confidence: 0.94, location: "Lymph nodes" });
  }

  // (I) Anaplasmosis: Deep jaundice + hard dung with mucus + clear urine
  const hasJaundice = syms.some((s) => s.includes("jaundice") || s.includes("पीलिया") || s.includes("icterus") || s.includes("pale mucous") || s.includes("yellow"));
  const hasConstipation = syms.some((s) => s.includes("constipat") || s.includes("hard dung") || s.includes("mucus on dung"));
  if (hasJaundice && !hasRedUrine) {
    scores["anaplasmosis"].score += 60;
    if (hasConstipation) scores["anaplasmosis"].score += 25;
    scores["anaplasmosis"].rationale.push("Severe icterus/jaundice with absence of hemoglobinuria");
    scores["anaplasmosis"].lesions.push({ label: "Severe icteric/jaundiced mucous membranes", confidence: 0.91, location: "Conjunctiva & gums" });
  }

  // (J) Brucellosis: Late abortion / retained placenta
  const hasAbortion = syms.some((s) => s.includes("abort") || s.includes("गर्भपात") || s.includes("placenta") || s.includes("जेर") || s.includes("hygroma"));
  if (hasAbortion) {
    scores["brucellosis"].score += 80;
    scores["brucellosis"].rationale.push("Third-trimester abortion storm and retained necrotic fetal membranes");
    scores["brucellosis"].lesions.push({ label: "Necrotic leathery placentitis & abortion", confidence: 0.95, location: "Reproductive tract" });
  }

  // (K) PPR (Goat Plague): Goat/Sheep with necrotic oral plaques + diarrhea + ocular discharge
  const isCaprineOvine = species.includes("goat") || species.includes("sheep") || species.includes("बकरी") || species.includes("भेड़");
  const hasOralPlaques = syms.some((s) => s.includes("cheesy") || s.includes("white plaque") || s.includes("stomatitis") || s.includes("मुंह"));
  const hasDiarrhea = syms.some((s) => s.includes("diarrhea") || s.includes("दस्त") || s.includes("loose"));
  const hasDischarge = syms.some((s) => s.includes("discharge") || s.includes("आंख") || s.includes("नाक") || s.includes("crust"));
  if (isCaprineOvine && hasDiarrhea && hasDischarge) {
    scores["ppr"].score += 70;
    scores["ppr"].rationale.push("Classic small ruminant triad: Necrotic stomatitis, purulent oculonasal crusting, and profuse diarrhea");
    scores["ppr"].lesions.push({ label: "Cheesy necrotic oral plaques & encrusted eyes", confidence: 0.94, location: "Mouth & face" });
    if (temp >= 104) scores["ppr"].score += 20;
  }

  // (L) CCPP: Goat with violent coughing + grunting dyspnea
  const hasCoughing = syms.some((s) => s.includes("cough") || s.includes("खांसी") || s.includes("grunting") || s.includes("pleuro"));
  if (species.includes("goat") && hasCoughing && temp >= 104 && !hasDiarrhea) {
    scores["ccpp"].score += 75;
    scores["ccpp"].rationale.push("Violent caprine coughing with thoracic pleuropneumonia sounds");
    scores["ccpp"].lesions.push({ label: "Acute fibrinous pleuropneumonia", confidence: 0.93, location: "Lungs & thorax" });
  }

  // (M) Goat Pox / Sheep Pox: Papules and scabs on hairless skin
  const hasPoxPustules = syms.some((s) => s.includes("pox") || s.includes("चेचक") || s.includes("papule") || s.includes("pustule") || s.includes("scab on groin"));
  if (isCaprineOvine && hasPoxPustules) {
    scores["goatpox"].score += 75;
    scores["goatpox"].rationale.push("Generalized umbilicated papulovesicular eruptions on wool-free skin");
    scores["goatpox"].lesions.push({ label: "Umbilicated pox papules with central dark crust", confidence: 0.92, location: "Lips, groin & axilla" });
  }

  // (N) Contagious Ecthyma (Orf): Scabs strictly on lips/muzzle
  const hasLipScabs = syms.some((s) => s.includes("orf") || s.includes("lip scab") || s.includes("scabby mouth") || s.includes("muzzle crust"));
  if (isCaprineOvine && hasLipScabs && temp < 103.5) {
    scores["orf"].score += 75;
    scores["orf"].rationale.push("Proliferative cauliflower-like crusty scabs strictly restricted to oral commissures");
    scores["orf"].lesions.push({ label: "Proliferative verrucose scabs at labial commissures", confidence: 0.91, location: "Lips & nostrils" });
  }

  // (O) Bluetongue: Sheep with blue/swollen tongue + coronitis
  const hasBlueTongue = syms.some((s) => s.includes("blue tongue") || s.includes("cyanotic") || s.includes("नीली जीभ") || s.includes("coronitis") || s.includes("facial edema"));
  if (isCaprineOvine && hasBlueTongue) {
    scores["bluetongue"].score += 80;
    scores["bluetongue"].rationale.push("Cyanotic swollen tongue with coronitis hoof band in sheep");
    scores["bluetongue"].lesions.push({ label: "Cyanotic lingual edema & coronitis band", confidence: 0.95, location: "Tongue & coronary band" });
  }

  // (P) African/Classical Swine Fever: Pig with purple ear/belly blotches
  const isSwine = species.includes("pig") || species.includes("swine") || species.includes("सूअर");
  const hasPurpleEars = syms.some((s) => s.includes("purple") || s.includes("cyanosis") || s.includes("ear blotch") || s.includes("belly red") || s.includes("swine fever"));
  if (isSwine && (hasPurpleEars || temp >= 105)) {
    scores["asf"].score += 80;
    scores["asf"].rationale.push("Severe cyanotic erythema of ears and abdomen in pig");
    scores["asf"].lesions.push({ label: "Hemorrhagic cyanotic skin blotches on ears & abdomen", confidence: 0.96, location: "Ears & ventral abdomen" });
  }

  // (Q) Rabies: Bellowing + straining tenesmus + inability to swallow
  const hasBellowing = syms.some((s) => s.includes("bellow") || s.includes("रंभाना") || s.includes("tenesmus") || s.includes("choking") || s.includes("dog bite") || s.includes("रेबीज"));
  if (hasBellowing) {
    scores["rabies"].score += 80;
    scores["rabies"].rationale.push("Repetitive hoarse vocalization, pharyngeal paralysis, and straining tenesmus");
    scores["rabies"].lesions.push({ label: "Pharyngeal paralysis with excessive stringy frothing & tenesmus", confidence: 0.94, location: "Nervous system" });
  }

  // (R) Milk Fever: Calving downer cow + S-shaped neck + cold ears + subnormal temperature (<100°F)
  const isHypothermic = temp <= 100.0;
  const hasNeckCurvature = syms.some((s) => s.includes("s-curve") || s.includes("head turned") || s.includes("cold ear") || s.includes("calving") || s.includes("downer") || s.includes("मिल्क फीवर"));
  if ((isHypothermic || temp < 100.5) && (isRecumbent || hasNeckCurvature)) {
    scores["milk_fever"].score += 85;
    scores["milk_fever"].rationale.push("Post-calving sternal recumbency with S-shaped neck curvature and subnormal hypothermia");
    scores["milk_fever"].lesions.push({ label: "Post-parturient hypocalcemic recumbency & cold extremities", confidence: 0.95, location: "General musculature" });
  }

  // (S) Ketosis: Sweet acetone breath + drop in milk + selective grain refusal
  const hasAcetoneBreath = syms.some((s) => s.includes("acetone") || s.includes("sweet breath") || s.includes("मीठी सांस") || s.includes("ketosis") || s.includes("refuses grain"));
  if (hasAcetoneBreath) {
    scores["ketosis"].score += 80;
    scores["ketosis"].rationale.push("Ketotic sweet acetone breath odor with selective grain refusal and rapid emaciation");
    scores["ketosis"].lesions.push({ label: "Severe negative energy balance & ketone body elevation", confidence: 0.92, location: "Metabolism" });
  }

  // (T) Tympanites (Bloat): Distended left flank + drum-like resonance
  const hasBloat = syms.some((s) => s.includes("bloat") || s.includes("अफारा") || s.includes("left flank") || s.includes("tympany") || s.includes("distended belly"));
  if (hasBloat) {
    scores["bloat"].score += 80;
    scores["bloat"].rationale.push("Ballooning distension of left paralumbar fossa with severe respiratory distress");
    scores["bloat"].lesions.push({ label: "Acute ruminal tympany & left flank ballooning", confidence: 0.95, location: "Left paralumbar fossa" });
  }

  // (U) Glanders / Surra for equines/camels
  const isEquineOrCamel = species.includes("horse") || species.includes("camel") || species.includes("donkey") || species.includes("घोड़ा") || species.includes("ऊंट");
  const hasFarcy = syms.some((s) => s.includes("farcy") || s.includes("stellate") || s.includes("nasal ulcer") || s.includes("glanders"));
  const hasSurra = syms.some((s) => s.includes("surra") || s.includes("tibarsa") || s.includes("सर्रा") || s.includes("undulating") || s.includes("sheath edema"));
  if (isEquineOrCamel && hasFarcy) {
    scores["glanders"].score += 85;
    scores["glanders"].rationale.push("Stellate nasal cicatrices and corded lymphatic farcy buds in equine");
    scores["glanders"].lesions.push({ label: "Ulcerative nasal mucosa & corded lymphatic buds", confidence: 0.96, location: "Nasal septum & limbs" });
  } else if (isEquineOrCamel && hasSurra) {
    scores["surra"].score += 80;
    scores["surra"].rationale.push("Undulating paroxysmal fever with dependent ventral edema in camel/equine");
    scores["surra"].lesions.push({ label: "Severe ventral dependent edema & cachexia", confidence: 0.93, location: "Ventral abdomen & limbs" });
  }

  // 3. FIND TOP SCORING CANDIDATE
  const candidateEntries = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  const topCandidateId = candidateEntries[0][0];
  const topCandidateScore = candidateEntries[0][1].score;
  const topDisease = ALL_LIVESTOCK_DISEASES.find((d) => d.id === topCandidateId) || ALL_LIVESTOCK_DISEASES[0];

  // If score is high (>40), we have an exact match!
  if (topCandidateScore >= 40) {
    const rawScore = Math.min(98, Math.max(70, topCandidateScore));
    const riskLevel: "Low" | "Medium" | "High" =
      topDisease.contagionRisk === "Severe" || rawScore >= 80 ? "High" : rawScore >= 55 ? "Medium" : "Low";

    const alternatives = candidateEntries
      .slice(1, 4)
      .map(([id]) => ALL_LIVESTOCK_DISEASES.find((d) => d.id === id)?.name || id)
      .filter((n) => n !== topDisease.name);

    const lesions = candidateEntries[0][1].lesions.length > 0
      ? candidateEntries[0][1].lesions
      : [{ label: topDisease.pathognomonicSigns, confidence: 0.90 }];

    return {
      riskLevel,
      riskScore: rawScore,
      suspectedDisease: topDisease.name,
      alternativeDiseases: alternatives.length > 0 ? alternatives : topDisease.differentialDiagnoses.slice(0, 2),
      confidence: Number((0.88 + (rawScore % 10) * 0.01).toFixed(2)),
      detectedLesions: lesions,
      recommendedActions: [
        topDisease.treatmentSummary,
        topDisease.quarantineRequired
          ? "CRITICAL: Isolate animal immediately in dedicated enclosure; strictly halt all herd and fodder movement."
          : "Provide shaded, stress-free resting stall with ad libitum clean fresh water.",
        `Preventative measure: ${topDisease.prevention}`,
        topDisease.zoonotic
          ? "BIOHAZARD WARNING: Highly zoonotic infection. Wear gloves/protective gear and inform district public health authorities."
          : "Record daily body temperature and notify assigned local veterinary officer."
      ],
      quarantineRequired: topDisease.quarantineRequired,
      contagionRisk: topDisease.contagionRisk,
      modelSource: "Veterinary Multi-Criteria Expert Decision Engine (ICAR-IVRI Grounded)"
    };
  }

  // Fallback for non-specific general symptoms
  let generalScore = 25;
  if (temp > 103) generalScore += 30;
  else if (temp > 102) generalScore += 15;
  if (isRecumbent) generalScore += 25;
  else if (isLethargic) generalScore += 12;
  if (isAnorexic) generalScore += 15;
  else if (isReducedAppetite) generalScore += 8;
  generalScore += Math.min(20, syms.length * 5);

  const fallbackScore = Math.min(80, generalScore);
  const fallbackLevel: "Low" | "Medium" | "High" = fallbackScore >= 75 ? "High" : fallbackScore >= 45 ? "Medium" : "Low";

  return {
    riskLevel: fallbackLevel,
    riskScore: fallbackScore,
    suspectedDisease: fallbackScore > 65 ? "Acute Pyrexia of Unknown Origin (PUO) / Systemic Infection" : "Subacute Bovine Malaise / Indigestion",
    alternativeDiseases: ["Mild Ruminal Acidosis", "Environmental Heat Stress", "Early-stage Viral Viremia"],
    confidence: 0.82,
    detectedLesions: [{ label: "Non-specific systemic febrile response", confidence: 0.85 }],
    recommendedActions: [
      "Provide fresh clean water and shaded resting shelter",
      "Monitor rectal temperature twice daily (morning and evening)",
      "Offer easily digestible green forage and oral electrolyte hydration",
      "Consult local veterinary dispensary if fever or anorexia persists past 24 hours"
    ],
    quarantineRequired: fallbackScore >= 75,
    contagionRisk: fallbackScore >= 75 ? "Moderate" : "Low",
    modelSource: "Veterinary Multi-Criteria Expert Decision Engine (ICAR-IVRI Grounded)"
  };
}

/**
 * 12 Pre-configured Clinical Benchmark Profiles for 1-Click Testing of All Diseases
 */
export const CLINICAL_BENCHMARK_PRESETS = [
  {
    id: "test-lsd",
    name: "Lumpy Skin Disease (LSD)",
    icon: "🔴",
    species: "Cow",
    breed: "Gir",
    age: 4,
    bodyTemperatureF: 105.2,
    activityLevel: "Lethargic" as const,
    appetite: "Reduced" as const,
    symptoms: [
      "Circular skin nodules / lumps",
      "High body fever (>103°F)",
      "Discharge from eyes / nose"
    ],
    lesionType: "Multiple circumscribed firm cutaneous nodules across head, neck, and dewlap with enlarged prescapular lymph nodes",
    photoUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-fmd",
    name: "Foot and Mouth Disease (FMD)",
    icon: "💧",
    species: "Cow",
    breed: "Crossbred HF",
    age: 5,
    bodyTemperatureF: 104.8,
    activityLevel: "Recumbent/Down" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Excessive stringy saliva drooling",
      "Severe lameness / hoof lesions",
      "High body fever (>103°F)",
      "Sudden drop in milk yield"
    ],
    lesionType: "Ruptured oral blisters on tongue dorsal surface, smacking lips with stringy ropy salivation and coronary band ulcerations",
    photoUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-anthrax",
    name: "Anthrax (Emergency Zoonosis)",
    icon: "☣️",
    species: "Buffalo",
    breed: "Murrah",
    age: 6,
    bodyTemperatureF: 106.5,
    activityLevel: "Recumbent/Down" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Dark tarry uncoagulated bloody discharge from rectum/mouth",
      "High body fever (>103°F)",
      "Labored / rapid breathing"
    ],
    lesionType: "Peracute collapse with dark uncoagulated tar-like bloody oozing from nostrils and rectum; no post-mortem incision allowed",
    photoUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-babesiosis",
    name: "Babesiosis (Redwater Fever)",
    icon: "🩸",
    species: "Cow",
    breed: "Sahiwal",
    age: 3,
    bodyTemperatureF: 106.0,
    activityLevel: "Lethargic" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Dark coffee / red port-wine urine (Hemoglobinuria)",
      "High body fever (>103°F)",
      "Loss of appetite / off-feed"
    ],
    lesionType: "Distinct port-wine colored red urine, severe conjunctival pallor (anemia), and heavy tick infestation (Rhipicephalus)",
    photoUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-bq",
    name: "Black Quarter (BQ)",
    icon: "⚡",
    species: "Cow",
    breed: "Kankrej",
    age: 2,
    bodyTemperatureF: 105.0,
    activityLevel: "Recumbent/Down" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Crepitating gas swelling in shoulder / thigh",
      "Severe lameness / hoof lesions",
      "High body fever (>103°F)"
    ],
    lesionType: "Acute crepitation and crackling paper sound on palpating swollen gluteal muscle of hind leg, severe lameness",
    photoUrl: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-hs",
    name: "Hemorrhagic Septicemia (HS)",
    icon: "🫁",
    species: "Buffalo",
    breed: "Jaffarabadi",
    age: 4,
    bodyTemperatureF: 106.2,
    activityLevel: "Recumbent/Down" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Swelling in throat / briskets",
      "Labored / rapid breathing",
      "High body fever (>103°F)"
    ],
    lesionType: "Hot painful submandibular throat swelling, extended head posture with loud stertorous snoring breathing",
    photoUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-mastitis",
    name: "Clinical Mastitis",
    icon: "🐄",
    species: "Cow",
    breed: "Gir",
    age: 6,
    bodyTemperatureF: 103.2,
    activityLevel: "Lethargic" as const,
    appetite: "Reduced" as const,
    symptoms: [
      "Swollen / painful udder quarter",
      "Sudden drop in milk yield",
      "Abnormal clots / yellow flakes in milk"
    ],
    lesionType: "Right hind quarter severely indurated, swollen and warm to touch; strip cup shows thick yellowish clots and blood tinge",
    photoUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-theileriosis",
    name: "Theileriosis (Tick Fever)",
    icon: "🔬",
    species: "Cow",
    breed: "Crossbred Jersey",
    age: 3,
    bodyTemperatureF: 106.4,
    activityLevel: "Lethargic" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Massive enlargement of prescapular lymph nodes",
      "High body fever (>103°F)",
      "Corneal cloudiness / bluish haze in eyes"
    ],
    lesionType: "Massive bilateral swelling of prescapular lymph nodes ('golf-ball size'), corneal opacity, and heavy Hyalomma tick burden",
    photoUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-ppr",
    name: "PPR (Goat Plague)",
    icon: "🐐",
    species: "Goat",
    breed: "Osmanabadi",
    age: 2,
    bodyTemperatureF: 105.8,
    activityLevel: "Recumbent/Down" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Severe diarrhea / loose dung",
      "Discharge from eyes / nose",
      "High body fever (>103°F)",
      "Necrotic cheesy sores in mouth"
    ],
    lesionType: "Whitish necrotic pseudomembrane plaques on oral mucosa, crusty dried eyelid discharge, and foul watery diarrhea",
    photoUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-milk-fever",
    name: "Milk Fever (Hypocalcemia)",
    icon: "🥛",
    species: "Cow",
    breed: "HF Cross",
    age: 6,
    bodyTemperatureF: 98.4,
    activityLevel: "Recumbent/Down" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Downer cow with S-shaped neck curvature",
      "Cold ears, horns and muzzle",
      "Subnormal body temperature (<100°F)"
    ],
    lesionType: "Sternal recumbency 24 hours post-calving with S-shaped neck curvature tucked into flank, subnormal temperature (98.4°F)",
    photoUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-bloat",
    name: "Acute Bloat (Tympanites)",
    icon: "🎈",
    species: "Buffalo",
    breed: "Murrah",
    age: 5,
    bodyTemperatureF: 101.8,
    activityLevel: "Lethargic" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Severe balloon-like swelling in left flank",
      "Labored / rapid breathing",
      "Restlessness & kicking at belly"
    ],
    lesionType: "Acute drum-like ballooning distension of left paralumbar fossa after grazing lush alfalfa; respiratory distress",
    photoUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "test-swine-fever",
    name: "African Swine Fever (ASF)",
    icon: "🐖",
    species: "Pig",
    breed: "Large White Yorkshire",
    age: 1,
    bodyTemperatureF: 106.8,
    activityLevel: "Recumbent/Down" as const,
    appetite: "Anorexic" as const,
    symptoms: [
      "Purple / cyanotic skin blotches on ears & abdomen",
      "High body fever (>103°F)",
      "Severe diarrhea / loose dung"
    ],
    lesionType: "Intense purple cyanotic skin blotches on tips of ears, snout, and belly; severe ataxia and high fever",
    photoUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80"
  }
];
