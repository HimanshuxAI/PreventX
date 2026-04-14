import React from 'react';
import { motion } from 'motion/react';
import { PredictionResults } from '../lib/mlEngine';

interface MedicalBodyMapProps {
  results: PredictionResults | null;
}

export function MedicalBodyMap({ results }: MedicalBodyMapProps) {
  const getRiskColor = (risk: number | undefined) => {
    if (risk === undefined) return '#CBD5E1'; // Slate-300
    if (risk > 75) return '#F43F5E'; // Rose-500
    if (risk > 45) return '#F59E0B'; // Amber-500
    return '#10B981'; // Emerald-500
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-slate-50/50 rounded-[40px] overflow-hidden border border-slate-100 mt-6 p-10">
      <svg viewBox="0 0 200 500" className="h-full w-auto drop-shadow-2xl">
        {/* Human Silhouette */}
        <path
          d="M100 20 C110 20 120 30 120 45 C120 60 110 70 100 70 C90 70 80 60 80 45 C80 30 90 20 100 20 Z M100 75 C125 75 145 90 150 120 L160 250 C162 270 155 280 145 280 L135 280 C125 280 120 270 120 250 L115 150 L100 155 L85 150 L80 250 C80 270 75 280 65 280 L55 280 C45 280 38 270 40 250 L50 120 C55 90 75 75 100 75 Z M100 280 L115 280 L130 480 C132 495 125 500 115 500 L105 500 C95 500 90 490 90 470 L95 280 L105 280 Z M100 280 L85 280 L70 480 C68 495 75 500 85 500 L95 500 C105 500 110 490 110 470 L105 280 L95 280 Z"
          fill="#F8FAFC"
          stroke="#E2E8F0"
          strokeWidth="2"
        />

        {/* Circulatory System (Anemia) */}
        <motion.path
          d="M100 80 L100 250 M100 120 L150 150 M100 120 L50 150 M100 250 L120 450 M100 250 L80 450"
          stroke={getRiskColor(results?.anemia.risk)}
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          opacity={0.4}
        />

        {/* Heart (Hypertension) */}
        <motion.path
          d="M95 120 C85 105 115 105 105 120 C115 135 85 135 95 120"
          fill={getRiskColor(results?.hypertension.risk)}
          animate={{
            scale: results?.hypertension.risk && results.hypertension.risk > 45 ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pancreas (Diabetes) */}
        <motion.ellipse
          cx="100"
          cy="180"
          rx="15"
          ry="5"
          fill={getRiskColor(results?.diabetes.risk)}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        {/* Scanning Line */}
        <motion.rect
          x="30"
          width="140"
          height="1"
          fill="rgba(20, 184, 166, 0.5)"
          animate={{
            y: [50, 480, 50],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </svg>

      {/* Overlays */}
      <div className="absolute top-8 left-8 space-y-4">
        <HealthLabel 
          label="Cardiovascular" 
          value={results?.hypertension.risk} 
          color={getRiskColor(results?.hypertension.risk)} 
        />
        <HealthLabel 
          label="Metabolic" 
          value={results?.diabetes.risk} 
          color={getRiskColor(results?.diabetes.risk)} 
        />
        <HealthLabel 
          label="Hematologic" 
          value={results?.anemia.risk} 
          color={getRiskColor(results?.anemia.risk)} 
        />
      </div>
    </div>
  );
}

function HealthLabel({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-100">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value !== undefined ? `${value}% Risk` : 'No Data'}</p>
      </div>
    </div>
  );
}
