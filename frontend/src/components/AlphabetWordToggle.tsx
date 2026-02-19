import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const AlphabetWordToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAlphabet = location.pathname === '/';

  return (
    <div className="glass-panel p-1 inline-flex items-center gap-1">
      <button
        onClick={() => navigate('/')}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          isAlphabet
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {isAlphabet && (
          <motion.div
            layoutId="alphabetWordMode"
            className="absolute inset-0 bg-primary rounded-lg"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10">Mode: Alphabet</span>
      </button>

      <div className="w-px h-6 bg-border" />

      <button
        onClick={() => navigate('/word')}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          !isAlphabet
            ? 'text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {!isAlphabet && (
          <motion.div
            layoutId="alphabetWordMode"
            className="absolute inset-0 bg-accent rounded-lg"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10">Mode: Word</span>
      </button>
    </div>
  );
};

export default AlphabetWordToggle;