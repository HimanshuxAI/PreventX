import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Globe, 
  Users, 
  Mic, 
  Thermometer, 
  Droplets, 
  Heart, 
  Wind,
  Play,
  Zap,
  Smartphone,
  FileText,
  LineChart as LineChartIcon,
  MessageSquare,
  Stethoscope,
  ShieldCheck,
  Globe2,
  Home as HomeIcon,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Language, translations, Page } from '../types';

interface DashboardProps {
  language: Language;
  onPageChange: (page: Page) => void;
  onStartPredictor: () => void;
}

const heartData = [
  { time: '9:00', bpm: 72 },
  { time: '10:00', bpm: 75 },
  { time: '11:00', bpm: 82 },
  { time: '12:00', bpm: 78 },
  { time: '13:00', bpm: 74 },
  { time: '14:00', bpm: 70 },
  { time: '15:00', bpm: 72 },
];

const riskData = [
  { year: '2024', risk: 10 },
  { year: '2025', risk: 12 },
  { year: '2026', risk: 15 },
  { year: '2027', risk: 14 },
  { year: '2028', risk: 18 },
  { year: '2029', risk: 22 },
  { year: '2030', risk: 25 },
];

export function Dashboard({ language, onPageChange, onStartPredictor }: DashboardProps) {
  const t = translations[language];

  return (
    <div className="flex-1 flex">
      <div className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{t.welcome}</h1>
          <p className="text-slate-500 font-medium mb-6">
            {t.preventxDesc}
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: t.accuracy, value: "93%+", unit: "Accuracy", icon: Shield, color: "from-orange-400 to-rose-400" },
            { label: t.diseasesCovered, value: "3", unit: "Diseases Covered", icon: Activity, color: "from-teal-400 to-emerald-400" },
            { label: "Languages", value: "3", unit: "Supported", icon: Globe, color: "from-blue-400 to-indigo-400" },
            { label: t.livesImpacted, value: "14L+", unit: "Lives Impacted", icon: Users, color: "from-sky-400 to-cyan-400" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} p-6 rounded-[32px] text-white shadow-lg shadow-slate-200 relative overflow-hidden group cursor-default`}
            >
              <div className="relative z-10">
                <stat.icon className="w-8 h-8 mb-4 opacity-80" />
                <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold">{stat.value}</span>
                  <span className="text-[10px] font-medium opacity-60">{stat.unit}</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Check Health Risk Button */}
        <div className="mb-12">
          <button 
            onClick={onStartPredictor}
            className="w-full py-5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white rounded-[32px] font-bold text-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-5 shadow-xl shadow-teal-500/30 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="relative z-10 tracking-tight">{t.checkHealthRisk}</span>
            <div className="ml-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Play className="w-4 h-4 fill-teal-600 text-teal-600 ml-1" />
            </div>
          </button>
        </div>

        {/* Key Features Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-display font-bold text-slate-900 mb-8">{t.keyFeatures}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: t.diseasePredictionTitle, desc: t.diseasePredictionDesc, icon: Zap },
              { title: t.voiceInputTitle, desc: t.voiceInputDesc, icon: Mic },
              { title: t.multiModalAnemiaTitle, desc: t.multiModalAnemiaDesc, icon: Smartphone },
              { title: t.shapExplainabilityTitle, desc: t.shapExplainabilityDesc, icon: LineChartIcon },
              { title: t.personalizedPlansTitle, desc: t.personalizedPlansDesc, icon: Sparkles },
              { title: t.pdfReportsTitle, desc: t.pdfReportsDesc, icon: FileText },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow hover:border-teal-200 transition-colors">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Graphs */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Heart Rate Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="bpm" stroke="#0D9488" strokeWidth={4} dot={{ r: 6, fill: '#0D9488', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-6">{t.futureRiskTimeline}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="risk" stroke="#0EA5E9" strokeWidth={4} fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Demo Button */}
        <button className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-bold text-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-3 shadow-xl">
          <Play className="w-6 h-6 text-teal-400 fill-teal-400" />
          {t.demoMode}
        </button>
      </div>

      {/* Right Panel */}
      <aside className="w-[300px] border-l border-slate-100 bg-white p-6 hidden xl:block sticky top-0 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-teal-700">{t.pancreasMonitoring}</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-rose-700">{t.heartMonitoring}</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-blue-700">{t.bloodMonitoring}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
