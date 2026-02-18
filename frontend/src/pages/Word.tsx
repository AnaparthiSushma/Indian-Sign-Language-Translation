import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hand, Type, BarChart3 } from 'lucide-react';

import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import PredictionDisplay from '@/components/PredictionDisplay';
import TranslationHistory from '@/components/TranslationHistory';
import TextToSign from '@/components/TextToSign';
import ModeToggle from '@/components/ModeToggle';
import StatsCard from '@/components/StatsCard';
import AlphabetWordToggle from '@/components/AlphabetWordToggle';
import { predictWord } from "@/lib/mlApi";

interface Prediction {
  text: string;
  confidence: number;
  type: 'letter' | 'word' | 'gesture';
  timestamp: Date;
}

interface HistoryEntry {
  id: string;
  text: string;
  timestamp: Date;
  mode: 'sign-to-text' | 'text-to-sign';
}

const Word = () => {
  const [mode, setMode] = useState<'sign-to-text' | 'text-to-sign'>('sign-to-text');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isConnected] = useState(true);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [textToSignInput, setTextToSignInput] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const [stats, setStats] = useState({
    signsDetected: 0,
    wordsTranslated: 0,
    accuracy: 0.92
  });

  // 🔥 REAL WORD BACKEND CALL
  const handleLandmarksDetected = useCallback(
    async (landmarks: number[]) => {


      if (!isCameraActive) return;
      if (!landmarks || landmarks.length !== 126) return;

      try {
        const result = await predictWord(landmarks);

        if (!result || !result.label) return;

        const prediction: Prediction = {
          text: result.label,
          confidence: result.confidence,
          type: 'word',
          timestamp: new Date()
        };

        setCurrentPrediction(prediction);

        setTranslatedText(prev => {
  if (!prev) return result.label;
  const lastWord = prev.split(" ").pop();
  if (lastWord === result.label) return prev;
  return prev + " " + result.label;
});


        setStats(prev => ({
          ...prev,
          signsDetected: prev.signsDetected + 1,
          wordsTranslated: prev.wordsTranslated + 1
        }));

      } catch (err) {
        console.error("Word prediction error:", err);
      }
    },
    [isCameraActive]
  );

  const handleTextToSign = useCallback((text: string) => {
    setIsTranslating(true);
    setTimeout(() => {
      setTextToSignInput(text);
      setIsTranslating(false);
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        text,
        timestamp: new Date(),
        mode: 'text-to-sign'
      };
      setHistory(prev => [entry, ...prev].slice(0, 50));
    }, 500);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  useEffect(() => {
    if (!isCameraActive && translatedText) {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        text: translatedText,
        timestamp: new Date(),
        mode: 'sign-to-text'
      };
      setHistory(prev => [entry, ...prev].slice(0, 50));
      setTranslatedText('');
      setCurrentPrediction(null);
    }
  }, [isCameraActive, translatedText]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Header isConnected={isConnected} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-4"
        >
          <AlphabetWordToggle />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <ModeToggle mode={mode} onModeChange={setMode} />

          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
            <StatsCard icon={Hand} label="Signs" value={stats.signsDetected} color="primary" />
            <StatsCard icon={Type} label="Words" value={stats.wordsTranslated} color="accent" />
            <StatsCard icon={BarChart3} label="Accuracy" value={`${Math.round(stats.accuracy * 100)}%`} color="success" />
          </div>
        </motion.div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {mode === 'sign-to-text' ? (
              <div className="space-y-6">
                {/* ✅ FIXED */}
<CameraFeed
  onLandmarks={handleLandmarksDetected}
  isActive={isCameraActive}
  onToggle={() => setIsCameraActive(!isCameraActive)}
/>


                <PredictionDisplay
                  currentPrediction={currentPrediction}
                  translatedText={translatedText}
                  isDetecting={isCameraActive}
                />
              </div>
            ) : (
              <TextToSign
                onTranslate={handleTextToSign}
                isTranslating={isTranslating}
                currentSignDisplay={textToSignInput}
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="h-[600px]"
          >
            <TranslationHistory history={history} onClear={handleClearHistory} />
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Powered by MediaPipe & Machine Learning •
            <span className="text-primary ml-1">Gesture Bridge</span> •
            Indian Sign Language Translation — Word Mode
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Word;
