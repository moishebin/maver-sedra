'use client';

import { Minus, Plus, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

/**
 * Props for the SpeedControl component
 */
interface SpeedControlProps {
  /** Current speed in WPM */
  speed: number;
  /** Callback when speed changes */
  onSpeedChange: (wpm: number) => void;
  /** Minimum speed (default: 100) */
  min?: number;
  /** Maximum speed (default: 600) */
  max?: number;
  /** Speed step increment (default: 25) */
  step?: number;
  /** Target speed (when ramping up, this is the final speed) */
  targetSpeed?: number;
  /** Whether ramp mode is enabled */
  rampEnabled?: boolean;
  /** Callback to toggle ramp mode */
  onToggleRamp?: () => void;
}

/**
 * Speed control component for RSVP reader
 * Allows users to increase/decrease reading speed
 */
export function SpeedControl({
  speed,
  onSpeedChange,
  min = 100,
  max = 600,
  step = 25,
  targetSpeed,
  rampEnabled = true,
  onToggleRamp,
}: SpeedControlProps) {
  const { t } = useLanguage();

  const decreaseSpeed = () => {
    const newSpeed = Math.max(min, speed - step);
    onSpeedChange(newSpeed);
  };

  const increaseSpeed = () => {
    const newSpeed = Math.min(max, speed + step);
    onSpeedChange(newSpeed);
  };

  const presetSpeeds = [200, 250, 300, 400];
  
  // Check if currently ramping up
  const isRamping = rampEnabled && targetSpeed !== undefined && speed < targetSpeed;
  const rampProgress = targetSpeed ? Math.round((speed / targetSpeed) * 100) : 100;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Speed Display with Ramp Toggle */}
      <div className="text-sm text-gray-400 uppercase tracking-wide flex items-center gap-2">
        {t.speed}
        {isRamping && (
          <span 
            className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
            title={t.warmingUp(rampProgress)}
          />
        )}
        {onToggleRamp && (
          <button
            onClick={onToggleRamp}
            className={`ms-2 p-1 rounded transition-all duration-200 ${
              rampEnabled 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-gray-700 text-gray-500 hover:bg-gray-600 hover:text-gray-400'
            }`}
            title={rampEnabled ? t.warmUpOn : t.warmUpOff}
            aria-label={rampEnabled ? t.disableWarmUp : t.enableWarmUp}
          >
            <Zap className={`w-3.5 h-3.5 ${rampEnabled ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Current Speed */}
      <div className="flex items-center gap-4">
        <button
          onClick={decreaseSpeed}
          disabled={speed <= min}
          className={`p-2 rounded-full transition-all duration-200 ${
            speed > min
              ? 'bg-gray-700 hover:bg-gray-600 text-white active:scale-95'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          aria-label={t.slower}
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="w-20 text-center">
          <span className="text-2xl font-bold text-white">{Math.round(speed)}</span>
          <span className="text-xs text-gray-400 block">
            {t.wpm}
            {isRamping && targetSpeed && (
              <span className="text-green-400 ms-1"><span className="inline-block rtl:-scale-x-100">→</span> {Math.round(targetSpeed)}</span>
            )}
          </span>
        </div>

        <button
          onClick={increaseSpeed}
          disabled={speed >= max}
          className={`p-2 rounded-full transition-all duration-200 ${
            speed < max
              ? 'bg-gray-700 hover:bg-gray-600 text-white active:scale-95'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          aria-label={t.faster}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2 mt-2">
        {presetSpeeds.map((preset) => (
          <button
            key={preset}
            onClick={() => onSpeedChange(preset)}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
              Math.round(speed) === preset
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
