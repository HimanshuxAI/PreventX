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
        return (
          <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
            <div className="max-w-2xl w-full bg-white rounded-[40px] p-12 soft-shadow border border-slate-100 text-center">
              <div className="w-20 h-20 medical-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-500/20">
                <span className="text-4xl">🧪</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">{t.selectDisease}</h2>
              <p className="text-slate-500 mb-10 leading-relaxed">
                {t.predictorDesc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'diabetes', label: t.diabetes },
                  { id: 'hypertension', label: t.hypertension },
                  { id: 'anemia', label: t.anemia }
                ].map((disease) => (
                  <button
                    key={disease.id}
                    onClick={() => setActivePredictor(disease.id)}
                    className="p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-2xl">
                        {disease.id === 'diabetes' ? '🩸' : disease.id === 'hypertension' ? '💓' : '🧪'}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 block">{disease.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {activePredictor === 'anemia' && <AnemiaPredictor onClose={() => setActivePredictor(null)} language={language} />}
            {activePredictor === 'diabetes' && <DiabetesPredictor onClose={() => setActivePredictor(null)} language={language} />}
            {activePredictor === 'hypertension' && <HypertensionPredictor onClose={() => setActivePredictor(null)} language={language} />}
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




