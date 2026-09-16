export interface ChatFAQ {
  keywords: string[];
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  category: "disease" | "first_aid" | "vaccination" | "helpline" | "nutrition" | "general";
  quickActions?: Array<{ label: string; action: string }>;
  suggestedFollowUps: string[];
}

export const LIVESTOCK_FAQS: ChatFAQ[] = [
  {
    keywords: ["lsd", "lumpy", "lumps", "nodule", "nodules", "skin bumps", "लम्पी", "गांठ", "फफोले"],
    questionEn: "What should I do if my cow or buffalo shows skin lumps (Lumpy Skin Disease)?",
    questionHi: "अगर गाय या भैंस के शरीर पर गांठें/फफोले (लम्पी स्किन) दिखें तो क्या करें?",
    category: "disease",
    answerEn: `**Lumpy Skin Disease (LSD) Management & First Aid:**
1. **Immediate Isolation:** Separate the affected animal immediately in a clean, shaded shed to stop biting flies and mosquitoes from transmitting the virus.
2. **Fly & Mosquito Control:** Apply fly repellents (neem oil or herbal spray) around the shed. Use mosquito nets or smoke dried neem leaves in the evening.
3. **Fever & Pain Relief:** Consult your local veterinarian for antipyretic medicine (e.g., Meloxicam/Paracetamol) and immune boosters.
4. **Topical Wound Dressing:** Clean ruptured nodules with mild potassium permanganate solution (1:1000) or apply neem-turmeric paste to prevent maggot infestation.
5. **Feed Soft Gruel:** Provide fresh drinking water, boiled wheat/maize porridge (daliya) with jaggery and mineral mixture.
6. **Vaccination:** Vaccinate all healthy cattle in your village with the homologous Goat Pox / Lumpi-ProVacInd vaccine.`,
    answerHi: `**लम्पी स्किन डिजीज (LSD) प्रबंधन एवं प्राथमिक उपचार:**
1. **तुरंत अलग करें (क्वारंटीन):** प्रभावित पशु को तुरंत अन्य स्वस्थ पशुओं से अलग साफ-सुथरे स्थान पर रखें ताकि मक्खी-मच्छरों से संक्रमण न फैले।
2. **मक्खी-मच्छर नियंत्रण:** बाड़े में नीम के तेल का छिड़काव करें या शाम को सूखी नीम की पत्तियों का धुआं करें।
3. **बुखार व दर्द नियंत्रण:** पशु चिकित्सक की सलाह से बुखार निवारक (Meloxicam/Paracetamol) दवा दें।
4. **गांठों की देखभाल:** फूटी हुई गांठों को पोटेशियम परमैंगनेट (लाल दवा) के हल्के घोल से धोएं और नीम-हल्दी का लेप लगाएं।
5. **सुपाच्य आहार:** गुड़, दलिया और मिनरल मिक्स्चर के साथ ताजा पानी दें।
6. **टीकाकरण:** गांव के अन्य स्वस्थ पशुओं को तुरंत गोट पॉक्स / Lumpi-ProVacInd टीका लगवाएं।`,
    quickActions: [
      { label: "Report Lumpy Case Now", action: "open_report" },
      { label: "Check Outbreak Map", action: "open_map" },
      { label: "Call 1962 Toll-Free", action: "call_1962" }
    ],
    suggestedFollowUps: [
      "Is milk from a cow with Lumpy safe to drink?",
      "Can Lumpy Skin Disease spread to humans?",
      "What is the vaccine for Lumpy Skin Disease?"
    ]
  },
  {
    keywords: ["fmd", "foot and mouth", "drool", "drooling", "saliva", "blister", "hoof", "खुरपका", "मुंहपका", "लार", "खुरहा"],
    questionEn: "What is Foot and Mouth Disease (FMD) and how to care for affected animals?",
    questionHi: "खुरपका-मुंहपका (FMD/खुरहा) के क्या लक्षण हैं और तुरंत क्या देखभाल करें?",
    category: "disease",
    answerEn: `**Foot and Mouth Disease (FMD / Khurha) Emergency Guidance:**
1. **Symptoms:** High fever, continuous ropey saliva drooling, painful blisters on tongue, gums, and between hooves, severe limping.
2. **Mouth Care:** Wash the mouth 2-3 times daily with a mild 1% alum (phitkari) or 0.1% potassium permanganate solution or boro-glycerine.
3. **Foot Care:** Keep the animal on dry, clean bedding (sand or straw). Wash hooves with 2% copper sulfate or 4% washing soda solution.
4. **Soft Nutrition:** Since mouth ulcers cause severe pain, feed soft green grass, boiled rice/maize gruel with jaggery. Avoid dry roughage.
5. **Biosecurity:** Do not allow people or cattle from other herds to enter. Disinfect footwear before entering shed.
6. **Vaccination:** FMD vaccine is administered twice a year under the National Animal Disease Control Programme (NADCP).`,
    answerHi: `**खुरपका-मुंहपका (FMD/खुरहा) आपातकालीन देखभाल:**
1. **पहचान:** तेज़ बुखार, मुंह से लगातार लार टपकना, जीभ-मसूड़ों पर छाले और खुरों के बीच घाव जिससे पशु लंगड़ाता है।
2. **मुंह की सफाई:** 1% फिटकरी (Phitkari) के पानी या बोरोग्लिसरीन से दिन में 2-3 बार मुंह के छालों को साफ करें।
3. **खुरों की सफाई:** पशु को सूखी जगह रखें। खुरों के घावों को फिनाइल या 2% नीला थोथा (कॉपर सल्फेट) के घोल से धोएं।
4. **मुलायम आहार:** चारा खाने में दर्द होने के कारण मुलायम दलिया, गुड़ और हरा चारा दें। सूखा भूसा न दें।
5. **सख्ती से अलगाव:** बीमार पशु का दूध बछड़े को सीधे न पीने दें। बर्तनों को उबलते पानी से धोएं।
6. **टीकाकरण:** वर्ष में दो बार (अप्रैल और सितंबर) सरकारी योजना (NADCP) के तहत टीका अवश्य लगवाएं।`,
    quickActions: [
      { label: "Report FMD Case", action: "open_report" },
      { label: "Call 1962 Ambulance", action: "call_1962" }
    ],
    suggestedFollowUps: [
      "Can calves die from Foot and Mouth Disease?",
      "How to clean hooves with maggots in FMD?",
      "Is FMD vaccine free in government veterinary hospitals?"
    ]
  },
  {
    keywords: ["bloat", "tympany", "gas in stomach", "stomach swollen", "left flank", "अफारा", "पेट फूलना", "टिम्पनी"],
    questionEn: "What is the emergency first aid for sudden acute stomach bloat (tympany)?",
    questionHi: "पशु का पेट अचानक फूलने (अफारा / टिम्पनी) पर क्या प्राथमिक उपचार करें?",
    category: "first_aid",
    answerEn: `**Emergency First Aid for Acute Rumen Bloat (Tympany):**
*⚠️ Acute bloat is life-threatening because the ballooning stomach compresses the lungs and heart!*
1. **Immediate Physical Aid:**
   - Stand the animal with its front legs elevated on a raised mound.
   - Tie a wooden bit or clean rope horizontally across the mouth like a bridle to stimulate continuous chewing, belching, and salivation.
   - Gently massage the left flank upward and inward.
2. **Emergency Drenching:**
   - Administer 500 ml of vegetable cooking oil (mustard or linseed oil) or sweet oil mixed with 30-50 ml of turpentine oil.
   - Or administer commercial antifoaming agent (e.g., Bloatosil / Tympol) as directed.
3. **Critical Red Flag:**
   - If the animal collapses, breathes with open mouth, or tongue turns blue, call a veterinarian immediately for emergency trocarization in the left paralumbar fossa.`,
    answerHi: `**अचानक पेट फूलने (अफारा / टिम्पनी) पर तुरंत प्राथमिक उपचार:**
*⚠️ अफारा एक आपात स्थिति है क्योंकि पेट का दबाव फेफड़ों और दिल पर पड़ता है!*
1. **तुरंत शारीरिक उपाय:**
   - पशु के अगले पैरों को किसी ऊंचे चबूतरे या ढलान पर रखें ताकि पेट का दबाव सीने पर कम हो।
   - मुंह में आड़ा लकड़ी का डंडा या साफ रस्सी बांधें ताकि पशु लगातार चबाए और डकार के जरिए गैस बाहर निकले।
   - बाईं कोख (Left Flank) पर नीचे से ऊपर की ओर हल्के हाथ से मालिश करें।
2. **घरेलू व दवा उपचार:**
   - 250 से 500 मिलीलीटर सरसों का तेल (या मीठा तेल) में 20-30 मिली तारपीन का तेल मिलाकर नाल से धीरे-धीरे पिलाएं।
   - अथवा ब्लोटोसिल (Bloatosil / Tympol) की शीशी तुरंत दें।
3. **गंभीर चेतावनी:**
   - अगर पशु गिर जाए और जीभ नीली पड़ने लगे तो तुरंत पशु चिकित्सक को बुलाकर बाईं कोख में ट्रोकार-कैनुला लगवाएं।`,
    quickActions: [
      { label: "Call 1962 Emergency", action: "call_1962" },
      { label: "Report Urgent Case", action: "open_report" }
    ],
    suggestedFollowUps: [
      "What causes sudden bloat after eating green clover or grain?",
      "How to avoid bloat in dairy cows?",
      "Can baking soda help with bloat?"
    ]
  },
  {
    keywords: ["1962", "helpline", "ambulance", "hospital", "doctor", "toll free", "हेल्पलाइन", "1962", "एम्बुलेंस", "सरकारी डॉक्टर"],
    questionEn: "How do I contact the government mobile veterinary clinic and toll-free helpline?",
    questionHi: "सरकारी मोबाइल पशु चिकित्सा एम्बुलेंस और 1962 हेल्पलाइन से कैसे संपर्क करें?",
    category: "helpline",
    answerEn: `**Government Mobile Veterinary Service & Emergency Helplines:**
* **Toll-Free National Helpline: 1962** (Available 24x7 in most states across India).
* **Mobile Veterinary Units (MVU):** The 1962 call center dispatches an emergency veterinary vehicle equipped with a qualified doctor, para-vet, diagnostic kit, and life-saving medicines directly to your doorstep/village.
* **Kisan Call Center: 1800-180-1551** for livestock advisory and agricultural questions.
* **National Animal Disease Outbreak Reporting:** You can also submit real-time digital outbreak reports directly through this PashuRaksha AI app to alert the District Chief Veterinary Officer (CVO).`,
    answerHi: `**सरकारी मोबाइल पशु चिकित्सा सेवा एवं आपातकालीन हेल्पलाइन:**
* **टोल-फ्री राष्ट्रीय पशु हेल्पलाइन: 1962** (पूरे भारत में 24 घंटे उपलब्ध)।
* **मोबाइल वेटरनरी यूनिट (MVU):** 1962 पर कॉल करने पर एक पूर्ण सुसज्जित पशु चिकित्सा एम्बुलेंस डॉक्टर, दवाओं और जांच उपकरणों के साथ सीधे आपके गांव/घर पहुंचती है।
* **किसान कॉल सेंटर: 1800-180-1551** पशुपालन व कृषि संबंधी सलाह हेतु।
* **महामारी पूर्व चेतावनी:** आप इस पशुरक्षा AI ऐप के माध्यम से भी सीधे बीमार पशु की फोटो व लक्षण भेजकर जिला मुख्य पशु चिकित्सा अधिकारी (CVO) को सूचित कर सकते हैं।`,
    quickActions: [
      { label: "Call 1962 Toll-Free", action: "call_1962" },
      { label: "Submit New Case Report", action: "open_report" }
    ],
    suggestedFollowUps: [
      "Is the 1962 veterinary service free of cost?",
      "What facilities are available inside a Mobile Veterinary Unit?",
      "How to report a disease outbreak in the whole village?"
    ]
  },
  {
    keywords: ["vaccine", "vaccination", "schedule", "calendar", "shot", "टीका", "टीकाकरण", "कैलेंडर", "सुई"],
    questionEn: "What is the recommended vaccination schedule for cows, buffaloes, and goats in India?",
    questionHi: "भारत में गाय, भैंस और बकरियों के लिए सरकारी टीकाकरण कैलेंडर क्या है?",
    category: "vaccination",
    answerEn: `**Standard National Livestock Vaccination Schedule (ICAR-IVRI):**
1. **Foot and Mouth Disease (FMD):**
   - Timing: Twice a year (Pre-monsoon May-June and Post-monsoon Nov-Dec).
   - Eligible: Cattle & Buffaloes from 4 months age; boosters annually.
2. **Hemorrhagic Septicemia (HS / Galghontu):**
   - Timing: May-June (strictly before monsoon rains).
   - Animals: Cattle and Buffaloes aged 6 months and above.
3. **Black Quarter (BQ / Chuchia):**
   - Timing: May-June before monsoon.
   - Animals: Cattle and Buffaloes aged 6 months to 2 years.
4. **Lumpy Skin Disease (LSD):**
   - Timing: Annually or pre-vector season with homologous goat pox / Lumpi-ProVacInd vaccine.
5. **Brucellosis (Bruvax / Cotton Strain 19):**
   - Timing: ONCE in lifetime for female calves between 4 to 8 months age only.
6. **Peste des Petits Ruminants (PPR) for Goats & Sheep:**
   - Timing: 3 months age; provides immunity for 3 years.
7. **Enterotoxemia (ET) for Sheep/Goats:**
   - Timing: May-June before monsoon lush grazing.`,
    answerHi: `**भारतीय पशु चिकित्सा अनुसंधान संस्थान (ICAR-IVRI) टीकाकरण कैलेंडर:**
1. **खुरपका-मुंहपका (FMD):**
   - समय: वर्ष में दो बार (मई-जून और नवंबर-दिसंबर)।
   - पशु: 4 माह से ऊपर की सभी गाय व भैंसें।
2. **गलघोंटू (HS):**
   - समय: मई-जून (मानसून शुरू होने से पहले)।
   - पशु: 6 माह से ऊपर के गोवंश व भैंस।
3. **लंगड़ा बुखार / काला बावा (BQ):**
   - समय: मई-जून (मानसून पूर्व)।
   - पशु: 6 माह से 2 वर्ष के बछड़े-बछड़ियां।
4. **लम्पी स्किन डिजीज (LSD):**
   - समय: साल में एक बार गोट पॉक्स / लम्पी-प्रोवैकइन्ड टीका।
5. **ब्रुसेलोसिस (Brucellosis):**
   - समय: केवल मादा बछड़ियों (4 से 8 माह की उम्र) में जीवन में केवल एक बार।
6. **पीपीआर (PPR - बकरी प्लेग):**
   - समय: 3 माह की उम्र में बकरियों व भेड़ों को; 3 साल तक सुरक्षा।
7. **फड़किया (Enterotoxemia - ET):**
   - समय: मई-जून में भेड़ों और बकरियों को।`,
    quickActions: [
      { label: "View INAPH Animal Records", action: "open_records" },
      { label: "Call 1962 for Vaccine Schedule", action: "call_1962" }
    ],
    suggestedFollowUps: [
      "Can pregnant animals be given FMD or HS vaccine?",
      "What to do if animal develops mild swelling after vaccine?",
      "Is Brucella vaccine safe for adult milch cows?"
    ]
  },
  {
    keywords: ["mastitis", "udder", "teat", "milk clots", "swollen udder", "थान", "थनैला", "मैस्टाइटिस", "दूध में छीछड़े"],
    questionEn: "How to identify and treat Mastitis (swollen udder / milk clots)?",
    questionHi: "थनैला रोग (मैस्टाइटिस) की पहचान और शुरुआती रोकथाम कैसे करें?",
    category: "disease",
    answerEn: `**Bovine Mastitis (Thanaila) Identification & Care:**
1. **Cardinal Signs:** Swollen, hot, hard, or painful udder quarter; flakes, clots, or watery/bloody milk; refusal to let calf nurse.
2. **Immediate Milking Protocol:**
   - Milk the infected quarter completely into a separate container 4-5 times a day to evacuate bacterial toxins. NEVER let infected milk fall on the barn floor!
   - Dispose of the mastitic milk safely.
3. **Cold & Warm Compresses:**
   - In acute hot swelling, apply cold ice packs for 10 minutes to relieve congestion.
   - In subacute stages, warm water fomentation helps circulation.
4. **Veterinary Treatment:**
   - Intramammary antibiotic infusion tubes (prescribed by a registered veterinarian) after complete stripping of the quarter.
   - Systemic anti-inflammatory and supportive Vitamin E / Selenium / Trisodium Citrate therapy.
5. **Prevention:**
   - Practice post-milking teat dipping in 0.5% povidone iodine.
   - Do not let cows sit on dirty ground for 30 minutes after milking while teat sphincter remains open.`,
    answerHi: `**थनैला रोग (मैस्टाइटिस) पहचान एवं प्राथमिक रोकथाम:**
1. **लक्षण:** थन में अत्यधिक सूजन, गर्माहट, कड़ापन या दर्द; दूध में लालिमा, पानी जैसा पतलापन या पनीर जैसे छीछड़े आना।
2. **तुरंत दूहने का नियम:**
   - संक्रमित थन को दिन में 4-5 बार पूरी तरह से अलग बर्तन में निचोड़ें ताकि अंदर का विषैला दूध बाहर निकल जाए।
   - इस दूध को कभी भी जमीन पर न गिराएं और न ही बछड़े को पीने दें।
3. **सिकाई:** शुरुआती तेज सूजन व गर्माहट में बर्फ से ठंडी सिकाई करें।
4. **डॉक्टरी उपचार:**
   - पशु चिकित्सक द्वारा थन के अंदर डाली जाने वाली एंटीबायोटिक ट्यूब (Intramammary Infusion) लगवाएं।
   - ट्राइसोडियम साइट्रेट (Trisodium Citrate) पाउडर या मैस्टीकिट पाउडर चारे में दें।
5. **बचाव:**
   - दूध निकालने के तुरंत बाद थन को पोवीडोन आयोडीन के घोल में डुबोएं (Teat Dipping)।
   - दूध निकालने के बाद कम से कम आधा घंटा पशु को बैठने न दें ताकि थन का छेद बंद हो सके।`,
    quickActions: [
      { label: "Report Mastitis Case", action: "open_report" },
      { label: "Call Veterinary Doctor", action: "call_1962" }
    ],
    suggestedFollowUps: [
      "What is the California Mastitis Test (CMT)?",
      "Can humans drink boiled milk from a cow with mastitis?",
      "What is dry cow therapy for mastitis?"
    ]
  },
  {
    keywords: ["deworming", "worms", "belly", "dung", "कीड़े", "पेट के कीड़े", "कृमि", "दवा"],
    questionEn: "When and how should I deworm my cattle, buffaloes, and goats?",
    questionHi: "गाय, भैंस और बकरियों को पेट के कीड़े (कृमिनाशक) की दवा कब और कैसे दें?",
    category: "nutrition",
    answerEn: `**Scientific Livestock Deworming Guidelines:**
1. **Calves:**
   - First dose at 10-14 days of age (against Toxocara roundworms) using Piperazine or Albendazole.
   - Repeat monthly until 6 months of age.
2. **Adult Cattle & Buffaloes:**
   - Minimum twice a year: Once pre-monsoon (May) and once post-monsoon (October/November).
   - Alternate anthelmintic chemical classes (Albendazole, Fenbendazole, Ivermectin, Oxyclozanide for liver flukes) to avoid drug resistance.
3. **Pregnant Animals Caution:**
   - *Fenbendazole* is safe during pregnancy. Avoid Albendazole in the first trimester (first 45 days) of pregnancy.
4. **Administration Tip:**
   - Give dewormers early in the morning on an empty stomach.
   - Follow up with liver tonic (e.g., Liv-52 / Belamyl) for 5 days post-deworming.`,
    answerHi: `**पशुओं में कृमिनाशक (कीड़े मारने की दवा) देने का सही तरीका:**
1. **छोटे बछड़े-बछड़ियां:**
   - पहली खुराक जन्म के 10 से 14 दिन पर (पाइपराज़िन या एल्बेंडाजोल)।
   - 6 माह की उम्र तक हर महीने एक बार कीड़े की दवा दें।
2. **बड़े गोवंश व भैंस:**
   - साल में कम से कम 2 बार: पहली बरसात से पहले (मई) और दूसरी बरसात के बाद (अक्टूबर/नवंबर)।
   - हर बार दवा बदल कर दें (जैसे एक बार Fenbendazole, अगली बार Ivermectin या Oxyclozanide) ताकि कीड़ों में प्रतिरोधक क्षमता न बने।
3. **गाभिन पशुओं में सावधानी:**
   - गाभिन पशुओं के लिए *फेनबेंडाजोल (Fenbendazole)* पूरी तरह सुरक्षित है। पहली तिमाही में एल्बेंडाजोल न दें।
4. **दवा देने का नियम:**
   - सुबह खाली पेट दवा दें और दवा के बाद 5 दिन तक लिवर टॉनिक दें।`,
    quickActions: [
      { label: "Check Animal Records", action: "open_records" }
    ],
    suggestedFollowUps: [
      "What are signs of worms in buffaloes?",
      "Which dewormer kills liver flukes (Fasciola)?",
      "How to give Ivermectin injection safely?"
    ]
  },
  {
    keywords: ["milk fever", "calving", "downer", "neck s", "calcium", "मिल्क फीवर", "प्रसव", "गर्दन मुड़ना", "कैल्शियम"],
    questionEn: "What is Milk Fever (Hypocalcemia) and how to handle a downer cow after delivery?",
    questionHi: "प्रसव के बाद गाय का बैठ जाना / गर्दन मुड़ना (मिल्क फीवर) क्या है और क्या करें?",
    category: "first_aid",
    answerEn: `**Milk Fever (Hypocalcemia) Emergency Response:**
*⚠️ Occurs within 24 to 72 hours after calving in high-yielding dairy cows due to sudden drop in blood calcium.*
1. **Symptoms:** S-shaped neck curvature, cold ears and muzzle, subnormal body temperature (<100°F), inability to stand, dry muzzle.
2. **CRITICAL WARNING:** NEVER forcefully drench liquids or medicines orally while the animal is down because throat paralysis causes immediate aspiration pneumonia and death!
3. **Emergency Treatment:**
   - Call a veterinarian immediately for intravenous infusion of Calcium Borogluconate (CBG) under heart monitoring.
   - Keep the animal propped in sternal recumbency (sitting upright on its chest) supported by hay bales; never allow it to lie flat on its side.
4. **Prevention:**
   - Feed anionic salts in late dry period.
   - Administer oral calcium gels (e.g., Calup Gel) immediately after calving and 12 hours later.`,
    answerHi: `**मिल्क फीवर (सूतक ज्वर / कैल्शियम की कमी) आपातकालीन कदम:**
*⚠️ यह अधिक दूध देने वाली गाय-भैंसों में ब्याने के 24 से 72 घंटे के भीतर खून में कैल्शियम की कमी से होता है।*
1. **पहचान:** पशु का बैठ जाना, गर्दन का अंग्रेजी अक्षर 'S' की तरह मुड़ जाना, कान व थन ठंडे पड़ना, शरीर का तापमान कम होना।
2. **सख्त चेतावनी:** बैठे हुए या बेसुध पशु को कभी भी मुंह से नाल के जरिए कोई तरल दवा न पिलाएं, इससे दवा फेफड़ों में जाकर पशु की तुरंत मौत हो सकती है!
3. **तत्काल इलाज:**
   - तुरंत सरकारी पशु चिकित्सक को बुलाएं और नस के जरिए कैल्शियम बोरोग्लूकोनेट (CBG) चढ़वाएं।
   - पशु को पेट के बल (सीने पर) टेक लगाकर बैठाएं, करवट के बल न लेटने दें।
4. **बचाव:**
   - प्रसव से पहले अत्यधिक कैल्शियम न दें।
   - ब्याने के तुरंत बाद और 12 घंटे बाद ओरल कैल्शियम जेल (जैसे Calup Gel) चटाएं।`,
    quickActions: [
      { label: "Call 1962 Emergency", action: "call_1962" },
      { label: "Report Urgent Downer Cow", action: "open_report" }
    ],
    suggestedFollowUps: [
      "Why should calcium not be given before calving?",
      "How to use oral calcium gel after delivery?",
      "What is Ketosis vs Milk Fever?"
    ]
  },
  {
    keywords: ["black quarter", "bq", "crackling", "leg swelling", "काला बावा", "लंगड़ा बुखार", "चरचराहट", "सूजन"],
    questionEn: "How to identify Black Quarter (BQ / Chuchia) in young cattle?",
    questionHi: "लंगड़ा बुखार / काला बावा (BQ) की पहचान और तुरंत क्या करें?",
    category: "disease",
    answerEn: `**Black Quarter (BQ / Clostridium chauvoei) Guide:**
1. **Target Animals:** Usually affects healthy, fast-growing young cattle aged 6 months to 2 years.
2. **Key Symptoms:** Sudden severe lameness, high fever (>105°F), hot and painful swelling in heavy muscles of shoulder, thigh, or loin.
3. **Pathognomonic Sign:** When pressing the swollen muscle with your hand, you feel a distinct crackling/crepitating sound (like stepping on dry leaves or bubble wrap) caused by subcutaneous gas bubbles.
4. **Urgent Action:** BQ is rapidly fatal within 12-48 hours. Immediate high-dose Penicillin and supportive therapy by a veterinarian is required in the earliest stages.
5. **Prevention:** Annual pre-monsoon BQ vaccination in May-June.`,
    answerHi: `**काला बावा / लंगड़ा बुखार (Black Quarter - BQ):**
1. **प्रभावित पशु:** यह मुख्य रूप से 6 माह से 2 वर्ष के तंदुरुस्त बछड़े-बछड़ियों में अधिक होता है।
2. **प्रमुख लक्षण:** अचानक तेज लंगड़ापन, 105°F से अधिक तेज बुखार, पुट्ठे या कंधे की भारी मांसपेशियों में सूजन।
3. **खास पहचान (चरचराहट):** सूजन वाली जगह को हाथ से दबाने पर सूखी पत्तियों या प्लास्टिक जैसी चर-चर (क्रेपिटेशन) की आवाज आती है क्योंकि अंदर गैस भर जाती है।
4. **तत्काल कदम:** यह रोग बहुत तेजी से फैलता है। लक्षण दिखते ही तुरंत पेनिसिलिन और एंटीबायोटिक इंजेक्शन लगवाने हेतु डॉक्टर को बुलाएं।
5. **बचाव:** हर वर्ष बरसात से पहले (मई-जून) बी.क्यू. (BQ) का टीका अवश्य लगवाएं।`,
    quickActions: [
      { label: "Report BQ Emergency", action: "open_report" },
      { label: "Call 1962 Immediately", action: "call_1962" }
    ],
    suggestedFollowUps: [
      "Can Black Quarter spread to humans?",
      "How to safely bury an animal that died of BQ?",
      "What is the combined HS-BQ vaccine?"
    ]
  },
  {
    keywords: ["anthrax", "blood from nose", "tarry blood", "sudden death", "एंथ्रेक्स", "काला खून", "अचानक मौत"],
    questionEn: "What are the danger signs of Anthrax and critical biosecurity rules?",
    questionHi: "एंथ्रेक्स के खतरनाक लक्षण क्या हैं और इसमें क्या सख्त सावधानी रखनी चाहिए?",
    category: "disease",
    answerEn: `**ANTHRAX CRITICAL BIOHAZARD ADVISORY (ICAR & WOAH):**
*⚠️ Anthrax is a deadly zoonotic disease that spreads to humans!*
1. **Cardinal Danger Signs:**
   - Sudden unexplained death in cattle/sheep with no prior sickness.
   - Dark, tarry, uncoagulated blood oozing from mouth, nostrils, anus, or vulva.
   - Absence of normal rigor mortis (stiffness); rapid bloated decomposition.
2. **STRICT SAFETY RULE:**
   - **DO NOT OPEN THE CARCASS OR CONDUCT A POST-MORTEM!** Exposure to air triggers bacteria to form indestructible spores that contaminate soil for 50+ years.
   - Do NOT consume, skin, sell, or touch meat or hide.
3. **Disposal:**
   - Dig a deep pit (at least 6-8 feet deep) away from water sources.
   - Cover carcass with quicklime (chuna) and bury completely.
   - Alert District Animal Husbandry Office immediately.`,
    answerHi: `**एंथ्रेक्स (गिल्टी रोग) अति-गंभीर जैविक चेतावनी:**
*⚠️ एंथ्रेक्स एक जानलेवा बीमारी है जो पशुओं से इंसानों में भी फैलती है!*
1. **खतरे के संकेत:**
   - बिना किसी पूर्व लक्षण के पशु की अचानक मौत।
   - मुंह, नाक, गुदा या योनि से काले रंग का न जमने वाला तारकोल जैसा खून बहना।
   - मरने के बाद शरीर में अकड़न (Rigor mortis) न होना और पेट तेजी से फूलना।
2. **सबसे सख्त नियम:**
   - **मृत पशु का पेट कभी न चीरें (पोस्टमार्टम न करें)!** हवा के संपर्क में आते ही इसके जीवाणु 50 वर्षों तक जीवित रहने वाले घातक बीजाणु बना लेते हैं।
   - मांस, चमड़ा या हड्डियों को कभी न छुएं।
3. **निस्तारण:**
   - आबादी व जल स्रोतों से दूर 6 से 8 फीट गहरा गड्ढा खोदें।
   - शव पर भारी मात्रा में अनबुझा चूना डालकर गड्ढे को मिट्टी से भरें।
   - तुरंत जिला पशु चिकित्सा अधिकारी को सूचित करें।`,
    quickActions: [
      { label: "Call Emergency Veterinary Office", action: "call_1962" },
      { label: "Report Suspected Anthrax Alert", action: "open_report" }
    ],
    suggestedFollowUps: [
      "Can humans get Anthrax from handling wool or skin?",
      "How is Anthrax treated if detected early?",
      "Which vaccine protects against Anthrax?"
    ]
  }
];

export function findFaqMatch(query: string): ChatFAQ | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  let bestMatch: ChatFAQ | null = null;
  let maxScore = 0;

  for (const faq of LIVESTOCK_FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  return maxScore >= 2 ? bestMatch : null;
}
