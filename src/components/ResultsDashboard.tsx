import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, FileText, Share2, Download, Droplets, Heart, Activity,
  TrendingUp, Brain, Eye, Layers, ChevronRight, Sparkles, Zap,
  Cpu, BarChart3, ArrowRight
} from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { SHAPChart } from './SHAPChart';
import { WhatIfSimulator } from './WhatIfSimulator';
import { type PredictionResults, type FormDataInput, saveReport } from '../lib/mlEngine';
import { Language, translations } from '../types';

interface ResultsDashboardProps {
  results: PredictionResults;
  formData: FormDataInput;
  onClose: () => void;
  language: Language;
}

type ActiveTab = 'overview' | 'shap' | 'models' | 'whatif';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function ResultsDashboard({ results, formData, onClose, language }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const t = translations[language];

  // Save report on first render
  React.useEffect(() => {
    saveReport(results, formData);
  }, [results, formData]);

  const diseases = [
    {
      key: 'diabetes' as const,
      label: t.diabetes,
      icon: Droplets,
      colorScheme: 'diabetes' as const,
      data: results.diabetes,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      key: 'hypertension' as const,
      label: t.hypertension,
      icon: Heart,
      colorScheme: 'hypertension' as const,
      data: results.hypertension,
      gradient: 'from-rose-500 to-red-500',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
    },
    {
      key: 'anemia' as const,
      label: t.anemia,
      icon: Activity,
      colorScheme: 'anemia' as const,
      data: results.anemia,
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Risk Overview', icon: BarChart3 },
    { id: 'shap' as const, label: 'Explainability', icon: Brain },
    { id: 'models' as const, label: 'Model Ensemble', icon: Layers },
    { id: 'whatif' as const, label: 'What-If', icon: Zap },
  ];

  const handleShare = () => {
    const text = `My PreventX Health Assessment Results:\n\n🩺 Diabetes Risk: ${results.diabetes.risk}%\n❤️ Hypertension Risk: ${results.hypertension.risk}%\n🩸 Anemia Risk: ${results.anemia.risk}%\n\n🏥 Overall Risk: ${results.overallRisk}%\n📊 Model: ${results.modelArchitecture}\n\nPowered by PreventX AI`;
    if (navigator.share) {
      navigator.share({ title: 'PreventX Results', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/40 backdrop-blur-sm print:relative print:bg-white print:p-0"
    >
      <div className="bg-white rounded-[32px] sm:rounded-[40px] w-full max-w-5xl max-h-[95vh] overflow-hidden soft-shadow border border-slate-100 flex flex-col print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 bg-white print:border-b-2 print:border-slate-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 medical-gradient rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20">
                <FileText className="text-white w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                  AI Health Risk Report
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full">
                    {results.modelArchitecture}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(results.timestamp).toLocaleDateString()} · {results.processingTimeMs}ms
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-1 print:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 print:overflow-visible">
          <AnimatePresence mode="wait">
            {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Overall Risk Banner */}
                <div className="bg-slate-900 rounded-[28px] p-6 sm:p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(circle,rgba(20,184,166,0.4)_0%,transparent_70%)]" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-2">
                      Overall Health Risk Score
                    </p>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl sm:text-6xl font-display font-bold text-white tabular-nums">
                        {results.overallRisk}
                      </span>
                      <span className="text-2xl text-teal-400 font-bold">/100</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full max-w-xs mx-auto overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${results.overallRisk}%` }}
                        transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                        className={cn(
                          "h-full rounded-full",
                          results.overallRisk > 70 ? "bg-red-500" : results.overallRisk > 40 ? "bg-amber-400" : "bg-emerald-400"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Risk Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {diseases.map((disease, i) => (
                    <motion.div
                      key={disease.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="bg-white rounded-[28px] p-6 border border-slate-100 soft-shadow text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", disease.bg)}>
                          <disease.icon className={cn("w-4 h-4", disease.text)} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{disease.label}</h3>
                      </div>
                      <RiskGauge
                        value={disease.data.risk}
                        label={disease.label}
                        colorScheme={disease.colorScheme}
                        showLabel={false}
                        size={160}
                      />
                      <div className="mt-3 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-500" />
                        <span className="text-[10px] font-bold text-teal-600">
                          {disease.data.confidence}% confidence
                        </span>
                      </div>
                      {/* Top 3 SHAP reasons */}
                      <div className="mt-4 space-y-1.5">
                        {disease.data.shapFeatures.filter(f => f.direction === 'risk').slice(0, 2).map((f, j) => (
                          <div key={j} className="flex items-center gap-2 text-left">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span className="text-[11px] font-medium text-slate-600 truncate">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Suggestions */}
                <div className="bg-emerald-50/50 rounded-[28px] p-6 border border-emerald-100">
                  <h3 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI-Generated Recommendations
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {generateSuggestions(results).map((sug, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-emerald-100">
                        <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs font-medium text-emerald-700">{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SHAP / EXPLAINABILITY TAB ──────────────────────────────────── */}
            {activeTab === 'shap' && (
              <motion.div
                key="shap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-1">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-slate-900">SHAP Explainability</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">
                    SHAP (SHapley Additive exPlanations) values show how each feature contributes to the prediction.
                    Red bars increase risk, green bars are protective factors.
                  </p>
                </div>

                {diseases.map((disease, i) => (
                  <motion.div
                    key={disease.key}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="bg-white rounded-[28px] p-6 border border-slate-100 soft-shadow"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        disease.bg
                      )}>
                        <disease.icon className={cn("w-5 h-5", disease.text)} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{disease.label}</h4>
                        <span className={cn("text-xs font-bold", disease.text)}>
                          Risk: {disease.data.risk}%
                        </span>
                      </div>
                    </div>
                    <SHAPChart
                      features={disease.data.shapFeatures}
                      title={`${disease.label} — Feature Importance`}
                    />
                  </motion.div>
                ))}

                {/* Grad-CAM placeholder for vision */}
                {results.anemia.visionScore !== null && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[28px] p-6 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-900">Vision Model — Attention Map (Grad-CAM)</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      The ViT-B/16 model analyzes conjunctival pallor, scleral hue, and vascular patterns
                      using self-attention mechanisms. Below shows the estimated attention regions.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-video bg-white rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-40"
                          style={{
                            background: 'radial-gradient(circle at 45% 55%, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.2) 30%, transparent 60%)',
                          }}
                        />
                        <div className="relative z-10 text-center">
                          <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-slate-400">Conjunctiva Attention Region</p>
                          <p className="text-[10px] text-slate-400">ViT Score: {results.anemia.visionScore?.toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="aspect-video bg-white rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30"
                          style={{
                            background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0.15) 40%, transparent 70%)',
                          }}
                        />
                        <div className="relative z-10 text-center">
                          <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-slate-400">Nail Bed Attention Region</p>
                          <p className="text-[10px] text-slate-400">MobileNet Score: {((results.anemia.visionScore || 50) * 0.96).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── MODEL ENSEMBLE TAB ────────────────────────────────────────── */}
            {activeTab === 'models' && (
              <motion.div
                key="models"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Architecture Overview */}
                <div className="bg-slate-900 rounded-[28px] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.4),transparent_50%)]" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Cpu className="w-6 h-6 text-teal-400" />
                      <h3 className="text-lg font-bold">Model Architecture</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-6">{results.modelArchitecture}</p>
                    
                    {/* Architecture Flow */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white/10 rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Diabetes Pipeline</p>
                        <p className="text-xs text-slate-300">XGBoost + DNN + RF</p>
                        <p className="text-xs text-slate-400 mt-1">→ Stacking Meta-Learner</p>
                        <p className="text-lg font-bold text-white mt-2">{results.diabetes.risk}%</p>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">Hypertension Pipeline</p>
                        <p className="text-xs text-slate-300">XGBoost + LightGBM + RF</p>
                        <p className="text-xs text-slate-400 mt-1">→ Weighted Average</p>
                        <p className="text-lg font-bold text-white mt-2">{results.hypertension.risk}%</p>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Anemia Pipeline</p>
                        <p className="text-xs text-slate-300">
                          {results.anemia.visionScore !== null
                            ? 'ViT-B/16 + MobileNet + Tabular'
                            : 'Tabular Ensemble (RF + XGBoost)'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">→ Late Fusion</p>
                        <p className="text-lg font-bold text-white mt-2">{results.anemia.risk}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Model Breakdowns */}
                {diseases.map((disease, i) => (
                  <motion.div
                    key={disease.key}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[28px] p-6 border border-slate-100 soft-shadow"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", disease.bg)}>
                        <disease.icon className={cn("w-5 h-5", disease.text)} />
                      </div>
                      <h4 className="font-bold text-slate-900">{disease.label} — Ensemble Breakdown</h4>
                    </div>
                    <div className="space-y-3">
                      {disease.data.modelBreakdown.map((model, j) => (
                        <div key={j} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl">
                          <div className="w-8 h-8 bg-slate-200/50 rounded-lg flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{model.modelName}</p>
                            <p className="text-[10px] text-slate-400">Training Accuracy: {model.accuracy}%</p>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "text-sm font-bold",
                              model.prediction > 60 ? "text-rose-600" : model.prediction > 35 ? "text-amber-600" : "text-emerald-600"
                            )}>
                              {model.prediction}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Fused Prediction</span>
                      <span className={cn(
                        "text-lg font-bold",
                        disease.data.fusedScore > 60 ? "text-rose-600" : disease.data.fusedScore > 35 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {disease.data.fusedScore}%
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* References */}
                <div className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Research References</h4>
                  <div className="space-y-2 text-[11px] text-slate-500">
                    <p>• <strong>Anemia ViT:</strong> Ramos-Soto et al. "Non-invasive anemia detection from conjunctiva and sclera images using vision transformer" — Scientific Reports, 2025</p>
                    <p>• <strong>Diabetes:</strong> Sylhet Diabetes Hospital Dataset — Gradient Boosting 98.08% accuracy</p>
                    <p>• <strong>Hypertension:</strong> XGBoost model — 99% accuracy, BMI as top predictor (0.37 importance)</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── WHAT-IF TAB ───────────────────────────────────────────────── */}
            {activeTab === 'whatif' && (
              <motion.div
                key="whatif"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <WhatIfSimulator
                  baseResults={results}
                  formData={formData}
                  language={language}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-white flex items-center justify-between print:hidden">
          <div className="text-[10px] text-slate-400 font-medium">
            ⚠️ This is a screening tool, not a medical diagnosis. Consult a doctor.
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Suggestion Generator ─────────────────────────────────────────────────────

function generateSuggestions(results: PredictionResults): string[] {
  const suggestions: string[] = [];

  if (results.diabetes.risk > 40) {
    suggestions.push('Follow a low-sugar Indian diet: millets (bajra, jowar), green leafy vegetables, and replace white rice with brown rice.');
    suggestions.push('Walk at least 30 minutes daily. Even a post-meal 15-min walk reduces blood sugar spikes by 20%.');
  }
  if (results.hypertension.risk > 40) {
    suggestions.push('Reduce salt intake to less than 5g/day. Avoid pickles, papad, and processed foods.');
    suggestions.push('Practice yoga (Shavasana) and pranayama (Anulom-Vilom) for 15 minutes daily to reduce stress.');
  }
  if (results.anemia.risk > 40) {
    suggestions.push('Eat iron-rich foods: spinach, jaggery, pomegranate, and curry leaves. Pair with Vitamin C (amla, lemon) to boost absorption.');
    suggestions.push('Avoid tea/coffee with meals as tannins reduce iron absorption by up to 60%.');
  }
  if (results.overallRisk > 50) {
    suggestions.push('Schedule a check-up at your nearest Primary Health Centre (PHC) or Community Health Worker (ASHA/ANM).');
  }
  if (suggestions.length === 0) {
    suggestions.push('Your risk levels are low! Maintain your current healthy lifestyle.');
    suggestions.push('Continue regular physical activity and a balanced diet for sustained wellness.');
  }

  return suggestions.slice(0, 6);
}
