import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  FileText, TrendingDown, TrendingUp, Minus, Calendar, Clock,
  Trash2, Download, Activity, Heart, Droplets, BarChart3, ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { type PredictionResults, getReports, clearReports } from '../lib/mlEngine';
import { Language, translations } from '../types';

interface ReportsPageProps {
  language: Language;
}

export function ReportsPage({ language }: ReportsPageProps) {
  const t = translations[language];
  const [reports, setReports] = React.useState<PredictionResults[]>(getReports());

  const chartData = useMemo(() => {
    return reports
      .slice(0, 20)
      .reverse()
      .map((r, i) => ({
        date: new Date(r.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        Diabetes: r.diabetes.risk,
        Hypertension: r.hypertension.risk,
        Anemia: r.anemia.risk,
        Overall: r.overallRisk,
      }));
  }, [reports]);

  const latestDelta = useMemo(() => {
    if (reports.length < 2) return null;
    const [latest, previous] = [reports[0], reports[1]];
    return {
      diabetes: latest.diabetes.risk - previous.diabetes.risk,
      hypertension: latest.hypertension.risk - previous.hypertension.risk,
      anemia: latest.anemia.risk - previous.anemia.risk,
      overall: latest.overallRisk - previous.overallRisk,
    };
  }, [reports]);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all reports?')) {
      clearReports();
      setReports([]);
    }
  };

  const DeltaBadge = ({ value }: { value: number }) => {
    if (value === 0) return <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5"><Minus className="w-3 h-3" /> 0</span>;
    const isDown = value < 0;
    return (
      <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
        isDown ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
      }`}>
        {isDown ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
        {value > 0 ? '+' : ''}{value}%
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">My Reports</h1>
              <p className="text-slate-500 font-medium text-sm">
                {reports.length} assessment{reports.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>
          {reports.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Reports Yet</h3>
          <p className="text-slate-500 font-medium max-w-sm">
            Complete your first health risk assessment to see your reports and trends here.
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Delta Cards (if multiple reports) */}
          {latestDelta && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Overall', delta: latestDelta.overall, icon: BarChart3, color: 'text-slate-600' },
                { label: t.diabetes, delta: latestDelta.diabetes, icon: Droplets, color: 'text-amber-600' },
                { label: t.hypertension, delta: latestDelta.hypertension, icon: Heart, color: 'text-rose-600' },
                { label: t.anemia, delta: latestDelta.anemia, icon: Activity, color: 'text-blue-600' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[24px] p-5 border border-slate-100 soft-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <DeltaBadge value={item.delta} />
                  </div>
                  <p className="text-xs font-bold text-slate-500">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1">vs. previous assessment</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Trend Chart */}
          {chartData.length >= 2 && (
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 soft-shadow">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Risk Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
                  />
                  <Line type="monotone" dataKey="Diabetes" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Hypertension" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Anemia" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Overall" stroke="#0D9488" strokeWidth={3} strokeDasharray="6 3" dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Report List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Assessment History</h3>
            {reports.map((report, i) => (
              <motion.div
                key={report.timestamp}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-[24px] p-5 border border-slate-100 soft-shadow hover:border-teal-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {new Date(report.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(report.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-teal-600 mt-0.5">
                        {report.modelArchitecture}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="text-center px-3">
                        <p className="text-xs font-bold text-amber-600">{report.diabetes.risk}%</p>
                        <p className="text-[9px] text-slate-400">DM</p>
                      </div>
                      <div className="text-center px-3">
                        <p className="text-xs font-bold text-rose-600">{report.hypertension.risk}%</p>
                        <p className="text-[9px] text-slate-400">HTN</p>
                      </div>
                      <div className="text-center px-3">
                        <p className="text-xs font-bold text-blue-600">{report.anemia.risk}%</p>
                        <p className="text-[9px] text-slate-400">Anemia</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                      <span className={`text-sm font-bold ${
                        report.overallRisk > 60 ? 'text-rose-600' : report.overallRisk > 35 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {report.overallRisk}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
