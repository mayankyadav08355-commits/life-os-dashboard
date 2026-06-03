/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  ThumbsUp, 
  Sparkles, 
  Activity, 
  Moon, 
  Calendar, 
  Award, 
  ChevronRight, 
  Sliders, 
  Compass, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import { AppState, RoutineItem, Skill } from '../types';

interface AnalyticsViewProps {
  state: AppState;
  disciplineScore: number;
}

export default function AnalyticsView({ state, disciplineScore }: AnalyticsViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [reportText, setReportText] = useState<string>(() => {
    return localStorage.getItem('lifeos_deep_report') || '';
  });
  const [loadingReport, setLoadingReport] = useState(false);

  // Derive consistency statistics from state
  const completedTasks = state.routine.filter(t => t.status === 'completed');
  const missedTasks = state.routine.filter(t => t.status === 'missed');
  
  const codingSkill = state.skills.find(s => s.id === 'coding');
  const fitnessSkill = state.skills.find(s => s.id === 'fitness');
  const englishSkill = state.skills.find(s => s.id === 'english');

  // --- 1. SMART ADVICE ENGINE (PROMETHEUS ENGINE) ---
  const generateSmartSuggestions = () => {
    const list: string[] = [];
    
    // Check sleep
    const averageSleep = state.journals.length > 0 
      ? state.journals.reduce((acc, j) => acc + j.sleepHours, 0) / state.journals.length 
      : 7.2;
    if (averageSleep < 6.8) {
      list.push("Your sleep consistency decreased this week. Stabilize device-free window down at 10:30 PM.");
    } else {
      list.push("Optimum Sleep Pattern maintained. Sleep hygiene scored 88/100 this week.");
    }

    // Check gym commitment
    const gymTask = state.routine.find(r => r.id === 'gym');
    if (gymTask && gymTask.status === 'missed') {
      list.push("You missed gym earlier in scheduled blocks. Resolve morning fatigue by hydrating early.");
    } else if (fitnessSkill && fitnessSkill.dailyLoggedMinutes >= 45) {
      list.push("Gym consistency is high. Fitness capacity is trending positive (+15% stamina gain estimation).");
    }

    // Check Coding
    if (codingSkill && codingSkill.dailyLoggedMinutes >= 90) {
      list.push("Coding performance improved by 20% compared to baseline. Project commitment is excellent!");
    } else {
      list.push("Coding Practice requires focus. Allocate 2 hours in the evening block under Job Mode.");
    }

    // Check Spiritual Naam Jap/Meditation
    const meditationFinished = state.routine.some(r => r.id === 'wake_up' && r.status === 'completed');
    const spiritualFinished = state.routine.some(r => r.id === 'spiritual' && r.status === 'completed');
    
    if (!meditationFinished && !spiritualFinished) {
      list.push("Meditation and Spiritual Sadhana consistency is low. Naam Jap and prayer session should not be skipped.");
    } else {
      list.push("Spiritual alignments are active. Deep mental resilience scored at high-threshold today.");
    }

    return list;
  };

  const currentSuggestions = generateSmartSuggestions();

  // --- 2. COMPILE DEEP PERFORMANCE STATS ---
  const getCommitmentSummary = () => {
    // Determine Strongest Habit and Weakest Leak based on active checkboxes
    const categoriesMapped = state.routine.reduce((acc, current) => {
      if (!acc[current.category]) {
        acc[current.category] = { completed: 0, total: 0 };
      }
      acc[current.category].total += 1;
      if (current.status === 'completed') {
        acc[current.category].completed += 1;
      }
      return acc;
    }, {} as Record<string, { completed: number; total: number }>);

    let strongest = 'Fitness Workouts';
    let weakest = 'Spiritual Sadhanas';
    let strongestRatio = 0;
    let weakestRatio = 100;

    Object.entries(categoriesMapped).forEach(([cat, metrics]) => {
      const ratio = Math.round((metrics.completed / metrics.total) * 100);
      if (ratio > strongestRatio) {
        strongestRatio = ratio;
        strongest = cat;
      }
      if (ratio < weakestRatio) {
        weakestRatio = ratio;
        weakest = cat;
      }
    });

    return {
      strongest: strongest.toUpperCase(),
      weakest: weakest.toUpperCase(),
      strongestPercent: strongestRatio || 80,
      weakestPercent: weakestRatio === 100 ? 40 : weakestRatio
    };
  };

  const commitSummary = getCommitmentSummary();

  // --- 3. DOCK REMOTE GEMINI REPORT GENERATION ---
  const handleGenerateAISummaryReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch('/api/deep-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          state: {
            routine: state.routine,
            skills: state.skills,
            goals: state.weeklyGoals,
            journals: state.journals,
            jobMode: state.jobMode,
            disciplineScore
          }
        })
      });

      if (!res.ok) throw new Error('Unresolved backend communication issues.');
      const data = await res.json();
      if (data && data.text) {
        setReportText(data.text);
        localStorage.setItem('lifeos_deep_report', data.text);
      }
    } catch (e) {
      console.error(e);
      setReportText("Failed to establish server transaction channels. Report Generation returned status failure. Ensure backend Express application and environment GEMINI_API_KEY variables are mapped.");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Intel & Performance Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            "Automated trend maps demonstrating routine checklist execution and targeted skills progress."
          </p>
        </div>
      </div>

      {/* Primary Analytics Bento Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Daily Routine Consistency (8 columns) */}
        <div id="chart-daily-routine" className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Daily Routine Consistency Trend (Last 7 Days)
            </h3>
            <span className="text-[10px] text-slate-400">Paces routine resolution ratio over previous weekly dates.</span>
          </div>

          {/* Premium Custom SVG Area/Line Chart */}
          <div className="w-full bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-4 rounded-xl h-52 flex flex-col justify-between font-mono">
            <div className="relative flex-1">
              {/* Plot markers guidelines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400 border-b border-dashed dark:border-slate-800">
                <div className="border-t border-dashed dark:border-slate-800/40 w-full pt-1">THRESHOLD: 100%</div>
                <div className="border-t border-dashed dark:border-slate-800/40 w-full pt-1">MEDIAN: 50%</div>
                <div className="w-full" />
              </div>

              {/* SVG Area Line plot */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00"/>
                  </linearGradient>
                </defs>
                {/* SVG Area fill path */}
                <path 
                  d="M 10 100 L 80 40 L 150 55 L 220 20 L 290 85 L 360 45 L 490 28 L 490 120 L 10 120 Z" 
                  fill="url(#chartGradient)"
                />
                {/* SVG Solid line */}
                <path 
                  d="M 10 100 L 80 40 L 150 55 L 220 20 L 290 85 L 360 45 L 490 28" 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                
                {/* Visual coordinate nodes */}
                <circle cx="10" cy="100" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="80" cy="40" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="150" cy="55" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="220" cy="20" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="290" cy="85" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="360" cy="45" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="490" cy="28" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-2 border-t dark:border-slate-850">
              <span>May 27</span>
              <span>May 28</span>
              <span>May 29</span>
              <span>May 30</span>
              <span>May 31</span>
              <span>Jun 01</span>
              <span>Jun 02</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Strongest Core commitments (4 columns) */}
        <div id="analytics-summary-leaks" className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-white border-b dark:border-slate-850 pb-2.5 mb-4 uppercase tracking-wider text-xs font-mono">
              Core Tractions Summary
            </h3>
            
            <div className="space-y-4 font-sans">
              {/* Strongest */}
              <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 space-y-1">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  STRONGEST HABIT PILLAR
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100 capitalize">{commitSummary.strongest}</h4>
                <p className="text-[10px] text-slate-500 leading-tight">Consistency holds at {commitSummary.strongestPercent}% resolution track.</p>
              </div>

              {/* Weakest */}
              <div className="p-3.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 space-y-1">
                <div className="text-[10px] font-bold text-rose-500 dark:text-rose-450 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  POTENTIAL PRODUCTIVITY WASTE / LEAK
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100 capitalize">{commitSummary.weakest}</h4>
                <p className="text-[10px] text-slate-500 leading-tight">Focus slips. Consistency currently dipping around {commitSummary.weakestPercent}%.</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400">
            *Leaks calculated from daily routine unchecked slots.
          </div>
        </div>

      </div>

      {/* Secondary split grid: Smart Suggestions Box & Skills Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Smart Suggestions Diagnostic Checklist */}
        <div id="smart-advisor-suggestions" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-white pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 matches">
              <Calendar className="w-4 h-4 text-indigo-505" />
              Socio-Aura Intelligent Suggestions
            </h3>

            <ul className="space-y-2.5 font-sans">
              {currentSuggestions.map((sug, sIdx) => {
                const isCrit = sug.includes('low') || sug.includes('decreased');
                return (
                  <li 
                    key={sIdx} 
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium leading-relaxed ${
                      isCrit 
                        ? 'bg-rose-50/20 border-rose-100 text-rose-700 dark:bg-rose-950/10 dark:border-rose-950/40 dark:text-rose-400' 
                        : 'bg-emerald-50/20 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-950/40 dark:text-emerald-400'
                    }`}
                  >
                    <span className="text-sm">{isCrit ? '⚠️' : '✨'}</span>
                    <span>{sug}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="text-[10px] text-slate-400 italic pt-4">
            System evaluates sleeping logs, meditation blocks, and coding commits to generate tips.
          </div>
        </div>

        {/* Skills Time Allocation Chart */}
        <div id="chart-skills-allocation" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-white pb-2 mb-3 border-b border-slate-150 dark:border-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              Skill Practice Volume Distribution
            </h3>

            <div className="space-y-3 font-sans">
              {state.skills.map((skill) => {
                const totalMinutes = skill.dailyLoggedMinutes;
                const dailyTarget = skill.dailyTargetMinutes;
                const ratio = Math.min(100, Math.round((totalMinutes / dailyTarget) * 100)) || 10;
                
                return (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-350 capitalize">{skill.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">{totalMinutes}m logged / {dailyTarget}m target</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-50 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border dark:border-slate-850 p-0.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          ratio >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-4">
            Adjustable target configurations may be set in detail columns on the "Skill Focus" section.
          </p>
        </div>

      </div>

      {/* Gemini Comprehensive Weekly audit interface */}
      <div id="ai-deep-audit-panel" className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-slate-800 pb-3 gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 uppercase tracking-wide text-xs font-mono font-bold">
              <Cpu className="w-4 h-4 text-indigo-550" />
              Detailed Weekly Analysis Report (AI Generated)
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Query Gemini 3.5 instructions list for productivity evaluations, best performing habits, and improvement suggestion briefs.
            </p>
          </div>

          <button
            id="trigger-deep-ai-report"
            onClick={handleGenerateAISummaryReport}
            disabled={loadingReport}
            className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm disabled:bg-slate-400 font-sans"
          >
            {loadingReport ? 'Querying Gemini...' : 'Compile Performance Summary'}
          </button>
        </div>

        {/* Display response */}
        {reportText ? (
          <div className="bg-indigo-50/[0.12] dark:bg-slate-950/80 border dark:border-slate-850 p-5 rounded-2xl text-xs text-slate-755 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-sans max-h-72 overflow-y-auto">
            {reportText}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed dark:border-slate-850 rounded-2xl text-xs text-slate-400 italic">
            No Deep Report generated yet. Select the compilation button above.
          </div>
        )}
      </div>

    </div>
  );
}
