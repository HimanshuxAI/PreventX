/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { ChatbotPage } from './components/ChatbotPage';
import { PrecautionsPage } from './components/PrecautionsPage';
import { ImpactSimulatorPage } from './components/ImpactSimulatorPage';
import { ReportsPage } from './components/ReportsPage';
import { LoginPage } from './components/LoginPage';
import { AnemiaPredictor, DiabetesPredictor, HypertensionPredictor } from './components/PredictorCards';
import { Page, Language, translations } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePredictor, setActivePredictor] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  const t = translations[language];

  useEffect(() => {
    import('./lib/supabase').then(({ onAuthStateChange, getCurrentUser }) => {
      getCurrentUser().then(user => {
        setIsLoggedIn(!!user);
        if (user?.email) setUserEmail(user.email);
        if (user?.id) {
          const cachedUserId = localStorage.getItem('preventx_last_user_id');
          if (cachedUserId !== user.id) {
            localStorage.removeItem('preventx_reports');
            localStorage.setItem('preventx_last_user_id', user.id);
          }
        }
        setAuthLoading(false);
      });
      const { data: { subscription } } = onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
        if (session?.user?.email) setUserEmail(session.user.email);
        if (session?.user?.id) localStorage.setItem('preventx_last_user_id', session.user.id);
      });
      return () => subscription.unsubscribe();
    });
  }, []);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"></div>;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Dashboard
            language={language}
            onPageChange={setCurrentPage}
            onStartPredictor={() => {
              setCurrentPage('predictor');
              setActivePredictor('diabetes'); // Default starting point
            }}
          />
        );
      case 'chatbot':
        return (
          <ChatbotPage
            title={t.chatbot}
            subtitle={t.symptomsSubtitle}
            examplePrompts={[
              t.feelDizzy,
              t.chestHurts,
              t.persistentCough,
              t.suggestDietAnemia,
              t.lowSugarPlan
            ]}
            placeholder={t.symptomsPlaceholder}
          />
        );
      case 'precautions':
        return <PrecautionsPage language={language} />;
      case 'impact':
        return <ImpactSimulatorPage language={language} />;
      case 'reports':
        return <ReportsPage language={language} />;
      case 'predictor':
        if (activePredictor) {
          return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
              <DiabetesPredictor onClose={() => setActivePredictor(null)} language={language} />
            </div>
          );
        }
        return (
          <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{t.selectDisease}</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">{t.predictorDesc}</p>
              </div>

              {/* Disease Model Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Diabetes Card */}
                <div className="bg-white rounded-[32px] border-2 border-orange-100 p-7 group hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-orange-50 rounded-full opacity-60" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                        <span className="text-2xl">🩸</span>
                      </div>
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-wider rounded-full">98.2% Accuracy</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{t.diabetes}</h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Ensemble model (XGBoost + LightGBM + Random Forest) trained on 768+ clinical samples with soft-voting fusion.</p>
                    <div className="space-y-2 mb-4">
                      {['BMI & Body Metrics', 'Family History', 'Diet & Sugar Intake', 'Glucose Indicators'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          <span className="font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-lg uppercase">Tabular Input</span>
                      <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-lg uppercase">SHAP Explainability</span>
                    </div>
                  </div>
                </div>

                {/* Hypertension Card */}
                <div className="bg-white rounded-[32px] border-2 border-rose-100 p-7 group hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-rose-50 rounded-full opacity-60" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                        <span className="text-2xl">💓</span>
                      </div>
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-full">98.9% Accuracy</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{t.hypertension}</h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Tri-model ensemble analyzing cardiovascular markers with BP product, stress-sleep interaction & lifestyle factors.</p>
                    <div className="space-y-2 mb-4">
                      {['Blood Pressure Readings', 'Salt & Diet Habits', 'Stress & Sleep Patterns', 'Cardiovascular History'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span className="font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-lg uppercase">Tabular Input</span>
                      <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-lg uppercase">SHAP Explainability</span>
                    </div>
                  </div>
                </div>

                {/* Anemia Card */}
                <div className="bg-white rounded-[32px] border-2 border-blue-100 p-7 group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-blue-50 rounded-full opacity-60" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <span className="text-2xl">🧪</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-full">98.5% Accuracy</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{t.anemia}</h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Multimodal late-fusion model combining tabular symptoms with NVIDIA Nemotron VLM vision analysis on eye/nail images.</p>
                    <div className="space-y-2 mb-4">
                      {['Conjunctiva / Nail Pallor (AI Vision)', 'Fatigue & Weakness Symptoms', 'Iron-Rich Diet Assessment', 'Menstrual History (if applicable)'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span className="font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-lg uppercase">Tabular + Vision</span>
                      <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-lg uppercase">Nemotron VLM</span>
                      <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-lg uppercase">Late Fusion</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unified Start Assessment Button */}
              <div className="bg-white rounded-[32px] border border-slate-100 soft-shadow p-8 text-center">
                <p className="text-sm text-slate-500 mb-2 font-medium">One assessment covers <strong className="text-slate-700">all 3 diseases</strong> simultaneously</p>
                <p className="text-xs text-slate-400 mb-6">7 quick steps · Camera optional · Takes ~45 seconds</p>
                <button
                  onClick={() => setActivePredictor('diabetes')}
                  className="inline-flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-[24px] font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 group"
                >
                  <span className="text-xl">⚡</span>
                  {t.startAssessment}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 p-8 bg-slate-50">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">{t.settings}</h1>
            <div className="max-w-2xl bg-white rounded-[32px] p-8 soft-shadow border border-slate-100 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{language === 'en' ? 'Account Settings' : language === 'hi' ? 'खाता सेटिंग्स' : 'खाते सेटिंग्ज'}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-medium text-slate-700">{language === 'en' ? 'Profile Visibility' : language === 'hi' ? 'प्रोफ़ाइल दृश्यता' : 'प्रोफाइल दृश्यता'}</span>
                    <div className="w-12 h-6 bg-teal-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-medium text-slate-700">{language === 'en' ? 'Notifications' : language === 'hi' ? 'सूचनाएं' : 'सूचना'}</span>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{language === 'en' ? 'Language Preferences' : language === 'hi' ? 'भाषा प्राथमिकताएं' : 'भाषा प्राधान्ये'}</h3>
                <div className="flex gap-3">
                  {['en', 'hi', 'mr'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang as Language)}
                      className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${language === lang ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-100 text-slate-500'}`}
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'मराठी'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button
                  onClick={() => {
                    localStorage.removeItem('preventx_reports');
                    import('./lib/supabase').then(({ signOut }) => signOut());
                  }}
                  className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold border-2 border-rose-100 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <Dashboard
            language={language}
            onPageChange={setCurrentPage}
            onStartPredictor={() => {
              setCurrentPage('predictor');
              setActivePredictor('diabetes');
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} language={language} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          language={language}
          userEmail={userEmail}
          onLanguageChange={setLanguage}
          onLogout={() => {
            localStorage.removeItem('preventx_reports');
            import('./lib/supabase').then(({ signOut }) => signOut());
          }}
        />

        <div className="flex-1 overflow-y-auto flex flex-col">
          {renderPage()}

          {currentPage !== 'home' && currentPage !== 'chatbot' && currentPage !== 'impact' && currentPage !== 'precautions' && (
            <footer className="py-6 px-8 bg-white border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">PreventX Bharat</p>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}




