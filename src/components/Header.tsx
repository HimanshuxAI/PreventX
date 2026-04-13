import React from 'react';
import { Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">Good Morning,</p>
        <h1 className="text-4xl font-display font-bold text-gray-900">William Johnson</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl soft-shadow hover:bg-gray-50 transition-colors">
          <Bell className="w-6 h-6 text-gray-900" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-pink-500 border-2 border-white rounded-full" />
        </button>
        
        <div className="w-12 h-12 rounded-2xl overflow-hidden soft-shadow">
          <img 
            src="https://picsum.photos/seed/doctor/100/100" 
            alt="User Profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
