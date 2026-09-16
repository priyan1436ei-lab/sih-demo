import React, { useState, useEffect, useRef } from "react";
import { Language, UserRole, ChatMessage } from "../types";
import { SUPPORTED_LANGUAGES } from "../data/translations";
import { sendLivestockChatMessage } from "../services/api";
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Check,
  Copy,
  Zap
} from "lucide-react";

interface LivestockChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLangChange?: (lang: Language) => void;
  userRole?: UserRole;
  onNavigateTab?: (tab: "report" | "map" | "records") => void;
  onOpenIVR?: () => void;
}

const COMMON_DOUBT_CHIPS = [
  { en: "🐄 Pregnancy Detection", hi: "🐄 गाभिन की पहचान कैसे करें?", queryEn: "How to know if a cow or buffalo is pregnant? What are early symptoms?", queryHi: "गाय या भैंस के गाभिन होने की पहचान कैसे करें? शुरुआती लक्षण क्या हैं?" },
  { en: "🥛 Increase Milk & Fat", hi: "🥛 दूध व फैट कैसे बढ़ाएं?", queryEn: "How to increase milk yield and fat percentage in dairy cattle?", queryHi: "गाय-भैंस में दूध उत्पादन और फैट प्रतिशत बढ़ाने के उपाय बताएं?" },
  { en: "🌿 Silage & Fodder Guide", hi: "🌿 साइलेज (हरा चारा) बनाना", queryEn: "How to prepare good quality silage at home from green fodder?", queryHi: "घर पर हरे चारे से पौष्टिक साइलेज (चारा अचार) कैसे बनाएं?" },
  { en: "🚨 Lumpy Skin First Aid", hi: "🚨 लम्पी रोग के लक्षण व उपचार", queryEn: "What are symptoms and first aid for Lumpy Skin Disease?", queryHi: "लम्पी स्किन डिजीज के लक्षण और प्राथमिक उपचार क्या हैं?" },
  { en: "🩹 Bloat / Tympany Care", hi: "🩹 पेट फूलने (अफारा) पर क्या करें?", queryEn: "What is emergency first aid for sudden acute bloat in cattle?", queryHi: "पशु का पेट अचानक फूलने (अफारा / टिम्पनी) पर क्या घरेलू इलाज करें?" },
  { en: "💉 Vaccination Schedule", hi: "💉 सरकारी टीकाकरण कैलेंडर", queryEn: "What is the recommended livestock vaccination schedule?", queryHi: "गाय, भैंस और बकरियों के लिए सरकारी टीकाकरण कैलेंडर क्या है?" },
  { en: "🏛️ KCC & Govt Subsidies", hi: "🏛️ पशुपालन केसीसी व सब्सिडी", queryEn: "What are government subsidies and Kisan Credit Card rules for animal husbandry?", queryHi: "पशुपालन किसान क्रेडिट कार्ड (KCC) और सरकारी सब्सिडी के क्या नियम हैं?" },
  { en: "📞 1962 Mobile Vet Clinic", hi: "📞 1962 सरकारी पशु एम्बुलेंस", queryEn: "How to call 1962 mobile veterinary ambulance?", queryHi: "1962 मोबाइल वेटरनरी एम्बुलेंस कैसे बुलाएं?" }
];

export const LivestockChatbot: React.FC<LivestockChatbotProps> = ({
  isOpen,
  onClose,
  lang,
  onLangChange,
  userRole = "farmer",
  onNavigateTab,
  onOpenIVR
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const isHi = lang === "hi";
    return [
      {
        id: "msg_welcome",
        sender: "bot",
        text: isHi
          ? `**नमस्ते! मैं 'पशु मित्र AI' हूँ — आपका 24x7 पशु स्वास्थ्य व संपूर्ण कृषि सलाहकार।**\n\nआप मुझसे **कोई भी सवाल** पूछ सकते हैं: जैसे गाय-भैंस का दूध व फैट बढ़ाना, गाभिन की पहचान, हरा चारा व साइलेज, बीमारी के लक्षण व प्राथमिक उपचार, सरकारी योजनाएं व KCC, या कोई भी सामान्य शंका।\n\nआप नीचे दिए गए विषयों पर क्लिक करके, टाइप करके, या बोलकर (माइक) सवाल पूछ सकते हैं।`
          : `**Namaste! I am 'Pashu Mitra AI' — your 24x7 all-round Livestock, Dairy & Farming Advisor.**\n\nAsk me **ANY question**: increasing milk yield and butterfat, pregnancy detection, green fodder and silage, disease first-aid, vaccination schedules, government schemes & KCC loans, or any general doubt.\n\nYou can type, speak using the microphone, or tap any topic below to get started.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: "general",
        suggestedFollowUps: isHi
          ? ["गाय-भैंस में गाभिन होने की पहचान कैसे करें?", "दूध और फैट कैसे बढ़ाएं?", "लम्पी स्किन रोग के क्या लक्षण हैं?"]
          : ["How to know if a cow is pregnant?", "How to boost milk yield and butterfat?", "What are symptoms of Lumpy Skin Disease?"]
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        lang === "hi"
          ? "आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया लिखकर प्रश्न पूछें।"
          : "Voice input is not supported in this browser. Please type your query."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition start failed:", err);
      }
    }
  };

  // Text to Speech
  const speakMessage = (text: string) => {
    if (!("speechSynthesis" in window)) return;

    if (speechSynthesisActive) {
      window.speechSynthesis.cancel();
      setSpeechSynthesisActive(false);
      return;
    }

    // Clean markdown formatting before speaking
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/#/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/[\*\_\`]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeechSynthesisActive(false);
    utterance.onerror = () => setSpeechSynthesisActive(false);

    setSpeechSynthesisActive(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleResetChat = () => {
    const isHi = lang === "hi";
    setMessages([
      {
        id: `reset_${Date.now()}`,
        sender: "bot",
        text: isHi
          ? `वार्तालाप रीसेट कर दिया गया है। आप कोई भी नया प्रश्न पूछ सकते हैं।`
          : `Chat reset. Feel free to ask any animal health question or doubt.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: "general"
      }
    ]);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      // Build history for multi-turn chat
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await sendLivestockChatMessage({
        message: query,
        history,
        language: lang,
        userRole
      });

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: res.category,
        quickActions: res.quickActions,
        suggestedFollowUps: res.suggestedFollowUps,
        latencyMs: res.latencyMs
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: "bot",
        text:
          lang === "hi"
            ? "माफ़ कीजिए, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें या आपात स्थिति में तुरंत 1962 पर कॉल करें।"
            : "Sorry, I encountered an issue processing your query. Please try again or call 1962 for immediate assistance.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickActions: [{ label: "Call 1962", action: "call_1962" }]
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute quick action from bot response
  const handleActionClick = (action: string) => {
    if (action === "open_report" && onNavigateTab) {
      onNavigateTab("report");
      onClose();
    } else if (action === "open_map" && onNavigateTab) {
      onNavigateTab("map");
      onClose();
    } else if (action === "open_records" && onNavigateTab) {
      onNavigateTab("records");
      onClose();
    } else if (action === "call_1962") {
      window.location.href = "tel:1962";
    }
  };

  // Render markdown with clean formatting (bold, lists, line breaks)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split("\n");
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Check if bullet point
          if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-emerald-700 font-bold mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
              </div>
            );
          }

          // Check if numbered point (e.g. 1., 2.)
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 my-1">
                <span className="font-bold text-emerald-800 bg-emerald-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {numMatch[1]}
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
          );
        })}
      </div>
    );
  };

  // Helper to replace **bold** with <strong>
  const formatInline = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-stone-900'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='text-stone-800'>$1</em>");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMaximized
          ? "inset-2 sm:inset-4 md:inset-8"
          : "bottom-3 sm:bottom-5 right-3 sm:right-5 w-[calc(100vw-24px)] sm:w-[440px] md:w-[480px] h-[600px] max-h-[88vh]"
      }`}
    >
      <div className="w-full h-full bg-stone-50 rounded-2xl shadow-2xl border-2 border-emerald-700/40 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Chatbot Header */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-3.5 sm:p-4 shrink-0 flex items-center justify-between border-b border-emerald-700/50 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {lang === "hi" ? "पशु मित्र AI" : "Pashu Mitra AI"}
                </h3>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  24x7 Doubt Solver
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 flex items-center gap-1">
                <span>{lang === "hi" ? "ICAR-IVRI व सरकारी पशु चिकित्सा ज्ञानकोश" : "ICAR-IVRI Verified Veterinary Advisor"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language switch */}
            {onLangChange && (
              <select
                value={lang}
                onChange={(e) => onLangChange(e.target.value as Language)}
                className="px-2 py-1 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors focus:outline-none cursor-pointer"
                title="Change language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-emerald-950 text-white">
                    {l.nativeName}
                  </option>
                ))}
              </select>
            )}

            {/* Reset Chat */}
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Maximize / Restore */}
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              title={isMaximized ? "Restore size" : "Maximize window"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-rose-500/30 transition-colors"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toll-Free Emergency Helpline Banner */}
        <div className="bg-amber-500/15 border-b border-amber-400/30 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-900 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-amber-700 fill-amber-600" />
            <span>
              {lang === "hi" ? "आपातकालीन पशु एम्बुलेंस हेल्पलाइन:" : "Emergency Mobile Vet Clinic:"}{" "}
              <strong className="font-bold text-amber-950">1962 (Toll-Free 24x7)</strong>
            </span>
          </div>
          <a
            href="tel:1962"
            className="px-2 py-0.5 bg-amber-600 text-white rounded-full font-bold text-[10px] hover:bg-amber-700 transition-colors"
          >
            {lang === "hi" ? "कॉल करें" : "Call Now"}
          </a>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 bg-stone-100/60">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-stone-800 shadow-xs relative ${
                    isUser
                      ? "bg-emerald-700 text-white rounded-tr-xs"
                      : "bg-white border border-stone-200/80 rounded-tl-xs"
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}

                  {/* Actions attached to Bot message */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => speakMessage(msg.text)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors font-medium border border-emerald-200"
                          title="Listen to answer"
                        >
                          <Volume2 className="w-3 h-3 text-emerald-700" />
                          <span>{lang === "hi" ? "आवाज सुनें" : "Listen"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {msg.latencyMs && (
                        <span className="text-[10px] text-stone-600 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 text-amber-500" />
                          <span>{msg.latencyMs}ms</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Interactive Actions attached to message */}
                {!isUser && msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-w-[90%] pt-0.5">
                    {msg.quickActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => handleActionClick(action.action)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 shadow-xs flex items-center gap-1 transition-all"
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-700" />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="space-y-1 max-w-[90%] pt-1">
                    <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider pl-1">
                      {lang === "hi" ? "संबंधित प्रश्न:" : "Related Doubts:"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {msg.suggestedFollowUps.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          onClick={() => handleSendMessage(fu)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 shadow-2xs hover:border-emerald-500 transition-all text-left"
                        >
                          💬 {fu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-stone-500 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-tl-xs border border-stone-200 text-xs text-stone-500 max-w-[75%] shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{lang === "hi" ? "पशु मित्र AI सोच रहा है..." : "Pashu Mitra is analyzing veterinary guidelines..."}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips Carousel */}
        <div className="bg-white border-t border-stone-200 px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-emerald-600" />
            {lang === "hi" ? "सुझाव:" : "Topics:"}
          </span>
          {COMMON_DOUBT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(lang === "hi" ? chip.queryHi : chip.queryEn)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-stone-700 border border-stone-200 transition-colors shrink-0"
            >
              {lang === "hi" ? chip.hi : chip.en}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md"
                  : "bg-stone-100 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 border-stone-300"
              }`}
              title={
                isListening
                  ? lang === "hi" ? "सुनना बंद करें" : "Stop listening"
                  : lang === "hi" ? "बोलकर पूछें (माइक)" : "Speak your question (Mic)"
              }
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isListening
                  ? lang === "hi" ? "सुन रहे हैं... बोलिए..." : "Listening... speak now..."
                  : lang === "hi"
                  ? "कोई भी शंका पूछें... जैसे: गाय का बुखार, लम्पी, टीका"
                  : "Ask any doubt... e.g. cow fever, goat lumps, vaccine"
              }
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900 placeholder:text-stone-500"
              disabled={isLoading}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-sm transition-colors"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-stone-500 text-center mt-1.5">
            {lang === "hi"
              ? "पशुरक्षा AI सलाह केवल मार्गदर्शन हेतु है। आपात स्थिति में स्थानीय पशु चिकित्सक से संपर्क करें या 1962 पर कॉल करें।"
              : "AI advisory is for informational guidance. In emergency, consult a registered veterinarian or call 1962."}
          </p>
        </div>
      </div>
    </div>
  );
};
