import React from 'react';
import { Bell, Globe, ChevronDown, LogOut } from 'lucide-react';
import { Language, translations } from '../types';

interface TopBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
}

export function TopBar({ language, onLanguageChange, onLogout }: TopBarProps) {
  const t = translations[language];

  return (
    <header className="h-20 flex items-center justify-end px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <Globe className="w-4 h-4 text-teal-600" />
            <span>{language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Marathi'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
            <button onClick={() => onLanguageChange('en')} className="w-full px-4 py-3 text-left text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">English</button>
            <button onClick={() => onLanguageChange('hi')} className="w-full px-4 py-3 text-left text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">Hindi (हिंदी)</button>
            <button onClick={() => onLanguageChange('mr')} className="w-full px-4 py-3 text-left text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">Marathi (मराठी)</button>
          </div>
        </div>

        <button className="relative w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100 relative group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">Priya Deshmukh</p>
          </div>
          <button className="w-10 h-10 rounded-xl overflow-hidden shadow-md border-2 border-white hover:border-teal-500 transition-all">
            <img 
              src="https://i.pinimg.com/736x/4e/08/04/4e080473ea8eed8e691a0d0cb4797c5f.jpg" 
              alt="User Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Logout Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
              <p className="text-sm font-bold text-slate-900 truncate">Priya Deshmukh</p>
            </div>
            <button 
              onClick={onLogout}
              className="w-full px-4 py-3 text-left text-sm text-rose-600 font-bold hover:bg-rose-50 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
