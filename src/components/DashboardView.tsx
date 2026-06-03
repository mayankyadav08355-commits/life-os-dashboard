/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Calendar, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  RefreshCw, 
  Lock, 
  Cpu, 
  PenTool, 
  CheckSquare, Plus, Trash2, BookOpen, Clock
} from 'lucide-react';
import { AppState, RoutineItem } from '../types';
import { MOTIVATIONAL_QUOTES } from '../utils/routineHelper';

interface DashboardViewProps {
  state: AppState;
  onUpdateRoutine: (routine: RoutineItem[]) => void;
  onNavigate: (viewStr: string) => void;
  disciplineScore: number;
}

export default function DashboardView({ 
  state, 
  onUpdateRoutine, 
  onNavigate, 
  disciplineScore 
}: DashboardViewProps) {
  const [time, setTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [focusInput, setFocusInput] = useState('');
  const [focusGoals, setFocusGoals] = useState<string[]>(() => {
    const saved = localStorage.getItem('lifeos_focus_goals');
    return saved ? JSON.parse(saved) : [
      'Complete Deep Study focus block',
      'Maintain 100% hydration target',
      'No distraction coding practice'
    ];
  });

  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportError, setAiReportError] = useState('');
  const [activeAdvice, setActiveAdvice] = useState<string>(() => {
    return localStorage.getItem('lifeos_latest_advice') || 
      "Click the 'Analyze Performance' button below to evoke Gemini AI diagnostics based on your real consistency trends.";
  });

  // Keep Clock ticking
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Set randomized quote index on session start
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setQuoteIndex(randomIdx);
  }, []);

  // Save focus goals
  const saveFocusGoals = (goals: string[]) => {
    setFocusGoals(goals);
    localStorage.setItem('lifeos_focus_goals', JSON.stringify(goals));
  };

  const handleAddFocusGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusInput.trim()) return;
    if (focusGoals.length >= 5) {
      alert("Let's keep it highly focused. Limit to 5 core intentions today.");
      return;
    }
    const updated = [...focusGoals, focusInput.trim()];
    saveFocusGoals(updated);
    setFocusInput('');
  };

  const handleRemoveFocusGoal = (index: number) => {
    const updated = focusGoals.filter((_, i) => i !== index);
    saveFocusGoals(updated);
  };

  // Trigger server-side Gemini analysis based on daily record, skills performance, and weekly goals
  const handleRequestAIReport = async () => {
    setAiReportLoading(true);
    setAiReportError('');
    try {
      const payload = {
        routine: state.routine,
        skills: state.skills,
        goals: state.weeklyGoals,
        journals: state.journals,
        jobMode: state.jobMode
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appState: payload })
      });

      if (!res.ok) {
        throw new Error('Server returned an error scoring trends.');
      }

      const data = await res.json();
      if (data && data.text) {
        setActiveAdvice(data.text);
        localStorage.setItem('lifeos_latest_advice', data.text);
      } else {
        throw new Error('Invalid analysis output formatting.');
      }
    } catch (err: any) {
      console.error(err);
      setAiReportError(err.message || 'Unable to connect to intelligence server. Please ensure express backend is up and running.');
    } finally {
      setAiReportLoading(false);
    }
  };

  // Derived metrics
  const completedTasks = state.routine.filter(t => t.status === 'completed');
  const missedTasks = state.routine.filter(t => t.status === 'missed');
  const pendingTasks = state.routine.filter(t => t.status === 'pending');
  const totalTasks = state.routine.length;
  
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const missedPercent = totalTasks > 0 ? Math.round((missedTasks.length / totalTasks) * 100) : 0;

  // Streak estimation based on completed routine parts
  const activeStreaks = completionPercent >= 75 ? 3 : 2; // Simulated streaks tied to productivity
  const weeklyConsistency = 88; // Default base consistency percentage

  // Beautiful time-dependent greeting
  const getGreeting = () => {
    const hrs = time.getHours();
    if (hrs < 12) return 'Hari Om & Good Morning';
    if (hrs < 17) return 'Good Afternoon - Maintain the Flow';
    if (hrs < 21) return 'Hari Om & Good Evening';
    return 'Good Night - Rest Well';
  };

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6">
      
      {/* Time & Title Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 md:p-8 shadow-sm">
        {/* Glow Circles */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-600/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-60 h-60 rounded-full bg-amber-500/5 dark:bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              AURA LIFE OPERATING SYSTEM
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {getGreeting()}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-1">
              "Build strong habits, align your spiritual path, and sharpen your technical stack."
            </p>
          </div>

          {/* Clock & Calendar Block */}
          <div className="flex flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 min-w-[240px]">
            <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <div>
              <div className="text-xl font-bold text-slate-800 dark:text-white font-mono tracking-tight leading-none">
                {formattedTime}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {formattedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Banner Footer */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-start gap-2.5">
          <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded uppercase mt-0.5 shrink-0">
            QUOTE
          </span>
          <p className="text-xs md:text-sm italic font-sans text-slate-600 dark:text-slate-300">
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
          </p>
        </div>
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1: Discipline Meter */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 flex flex-col items-center text-center justify-between shadow-sm relative">
          <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 tracking-wider">
            DISCIPLINE METER
          </div>
          
          <div className="relative w-36 h-36 mt-4 flex items-center justify-center">
            {/* Custom SVG Radial Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer track */}
              <circle 
                cx="72" 
                cy="72" 
                r="60" 
                strokeWidth="10" 
                stroke="currentColor" 
                className="text-slate-100 dark:text-slate-800"
                fill="transparent" 
              />
              {/* Dynamic filled path */}
              <circle 
                cx="72" 
                cy="72" 
                r="60" 
                strokeWidth="10" 
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * disciplineScore) / 100}
                strokeLinecap="round"
                stroke="currentColor" 
                className="text-indigo-600 dark:text-indigo-500 transition-all duration-700 ease-out"
                fill="transparent" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
                {disciplineScore}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">SCORE INDEX</span>
            </div>
          </div>

          <div className="mt-4 space-y-1 w-full">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Growth State</h3>
            <p className="text-xs text-slate-400">
              {disciplineScore >= 80 
                ? 'Excellent alignment! Warrior discipline mode active.' 
                : disciplineScore >= 50 
                ? 'Steady rhythm, stay careful on deep focus blocks.' 
                : 'Action required: consistency decline detected.'}
            </p>
          </div>
        </div>

        {/* Metric Card 2: Habit Consistency & Streaks */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider">
            STREAKS & CONSISTENCY
          </div>

          <div className="my-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 relative">
                <Flame className="w-7 h-7 text-amber-500 animate-bounce fill-amber-500" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                  {activeStreaks} Days
                </div>
                <div className="text-xs text-slate-400">Active Daily Streak</div>
              </div>
            </div>

            <div className="border-l border-slate-100 dark:border-slate-800 h-10" />

            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                {weeklyConsistency}%
              </div>
              <div className="text-xs text-slate-400">Consistency Index</div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              Streak Multiplier Active
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Maintain a 75% daily task resolution to keep your streak burning hot.
            </p>
          </div>
        </div>

        {/* Metric Card 3: Today's Routine Resolution */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider">
            TODAY'S RES-METER
          </div>

          <div className="space-y-3 my-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tasks Completed</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedTasks.length} / {totalTasks}</span>
            </div>
            
            {/* Split Progress Visual */}
            <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 border dark:border-slate-700">
              <div 
                className="bg-emerald-500 transition-all duration-500" 
                style={{ width: `${completionPercent}%` }}
                title={`Completed: ${completionPercent}%`}
              />
              <div 
                className="bg-rose-500 transition-all duration-500" 
                style={{ width: `${missedPercent}%` }}
                title={`Missed: ${missedPercent}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {completionPercent}% Success
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                {missedPercent}% Missed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                {100 - completionPercent - missedPercent}% Pending
              </span>
            </div>
          </div>

          <button 
            id="go-to-routine-btn"
            onClick={() => onNavigate('routine')}
            className="w-full text-xs text-center py-2 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all border border-indigo-100 dark:border-indigo-900/40"
          >
            Manage Routine Schedule →
          </button>
        </div>
      </div>

      {/* Main Grid: Focus Goals & AI Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Section left (5 columns): Daily Focus Targets */}
        <div id="focus-goals" className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-slate-800 dark:text-white">Daily Focus Targets</h2>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Max 5 Tasks</span>
            </div>

            <form onSubmit={handleAddFocusGoal} className="flex gap-2 mb-4">
              <input
                id="focus-goal-input"
                type="text"
                placeholder="Declare a micro-goal today..."
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                className="flex-1 text-xs shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                id="add-focus-goal-btn"
                type="submit"
                className="bg-indigo-600 text-white rounded-xl px-3 hover:bg-indigo-500 flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <ul id="focus-goals-list" className="space-y-2 max-h-[192px] overflow-y-auto pr-1">
              {focusGoals.map((g, idx) => (
                <li 
                  key={idx}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium shrink-0 leading-tight">{g}</span>
                  </div>
                  <button
                    id={`remove-focus-goal-${idx}`}
                    type="button"
                    onClick={() => handleRemoveFocusGoal(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
              {focusGoals.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 italic">
                  No focus goals declared. Use input to set three intents.
                </div>
              )}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <PenTool className="w-3.5 h-3.5 text-slate-400" />
            <span>Intentions are wiped manually to promote grit.</span>
          </div>
        </div>

        {/* Section right (7 columns): AI Personal Coach Diagnostics */}
        <div id="ai-coach" className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <h2 className="font-bold text-slate-800 dark:text-white">AI Personal Growth Coach</h2>
              </div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono tracking-wider">Gemini 3.5 Active</span>
            </div>

            {/* AI Report Card */}
            <div 
              id="ai-coach-advice-container"
              className="bg-indigo-50/20 dark:bg-slate-950/80 border border-indigo-100/30 dark:border-indigo-900/30 rounded-xl p-4 min-h-[160px] max-h-[220px] overflow-y-auto leading-relaxed text-xs text-slate-600 dark:text-slate-300"
            >
              {aiReportLoading ? (
                <div className="flex flex-col items-center justify-center p-6 space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Engaging Gemini 3.5... analyzing routine checkboxes, logged skill times, and goal completion curves...
                  </p>
                </div>
              ) : (
                <div className="whitespace-pre-line font-sans prose dark:prose-invert max-w-none text-xs">
                  {activeAdvice}
                </div>
              )}
            </div>

            {aiReportError && (
              <p className="text-rose-500 text-[11px] font-mono mt-2 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/40">
                ⚠️ Error: {aiReportError}
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Analyzes water, goals complete, active job routines instantly.
            </span>
            <button
              id="ai-audit-btn"
              type="button"
              disabled={aiReportLoading}
              onClick={handleRequestAIReport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-650/20 disabled:bg-slate-400"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              Analyze Health & Consistency
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
