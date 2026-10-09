import { WordToken } from '@/types';

/**
 * Props for the WordDisplay component
 */
interface WordDisplayProps {
  /** The word token to display */
  word: WordToken;
  /** Whether RSVP is currently playing */
  isPlaying: boolean;
  /** Font size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to highlight the ORP (Optimal Recognition Point) */
  highlightORP?: boolean;
}

/**
 * Displays a single Hebrew word centered for RSVP reading
 * Supports RTL text direction and ORP highlighting
 */
export function WordDisplay({ 
  word, 
  isPlaying, 
  size = 'lg',
  highlightORP = false,
}: WordDisplayProps) {
  const sizeClasses = {
    sm: 'text-4xl md:text-5xl',
    md: 'text-6xl md:text-7xl',
    lg: 'text-7xl md:text-8xl',
  };

  /**
   * Calculates the Optimal Recognition Point (ORP) for Hebrew text
   * For Hebrew RTL text, the ORP is typically around 1/3 from the right edge
   */
  const getORPIndex = (text: string): number => {
    const chars = Array.from(text);
    // For Hebrew, ORP is approximately at 30% from the right (which is ~70% from left in LTR index)
    return Math.floor(chars.length * 0.7);
  };

  /**
   * Renders text with ORP character highlighted
   */
  const renderWithORP = (text: string) => {
    if (!highlightORP) return text;

    const chars = Array.from(text);
    const orpIndex = getORPIndex(text);

    // Split into three parts: before ORP, ORP character, after ORP
    const before = chars.slice(0, orpIndex).join('');
    const orp = chars[orpIndex];
    const after = chars.slice(orpIndex + 1).join('');

    return (
      <>
        {before}
        <span className="text-yellow-400 font-bold">{orp}</span>
        {after}
      </>
    );
  };

  return (
    <div 
      dir="rtl" 
      className={`flex items-center justify-center min-h-[200px] ${sizeClasses[size]}`}
    >
      <span 
        className={`font-bold text-center leading-tight transition-opacity duration-200 ${
          isPlaying ? 'opacity-100' : 'opacity-80'
        } ${word.source?.kind === 'targum' ? 'text-amber-200' : ''}`}
      >
        {renderWithORP(word.text)}
      </span>
    </div>
  );
}
