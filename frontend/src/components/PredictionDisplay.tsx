import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Sparkles } from 'lucide-react';

interface Prediction {
  text: string;
  confidence: number;
  type: 'letter' | 'word' | 'gesture';
  timestamp: Date;
}

interface PredictionDisplayProps {
  currentPrediction: Prediction | null;
  isDetecting: boolean;
  translatedText: string; // ✅ RECEIVE FULL SENTENCE
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "bn", label: "Bengali" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" }
];

const PredictionDisplay = ({
  currentPrediction,
  isDetecting,
  translatedText
}: PredictionDisplayProps) => {

  const [targetLang, setTargetLang] = useState("hi");

  // 🔥 IMPORTANT: separate state (avoid conflict with prop)
  const [translatedOutput, setTranslatedOutput] = useState("");

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-success';
    if (confidence >= 0.5) return 'bg-warning';
    return 'bg-destructive';
  };

  // 🔥 TRANSLATE FULL SENTENCE (NOT JUST CURRENT CHAR)
  useEffect(() => {
    const translateText = async () => {
      if (!translatedText) {
        setTranslatedOutput("");
        return;
      }

      try {
        // If English selected → no API call
        if (targetLang === "en") {
          setTranslatedOutput(translatedText);
          return;
        }

        const response = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: translatedText,   // ✅ FULL SENTENCE
            source: "en",
            target: targetLang
          })
        });

        const data = await response.json();
        setTranslatedOutput(data.translated_text);

      } catch (error) {
        console.error("Translation error:", error);
      }
    };

    translateText();

  }, [translatedText, targetLang]);

  return (
    <div className="glass-panel-strong p-6 h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Hand className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Live Detection</h2>
          <p className="text-sm text-muted-foreground">
            {isDetecting ? 'Analyzing gestures...' : 'Start camera to begin'}
          </p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="mb-4">
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
      </div>

      {/* Detected Current Gesture */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Current Detection
        </p>

        <AnimatePresence mode="wait">
          {currentPrediction ? (
            <motion.div
              key={currentPrediction.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glow-border rounded-xl p-4 bg-secondary"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl font-display font-bold text-gradient">
                  {currentPrediction.text}
                </span>

                <span className="text-sm font-medium">
                  {Math.round(currentPrediction.confidence * 100)}%
                </span>
              </div>

              <div className="confidence-bar">
                <motion.div
                  className={`confidence-bar-fill ${getConfidenceColor(currentPrediction.confidence)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentPrediction.confidence * 100}%` }}
                />
              </div>
            </motion.div>
          ) : (
            <div className="rounded-xl p-4 bg-secondary/50 border border-dashed border-muted text-center">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No gesture detected
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔥 FULL SENTENCE TRANSLATION */}
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Translation (English → {LANGUAGES.find(l => l.code === targetLang)?.label})
        </p>

        <div className="h-32 rounded-xl bg-secondary/50 p-4 overflow-y-auto">
          {translatedOutput ? (
            <motion.p
              className="text-lg font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {translatedOutput}
            </motion.p>
          ) : (
            <p className="text-muted-foreground italic">
              Translated text will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionDisplay;
