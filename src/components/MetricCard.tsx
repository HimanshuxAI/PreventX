import React from 'react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  variant?: 'default' | 'gradient';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function MetricCard({ 
  title, 
  value, 
  subValue, 
  unit, 
  change, 
  isPositive, 
  variant = 'default',
  children
}: MetricCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[32px] flex flex-col justify-between min-h-[180px] relative overflow-hidden",
        variant === 'gradient' 
          ? "bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20" 
          : "bg-white soft-shadow"
      )}
    >
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className={cn("text-sm font-bold mb-1", variant === 'gradient' ? "text-white/80" : "text-gray-400")}>
            {title}
          </h3>
          {change && (
            <div className={cn(
              "text-[10px] font-bold flex items-center gap-1",
              variant === 'gradient' ? "text-white/90" : (isPositive ? "text-green-500" : "text-pink-500")
            )}>
              {isPositive ? '▲' : '▼'} {change}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-display font-bold">{value}</span>
          {unit && <span className={cn("text-sm font-medium", variant === 'gradient' ? "text-white/60" : "text-gray-400")}>{unit}</span>}
          {subValue && <span className={cn("text-2xl font-display font-bold opacity-40")}>/{subValue}</span>}
        </div>
      </div>

      {children && (
        <div className="absolute right-0 bottom-0 opacity-40 pointer-events-none">
          {children}
        </div>
      )}
    </motion.div>
  );
}
