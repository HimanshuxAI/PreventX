import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowDown, ArrowUp, Minus, RotateCcw } from 'lucide-react';
import { RiskGauge, MiniRiskGauge } from './RiskGauge';
import { type PredictionResults, type FormDataInput, simulateWhatIf } from '../lib/mlEngine';
import { Language, translations } from '../types';

interface WhatIfSimulatorProps {
  baseResults: PredictionResults;
  formData: FormDataInput;
  language: Language;
}

interface SliderConfig {
  key: string;
  label: string;
  currentValue: string;
  options: { label: string; value: string }[];
  fieldName: keyof FormDataInput;
}

export function WhatIfSimulator({ baseResults, formData, language }: WhatIfSimulatorProps) {
  const t = translations[language];
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const sliders: SliderConfig[] = [
    {
      key: 'weight',
      label: 'Body Weight (kg)',
      currentValue: formData.weight,
      fieldName: 'weight',
      options: [
        { label: '-10kg', value: String(Math.max(30, parseInt(formData.weight || '70') - 10)) },
        { label: '-5kg', value: String(Math.max(30, parseInt(formData.weight || '70') - 5)) },
        { label: 'Current', value: formData.weight || '70' },
        { label: '+5kg', value: String(parseInt(formData.weight || '70') + 5) },
      ],
    },
    {
      key: 'exerciseFrequency',
      label: 'Exercise Level',
      currentValue: formData.exerciseFrequency,
      fieldName: 'exerciseFrequency',
      options: [
        { label: 'Never', value: 'Never' },
        { label: 'Rarely', value: 'Rarely' },
        { label: '2-3x/week', value: '2-3 times a week' },
        { label: 'Daily', value: 'Daily' },
      ],
    },
    {
      key: 'sugarIntake',
      label: 'Sugar Intake',
      currentValue: formData.sugarIntake,
      fieldName: 'sugarIntake',
      options: [
        { label: 'Rarely', value: 'Rarely (natural only)' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Daily', value: 'Daily' },
      ],
    },
    {
      key: 'saltIntake',
      label: 'Salt Intake',
      currentValue: formData.saltIntake,
      fieldName: 'saltIntake',
      options: [
        { label: 'Low', value: 'Low (minimal added salt)' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'High', value: 'High' },
      ],
    },
    {
      key: 'sleep',
      label: 'Sleep Duration',
      currentValue: formData.sleep,
      fieldName: 'sleep',
      options: [
        { label: '<5 hrs', value: 'Less than 5 hours' },
        { label: '5-6 hrs', value: '5–6 hours' },
        { label: '7-8 hrs', value: '7–8 hours (recommended)' },
        { label: '8+ hrs', value: 'More than 8 hours' },
      ],
    },
    {
      key: 'stressLevel',
      label: 'Stress Level',
      currentValue: formData.stressLevel,
      fieldName: 'stressLevel',
      options: [
        { label: 'Low', value: 'Low' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'High', value: 'High' },
      ],
    },
    {
      key: 'smoking',
      label: 'Smoking Status',
      currentValue: formData.smoking,
      fieldName: 'smoking',
      options: [
        { label: 'Never', value: 'Never' },
        { label: 'Occasional', value: 'Occasionally' },
        { label: 'Regular', value: 'Yes, regularly' },
      ],
    },
  ];

  const projectedResults = useMemo(() => {
    if (Object.keys(overrides).length === 0) return baseResults;
    return simulateWhatIf(formData, overrides as any);
  }, [overrides, formData, baseResults]);

  const hasChanges = Object.keys(overrides).length > 0;

  const getDelta = (base: number, projected: number) => {
    const diff = projected - base;
    return { diff, icon: diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus };
  };

  const handleReset = () => setOverrides({});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-[28px] p-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">What-If Simulator</h3>
            <p className="text-xs text-slate-500">
              Adjust lifestyle factors to see how your risk scores change in real-time
            </p>
          </div>
        </div>
      </div>

      {/* Current vs Projected Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'diabetes', label: t.diabetes, base: baseResults.diabetes.risk, proj: projectedResults.diabetes.risk, scheme: 'diabetes' as const },
          { key: 'hypertension', label: t.hypertension, base: baseResults.hypertension.risk, proj: projectedResults.hypertension.risk, scheme: 'hypertension' as const },
          { key: 'anemia', label: t.anemia, base: baseResults.anemia.risk, proj: projectedResults.anemia.risk, scheme: 'anemia' as const },
        ].map((d) => {
          const { diff, icon: DeltaIcon } = getDelta(d.base, d.proj);
          return (
            <div key={d.key} className="bg-white rounded-[24px] p-4 border border-slate-100 soft-shadow">
              <p className="text-xs font-bold text-slate-500 text-center mb-3">{d.label}</p>
              <RiskGauge value={d.proj} label="" colorScheme={d.scheme} showLabel={false} size={130} />
              {hasChanges && diff !== 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center justify-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold mx-auto w-fit ${
                    diff < 0
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <DeltaIcon className="w-3 h-3" />
                  {diff > 0 ? '+' : ''}{diff}% from current
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-[28px] p-6 border border-slate-100 soft-shadow space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Modify Lifestyle Factors</h4>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {sliders.map((slider) => {
          const currentSelection = overrides[slider.fieldName] || slider.currentValue;
          return (
            <div key={slider.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">{slider.label}</label>
                <span className="text-[10px] font-bold text-slate-400">
                  Current: {slider.currentValue || 'N/A'}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {slider.options.map((opt) => {
                  const isActive = currentSelection === opt.value;
                  const isCurrent = opt.value === slider.currentValue;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (opt.value === slider.currentValue) {
                          const newOverrides = { ...overrides };
                          delete newOverrides[slider.fieldName];
                          setOverrides(newOverrides);
                        } else {
                          setOverrides({ ...overrides, [slider.fieldName]: opt.value });
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                        isActive
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : isCurrent
                          ? 'border-slate-200 bg-slate-50 text-slate-600'
                          : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                      {isCurrent && !isActive && (
                        <span className="ml-1 text-[9px] text-slate-300">●</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Summary */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 rounded-[28px] p-6 border border-emerald-100"
        >
          <h4 className="text-sm font-bold text-emerald-800 mb-3">📊 Projected Impact</h4>
          <div className="space-y-2">
            {Object.entries(overrides).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs text-emerald-700">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium">
                  {key}: <strong>{(formData as any)[key]}</strong> → <strong>{value}</strong>
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-emerald-200 mt-2 text-xs font-bold text-emerald-800">
              Overall Risk: {baseResults.overallRisk}% → {projectedResults.overallRisk}%
              ({projectedResults.overallRisk < baseResults.overallRisk ? '↓' : '↑'}
              {Math.abs(projectedResults.overallRisk - baseResults.overallRisk)}%)
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
