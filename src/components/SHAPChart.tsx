import React from 'react';
import { motion } from 'motion/react';
import { type SHAPFeature } from '../lib/mlEngine';

interface SHAPChartProps {
  features: SHAPFeature[];
  title?: string;
  maxBars?: number;
}

export function SHAPChart({ features, title = 'Feature Importance (SHAP)', maxBars = 8 }: SHAPChartProps) {
  const displayFeatures = features.slice(0, maxBars);
  const maxVal = Math.max(...displayFeatures.map(f => Math.abs(f.value)), 1);

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">{title}</h4>
      )}
      <div className="space-y-2.5">
        {displayFeatures.map((feature, i) => {
          const barWidth = (Math.abs(feature.value) / maxVal) * 100;
          const isRisk = feature.direction === 'risk';

          return (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600 truncate max-w-[65%]">
                  {feature.name}
                </span>
                <span
                  className="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md"
                  style={{
                    color: isRisk ? '#DC2626' : '#059669',
                    backgroundColor: isRisk ? '#FEF2F2' : '#ECFDF5',
                  }}
                >
                  {isRisk ? '+' : '-'}{Math.abs(feature.value).toFixed(1)}
                </span>
              </div>
              <div className="h-5 bg-slate-100/80 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(barWidth, 100)}%` }}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-lg relative overflow-hidden"
                  style={{
                    backgroundColor: isRisk ? '#FCA5A5' : '#6EE7B7',
                  }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${isRisk ? '#FECACA' : '#A7F3D0'}, transparent)`,
                    }}
                  />
                </motion.div>
                {/* Hover tooltip */}
                <div className="absolute inset-0 flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded">
                    Raw: {feature.rawValue}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-300" />
          <span className="text-[10px] font-bold text-slate-400">Risk ↑</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-300" />
          <span className="text-[10px] font-bold text-slate-400">Protective ↓</span>
        </div>
      </div>
    </div>
  );
}

// Compact inline SHAP for result cards
export function SHAPMini({ features }: { features: SHAPFeature[] }) {
  const top3 = features.filter(f => f.direction === 'risk').slice(0, 3);
  return (
    <div className="space-y-1.5">
      {top3.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-xs font-bold text-slate-600 truncate">{f.name}</span>
        </div>
      ))}
    </div>
  );
}
