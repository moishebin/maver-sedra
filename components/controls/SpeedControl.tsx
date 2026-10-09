'use client';

import { Check, Minus, Plus, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

/**
 * Props for the SpeedControl component
 */
interface SpeedControlProps {
  /** Speed the reader is running at right now (lower than targetSpeed while warming up) */
  speed: number;
  /** The speed the user chose; what the buttons and presets change */
  targetSpeed: number;
  /** Callback when the chosen speed changes */
  onSpeedChange: (wpm: number) => void;
  /** Whether the reader is playing (warm-up only runs while playing) */
  isPlaying?: boolean;
  /** Minimum speed (default: 100) */
  min?: number;
  /** Maximum speed (default: 600) */
  max?: number;
  /** Speed step increment (default: 25) */
  step?: number;
  /** Whether warm-up is enabled */
  rampEnabled?: boolean;
  /** Whether the warm-up has finished and the reader is at full speed */
  warmUpDone?: boolean;
  /** Callback to toggle warm-up */
  onToggleRamp?: () => void;
}

/**
 * Speed control for the RSVP reader: the chosen speed with -/+ and presets,
 * and a warm-up switch (start at half speed and build up to the chosen speed)
 */
export function SpeedControl({
  speed,
  targetSpeed,
  onSpeedChange,
  isPlaying = false,
  min = 100,
  max = 600,
  step = 25,
  rampEnabled = true,
  warmUpDone = false,
  onToggleRamp,
}: SpeedControlProps) {
  const { t } = useLanguage();

  // Buttons always adjust the chosen speed, never the warm-up speed
  const decreaseSpeed = () => onSpeedChange(Math.max(min, targetSpeed - step));
  const increaseSpeed = () => onSpeedChange(Math.min(max, targetSpeed + step));

  const presetSpeeds = [200, 250, 300, 400];

  const isWarmingUp = rampEnabled && isPlaying && Math.round(speed) < targetSpeed;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Chosen speed */}
      <div className="flex items-center gap-4">
        <button
          onClick={decreaseSpeed}
          disabled={targetSpeed <= min}
          className={`p-2 rounded-full transition-all duration-200 ${
            targetSpeed > min
              ? 'bg-gray-700 hover:bg-gray-600 text-white active:scale-95'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          aria-label={t.slower}
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="w-24 text-center leading-tight">
          {/* While warming up, the current speed takes the label's place (same height, so nothing shifts) */}
          {isWarmingUp ? (
            <span className="flex h-5 items-center justify-center gap-1 text-sm font-semibold text-green-400">
              <Zap className="w-3 h-3 fill-current" />
              {Math.round(speed)}
            </span>
          ) : (
            <span className="flex h-5 items-center justify-center text-xs text-gray-400 uppercase tracking-wide">
              {t.speed}
            </span>
          )}
          <span
            className={`block text-2xl font-bold transition-colors ${isWarmingUp ? 'text-gray-500' : 'text-white'}`}
          >
            {targetSpeed}
          </span>
          <span className="block text-xs text-gray-400">{t.wpm}</span>
        </div>

        <button
          onClick={increaseSpeed}
          disabled={targetSpeed >= max}
          className={`p-2 rounded-full transition-all duration-200 ${
            targetSpeed < max
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
              targetSpeed === preset
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Warm-up switch */}
      {onToggleRamp && (
        <div className="flex flex-col items-center gap-1 mt-2">
          <button
            type="button"
            role="switch"
            aria-checked={rampEnabled}
            aria-label={rampEnabled ? t.disableWarmUp : t.enableWarmUp}
            onClick={onToggleRamp}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
              !rampEnabled
                ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                : warmUpDone
                  ? 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
            }`}
          >
            {rampEnabled && warmUpDone
              ? <Check className="w-4 h-4" />
              : <Zap className={`w-4 h-4 ${rampEnabled ? 'fill-current' : ''}`} />}
            {t.warmUp}: {rampEnabled ? t.on : t.off}
          </button>
          <p className="text-xs text-center text-gray-500" aria-live="polite">
            {isWarmingUp
              ? <span className="text-green-400">{t.warmingUp(targetSpeed)}</span>
              : !rampEnabled
                ? t.warmUpOffHint
                : warmUpDone
                  ? t.warmUpDone(targetSpeed)
                  : t.warmUpOnHint}
          </p>
        </div>
      )}
    </div>
  );
}
