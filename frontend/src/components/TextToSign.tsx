import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Mic, MicOff, Hand, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TextToSignProps {
  onTranslate: (text: string) => void;
  isTranslating: boolean;
  currentSignDisplay: string | null;
}

const LANGUAGES = [
  { code: "en", label: "English", speech: "en-US" },
  { code: "te", label: "Telugu", speech: "te-IN" },
  { code: "hi", label: "Hindi", speech: "hi-IN" },
  { code: "es", label: "Spanish", speech: "es-ES" },
  { code: "fr", label: "French", speech: "fr-FR" },
  { code: "de", label: "German", speech: "de-DE" },
  { code: "ta", label: "Tamil", speech: "ta-IN" },
  { code: "kn", label: "Kannada", speech: "kn-IN" },
  { code: "ml", label: "Malayalam", speech: "ml-IN" },
  { code: "bn", label: "Bengali", speech: "bn-IN" }
];

const TextToSign = ({
  onTranslate,
  isTranslating,
  currentSignDisplay
}: TextToSignProps) => {

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [translatedText, setTranslatedText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getISLImage = (char: string) => {
    const upper = char.toUpperCase();
    if (/[A-Z0-9]/.test(upper)) {
      return `/isl/${upper}.jpg`;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    try {
      let targetTranslation = inputText.trim();
      let englishTranslation = inputText.trim();

      // 🔹 1. Source → Target (Google style)
      if (sourceLang !== targetLang) {
        const res1 = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: inputText.trim(),
            source: sourceLang,
            target: targetLang
          })
        });

        const data1 = await res1.json();
        targetTranslation = data1.translated_text;
      }

      // 🔹 2. Source → English (for Sign)
      if (sourceLang !== "en") {
        const res2 = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: inputText.trim(),
            source: sourceLang,
            target: "en"
          })
        });

        const data2 = await res2.json();
        englishTranslation = data2.translated_text;
      }

      setTranslatedText(targetTranslation);
      onTranslate(englishTranslation);

    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!isListening) {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {

        const SpeechRecognition =
          (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        const selectedLang = LANGUAGES.find(l => l.code === sourceLang);
        recognition.lang = selectedLang?.speech || "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          setInputText(event.results[0][0].transcript);
        };
        recognition.onerror = () => setIsListening(false);

        recognition.start();
      } else {
        alert("Speech recognition not supported.");
      }
    } else {
      setIsListening(false);
    }
  };
  const speakText = () => {
  if (!translatedText) return;

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(translatedText);

    const selectedLang = LANGUAGES.find(l => l.code === targetLang);
    utterance.lang = selectedLang?.speech || "en-US";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // stop previous
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Text-to-speech not supported in this browser.");
  }
};

  return (
    <div className="glass-panel-strong p-6 h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Text to Sign</h2>
          <p className="text-sm text-muted-foreground">
            Multi-language → Multi-language → Sign
          </p>
        </div>
      </div>

      {/* 🌍 Language Selectors */}
      <div className="flex gap-3 mb-4 items-center">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-secondary border rounded-md px-3 py-1"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <span>→</span>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-secondary border rounded-md px-3 py-1"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <span className="text-muted-foreground">→ English → Sign</span>
      </div>

      {/* Input */}
      <div className="relative mb-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or speak..."
          className="min-h-[100px] pr-24 resize-none bg-secondary border-muted focus:border-accent"
        />

        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button size="icon" variant="ghost" onClick={toggleSpeechRecognition}>
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!inputText.trim() || isTranslating}
            className="bg-accent text-accent-foreground"
          >
            {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Google-style Translation Output */}
      {translatedText && (
  <div className="mb-4 p-3 rounded-lg bg-secondary border flex justify-between items-center">
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        Translation ({sourceLang} → {targetLang})
      </p>
      <p className="text-base font-medium">{translatedText}</p>
    </div>

    <Button
      size="icon"
      variant="ghost"
      onClick={speakText}
    >
      {isSpeaking ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  </div>
)}


      {/* Sign Output */}
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Sign Output (English → ISL)
        </p>

        <div className="h-full min-h-[150px] rounded-xl bg-secondary/50 p-4 flex items-center justify-center">
          {currentSignDisplay ? (
            <div className="flex flex-wrap justify-center gap-3">
              {currentSignDisplay.split('').map((char, index) =>
                char === ' ' ? (
                  <div key={index} className="w-6" />
                ) : (
                  <div key={index} className="flex flex-col items-center">
                    {getISLImage(char) && (
                      <img
                        src={getISLImage(char)!}
                        alt={char}
                        className="w-16 h-16 object-contain mb-1 rounded-md"
                      />
                    )}
                    <span className="text-xs uppercase">{char}</span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Hand className="w-10 h-10 mx-auto mb-2" />
              Enter text to see sign language output
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToSign;