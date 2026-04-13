import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Heart, 
  Activity, 
  Droplets,
  TrendingUp,
  ArrowRight,
  Wand2,
  Globe,
  Building2,
  Map,
  Info,
  Link as LinkIcon,
  QrCode
} from 'lucide-react';
import { Language, translations } from '../types';

interface ImpactSimulatorPageProps {
  language: Language;
}

export function ImpactSimulatorPage({ language }: ImpactSimulatorPageProps) {
  const t = translations[language];
  const [populationInput, setPopulationInput] = useState('5000');
  const [population, setPopulation] = useState(5000);

  const stats = useMemo(() => {
    const pop = population;
    
    // Diabetes: 11.7% prevalence, 50% undiagnosed, 40% AI detection, 60% prevention
    const diabetesAtRisk = Math.round(pop * 0.117);
    const diabetesUndiagnosed = Math.round(diabetesAtRisk * 0.5);
    const diabetesAIDetectable = Math.round(diabetesUndiagnosed * 0.4);
    const diabetesPreventable = Math.round(diabetesAIDetectable * 0.6);

    // Hypertension: 28.6% prevalence, 50% undiagnosed, 35% AI detection, 60% prevention
    const hyperAtRisk = Math.round(pop * 0.286);
    const hyperUndiagnosed = Math.round(hyperAtRisk * 0.5);
    const hyperAIDetectable = Math.round(hyperUndiagnosed * 0.35);
    const hyperPreventable = Math.round(hyperAIDetectable * 0.6);

    // Anemia: 53% prevalence, 50% undiagnosed, 45% AI detection, 60% prevention
    const anemiaAtRisk = Math.round(pop * 0.53);
    const anemiaUndiagnosed = Math.round(anemiaAtRisk * 0.5);
    const anemiaAIDetectable = Math.round(anemiaUndiagnosed * 0.45);
    const anemiaPreventable = Math.round(anemiaAIDetectable * 0.6);

    const totalPreventable = diabetesPreventable + hyperPreventable + anemiaPreventable;
    const totalSavings = (totalPreventable * 0.15).toFixed(1); // ₹15,000 per case saved

    return {
      diabetes: { atRisk: diabetesAtRisk, undiagnosed: diabetesUndiagnosed, ai: diabetesAIDetectable, preventable: diabetesPreventable },
      hypertension: { atRisk: hyperAtRisk, undiagnosed: hyperUndiagnosed, ai: hyperAIDetectable, preventable: hyperPreventable },
      anemia: { atRisk: anemiaAtRisk, undiagnosed: anemiaUndiagnosed, ai: anemiaAIDetectable, preventable: anemiaPreventable },
      totalPreventable,
      totalSavings
    };
  }, [population]);

  const handleCalculate = () => {
    const val = parseInt(populationInput);
    if (!isNaN(val) && val > 0) {
      setPopulation(val);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-display font-bold text-slate-900">{t.impactSimulator}</h1>
        </div>
        <p className="text-slate-500 font-medium">{t.impactSubtitle}</p>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Population Input Section */}
        <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{t.populationSettings}</h3>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={populationInput}
                onChange={(e) => setPopulationInput(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                placeholder="Enter population..."
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                {t.people}
              </div>
            </div>
            <button 
              onClick={handleCalculate}
              className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Wand2 className="w-5 h-5 text-teal-400" />
              {t.calculateImpact}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: t.smallVillage, value: 1000, icon: HomeIcon },
              { label: t.largeTown, value: 10000, icon: Building2 },
              { label: t.city, value: 100000, icon: Map },
              { label: t.allIndia, value: 1400000000, icon: Globe },
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setPopulationInput(preset.value.toString());
                  setPopulation(preset.value);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  population === preset.value 
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-teal-200 hover:bg-teal-50'
                }`}
              >
                <preset.icon className="w-3.5 h-3.5" />
                {preset.label} ({formatNumber(preset.value)})
              </button>
            ))}
          </div>
        </div>

        {/* Main Result Summary */}
        <motion.div 
          key={population}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[40px] p-10 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-teal-400">{stats.totalPreventable.toLocaleString()}</span> {t.casesPreventable} <span className="text-teal-400">{formatNumber(population)}</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium">
              {t.estSavings.replace('{amount}', stats.totalSavings)}
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(circle,rgba(20,184,166,0.3)_0%,transparent_70%)]" />
          </div>
        </motion.div>

        {/* Disease Breakdown Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              id: 'diabetes',
              name: t.diabetes, 
              data: stats.diabetes, 
              icon: Droplets, 
              color: "text-orange-500", 
              bg: "bg-orange-50",
              barColor: "bg-orange-500",
              percentage: (stats.diabetes.preventable / stats.diabetes.atRisk) * 100
            },
            { 
              id: 'hypertension',
              name: t.hypertension, 
              data: stats.hypertension, 
              icon: Heart, 
              color: "text-rose-500", 
              bg: "bg-rose-50",
              barColor: "bg-rose-500",
              percentage: (stats.hypertension.preventable / stats.hypertension.atRisk) * 100
            },
            { 
              id: 'anemia',
              name: t.anemia, 
              data: stats.anemia, 
              icon: Activity, 
              color: "text-teal-500", 
              bg: "bg-teal-50",
              barColor: "bg-teal-500",
              percentage: (stats.anemia.preventable / stats.anemia.atRisk) * 100
            },
          ].map((disease, i) => (
            <motion.div 
              key={disease.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 ${disease.bg} ${disease.color} rounded-2xl flex items-center justify-center`}>
                  <disease.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-display font-bold text-slate-900">{disease.name}</h4>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{t.atRiskPopulation}:</span>
                  <span className="font-bold text-slate-900">{formatNumber(disease.data.atRisk)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{t.likelyUndiagnosed}:</span>
                  <span className="font-bold text-slate-900">{formatNumber(disease.data.undiagnosed)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{t.detectableByAI}:</span>
                  <span className="font-bold text-slate-900">{formatNumber(disease.data.ai)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-sm font-bold text-slate-900">{t.preventableCases}:</span>
                  <span className={`text-lg font-bold ${disease.color}`}>{formatNumber(disease.data.preventable)}</span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${disease.percentage * 5}%` }} // Scaled for visibility
                  className={`h-full ${disease.barColor}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Methodology Section */}
        <div className="bg-white p-10 rounded-[40px] soft-shadow border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <Info className="w-6 h-6 text-slate-400" />
            <h3 className="text-xl font-display font-bold text-slate-900">{t.methodology}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {[
              t.diabetesPrevalence,
              t.hypertensionPrevalence,
              t.anemiaPrevalence,
              t.undiagnosedRate,
              t.earlyDetectionAI,
              t.preventionRate,
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 shrink-0" />
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Share with Doctor Section */}
        <div className="bg-rose-50 border border-rose-100 p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm shrink-0">
            <QrCode className="w-10 h-10 text-rose-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{t.shareWithDoctor}</h3>
            <p className="text-slate-600 text-sm font-medium mb-6 md:mb-0">
              {t.shareWithDoctorDesc}
            </p>
          </div>
          <button className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 shrink-0">
            <LinkIcon className="w-5 h-5" />
            {t.generateShareLink}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for preset icons
function HomeIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
