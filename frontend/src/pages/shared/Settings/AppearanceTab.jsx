import { Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';

export default function AppearanceTab() {
  const [theme, setTheme] = useState('light');
  const [density, setDensity] = useState('comfortable');

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Default clear appearance' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes in low light' },
    { id: 'system', name: 'System', icon: Monitor, description: 'Matches your device settings' },
  ];

  return (
    <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h3 className="text-[12px] font-bold text-[#7E8B9B] uppercase tracking-widest mb-4">Theme Preference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center p-5 rounded-[24px] border-[2.5px] text-center transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#F6CD46] bg-[#FFFBE5]/50 shadow-sm shadow-yellow-500/10'
                    : 'border-slate-100 bg-white hover:border-[#FCE49F] hover:bg-slate-50 shadow-sm shadow-slate-100/50'
                }`}
              >
                <div className={`p-3.5 rounded-[16px] mb-3 transition-colors ${
                  isActive 
                    ? 'bg-[#F6CD46] text-white' 
                    : 'bg-slate-50 text-[#7E8B9B]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className={`text-[14px] font-bold ${isActive ? 'text-[#1E2538]' : 'text-[#1E2538]'}`}>
                  {t.name}
                </h4>
                <p className={`text-[12px] mt-1 ${isActive ? 'text-[#332500]/70' : 'text-[#7E8B9B]'}`}>
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-[12px] font-bold text-[#7E8B9B] uppercase tracking-widest mb-4">Display Density</h3>
        <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-1.5 inline-flex w-full sm:w-auto shadow-inner">
          <button 
            onClick={() => setDensity('comfortable')}
            className={`flex-1 sm:flex-none px-8 py-2.5 rounded-[14px] text-[13px] font-bold transition-all ${
              density === 'comfortable'
                ? 'bg-white text-[#1E2538] shadow-sm'
                : 'text-[#7E8B9B] hover:text-[#1E2538]'
            }`}
          >
            COMFORTABLE
          </button>
          <button 
            onClick={() => setDensity('compact')}
            className={`flex-1 sm:flex-none px-8 py-2.5 rounded-[14px] text-[13px] font-bold transition-all ${
              density === 'compact'
                ? 'bg-white text-[#1E2538] shadow-sm'
                : 'text-[#7E8B9B] hover:text-[#1E2538]'
            }`}
          >
            COMPACT
          </button>
        </div>
        <p className="text-[13px] text-[#7E8B9B] mt-3 ml-2">
          Compact mode shows more books per row in the catalog by reducing padding.
        </p>
      </div>
    </div>
  );
}
