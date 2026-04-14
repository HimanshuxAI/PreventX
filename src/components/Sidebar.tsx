import React from 'react';
import { 
  Home, 
  Activity, 
  MessageSquare, 
  Stethoscope, 
  ShieldCheck, 
  LineChart, 
  Globe2, 
  Settings,
  Heart,
  FileText
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Page, Language, translations } from '../types';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  language: Language;
}

export function Sidebar({ currentPage, onPageChange, language }: SidebarProps) {
  const t = translations[language];
  
  const menuItems = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'predictor', icon: Activity, label: t.predictor },
    { id: 'chatbot', icon: MessageSquare, label: t.chatbot },
    { id: 'precautions', icon: ShieldCheck, label: t.precautions },
    { id: 'impact', icon: Globe2, label: t.impact },
    { id: 'reports', icon: FileText, label: language === 'en' ? 'My Reports' : language === 'hi' ? 'मेरी रिपोर्ट्स' : 'माझ्या अहवाल' },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <aside className="w-64 h-full flex flex-col py-8 px-6 border-r border-slate-200 bg-white shadow-sm z-20">
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => onPageChange('home')}>
        <div className="w-10 h-10 medical-gradient rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Heart className="text-white w-6 h-6" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-slate-900">PreventX</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id as Page)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-left",
              currentPage === item.id 
                ? "bg-teal-50 text-teal-600 shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5", currentPage === item.id ? "text-teal-600" : "text-slate-400 group-hover:text-slate-900")} />
            <span className="font-medium text-sm">{item.label}</span>
            {currentPage === item.id && <div className="ml-auto w-1.5 h-6 bg-teal-500 rounded-full" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">Support Bharat</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI-Powered Healthcare for every village in India.
          </p>
        </div>
      </div>
    </aside>
  );
}
