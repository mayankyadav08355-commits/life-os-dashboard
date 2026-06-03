/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Briefcase, 
  Flame, 
  Settings, 
  TrendingUp, 
  BookOpen,
  Award,
  HelpCircle,
  Menu,
  X,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  jobMode: boolean;
  onJobModeToggle: () => void;
  disciplineScore: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  jobMode,
  onJobModeToggle,
  disciplineScore,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'routine', label: 'Daily Routine', icon: CalendarClock },
    { id: 'skills', label: 'Skill Focus', icon: Compass },
    { id: 'goals', label: 'Weekly Goals', icon: Award },
    { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp },
    { id: 'tools', label: 'Tools (Timer & Journal)', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Flame className="w-5 h-5 animate-pulse text-amber-300 fill-amber-300" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white tracking-tight">LifeOS</span>
          {jobMode && (
            <span className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold px-1.5 py-0.5 rounded border border-sky-400/20">
              JOB MODE
            </span>
          )}
        </div>
        
        <button 
          id="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 mr-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar background overlay for mobile */}
      {isOpen && (
        <div 
          id="sidebar-overlay"
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Primary Sidebar Drawer */}
      <aside 
        id="app-sidebar"
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:block'
        }`}
      >
        <div className="flex flex-col flex-1 py-6 overflow-y-auto">
          {/* Brand Logo */}
          <div className="px-6 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 dark:text-white leading-none tracking-tight">AURA LifeOS</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Personal operating system</span>
              </div>
            </div>
            
            <button 
              id="sidebar-close-btn"
              onClick={() => setIsOpen(false)} 
              className="lg:hidden p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="mx-4 mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">DISCIPLINE SCORE</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{disciplineScore}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${disciplineScore}%` }}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-3 flex flex-col gap-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Settings & Toggles */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* Job Mode Toggle Action */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 select-none">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Job Mode</span>
              </div>
              <span className="text-[10px] text-slate-500">Auto-shift coding to evening</span>
            </div>
            
            {/* Custom Interactive Toggle Button */}
            <button
              id="job-mode-toggle"
              type="button"
              onClick={onJobModeToggle}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                jobMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={jobMode}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  jobMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Audio and Theme Actions */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              {/* Sound toggle */}
              <button 
                id="sound-toggle-btn"
                onClick={onToggleSound}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                title={soundEnabled ? "Mute audio notifications" : "Unmute audio notifications"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              {/* Theme toggle */}
              <button 
                id="theme-toggle-btn"
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                title="Switch theme"
              >
                <Settings className={`w-4 h-4 ${theme === 'dark' ? 'rotate-45' : ''} transition-transform duration-300`} />
              </button>
            </div>
            
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              v1.0.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
