import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Activity,
  Zap,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  History,
  Minus,
  Heart,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Language, translations, Page } from '../types';
import { getReports, PredictionResults } from '../lib/mlEngine';

interface DashboardProps {
  language: Language;
  onPageChange: (page: Page) => void;
  onStartPredictor: () => void;
}

function getSeverityLabel(risk: number): string {
  if (risk > 75) return 'Critical';
  if (risk > 55) return 'High';
  if (risk > 35) return 'Medium';
  return 'Low';
}

function getSeverityColor(risk: number): string {
  if (risk > 75) return 'text-rose-600';
  if (risk > 55) return 'text-orange-600';
  if (risk > 35) return 'text-amber-600';
  return 'text-emerald-600';
}

function getTrendIcon(current: number, previous: number | null) {
  if (previous === null) return { icon: Minus, label: 'First scan', color: 'text-slate-400' };
  const diff = current - previous;
  if (Math.abs(diff) < 2) return { icon: Minus, label: 'Stable', color: 'text-slate-400' };
  if (diff < 0) return { icon: TrendingDown, label: `↓ ${Math.abs(diff)}% since last`, color: 'text-emerald-600' };
  return { icon: TrendingUp, label: `↑ ${Math.abs(diff)}% since last`, color: 'text-rose-500' };
}

export function Dashboard({ language, onPageChange, onStartPredictor }: DashboardProps) {
  const t = translations[language];
  const [reports, setReports] = useState<PredictionResults[]>([]);
  const [latestResults, setLatestResults] = useState<PredictionResults | null>(null);
  const [previousResults, setPreviousResults] = useState<PredictionResults | null>(null);

  useEffect(() => {
    const historicalReports = getReports();
    setReports(historicalReports);
    if (historicalReports.length > 0) {
      setLatestResults(historicalReports[0]);
    }
    if (historicalReports.length > 1) {
      setPreviousResults(historicalReports[1]);
    }
  }, []);

  const hasAssessment = latestResults !== null;

  // Transform reports for Recharts
  const chartData = reports.slice(0, 7).reverse().map(r => ({
    date: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    Diabetes: r.diabetes.risk,
    Hypertension: r.hypertension.risk,
    Anemia: r.anemia.risk,
    Overall: r.overallRisk
  }));

  // Demo data for first-time users
  const demoData = [
    { date: 'Week 1', Diabetes: 42, Hypertension: 28, Anemia: 35 },
    { date: 'Week 2', Diabetes: 40, Hypertension: 30, Anemia: 33 },
    { date: 'Week 3', Diabetes: 38, Hypertension: 26, Anemia: 30 },
    { date: 'Week 4', Diabetes: 35, Hypertension: 22, Anemia: 28 },
    { date: 'Week 5', Diabetes: 33, Hypertension: 20, Anemia: 25 },
    { date: 'Week 6', Diabetes: 30, Hypertension: 18, Anemia: 22 },
    { date: 'Week 7', Diabetes: 28, Hypertension: 16, Anemia: 20 },
  ];

  const displayData = chartData.length >= 2 ? chartData : demoData;

  // Time since last check
  const lastCheckedLabel = latestResults
    ? (() => {
        const diff = Date.now() - latestResults.timestamp;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
      })()
    : null;

  // Card definitions
  const cards = [
    {
      id: 'wellness',
      label: 'Overall Wellness',
      icon: Shield,
      gradient: 'from-teal-500 to-emerald-500',
      bgLight: 'bg-teal-50',
      iconColor: 'text-teal-600',
      borderColor: 'border-teal-100',
      value: hasAssessment ? `${100 - latestResults!.overallRisk}` : null,
      unit: '/100',
      unitLabel: 'Score',
      trend: hasAssessment && previousResults
        ? getTrendIcon(100 - latestResults!.overallRisk, 100 - previousResults.overallRisk)
        : null,
      subtitle: hasAssessment ? `Last checked ${lastCheckedLabel}` : null,
    },
    {
      id: 'diabetes',
      label: 'Diabetes Status',
      icon: Activity,
      gradient: 'from-orange-500 to-amber-500',
      bgLight: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-100',
      value: hasAssessment ? `${latestResults!.diabetes.risk}%` : null,
      unit: '',
      unitLabel: 'Risk',
      severity: hasAssessment ? getSeverityLabel(latestResults!.diabetes.risk) : null,
      severityColor: hasAssessment ? getSeverityColor(latestResults!.diabetes.risk) : null,
      trend: hasAssessment
        ? getTrendIcon(latestResults!.diabetes.risk, previousResults?.diabetes.risk ?? null)
        : null,
    },
    {
      id: 'hypertension',
      label: 'Hypertension',
      icon: Heart,
      gradient: 'from-rose-500 to-pink-500',
      bgLight: 'bg-rose-50',
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-100',
      value: hasAssessment ? `${latestResults!.hypertension.risk}%` : null,
      unit: '',
      unitLabel: 'Risk',
      severity: hasAssessment ? getSeverityLabel(latestResults!.hypertension.risk) : null,
      severityColor: hasAssessment ? getSeverityColor(latestResults!.hypertension.risk) : null,
      trend: hasAssessment
        ? getTrendIcon(latestResults!.hypertension.risk, previousResults?.hypertension.risk ?? null)
        : null,
    },
    {
      id: 'tests',
      label: 'Tests Done',
      icon: History,
      gradient: 'from-blue-500 to-indigo-500',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
      value: hasAssessment ? reports.length.toString() : '0',
      unit: '',
      unitLabel: 'Assessments',
      subtitle: hasAssessment
        ? `(${latestResults!.anemia.visionScore !== null ? 'Eye + Palm + Tabular' : 'Tabular Only'})`
        : null,
    },
  ];

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {/* Hero Section */}
        <header className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold text-slate-900 mb-3"
          >
            {t.welcome}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-medium max-w-2xl leading-relaxed"
          >
            {t.preventxDesc}
          </motion.p>
        </header>

        {/* Quick Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const TrendIcon = card.trend?.icon;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "relative bg-white rounded-[28px] p-6 border-2 overflow-hidden group cursor-pointer transition-all duration-300",
                  hasAssessment || card.id === 'tests'
                    ? `${card.borderColor} hover:shadow-lg hover:shadow-slate-100`
                    : "border-slate-100 hover:border-slate-200"
                )}
                onClick={() => {
                  if (card.id === 'wellness' || card.id === 'tests') onStartPredictor();
                  else if (card.id === 'diabetes' || card.id === 'hypertension') onStartPredictor();
                }}
              >
                {/* Top row: icon + label */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", card.bgLight)}>
                    <Icon className={cn("w-5.5 h-5.5", card.iconColor)} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{card.label}</p>
                </div>

                {/* Value */}
                {card.value && (hasAssessment || card.id === 'tests') ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={card.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-2"
                    >
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-bold text-slate-900">{card.value}</span>
                        {card.unit && <span className="text-sm font-bold text-slate-300">{card.unit}</span>}
                      </div>
                      {card.severity && (
                        <span className={cn("text-xs font-bold", card.severityColor)}>
                          {card.severity}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-display font-bold text-slate-200 tracking-widest">——</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{card.unitLabel}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">No Data Yet</span>
                  </div>
                )}

                {/* Trend / Subtitle */}
                {card.trend && hasAssessment ? (
                  <div className={cn("flex items-center gap-1 text-[11px] font-bold", card.trend.color)}>
                    {TrendIcon && <TrendIcon className="w-3.5 h-3.5" />}
                    <span>{card.trend.label}</span>
                  </div>
                ) : card.subtitle ? (
                  <p className="text-[10px] font-bold text-slate-400">{card.subtitle}</p>
                ) : null}

                {/* Decorative gradient dot */}
                <div className={cn(
                  "absolute -right-3 -bottom-3 w-20 h-20 rounded-full opacity-[0.06] bg-gradient-to-br group-hover:scale-150 transition-transform duration-500",
                  card.gradient
                )} />
              </motion.div>
            );
          })}
        </div>

        {/* Main Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative mb-12"
        >
          <button
            onClick={onStartPredictor}
            className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-bold text-xl hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-2 shadow-2xl relative overflow-hidden group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-teal-400 group-hover:animate-pulse" />
              </div>
              <span className="tracking-tight">{t.checkHealthRisk}</span>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <ArrowUpRight className="w-5 h-5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Takes 45 seconds • Camera + 3 questions
            </span>
          </button>
        </motion.div>

        {/* Future Risk Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-8 lg:p-10 rounded-[40px] border border-slate-100 soft-shadow mb-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-display font-bold text-slate-900">{t.futureRiskTimeline}</h3>
              <p className="text-sm text-slate-400 font-medium">
                {chartData.length >= 2
                  ? 'Risk trends across your last 7 assessments'
                  : 'Sample trend data — complete assessments to see your own'}
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { key: 'Diabetes', color: 'bg-orange-400' },
                { key: 'Hypertension', color: 'bg-rose-500' },
                { key: 'Anemia', color: 'bg-blue-400' },
              ].map(({ key, color }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", color)} />
                  <span className="text-[10px] font-black uppercase text-slate-400">{key}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="gradientDM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientHT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientAN" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                  }}
                  labelStyle={{ fontWeight: 700, color: '#1E293B', marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="Diabetes" stroke="#FB923C" strokeWidth={3} fill="url(#gradientDM)" dot={false} />
                <Area type="monotone" dataKey="Hypertension" stroke="#F43F5E" strokeWidth={3} fill="url(#gradientHT)" dot={false} />
                <Area type="monotone" dataKey="Anemia" stroke="#3B82F6" strokeWidth={3} fill="url(#gradientAN)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Health Insight + Coach CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-white rounded-[28px] border border-slate-100 soft-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-600" />
              </div>
              <h4 className="font-bold text-slate-900">AI Health Insight</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {latestResults
                ? `Based on your ${latestResults.overallRisk}% risk profile, your primary focus should be on ${latestResults.diabetes.risk > latestResults.hypertension.risk ? 'blood sugar management' : 'cardiovascular health'}. ${
                    latestResults.anemia.visionScore !== null
                      ? 'Vision analysis has been included in your anemia assessment.'
                      : 'Add eye/nail images next time for enhanced anemia detection.'
                  }`
                : 'Complete your first health scan to unlock personalized bio-digital insights.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex items-center"
          >
            <button
              onClick={() => onPageChange('chatbot')}
              className="w-full py-6 bg-teal-600/10 text-teal-700 rounded-[28px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-teal-600 hover:text-white transition-all duration-300 group border border-teal-100"
            >
              Ask PreventX Coach
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

