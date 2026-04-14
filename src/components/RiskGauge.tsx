import React from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface RiskGaugeProps {
  value: number; // 0-100
  label: string;
  size?: number;
  colorScheme?: 'diabetes' | 'hypertension' | 'anemia';
  showLabel?: boolean;
  animated?: boolean;
}

const COLOR_SCHEMES = {
  diabetes: {
    low: '#10B981',     // emerald
    moderate: '#F59E0B', // amber
    high: '#EF4444',    // red
    critical: '#DC2626', // red-600
    ring: '#FDE68A',    // amber-200
    bg: 'rgba(251, 191, 36, 0.1)',
  },
  hypertension: {
    low: '#10B981',
    moderate: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626',
    ring: '#FECACA',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  anemia: {
    low: '#10B981',
    moderate: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626',
    ring: '#BFDBFE',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
};

function getSeverityLabel(value: number): string {
  if (value > 75) return 'Critical';
  if (value > 55) return 'High';
  if (value > 35) return 'Moderate';
  return 'Low';
}

function getColor(value: number, scheme: typeof COLOR_SCHEMES.diabetes): string {
  if (value > 75) return scheme.critical;
  if (value > 55) return scheme.high;
  if (value > 35) return scheme.moderate;
  return scheme.low;
}

export function RiskGauge({
  value,
  label,
  size = 180,
  colorScheme = 'diabetes',
  showLabel = true,
  animated = true,
}: RiskGaugeProps) {
  const scheme = COLOR_SCHEMES[colorScheme];
  const color = getColor(value, scheme);
  const severity = getSeverityLabel(value);

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const strokeWidth = 10;
  const center = size / 2;

  // Animated value
  const springValue = useSpring(0, { stiffness: 60, damping: 20 });
  React.useEffect(() => {
    if (animated) springValue.set(value);
  }, [value, animated, springValue]);

  const dashOffset = useTransform(springValue, [0, 100], [circumference, 0]);

  // For the number display
  const [displayValue, setDisplayValue] = React.useState(0);
  React.useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }
    let frame: number;
    const start = performance.now();
    const duration = 1500;
    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, animated]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg
          width={size}
          height={size * 0.65}
          viewBox={`0 0 ${size} ${size * 0.65}`}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2 + 5} ${size * 0.6} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 5} ${size * 0.6}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated fill arc */}
          <motion.path
            d={`M ${strokeWidth / 2 + 5} ${size * 0.6} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 5} ${size * 0.6}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
            filter={`drop-shadow(0 0 6px ${color}40)`}
          />
        </svg>

        {/* Center value */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <span
            className="font-display font-bold tabular-nums leading-none"
            style={{ fontSize: size * 0.22, color }}
          >
            {displayValue}%
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full"
            style={{
              color,
              backgroundColor: `${color}15`,
            }}
          >
            {severity}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
          {label}
        </p>
      )}
    </div>
  );
}

// Mini inline gauge for compact display
export function MiniRiskGauge({
  value,
  label,
  colorScheme = 'diabetes',
}: {
  value: number;
  label: string;
  colorScheme?: 'diabetes' | 'hypertension' | 'anemia';
}) {
  const scheme = COLOR_SCHEMES[colorScheme];
  const color = getColor(value, scheme);
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {value}%
      </div>
      <div>
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
          {getSeverityLabel(value)}
        </p>
      </div>
    </div>
  );
}
