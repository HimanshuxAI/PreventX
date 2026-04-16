import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Activity,
  Globe,
  Users,
  Mic,
  Play,
  Zap,
  Smartphone,
  FileText,
  LineChart as LineChartIcon,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  History
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
import { MedicalBodyMap } from './MedicalBodyMap';

interface DashboardProps {
  language: Language;
  onPageChange: (page: Page) => void;
  onStartPredictor: () => void;
}

export function Dashboard({ language, onPageChange, onStartPredictor }: DashboardProps) {
  const t = translations[language];
  const [reports, setReports] = useState<PredictionResults[]>([]);
  const [latestResults, setLatestResults] = useState<PredictionResults | null>(null);

  useEffect(() => {
    const historicalReports = getReports();
    setReports(historicalReports);
    if (historicalReports.length > 0) {
      setLatestResults(historicalReports[0]);
    }
  }, []);

  // Transform reports for Recharts
  const chartData = reports.slice(0, 7).reverse().map(r => ({
    date: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    Diabetes: r.diabetes.risk,
    Hypertension: r.hypertension.risk,
    Anemia: r.anemia.risk,
    Overall: r.overallRisk
  }));

  // Fallback data if no reports
  const displayData = chartData.length > 0 ? chartData : [
    { date: 'Initial', Diabetes: 5, Hypertension: 5, Anemia: 5, Overall: 5 },
    { date: 'Today', Diabetes: 5, Hypertension: 5, Anemia: 5, Overall: 5 },
  ];

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">{t.welcome}</h1>
            <p className="text-slate-500 font-medium max-w-2xl">
              {t.preventxDesc}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Live in <span className="text-teal-600">42 Villages</span>
            </p>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Overall Wellness', value: latestResults ? `${100 - latestResults.overallRisk}%` : '---', unit: 'Score', icon: Shield, color: 'from-teal-400 to-emerald-400' },
            { label: 'Diabetes Status', value: latestResults ? `${latestResults.diabetes.risk}%` : '---', unit: 'Risk', icon: Activity, color: 'from-orange-400 to-rose-400' },
            { label: 'Hypertension', value: latestResults ? `${latestResults.hypertension.risk}%` : '---', unit: 'Risk', icon: TrendingUp, color: 'from-rose-400 to-pink-400' },
            { label: 'Tests Done', value: reports.length.toString(), unit: 'Assessments', icon: History, color: 'from-blue-400 to-indigo-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} p-6 rounded-[32px] text-white shadow-lg relative overflow-hidden group`}
            >
              <div className="relative z-10">
                <stat.icon className="w-8 h-8 mb-4 opacity-80" />
                <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold">{stat.value}</span>
                  <span className="text-[10px] font-bold opacity-60 uppercase">{stat.unit}</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Main Action */}
        <div className="relative mb-12 group">
          <button
            onClick={onStartPredictor}
            className="w-full py-6 bg-slate-900 text-white rounded-[40px] font-bold text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-6 shadow-2xl relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center animate-pulse">
              <Zap className="w-6 h-6 text-teal-400" />
            </div>
            <span className="tracking-tight">{t.checkHealthRisk}</span>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>

        {/* Dynamic Risk Timeline */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 soft-shadow mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-display font-bold text-slate-900">{t.futureRiskTimeline}</h3>
              <p className="text-sm text-slate-400 font-medium">Risk trends across your last 7 assessments</p>
            </div>
            <div className="flex gap-4">
              {['Diabetes', 'Hypertension', 'Anemia'].map(key => (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", key === 'Diabetes' ? 'bg-orange-400' : key === 'Hypertension' ? 'bg-rose-500' : 'bg-blue-400')} />
                  <span className="text-[10px] font-black uppercase text-slate-400">{key}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="gradientDM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
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
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="Diabetes" stroke="#FB923C" strokeWidth={4} fill="url(#gradientDM)" />
                <Area type="monotone" dataKey="Hypertension" stroke="#F43F5E" strokeWidth={4} fill="none" />
                <Area type="monotone" dataKey="Anemia" stroke="#3B82F6" strokeWidth={4} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { title: t.voiceInputTitle, icon: Mic, color: 'bg-emerald-50 text-emerald-600' },
            { title: t.multiModalAnemiaTitle, icon: Smartphone, color: 'bg-blue-50 text-blue-600' },
            { title: t.shapExplainabilityTitle, icon: LineChartIcon, color: 'bg-purple-50 text-purple-600' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 hover:border-teal-200 transition-colors">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", f.color)}>
                <f.icon className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700">{f.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar: Bio-Digital Twin */}
      <aside className="w-[450px] border-l border-slate-100 bg-white p-8 hidden xl:flex flex-col h-full scrollbar-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">Health Digital Twin</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Anatomical Analysis</p>
          </div>
          <div className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Sync: Live
          </div>
        </div>

        <MedicalBodyMap results={latestResults} />

        <div className="mt-auto space-y-4">
          <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h4 className="font-bold text-slate-900">AI Health Insight</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              {latestResults
                ? `Based on your ${latestResults.overallRisk}% risk profile, your primary focus should be on ${latestResults.diabetes.risk > latestResults.hypertension.risk ? 'blood sugar management' : 'cardiovascular health'}.`
                : "Complete your first health scan to unlock personalized bio-digital insights."}
            </p>
          </div>

          <button
            onClick={() => onPageChange('chatbot')}
            className="w-full py-5 bg-teal-600/10 text-teal-700 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-teal-600 hover:text-white transition-all group"
          >
            Ask AarogyaShield Coach
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </aside>
    </div>
  );
}
